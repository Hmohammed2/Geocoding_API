// requireAuth.js
const jwt = require("jsonwebtoken");

/**
 * Middleware to protect routes and ensure the user is authenticated.
 * It expects the JWT to be stored in a cookie named "jwt".
 */
const requireAuth = (req, res, next) => {
  // Ensure cookie-parser middleware is being used in your app
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ message: "Authentication token missing." });
  }

  try {
    // Verify the token using your JWT secret key
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach the decoded user information (e.g., userId) to req.user
    req.user = { userId: decoded.userId, ...decoded };
    
    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

module.exports = requireAuth;