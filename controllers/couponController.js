import Coupon from "../models/coupon.schema";
import asyncHandler from "../service/asyncHandler";
import CustomError from "../utils/customError";

/**********************************************************
 * @CREATE_COUPON
 * @route https://localhost:5000/api/coupon
 * @description Controller used for creating a new coupon
 * @description Only admin and Moderator can create the coupon
 * @returns Coupon Object with success message "Coupon Created SuccessFully"
 *********************************************************/
export const createCoupon = asyncHandler(async (req, res, next) => {
  const { code, discount } = req.body;

  if (!code || !discount) {
    throw new CustomError("Please pass all the values", 400);
  }

  const coupon = await Coupon.findOne({ code });

  if (coupon) {
    throw new CustomError("Same Coupon is already present in the database", 400);
  }

  const newCoupon = await Coupon.create({
    code,
    discount,
  });

  res.status(200).json({
    success: true,
    newCoupon,
  });
});

/**********************************************************
 * @DEACTIVATE_COUPON
 * @route https://localhost:5000/api/coupon/deactive/:couponId
 * @description Controller used for deactivating the coupon
 * @description Only admin and Moderator can update the coupon
 * @returns Coupon Object with success message "Coupon Deactivated SuccessFully"
 *********************************************************/
export const deactivateCoupon = asyncHandler(async (req, res, next) => {
  const { couponId } = req.params;

  const updatedCoupon = await Coupon.findByIdAndDelete({ couponId }, { active: false }, { new: true, runValidators: true });

  if (!updatedCoupon) {
    throw new CustomError("Coupon not found", 400);
  }

  res.status(200).json({
    success: true,
    message: "Coupon deactivated successfully",
    updatedCoupon,
  });
});

/**********************************************************
 * @DELETE_COUPON
 * @route https://localhost:5000/api/coupon/:couponId
 * @description Controller used for deleting the coupon
 * @description Only admin and Moderator can delete the coupon
 * @returns Success Message "Coupon Deleted SuccessFully"
 *********************************************************/
export const deleteCoupon = asyncHandler(async (req, res, next) => {
  const { couponId } = req.params;

  const deletedCoupon = await Coupon.findByIdAndDelete({ couponId });

  if (!deletedCoupon) {
    throw new CustomError("Coupon not found", 400);
  }

  res.status(200).json({
    success: true,
    message: "Coupon deleted successfully",
    deletedCoupon,
  });
});

/**********************************************************
 * @GET_ALL_COUPONS
 * @route https://localhost:5000/api/coupon
 * @description Controller used for getting all coupons details
 * @description Only admin and Moderator can get all the coupons
 * @returns allCoupons Object
 *********************************************************/
export const getAllCoupons = asyncHandler(async (_req, res, next) => {
  const coupons = await Coupon.find();

  if (!coupons) {
    throw new CustomError("No coupons found", 400);
  }

  res.status(200).json({
    success: true,
    coupons,
  });
});
