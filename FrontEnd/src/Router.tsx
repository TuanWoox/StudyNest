import { createBrowserRouter, Navigate } from "react-router-dom";

import CenterLayout from "./layouts/CenterLayout";
import InnerLayout from "./layouts/InnerLayout";

// Auth features
import Login from "./features/auth/Login";
import Register from "./features/auth/Register";

// User features
import NotesPage from "./features/user/notes/NotesPage";
import Quizzes from "./features/user/Quizzes";
import Analytics from "./features/user/Analytics";
import Feedback from "./features/user/Feedback";

// Admin features
import Dashboard from "./features/admin/Dashboard";
import ManageUser from "./features/admin/ManageUser";
import AdminFeedback from "./features/admin/ManageFeedback";;
import QuizGeneration from "./features/user/quizzes/QuizGeneration";
import QuizDetailPage from "./features/user/quizzes/QuizDetailPage";
import QuizView from "./features/user/quizzes/QuizAttempt/QuizAttemptView";
import QuizResultView from "./features/user/quizzes/QuizAttemptResult/QuizResultView";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <CenterLayout />,
    children: [
      { index: true, element: <Navigate to="/login" /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
    ],
  },
  {
    path: "/user",
    element: <InnerLayout />,
    children: [
      { index: true, element: <Navigate to="/user/notes" /> },
      { path: "notes", element: <NotesPage /> },
      { path: "quiz", element: <Quizzes /> },
      { path: "quiz/generate", element: <QuizGeneration /> },
      { path: "quiz/:id", element: <QuizDetailPage /> },
      { path: "quiz/quizAttempt/:id", element: <QuizView /> },
      { path: "quiz/quizAttemptResult/:id", element: <QuizResultView /> },
      { path: "analytics", element: <Analytics /> },
      { path: "feedback", element: <Feedback /> },
    ],
  },
  {
    path: "/admin",
    element: <InnerLayout />,
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "users", element: <ManageUser /> },
      { path: "feedback", element: <AdminFeedback /> },
    ],
  },
]);
