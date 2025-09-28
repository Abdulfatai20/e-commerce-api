// import { currency } from "../../admin/src/App.jsx";
import axios from "axios";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

// gateway initialize
const paystackSecret = process.env.PAYSTACK_SECRET_KEY;

//Placing orders using COD Method
const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;

    const orderData = {
      userId,
      items,
      amount,
      address,
      paymentMethod: "COD",
      payment: false,
      date: Date.now(),
    };
    await orderModel.create(orderData);
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    res.json({ success: true, message: "Order Placed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//Placing orders using Stripe Method
const placeOrderPayStack = async (req, res) => {
  try {
    const { userId, items, amount, address, email } = req.body;

    const orderData = {
      userId,
      items,
      amount,
      address,
      paymentMethod: "Paystack",
      payment: false,
      date: Date.now(),
    };
    const newOrder = await orderModel.create(orderData);

    // Call Paystack API to initialize payment
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: address.email,
        amount: amount * 100,
        reference: newOrder._id.toString(),
        callback_url: `${process.env.FRONTEND_URL}/verify?reference=${newOrder._id}`,
      },
      {
        headers: {
          Authorization: `Bearer ${paystackSecret}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ success: true, auth_url: response.data.data.authorization_url });
  } catch (error) {
    console.log(error.response?.data || error.message);
    res.json({ success: false, message: error.message });
  }
};

// Verifying Stripe Payment
const verifyPaystack = async (req, res) => {
  const { reference, userId } = req.body;
  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${paystackSecret}` } }
    );

    if (response.data.data.status === "success") {
      await orderModel.findByIdAndUpdate(reference, { payment: true });
      await userModel.findByIdAndUpdate(userId, { cartData: {} });
      res.json({
        success: true,
        message: "Payment Verified, Order Placed",
      });
    } else {
      await orderModel.findByIdAndDelete(reference);
      res.json({ success: false, message: "Payment Failed, Order Cancelled" });
    }
  } catch (error) {
    console.log(error.response?.data || error.message);
    res.json({ success: false, message: "Verification failed" });
  }
};

//Placing orders using Razorpay Method
const placeOrderRazorPay = async (req, res) => {};

// All orders data for admin panel
const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({}).exec();
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// User order data for frontend
const userOrders = async (req, res) => {
  try {
    const { userId } = req.body;
    const orders = await orderModel.find({ userId }).exec();
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// update order status
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    await orderModel.findByIdAndUpdate(orderId, { status });
    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  placeOrder,
  placeOrderPayStack,
  placeOrderRazorPay,
  allOrders,
  userOrders,
  updateStatus,
  verifyPaystack,
};
