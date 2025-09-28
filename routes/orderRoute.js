import express from "express";
import {
  placeOrder,
  placeOrderRazorPay,
  allOrders,
  userOrders,
  updateStatus,
  verifyPaystack,
  placeOrderPayStack,
} from "../controllers/orderController.js";
import adminAuth from "../middleware/adminAuth.js";
import userAuth from "../middleware/userAuth.js";

const orderRouter = express.Router();

// Admin Features
orderRouter.post("/list", adminAuth, allOrders);
orderRouter.post("/status", adminAuth, updateStatus);

// Payment Features
orderRouter.post("/place", userAuth, placeOrder);
orderRouter.post("/paystack", userAuth, placeOrderPayStack);
orderRouter.post("/razorpay", userAuth, placeOrderRazorPay);

// User Feature
orderRouter.post("/userOrders", userAuth, userOrders);

// Verify payment
orderRouter.post("/verifypayStack", userAuth, verifyPaystack);

export default orderRouter;
