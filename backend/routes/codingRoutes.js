import express from "express";
import {
  submitCodingAnswer,
  createCodingQuestion,
  getCodingQuestions,
  getCodingQuestion,
} from "../controllers/codingController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected routes (require authentication)
router.use(protect);

// Student routes
router.post("/submit", submitCodingAnswer);
router.get("/questions", getCodingQuestions);
router.get("/questions/:id", getCodingQuestion);

// Teacher routes (require teacher role)
router.post("/question", createCodingQuestion);

export default router;
