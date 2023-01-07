// this files gets file from .env into a big object and we will be able to use the fields just by config.JWT_SECRET
import dotenv from "dotenv";

dotenv.config();

const config = {
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRY: process.env.JWT_EXPIRY || "30d",
};

export default config;
