import app from "./app.js";
import mongoose from "mongoose";
import config from "./config/index.js";

// IIFE -> ()()

// (async () => {})()
(async () => {
  try {
    await mongoose.connect(config.MONGODB_URL);
    console.log("DO CONNECTED WITH SUCCESS");

    app.on("error", (err) => {
      console.log("ERROR: ", err);
      throw err;
    });

    const onListening = () => {
      console.log(`Listening on ${config.PORT}`);
    };

    app.listen(config.PORT, onListening);
  } catch (error) {
    console.log("ERROR ", error);
    throw error;
  }
})();
