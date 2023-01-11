import Product from "../models/product.schema";
import formidable from "formidable";
import fs from "fs"; // node filesystem module
import { s3FileUpload, s3FileDelete } from "../service/imageUploader";
import Mongoose from "mongoose";
import asyncHandler from "../service/asyncHandler";
import CustomError from "../utils/customError";
import config from "../config/index";

/***************************************************************
@ADD_PRODUCT
@route http://localhost:4000/api/product
@description Controller used for creating a new product 
@description Only admin can create the coupon
@description Uses AWS S3 bucket for image upload 
@return Product Object
***************************************************************/
export const addProduct = asyncHandler(async (req, res) => {
  const form = formidable({
    multiples: true,
    keepExtensions: true,
  });

  form.parse(req, async function (err, fields, files) {
    try {
      if (err) {
        throw new CustomError(err.message || "something went wrong", 500);
      }

      // generate _id
      let productId = new Mongoose.Types.ObjectId().toHexString(); // gives a 24 character hex string
      // we are generating product id because we want to store photos in a certain way
      // 345ab/photo_1
      // 345ab/photo_2
      //   console.log(fields, files);

      // check for fields
      if (!fields.name || !fields.price || !fields.description || !fields.collectionId) {
        throw new CustomError(err.message || "something went wrong", 500);
      }

      // handling images
      let imgArrayResp = Promise.all(
        Object.keys(files).map(async (filekey, index) => {
          const element = files[filekey];

          // reference of the file that is stored in out system
          const data = fs.readFileSync(element.filepath);

          // upload
          const upload = await s3FileUpload({
            bucketName: config.S3_BUCKET_NAME,
            body: data,
            contentType: element.mimetype,
            key: `products/${productId}/photo_${index + 1}.png`,
          });
          return { secure_url: upload.Location }; // this location is coming from the promise
        })
      );

      let imgArray = await imgArrayResp;

      const product = await Product.create({
        _id: productId,
        photos: imgArray,
        ...fields,
      });

      if (!product) {
        throw new CustomError("Product was not created", 500);
      }

      res.status(200).json({
        success: true,
        product,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message || "Something went wrong",
      });
    }
  });
});

/***************************************************************
@GET_ALL_PRODUCT
@route http://localhost:4000/api/productS
@description Controller used for fetching all the products 
@PARAMS 
@return Products Object
***************************************************************/
export const getAllProducts = asyncHandler(async (_req, res) => {
  const products = await Product.find();

  if (!products) {
    throw new CustomError("No products found", 404);
  }

  res.status(200).json({
    success: true,
    products,
  });
});

/***************************************************************
@GET_PRODUCT_BY_ID
@route http://localhost:4000/api/product/:id
@description Controller used for fetching a particular product 
@PARAMS product id (params)
@return Product Object
***************************************************************/
export const getProduct = asyncHandler(async (req, res) => {
  const { id: productId } = req.params;

  const product = await Product.findById({ productId });

  if (!product) {
    throw new CustomError("No product found", 400);
  }

  res.status(200).json({
    success: true,
    product,
  });
});
