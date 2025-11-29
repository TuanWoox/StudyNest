import { useState, useCallback } from "react";
import {
  validateCreateQuestion,
  validateUpdateQuestion,
} from "@/utils/validation/questionValidation";
import { ChoiceDTO } from "@/types/question/createQuestionDTO";

interface ValidationError {
  message: string;
}

interface UseQuestionValidationReturn {
  validationError: ValidationError | null;
  validateForCreate: (
    name: string,
    type: string,
    explanation: string | undefined,
    choices: ChoiceDTO[]
  ) => boolean;
  validateForUpdate: (
    questionId: string,
    name: string,
    type: string,
    explanation: string | undefined,
    choices: ChoiceDTO[]
  ) => boolean;
  clearValidationError: () => void;
}

/**
 * Hook for question validation with error state management
 * Matches backend QuestionBusiness.ValidateQuestion logic
 */
export function useQuestionValidation(): UseQuestionValidationReturn {
  const [validationError, setValidationError] = useState<ValidationError | null>(
    null
  );

  const validateForCreate = useCallback(
    (
      name: string,
      type: string,
      explanation: string | undefined,
      choices: ChoiceDTO[]
    ): boolean => {
      const result = validateCreateQuestion(name, type, explanation, choices);
      
      if (!result.isValid) {
        setValidationError({ message: result.error || "Validation failed" });
        return false;
      }
      
      setValidationError(null);
      return true;
    },
    []
  );

  const validateForUpdate = useCallback(
    (
      questionId: string,
      name: string,
      type: string,
      explanation: string | undefined,
      choices: ChoiceDTO[]
    ): boolean => {
      const result = validateUpdateQuestion(
        questionId,
        name,
        type,
        explanation,
        choices
      );
      
      if (!result.isValid) {
        setValidationError({ message: result.error || "Validation failed" });
        return false;
      }
      
      setValidationError(null);
      return true;
    },
    []
  );

  const clearValidationError = useCallback(() => {
    setValidationError(null);
  }, []);

  return {
    validationError,
    validateForCreate,
    validateForUpdate,
    clearValidationError,
  };
}
