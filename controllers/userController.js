import validator from "validator";
import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

// Route for user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Username and password are required",
      });
    }

    const userExists = await userModel
      .findOne({ email })
      .collation({ locale: "en", strength: 2 })
      .exec();
    if (!userExists) {
      res.status(401).json({ success: false, message: "User doesn't exist" });
    }
    const match = await bcrypt.compare(password, userExists.password);
    if (match) {
      const token = createToken(userExists._id);
      res.json({ success: true, token });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//Route for user register
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // checking user already exists or not
    const userExists = await userModel
      .findOne({ email })
      .collation({ locale: "en", strength: 2 })
      .lean()
      .exec();
    if (userExists) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists" });
    }

    // validating email format & strong password
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email",
      });
    }
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Please enter a strong password",
      });
    }

    // hashing user password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUserObject = { name, email, password: hashedPassword };

    // Create and store new user
    const user = await userModel.create(newUserObject);

    const token = createToken(user._id);
    res.json({
      success: true,
      message: `New user ${name} created!`,
      token,
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// Route for admin login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign({ email, role: "admin" }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { loginUser, registerUser, adminLogin };
