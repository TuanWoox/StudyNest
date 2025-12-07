import { createBrowserRouter, Navigate } from "react-router-dom";

// Layouts
import CenterLayout from "./layouts/CenterLayout";
import UserLayout from "./layouts/UserLayout";
import AdminLayout from "./layouts/AdminLayout";

// Guest features
import EntryComponent from "./features/guest/Entry/EntryComponent";
import Login from "./features/guest/Login/Login";
import Register from "./features/guest/Register/Register";
import ForgotPassword from "./features/guest/ForgotPassword/ForgotPassword";
import ResetPassword from "./features/guest/ResetPassword/ResetPassword";
import { LandingPage } from "./features/guest/HomePage/HomePage";

// User features
import NotesPage from "./features/user/notes/Notes/NotesPage";
import Quizzes from "./features/user/quizzes/Quizzes/Quizzes";
import QuizGeneration from "./features/user/quizzes/QuizGeneration/QuizGeneration";
import QuizDetailPage from "./features/user/quizzes/QuizDetailPage/QuizDetailPage";
import QuizView from "./features/user/quizzes/QuizAttempt/QuizAttemptView";
import QuizResultView from "./features/user/quizzes/QuizAttemptResult/QuizResultView";
import QuizHistory from "./features/user/quizzes/QuizHistory/QuizHistory";
import ChangePassword from "./features/user/changePassword/ChangePassword";
import Feedbacks from "./features/user/feedbacks/Feedbacks/Feedbacks";
import { NotFoundPage } from "./components/NotFoundPage/NotFoundPage";

// Admin features
import SettingsConfig from "./features/admin/settings/SettingsConfig";
import AdminFeedBacks from "./features/admin/feedbacks/Feedbacks/FeedBacks";
import QuizzesExplore from "./features/user/quizzes/QuizzesExplore/QuizzesExplore";
import QuizSessionPlay from "./features/user/quizSessions/QuizSessionPLay/QuizSessionPlay";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <CenterLayout />,
    children: [
      { index: true, element: <EntryComponent /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "forgot-password", element: <ForgotPassword /> },
      { path: "reset-password", element: <ResetPassword /> },
    ],
  },
  {
    path: "/user",
    element: <UserLayout />,
    children: [
      { index: true, element: <Navigate to="/user/notes" /> },
      { path: "notes", element: <NotesPage /> },
      { path: "quiz", element: <Quizzes /> },
      { path: "exploreQuiz", element: <QuizzesExplore /> },
      { path: "quiz/generate", element: <QuizGeneration /> },
      { path: "quiz/:id", element: <QuizDetailPage /> },
      { path: "quiz/history/:id", element: <QuizHistory /> },
      { path: "quiz/quizAttempt/:id", element: <QuizView /> },
      { path: "quiz/quizAttemptResult/:id", element: <QuizResultView /> },
      { path: "quizSession/play/:sessionId", element: <QuizSessionPlay /> },
      { path: "feedbacks", element: <Feedbacks /> },
      { path: "change-password", element: <ChangePassword /> },
    ],
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="/admin/settings" /> },
      { path: "settings", element: <SettingsConfig /> },
      { path: "feedbacks", element: <AdminFeedBacks /> },
    ],
  },
  {
    path: "/homepage", element: <LandingPage />,
  },
  {
    path: "*", element: <NotFoundPage />
  }
]);
