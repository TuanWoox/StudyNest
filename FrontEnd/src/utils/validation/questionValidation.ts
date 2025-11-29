import { ChoiceDTO } from "@/types/question/createQuestionDTO";

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Count words in a string (matching backend CountWords logic)
 */
function countWords(text: string): number {
  if (!text || text.trim().length === 0) return 0;
  const parts = text.trim().split(/[\s\n\r\t]+/);
  return parts.filter((p) => p.length > 0).length;
}

/**
 * Ensure choice count matches expected
 */
function ensureChoiceCount(
  choices: ChoiceDTO[],
  expectedCount: number,
  message: string
): ValidationResult {
  if (choices.length !== expectedCount) {
    return { isValid: false, error: message };
  }
  return { isValid: true };
}

/**
 * Validate MCQ (Multiple Choice Question)
 * - Must have exactly 4 choices
 * - Must have exactly 1 correct answer
 */
function validateMcq(choices: ChoiceDTO[]): ValidationResult {
  const countResult = ensureChoiceCount(
    choices,
    4,
    "MCQ must have exactly 4 choices."
  );
  if (!countResult.isValid) return countResult;

  const correctCount = choices.filter((c) => c.isCorrect).length;
  if (correctCount !== 1) {
    return { isValid: false, error: "MCQ must have exactly 1 correct answer." };
  }

  return { isValid: true };
}

/**
 * Validate MSQ (Multiple Select Question)
 * - Must have exactly 4 choices
 * - Must have at least 2 correct answers
 */
function validateMsq(choices: ChoiceDTO[]): ValidationResult {
  const countResult = ensureChoiceCount(
    choices,
    4,
    "MSQ must have exactly 4 choices."
  );
  if (!countResult.isValid) return countResult;

  const correctCount = choices.filter((c) => c.isCorrect).length;
  if (correctCount < 2) {
    return {
      isValid: false,
      error: "MSQ must have at least 2 correct answers.",
    };
  }

  return { isValid: true };
}

/**
 * Validate TF (True/False Question)
 * - Must have exactly 2 choices
 * - Choices must be "True" and "False"
 * - Must have exactly 1 correct answer
 */
function validateTf(choices: ChoiceDTO[]): ValidationResult {
  const countResult = ensureChoiceCount(
    choices,
    2,
    "TF question must have exactly 2 choices: True and False."
  );
  if (!countResult.isValid) return countResult;

  const hasTrue = choices.some(
    (c) => c.text?.trim().toLowerCase() === "true"
  );
  const hasFalse = choices.some(
    (c) => c.text?.trim().toLowerCase() === "false"
  );

  if (!hasTrue || !hasFalse) {
    return {
      isValid: false,
      error: "TF question must contain only 'True' and 'False' as choices.",
    };
  }

  const correctCount = choices.filter((c) => c.isCorrect).length;
  if (correctCount !== 1) {
    return {
      isValid: false,
      error: "TF question must have exactly 1 correct answer.",
    };
  }

  return { isValid: true };
}

/**
 * Validate choices by question type
 */
function validateChoiceByType(
  type: string,
  choices: ChoiceDTO[]
): ValidationResult {
  const normalizedType = type.trim().toUpperCase();

  switch (normalizedType) {
    case "MCQ":
      return validateMcq(choices);
    case "MSQ":
      return validateMsq(choices);
    case "TF":
      return validateTf(choices);
    default:
      return {
        isValid: false,
        error: "Invalid question type. Supported types: MCQ, MSQ, TF.",
      };
  }
}

/**
 * Main question validation function (matches backend ValidateQuestion)
 * @param name Question title
 * @param type Question type (MCQ, MSQ, TF)
 * @param explanation Optional explanation
 * @param choices List of choices
 * @param isUpdate Whether this is an update operation
 * @param questionId Current question ID (for update validation)
 */
export function validateQuestion(
  name: string,
  type: string,
  explanation: string | undefined,
  choices: ChoiceDTO[],
  isUpdate: boolean = false,
  questionId?: string
): ValidationResult {
  // Validate question title
  if (!name || name.trim().length === 0) {
    return {
      isValid: false,
      error: "Question title is required and must not exceed 300 characters.",
    };
  }
  if (name.trim().length > 300) {
    return {
      isValid: false,
      error: "Question title is required and must not exceed 300 characters.",
    };
  }

  // Validate question type
  if (!type || type.trim().length === 0) {
    return {
      isValid: false,
      error: "Question type is missing. Please select MCQ, MSQ, or TF.",
    };
  }

  // Validate each choice text
  for (const choice of choices) {
    if (!choice.text || choice.text.trim().length === 0) {
      return { isValid: false, error: "Each choice must have text content." };
    }
    if (choice.text.trim().length > 200) {
      return {
        isValid: false,
        error: "Choice text must not exceed 200 characters.",
      };
    }
  }

  // Check for duplicate choice texts
  const textMap = new Map<string, number>();
  for (const choice of choices) {
    const normalizedText = (choice.text || "").trim().toLowerCase();
    textMap.set(normalizedText, (textMap.get(normalizedText) || 0) + 1);
  }
  const duplicates = Array.from(textMap.entries())
    .filter(([_, count]) => count > 1)
    .map(([text]) => text);

  if (duplicates.length > 0) {
    return {
      isValid: false,
      error: `Duplicate choice texts found: ${duplicates.join(", ")}.`,
    };
  }

  // Validate choices by type
  const typeValidation = validateChoiceByType(type, choices);
  if (!typeValidation.isValid) {
    return typeValidation;
  }

  // Validate explanation word count
  if (explanation && explanation.trim().length > 0) {
    const wordCount = countWords(explanation);
    if (wordCount > 200) {
      return {
        isValid: false,
        error: "Explanation should be concise (maximum 200 words).",
      };
    }
  }

  return { isValid: true };
}

/**
 * Validate question for create operation
 */
export function validateCreateQuestion(
  name: string,
  type: string,
  explanation: string | undefined,
  choices: ChoiceDTO[]
): ValidationResult {
  return validateQuestion(name, type, explanation, choices, false);
}

/**
 * Validate question for update operation
 */
export function validateUpdateQuestion(
  questionId: string,
  name: string,
  type: string,
  explanation: string | undefined,
  choices: ChoiceDTO[]
): ValidationResult {
  return validateQuestion(name, type, explanation, choices, true, questionId);
}
