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
      let user = await User.findOne({ clerkId });

      if (!user) {
        // Auto-create user from JWT claims if Inngest hasn't processed the webhook yet.
        // This eliminates the race condition where frontend requests arrive before
        // Inngest creates the user, causing delayed role selection page loading.
        try {
          user = await User.create({
            clerkId,
            email: claims.email || "",
            name: `${claims.first_name || claims.given_name || ""} ${claims.last_name || claims.family_name || ""}`.trim() || "User",
            profileImage: claims.image_url || claims.picture || "",
            role: null,
          });
        } catch (createError) {
          // If creation fails due to duplicate key (race with Inngest), try finding again
          if (createError.code === 11000) {
            user = await User.findOne({ clerkId });
          }
          if (!user) {
            return res.status(404).json({ message: "User not found" });
          }
        }
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
