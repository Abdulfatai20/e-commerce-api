import jwt from "jsonwebtoken";

const adminAuth = async (req, res, next) => {
  try {
    //Get the Header
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.json({ success: false, message: "No token provided" });
    }

    //Extract the token
    const token = authHeader.split(" ")[1];

    // Verify and decode it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    //Store decoded info for later handlers
    req.admin = decoded;
    next();
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export default adminAuth;
