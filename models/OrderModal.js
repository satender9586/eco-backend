import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  products: [
    {
      type: Object,
      required: true,
    },
  ],
  shippinAddress: {
    type: Object,
  },
});

const Order = mongoose.model("Order", OrderSchema);

export default Order;
