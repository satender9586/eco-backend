import express from "express";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import PaymentModel from "../models/PaymentModel.js";
import Order from "../models/OrderModal.js";

dotenv.config();
const router = express.Router();

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});

// Define a function to save payment data
async function savePaymentData(razorpayOrderId) {
  try {
    const data = new PaymentModel({ key_id: razorpayOrderId });
    return await data.save();
  } catch (error) {
    throw new Error(`Failed to save payment data: ${error.message}`);
  }
}

router.post("/makePayment", async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount required",
      });
    }

    const razorpayOrder = await razorpayInstance.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `txt_${Date.now()}`,
    });

    // Save payment data using the separate function
    const savedPayment = await PaymentModel.create({
      key_id: razorpayOrder.id,
      amount: amount,
      Summary: razorpayOrder,
    });
    console.log(savedPayment);

    res.status(200).json({
      success: true,
      message: "Payment created successfully",
      key_id: process.env.RAZORPAY_KEY,
      data: savedPayment,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: `An error occurred: ${error.message}`,
    });
  }
});

router.post("/confirmPayment", async (req, res) => {
  const {
    orderCreationId,
    razorpayPaymentId,
    razorpayOrderId,
    razorpaySignature,
  } = req.body;

  try {
    if (
      !orderCreationId ||
      !razorpayPaymentId ||
      !razorpayOrderId ||
      !razorpaySignature
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required in payment confirm",
      });
    }

    const isPaymetnOrderIdExist = await PaymentModel.findOne({
      key_id: orderCreationId,
    });

    console.log(isPaymetnOrderIdExist);

    // const paymentObj = new PaymentModel({
    //   orderCreationId,
    //   razorpayPaymentId,
    //   razorpayOrderId,
    //   razorpaySignature,
    // });

    // await paymentObj.save();

    return res.status(200).json({
      success: true,
      message: "Payment confirmed successfully",
      payment: paymentObj,
    });
  } catch (error) {
    console.log("Error from payment confirm api", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while confirming payment",
      error: error.message,
    });
  }
});

router.post("/createOrder", async (req, res) => {
  const { userId, paymentId, amount, products } = req.body;

  try {
    // Check if amount is missing
    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "Amount field is required in createOrder API",
      });
    }

    // Save order data
    // const order = new Order({
    //   // userId,
    //   // paymentId,
    //   amount,
    //   // products
    // });

    const savedOrder = await Order.create({ amount });

    if (!savedOrder) {
      return res.status(400).json({
        success: false,
        message: "Failed to create order",
      });
    }

    console.log("savde order", savedOrder);

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: savedOrder,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: `An error occurred: ${error}`,
    });
  }
});
export default router;
