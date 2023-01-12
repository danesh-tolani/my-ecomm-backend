import asyncHandler from "../service/asyncHandler.js";
import CustomError from "../utils/customError.js";
import User from "../models/user.schema";
import AuthRoles from "../utils/authRoles.js";

export const isAdmin = asyncHandler(async (req, _res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError("User not found", 400);
  }

  if (user.role !== AuthRoles.ADMIN || user.role !== AuthRoles.MODERATOR) {
    throw new CustomError("User is not an Admin or a moderator", 400);
  }

  next();
});

// app.get('/api/coupon/',isAdmin, createCoupon)
