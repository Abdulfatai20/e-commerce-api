import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  try {
    //Get the Header
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    //Extract the token
    const token = authHeader.split(" ")[1];

    // Verify and decode it
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) {
        console.log("❌ Token verification failed here");
        return res.status(403).json({ success: false, message: "Forbidden" }); //invalid token, 403 means forbidden
      }
      console.log("✅ Token verified:", decoded);
      //Store decoded info for later handlers
      req.body.userId = decoded.id;
      next();
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export default userAuth;
