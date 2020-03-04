import MarkerModel from "../models/marker";

export class ExpiryRemover {
  // Check Expired and Delete it
  public delete = async () => {
    const result = await MarkerModel.deleteExpired();
    console.log("expired Marker deleted", result);
  };

  // Delete Expired Marker Every Hour
  public deleteFrequently = () => {
    setInterval(async () => {
      await this.delete();
    }, 60 * 60 * 1000);
  };
}
