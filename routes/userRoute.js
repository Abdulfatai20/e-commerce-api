import express from "express";
import {
  loginUser,
  registerUser,
  adminLogin,
  refresh,
  logout,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/admin", adminLogin);
userRouter.get("/refresh", refresh);
userRouter.post("/logout", logout);

export default userRouter;
