import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    products: {
      type: [
        {
          productId: {
            ref: "Product",
            type: mongoose.Schema.Types.ObjectId,
            required: true,
          },
          count: Number,
          price: Number,
        },
      ],
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      req: true,
    },
    address: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    coupon: {
      type: String,
    },
    transactionId: {
      type: String,
    },
    status: {
      type: String,
      enum: ["ORDERED", "SHIPPED", "DELIVERED", "CANCELLED"],
      default: "ORDERED",
      //
    },
    // paymentMode: UPI, WALLET, CREDIT_CARD, COD
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Order", orderSchema);
