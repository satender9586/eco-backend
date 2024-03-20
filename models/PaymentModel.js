import mongoose from "mongoose";

const { Schema } = mongoose;

const PaymentSchema = new Schema(
  {
    key_id: {
      type: String,
      required: true,
    },
    amount:{
      type:Number,
      required:true
    },
    Summary: {
      type: Object,
      required:true
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", PaymentSchema);

export default Payment;
