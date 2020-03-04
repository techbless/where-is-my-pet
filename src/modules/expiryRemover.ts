import MarkerModel from "../models/marker";

export class ExpiryRemover {
  public delete = async () => {
    const result = await MarkerModel.deleteExpired();
    console.log("expired Marker deleted", result);
  };

  public deleteFrequently = () => {
    setInterval(async () => {
      await this.delete();
    }, 10 * 1000);
  };
}
