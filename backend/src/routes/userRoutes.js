import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { getCurrentUser, updateRole } from "../controllers/userController.js";

const router = express.Router();

router.use(protectRoute);

router.get("/me", getCurrentUser);
router.patch("/role", updateRole);

export default router;
