import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a product name"],
      trim: true,
      maxLength: [120, "Product name should not be more than 120 characters"],
    },
    price: {
      type: Number,
      required: [true, "Please provide price of the product"],
      maxLength: [5, "Product should not be more than 5 digits"],
    },
    description: {
      type: String,
      // use some form of editor - personal assignment
    },
    photos: [
      {
        secure_url: {
          type: String,
          required: true,
        },
      },
    ],
    stock: {
      type: Number,
      default: 0,
    },
    sold: {
      type: Number,
      default: 0,
    },
    collectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collection",
    },

    // add rating afterwards
  },

  {
    timestamps: true,
  }
);

export default mongoose.model("Product", productSchema);
