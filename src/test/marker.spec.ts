import * as dotenv from "dotenv";
dotenv.config();

import { expect } from "chai";
import request from "supertest";
import app from "../app";

import connectDB from "../modules/dbc";

import { Marker } from "../models/entities/marker";
import { doesNotMatch } from "assert";

describe("App Test", () => {
  const req = request(app);

  before(async () => {
    await connectDB();
  });

  describe("Basic Test", () => {
    it("GET /", async () => {
      await req.get("/").expect(200);
    });

    it("GET /not_found", async () => {
      await req.get("/not_found").expect(404);
    });
  });

  describe("Marker Test", () => {
    it("GET /marker", async () => {
      const result = await req.get("/marker").expect(200);
      expect(result.body).to.be.a("Array");
      expect(result.body[0].m_id).to.be.a("number");
    });

    it("POST /marker", async () => {
      const result = await req
        .post("/marker")
        .set("Content-Type", "application/x-www-form-urlencoded")
        .field("latitude", "0.12345")
        .field("longitude", "0.56789")
        .field("comment", "This is a test marker")
        .field("type", "finding")
        .field("auth", "P@ssw0rd")
        .field("f_time", "2020-03-04 12:33:00")
        .attach("img", "src/public/img/found.png");

      const insertedMId: number = result.body.m_id;
      const foundMarker = await Marker.findByIds([insertedMId]);

      expect(foundMarker[0].m_id).to.equal(insertedMId);
      expect(foundMarker[0].img_url).not.to.be.null;
      expect;
    });
  });
});
