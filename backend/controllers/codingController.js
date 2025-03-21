import CodingQuestion from "../models/codingQuestionModel.js";
import asyncHandler from "express-async-handler";

// @desc    Submit a coding answer
// @route   POST /api/coding/submit
// @access  Private (Student)
const submitCodingAnswer = asyncHandler(async (req, res) => {
  const { questionId, code, language } = req.body;

  if (!code || !language || !questionId) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  // Find the existing question
  const question = await CodingQuestion.findById(questionId);
  if (!question) {
    res.status(404);
    throw new Error("Question not found");
  }

  // Update the question with the submitted answer
  question.submittedAnswer = {
    code,
    language,
    status: "pending", // Initial status
    executionTime: 0, // Will be updated after execution
  };

  // Save the updated question
  const updatedQuestion = await question.save();

  res.status(200).json({
    success: true,
    data: updatedQuestion,
  });
});

// @desc    Create a new coding question
// @route   POST /api/coding/question
// @access  Private (Teacher)
const createCodingQuestion = asyncHandler(async (req, res) => {
  const { question, description, testCases } = req.body;

  if (!question || !description || !testCases) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  const newQuestion = await CodingQuestion.create({
    question,
    description,
    testCases,
    teacher: req.user._id, // Assuming req.user is set by auth middleware
  });

  res.status(201).json({
    success: true,
    data: newQuestion,
  });
});

// @desc    Get all coding questions
// @route   GET /api/coding/questions
// @access  Private
const getCodingQuestions = asyncHandler(async (req, res) => {
  const questions = await CodingQuestion.find()
    .select("-submittedAnswer") // Don't send other submissions
    .populate("teacher", "name email");

  res.status(200).json({
    success: true,
    count: questions.length,
    data: questions,
  });
});

// @desc    Get a single coding question
// @route   GET /api/coding/questions/:id
// @access  Private
const getCodingQuestion = asyncHandler(async (req, res) => {
  const question = await CodingQuestion.findById(req.params.id).populate(
    "teacher",
    "name email"
  );

  if (!question) {
    res.status(404);
    throw new Error("Question not found");
  }

  res.status(200).json({
    success: true,
    data: question,
  });
});

export {
  submitCodingAnswer,
  createCodingQuestion,
  getCodingQuestions,
  getCodingQuestion,
};
