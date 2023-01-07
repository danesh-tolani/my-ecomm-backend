import mongoose from "mongoose";
import AuthRoles from "../utils/authRoles";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is a required"],
      maxLength: [50, "Name must be less than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is a required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is a required"],
      minLength: [8, "Password must be at least 8 characters"],
      select: false, // when we query the database while authentication, this field will never come up
    },
    role: {
      type: String,
      enum: Object.values(AuthRoles), // returns array of values ["ADMIN", "MODERATOR", "USER"]
      default: AuthRoles.USER,
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema); // will be stored as "users" in mongodb
