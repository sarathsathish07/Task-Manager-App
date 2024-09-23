import express from "express";
import {
  authUser,
  registerUser,
  logoutUser,
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  googleLogin,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();


router.post("/googleLogin", googleLogin);
router.post("/auth", authUser);
router.post("/logout", logoutUser);
router.post("/create-task", protect, createTask);
router.get("/get-tasks", protect, getTasks);
router.put("/update-task/:id", protect, updateTask);
router.delete("/delete-task/:id", protect, deleteTask);
router.post("/", registerUser);


export default router;
