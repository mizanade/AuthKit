import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connect from "./db/connect.js";
import cookieParser from "cookie-parser";
import fs from "fs";
import errorHandler from "./src/helpers/errorHandler.js";

dotenv.config();

const port = process.env.PORT || 8000;

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(errorHandler);

const routesFiles = fs.readdirSync("./src/routes");

routesFiles.forEach((file) => {
  import(`./src/routes/${file}`)
    .then((route) => {
      app.use("/api/v1", route.default);
    })
    .catch((err) => {
      console.log("failed to load route file", err);
    });
});

const server = async () => {
  try {
    await connect();

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.log("failed to start server", error.message);
    process.exit(1);
  }
};

server();
