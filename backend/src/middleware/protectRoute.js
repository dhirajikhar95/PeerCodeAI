import User from "../models/User.js";

// Decode JWT payload (base64url decode)
function decodeJwtPayload(token) {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT format");
  }
  const payload = parts[1];
  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = Buffer.from(base64, "base64").toString("utf8");
  return JSON.parse(jsonPayload);
}

export const protectRoute = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized - no token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const claims = decodeJwtPayload(token);
      const clerkId = claims.sub;

      if (!clerkId) {
        return res.status(401).json({ message: "Unauthorized - invalid token" });
      }

      // Verify token is not expired
      const now = Math.floor(Date.now() / 1000);
      if (claims.exp && claims.exp < now) {
        return res.status(401).json({ message: "Unauthorized - token expired" });
      }

      // Find user in DB by clerk ID
      const user = await User.findOne({ clerkId });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      req.user = user;
      next();
    } catch (decodeError) {
      return res.status(401).json({ message: "Unauthorized - invalid token" });
    }
  } catch (error) {
    console.error("Error in protectRoute middleware:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
