import * as dotenv from "dotenv";
import * as typeorm from "typeorm";
import "reflect-metadata";
import app from "./app";
dotenv.config();

// Entities
import { Marker } from "./models/entities/marker";

const options: typeorm.ConnectionOptions = {
  type: "mysql",
  host: process.env.MYSQL_HOST,
  port: 3306,
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  synchronize: true,
  logging: true,
  entities: [Marker]
  //entities: ["src/models/entities/**/*.ts"]
};

typeorm.createConnection(options).then(() => {
  const PORT: number = 80;
  app.listen(PORT, err => {
    if (err) throw err;
    else console.log("Server Listen on Port ", PORT);
  });
});
