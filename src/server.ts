import * as dotenv from "dotenv";
dotenv.config();

import connectDB from "./modules/dbc";

import "reflect-metadata";
import app from "./app";

// Auto Marker Expiry Remover
import { ExpiryRemover } from "./modules/expiryRemover";

const PORT: number = 80;

connectDB().then(() => {
  app.listen(PORT, err => {
    if (err) throw err;
    else console.log("Server Listen on Port ", PORT);
  });
});

const expiryRemover: ExpiryRemover = new ExpiryRemover();
expiryRemover.deleteFrequently();
