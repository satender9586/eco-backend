import express from "express";
import Razorpay from "razorpay";
import dotenv from "dotenv";
import PaymentModel from "../models/PaymentModel.js";
import Order from "../models/OrderModal.js";
import Product from "../models/productModel.js";

dotenv.config();
const router = express.Router();

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});

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

    const savedPayment = await PaymentModel.create({
      key_id: razorpayOrder.id,
      amount: amount,
      Summary: razorpayOrder,
    });
    console.log(savedPayment);

    res.status(200).json({
      success: true,
      message: "Payment created successfully",
      RazorPaykey_id: process.env.RAZORPAY_KEY,
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

    if (!isPaymetnOrderIdExist) {
      return res.status(404).json({
        success: true,
        message: "Payment init id does not exist",
      });
    }

    isPaymetnOrderIdExist.PaymentSuccessSummary.orderCreationId =
      orderCreationId;
    isPaymetnOrderIdExist.PaymentSuccessSummary.razorpayPaymentId =
      razorpayPaymentId;
    isPaymetnOrderIdExist.PaymentSuccessSummary.razorpayOrderId =
      razorpayOrderId;
    isPaymetnOrderIdExist.PaymentSuccessSummary.razorpaySignature =
      razorpaySignature;

    const saveObj = await isPaymetnOrderIdExist.save();

    return res.status(200).json({
      success: true,
      message: "Payment confirm successfully",
      payment: saveObj,
      RazorPayKey_id: razorpayOrderId,
    });
  } catch (error) {
    console.log("Error from payment confirm api", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while confirm payment",
      error: error.message,
    });
  }
});
router.post("/createOrder", async (req, res) => {
  const { userId, paymentId, amount, products, shippingAddress } = req.body;

  try {
    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "Amount field is required in createOrder API",
      });
    }

    const productObjects = await Product.find({
      _id: { $in: products.map((p) => p._id) },
    });

    const orderProducts = products.map(({ _id, quantity }) => {
      const product = productObjects.find((p) => p._id.toString() === _id);
      return { product, quantity };
    });

    const order = new Order({
      userId,
      paymentId,
      amount,
      products: orderProducts,
      shippingAddress,
    });

    const savedOrder = await order.save();

    if (!savedOrder) {
      return res.status(400).json({
        success: false,
        message: "Failed to create order",
      });
    }

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

router.get("/orders/:id", async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User Id is Required",
      });
    }

    const retrievedOrders = await Order.find({ _id: id });

    if (!retrievedOrders || retrievedOrders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No orders found for the provided user ID",
      });
    }

    return res.status(200).json({
      success: true,
      data: retrievedOrders,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing your request",
    });
  }
});

router.get("/ordersuser/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const orders = await Order.find({ userId });

    return res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      orders,
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
