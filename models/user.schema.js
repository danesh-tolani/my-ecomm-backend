import mongoose from "mongoose";
import AuthRoles from "../utils/authRoles";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import config from "../config/index";

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
// mongoose hooks for schema
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  // this checks if the password is there or not, if modified is true than it means password was already there and this encrypt password should not run

  // used normal function because we need to use .this which refers to the userSchema object
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Schema methods
userSchema.methods = {
  // compare password
  comparePassword: async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  },

  // generate JWT Token
  getJwtToken: function () {
    return JWT.sign(
      {
        _id: this._id,
        role: this.role,
      },
      config.JWT_SECRET,
      {
        expiresIn: config.JWT_EXPIRY,
      }
    );
  },

  // generate forgot password token
  generateForgotPasswordToken: function () {
    const forgotToken = crypto.randomBytes(20).toString("hex");

    // step-1: Save to DB
    this.forgotPasswordToken = crypto.createHash("sha256").update(forgotToken).digest("hex"); // encrypt the forgotPasswordToken
    this.forgotPasswordExpiry = Date.now() + 20 * 60 * 1000; // 20 mins

    // step-2: return value to user

    return forgotToken;
  },
};
export default mongoose.model("User", userSchema); // will be stored as "users" in mongodb
