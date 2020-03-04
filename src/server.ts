import * as dotenv from "dotenv";
import * as typeorm from "typeorm";
import "reflect-metadata";
import app from "./app";
dotenv.config();

// Entities
import { Marker } from "./models/entities/marker";

// Auto Marker Expiry Checker
import { ExpiryChecker } from "./modules/expiryChecker";

const options: typeorm.ConnectionOptions = {
  type: "mysql",
  host: process.env.MYSQL_HOST,
  port: 3306,
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  entities: [Marker],
  timezone: "+09:00",
  synchronize: true,
  logging: true,
  charset: "utf8mb4"
  //entities: ["src/models/entities/**/*.ts"]
};

typeorm.createConnection(options).then(() => {
  const PORT: number = 80;

  app.listen(PORT, err => {
    if (err) throw err;
    else console.log("Server Listen on Port ", PORT);
  });

  const expiryChecker: ExpiryChecker = new ExpiryChecker();
  expiryChecker.deleteFrequently();
});
