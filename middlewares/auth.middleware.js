import User from "../models/user.schema.js";
import JWT from "jsonwebtoken";
import asyncHandler from "../service/asyncHandler.js";
import CustomError from "../utils/customError.js";
import config from "../config/index.js";

export const isLoggedIn = asyncHandler(async (req, _res, next) => {
  let token;

  if (req.cookies.token || (req.headers.authorization && req.headers.authorization.startsWith("Bearer"))) {
    token = req.cookies.token || req.headers.authorization.split(" ")[1];

    if (!token) {
      throw new CustomError("Not authorized to access this route", 401);
    }

    try {
      // while creating token in Schema _id and email were passed so when we decode the token we get object with _id and email
      const decodedJwtPayload = JWT.verify(token, config.JWT_SECRET);

      req.user = await User.findById(decodedJwtPayload._id, "name email role"); // findById will return only name email and role

      next();
    } catch (error) {
      throw new CustomError("Not authorized to access this route", 401);
    }
  }
});
