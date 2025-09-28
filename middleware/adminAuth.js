import jwt from "jsonwebtoken";

const adminAuth = async (req, res, next) => {
  try {
    //Get the Header
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    //Extract the token
    const token = authHeader.split(" ")[1];

    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // if (decoded.role !== "admin") {
    //   return res
    //     .status(403)
    //     .json({ success: false, message: "Not authorized" });
    // }

    // Verify and decode it
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        console.log("❌ Token verification failed for admin:", err.message);
        return res
          .status(403)
          .json({ success: false, message: "Not authorized" }); //invalid token, 403 means forbidden
      }
      console.log("✅ Token verified for admin:", decoded);
      //Store decoded info for later handlers
      req.admin = decoded;
      next();
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export default adminAuth;
