import { QuizAttemptSnapshotDTO } from "@/types/quizAttemptSnapshot/quizAttemptSnapshotDTO";

// Helper function to parse quiz snapshot
const getQuizSnapshot = (snapshotString: string): QuizAttemptSnapshotDTO | null => {
    if (!snapshotString) return null;
    try {
        return JSON.parse(snapshotString) as QuizAttemptSnapshotDTO;
    } catch {
        return null;
    }
};

export default getQuizSnapshot;