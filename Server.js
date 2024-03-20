import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import connectDB from "./Config/db.js";
import authroutes from "./routes/authroutes.js";
import productrouts from "./routes/productRoutes.js";
import shippingroute from "./routes/shippingroute.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRouter from "./routes/PaymentRouter.js";

dotenv.config();
connectDB();

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// routes
app.use("/api/v1/auth", authroutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/product", productrouts);
app.use("/api/v1/shipping", shippingroute);
app.use("/api/v1/payment", paymentRouter);

const PORT = process.env.PORT_NUMBER || 3000;

app.listen(PORT, () => {
  console.log("Server Is Running on ", PORT);
});
