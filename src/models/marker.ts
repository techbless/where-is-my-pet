import { Marker } from "./entities/marker";
import { getRepository, getManager } from "typeorm";

class MarkerModel {
  public async readAll() {
    const repository = await getRepository(Marker);
    return await repository
      .createQueryBuilder("marker")
      .select([
        "marker.m_id",
        "marker.latitude",
        "marker.longitude",
        "marker.comment",
        "marker.type",
        "marker.img_url",
        "marker.f_time"
      ])
      .getRawMany();
  }

  public async getAuth(m_id: number): Promise<string | undefined> {
    const repository = await getRepository(Marker);
    const result = await repository
      .createQueryBuilder("marker")
      .select(["marker.auth"])
      .where("m_id = :m_id", {
        m_id: m_id
      })
      .getRawMany();

    try {
      return result[0].marker_auth;
    } catch (error) {
      return undefined;
    }
  }

  public async create(
    latitude: string,
    longitude: string,
    comment: string,
    type: string,
    f_time: string,
    auth: string
  ) {
    const repository = await getRepository(Marker);
    const marker: Marker = new Marker();
    marker.latitude = latitude;
    marker.longitude = longitude;
    marker.comment = comment;
    marker.type = type;
    marker.f_time = f_time;
    marker.auth = auth;
    return await repository.save(marker);
  }

  public async updateImageUrl(m_id: number, img_url: string) {
    const repository = await getRepository(Marker);

    const marker = new Marker();
    marker.img_url = img_url;

    return await repository.update(
      {
        m_id: m_id
      },
      marker
    );
  }

  public async delete(m_id: number, auth: string) {
    const repository = await getRepository(Marker);
    repository.delete({
      m_id: m_id,
      auth: auth
    });
  }

  public async deleteExpired() {
    const repository = await getRepository(Marker);
    repository
      .createQueryBuilder()
      .delete()
      .where("f_time < NOW() - INTERVAL 3 DAY")
      .execute();
  }
}

export default new MarkerModel();
