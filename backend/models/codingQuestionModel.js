import mongoose from "mongoose";

const codingSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "Question is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Question description is required"],
      trim: true,
    },
    testCases: [
      {
        input: {
          type: String,
          required: true,
        },
        expectedOutput: {
          type: String,
          required: true,
        },
      },
    ],
    submittedAnswer: {
      code: {
        type: String,
        required: [true, "Code submission is required"],
        trim: true,
      },
      language: {
        type: String,
        required: [true, "Programming language must be specified"],
        enum: ["javascript", "python", "java", "cpp"], // Add more languages as needed
      },
      executionTime: {
        type: Number,
        default: 0,
      },
      status: {
        type: String,
        enum: ["pending", "passed", "failed", "error"],
        default: "pending",
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Teacher reference is required"],
    },
    score: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt timestamps
  }
);

// Add any necessary indexes
codingSchema.index({ user: 1, createdAt: -1 });

const CodingQuestion = mongoose.model("CodingQuestion", codingSchema);

export default CodingQuestion;
