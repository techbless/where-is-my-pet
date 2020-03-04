import { Request, Response } from "express";
import MarkerModel from "../models/marker";
import * as AWS from "aws-sdk";
import * as formidable from "formidable";
import * as path from "path";
import * as fs from "fs";

interface FormData {
  fields: formidable.Fields;
  files: formidable.Files;
}

class MarkerController {
  private s3!: AWS.S3;

  constructor() {
    AWS.config.update({
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    });
    this.s3 = new AWS.S3();
  }

  private isValidDateTime(dt: string) {
    const reg = /[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]/;
    return reg.test(dt);
  }

  private parseFormData(req: Request): Promise<FormData> {
    return new Promise(function(resolve, reject) {
      var form = new formidable.IncomingForm();
      form.parse(req, function(err, fields, files) {
        if (err) return reject(err);

        const parsedForm: FormData = {
          fields: fields,
          files: files
        };
        resolve(parsedForm);
      });
    });
  }

  public async getMarkers(req: Request, res: Response) {
    try {
      const markers = await MarkerModel.readAll();
      res.json(markers);
    } catch (error) {
      res.json({
        res: "ERROR",
        details: "Failed to read markers from database"
      });

      throw error;
    }
  }

  public async addMarker(req: Request, res: Response) {
    const parsedForm: FormData = await this.parseFormData(req);
    const fields = parsedForm.fields;
    const files = parsedForm.files;

    const latitude: string = fields.latitude as string;
    const longitude: string = fields.longitude as string;
    const comment: string = fields.comment as string;
    const type: string = fields.type as string;
    const f_time: string = fields.f_time as string;
    const auth: string = fields.auth as string;

    if (!files.img) {
      res.json({ res: "ERROR", details: "no file exists" });
      return;
    }

    if (!this.isValidDateTime(f_time)) {
      res.json({ res: "ERROR", details: "not valid date_time format" });
      return;
    }

    if (!latitude || !longitude || !comment || !type || !f_time || !auth) {
      res.json({
        res: "ERROR",
        details: "There are missing arguments."
      });
      return;
    }

    const insertedMarker = await MarkerModel.create(
      latitude,
      longitude,
      comment,
      type,
      f_time,
      auth
    );

    const extention: string = path.extname(files.img.name);
    const fullname: string =
      "img/marker/marker" + insertedMarker.m_id + extention;
    const params: AWS.S3.Types.PutObjectRequest = {
      Bucket: process.env.AWS_S3_BUCKET as string,
      Key: fullname,
      ACL: "public-read",
      Body: fs.createReadStream(files.img.path)
    };

    try {
      const data = await this.s3.upload(params).promise();

      try {
        MarkerModel.updateImageUrl(insertedMarker.m_id, data.Location);
        insertedMarker.img_url = data.Location;
      } catch (error) {
        res.json({
          res: "ERROR",
          details: "Failed to update iamage url on Database."
        });

        throw error;
      }
    } catch (error) {
      res.json({
        res: "ERROR",
        details: "Failed to upload image to s3 bucket."
      });

      throw error;
    }

    const result = JSON.parse(JSON.stringify(insertedMarker));
    result.res = "SUCCESS";

    res.json(result);
  }

  public async deleteMarker(req: Request, res: Response) {
    const m_id = +req.params.m_id; // Number
    const auth = req.query.auth;

    try {
      const realAuth = await MarkerModel.getAuth(m_id);
      if (auth == realAuth && realAuth) {
        await MarkerModel.delete(m_id, auth);
        res.json({
          res: "SUCCESS",
          m_id: m_id
        });
      } else {
        res.json({
          res: "FAILED",
          details: "Wrong password or No such marker exists"
        });
      }
    } catch (error) {
      res.json({
        res: "ERROR",
        details: "Failed to get password from database"
      });

      throw error;
    }
  }
}

export default new MarkerController();
