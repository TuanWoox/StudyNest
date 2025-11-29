// Validation utilities matching backend QuestionBusiness.ValidateQuestion

import type { Choice } from "@/types/quiz/quiz";

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Count words in a string (matching backend CountWords logic)
 */
const countWords = (text: string): number => {
  if (!text || !text.trim()) return 0;
  const parts = text
    .trim()
    .split(/[\s\n\r\t]+/)
    .filter(Boolean);
  return parts.length;
};

/**
 * Validate quiz title
 */
export const validateQuizTitle = (title: string): string | null => {
  const trimmed = title.trim();

  if (!trimmed) {
    return "Title is required";
  }

  if (trimmed.length > 300) {
    return "Title must not exceed 300 characters";
  }

  return null;
};

/**
 * Ensure choice count matches expected (backend: EnsureChoiceCount)
 */
const ensureChoiceCount = (
  choices: Choice[],
  expectedCount: number,
  message: string
): string | null => {
  return choices.length === expectedCount ? null : message;
};

/**
 * Validate MCQ choices (backend: ValidateMcq)
 */
const validateMcq = (choices: Choice[]): string | null => {
  const err = ensureChoiceCount(choices, 4, "MCQ must have exactly 4 choices.");
  if (err) return err;

  const correctCount = choices.filter((c) => c.isCorrect).length;
  if (correctCount !== 1) {
    return "MCQ must have exactly 1 correct answer.";
  }

  return null;
};

/**
 * Validate MSQ choices (backend: ValidateMsq)
 */
const validateMsq = (choices: Choice[]): string | null => {
  const err = ensureChoiceCount(choices, 4, "MSQ must have exactly 4 choices.");
  if (err) return err;

  const correctCount = choices.filter((c) => c.isCorrect).length;
  if (correctCount < 2) {
    return "MSQ must have at least 2 correct answers.";
  }

  return null;
};

/**
 * Validate TF choices (backend: ValidateTf)
 */
const validateTf = (choices: Choice[]): string | null => {
  const err = ensureChoiceCount(
    choices,
    2,
    "TF question must have exactly 2 choices: True and False."
  );
  if (err) return err;

  const hasTrue = choices.some((c) => c.text?.trim().toLowerCase() === "true");
  const hasFalse = choices.some((c) => c.text?.trim().toLowerCase() === "false");

  if (!hasTrue || !hasFalse) {
    return "TF question must contain only 'True' and 'False' as choices.";
  }

  const correctCount = choices.filter((c) => c.isCorrect).length;
  if (correctCount !== 1) {
    return "TF question must have exactly 1 correct answer.";
  }

  return null;
};

/**
 * Validate choices by type (backend: ValidateChoiceByType)
 */
const validateChoiceByType = (type: string, choices: Choice[]): string | null => {
  const typeUpper = type.trim().toUpperCase();

  switch (typeUpper) {
    case "MCQ":
      return validateMcq(choices);
    case "MSQ":
      return validateMsq(choices);
    case "TF":
      return validateTf(choices);
    default:
      return "Invalid question type. Supported types: MCQ, MSQ, TF.";
  }
};

/**
 * Validate complete question (matching backend QuestionBusiness.ValidateQuestion)
 * @param name Question title
 * @param type Question type (MCQ, MSQ, TF)
 * @param explanation Optional explanation
 * @param choices List of choices
 * @param isUpdate Whether this is an update operation
 * @param questionId Current question ID (for update validation)
 */
export const validateQuestion = (
  name: string,
  type: string,
  explanation: string,
  choices: Choice[],
  isUpdate: boolean = false,
  questionId?: string
): string | null => {
  // Validate question title (backend: string.IsNullOrWhiteSpace(name) || name.Trim().Length > 300)
  if (!name || name.trim().length === 0) {
    return "Question title is required and must not exceed 300 characters.";
  }
  if (name.trim().length > 300) {
    return "Question title is required and must not exceed 300 characters.";
  }

  // Validate question type (backend: string.IsNullOrWhiteSpace(type))
  if (!type || type.trim().length === 0) {
    return "Question type is missing. Please select MCQ, MSQ, or TF.";
  }

  // Validate each choice text (backend: foreach(var c in choices))
  for (const choice of choices) {
    if (!choice.text || choice.text.trim().length === 0) {
      return "Each choice must have text content.";
    }
    if (choice.text.trim().length > 200) {
      return "Choice text must not exceed 200 characters.";
    }
  }

  // Check for duplicate choice texts (backend: GroupBy + Where)
  const textMap = new Map<string, number>();
  for (const choice of choices) {
    const normalizedText = (choice.text || "").trim().toLowerCase();
    textMap.set(normalizedText, (textMap.get(normalizedText) || 0) + 1);
  }
  const duplicates = Array.from(textMap.entries())
    .filter(([_, count]) => count > 1)
    .map(([text]) => text);

  if (duplicates.length > 0) {
    return `Duplicate choice texts found: ${duplicates.join(", ")}.`;
  }

  // Validate choices by type (backend: ValidateChoiceByType)
  const typeError = validateChoiceByType(type, choices);
  if (typeError) return typeError;

  // Validate explanation word count (backend: CountWords(explanation) > 200)
  if (explanation && explanation.trim().length > 0) {
    const wordCount = countWords(explanation);
    if (wordCount > 200) {
      return "Explanation should be concise (maximum 200 words).";
    }
  }

  return null;
};

/**
 * Get default choices for a question type
 */
export const getDefaultChoices = (
  type: "MCQ" | "MSQ" | "TF",
  questionId: string = ""
): Choice[] => {
  if (type === "TF") {
    return [
      { id: "", questionId, text: "True", isCorrect: true },
      { id: "", questionId, text: "False", isCorrect: false },
    ];
  }

  // MCQ and MSQ get 4 empty choices
  return Array.from({ length: 4 }, () => ({
    id: "",
    questionId,
    text: "",
    isCorrect: false,
  }));
};

/**
 * Convert choices when changing question type
 * Preserves choice IDs to avoid backend issues
 */
export const convertChoicesForType = (
  currentChoices: Choice[],
  newType: "MCQ" | "MSQ" | "TF",
  questionId: string = ""
): Choice[] => {
  // Converting to True/False
  if (newType === "TF") {
    // Keep the first 2 choices, convert text to True/False
    // This preserves the choice IDs
    if (currentChoices.length >= 2) {
      return [
        {
          ...currentChoices[0],
          text: "True",
          isCorrect: currentChoices[0].isCorrect || true, // Default first as correct
          questionId,
        },
        {
          ...currentChoices[1],
          text: "False",
          isCorrect: currentChoices[1].isCorrect ? false : false, // Ensure only one correct
          questionId,
        },
      ];
    }
    // Fallback: create new TF choices if less than 2 exist
    return getDefaultChoices("TF", questionId);
  }

  // Converting FROM True/False to MCQ/MSQ
  const isTrueFalse =
    currentChoices.length === 2 &&
    currentChoices[0]?.text === "True" &&
    currentChoices[1]?.text === "False";

  if (isTrueFalse) {
    // We only have 2 choices, need to create 4 for MCQ/MSQ
    // Keep the existing 2 with empty text, add 2 new ones
    const newChoices: Choice[] = [
      { ...currentChoices[0], text: "", isCorrect: false, questionId },
      { ...currentChoices[1], text: "", isCorrect: false, questionId },
      { id: "", questionId, text: "", isCorrect: false },
      { id: "", questionId, text: "", isCorrect: false },
    ];
    return newChoices;
  }

  // Converting between MCQ and MSQ (already have 4 choices)
  const hasExactly4Choices = currentChoices.length === 4;

  if (!hasExactly4Choices) {
    // If not exactly 4 choices, create fresh ones
    return getDefaultChoices(newType, questionId);
  }

  // Keep the choices but adjust correctness based on new type
  const newChoices = currentChoices.map((c) => ({ ...c, questionId }));

  if (newType === "MCQ") {
    // MCQ: Only allow 1 correct answer
    // Keep the first correct answer, uncheck the rest
    let foundFirst = false;
    newChoices.forEach((choice) => {
      if (choice.isCorrect && !foundFirst) {
        foundFirst = true;
      } else if (choice.isCorrect) {
        choice.isCorrect = false;
      }
    });
  }

  // MSQ: No changes needed, it can have 0-4 correct

  return newChoices;
};
