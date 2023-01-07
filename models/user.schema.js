import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is a required"],
    maxLength: [50, "Name must be less than 50 characters"],
  },
});
