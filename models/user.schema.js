import mongoose from "mongoose";
import AuthRoles from "../utils/authRoles";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

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

// challenge 1: encrypt password before saving
userSchema.pre("save", async function (next) {
  if (!this.modified("password")) return next();
  // this checks if the password is there or not, if modified is true than it means password was already there and this encrypt password should not run

  // used normal function because we need to use .this which refers to the userSchema object
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export default mongoose.model("User", userSchema); // will be stored as "users" in mongodb
