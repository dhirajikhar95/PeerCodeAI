import { useUser } from "@clerk/clerk-react";
import { Navigate, Route, Routes } from "react-router";
import HomePage from "./pages/HomePage";

import { Toaster } from "react-hot-toast";
import DashboardPage from "./pages/DashboardPage";
import TeacherDashboard from "./pages/TeacherDashboard";
import CreateQuestionPage from "./pages/CreateQuestionPage";
import EditQuestionPage from "./pages/EditQuestionPage";
import FeedbackPage from "./pages/FeedbackPage";
import ProblemPage from "./pages/ProblemPage";
import ProblemsPage from "./pages/ProblemsPage";
import SessionPage from "./pages/SessionPage";
import RoleSelectionPage from "./pages/RoleSelectionPage";
import MyQuestionsPage from "./pages/MyQuestionsPage";
import SessionsPage from "./pages/SessionsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import JoinSessionPage from "./pages/JoinSessionPage";
import MyProgressPage from "./pages/MyProgressPage";
import MySessionsPage from "./pages/MySessionsPage";
import { useUserRole } from "./hooks/useUserRole";

function App() {
  const { isSignedIn, isLoaded } = useUser();
  const { data: userData, isLoading: isLoadingUser, error: userError } = useUserRole();

  // Loading state
  if (!isLoaded || (isSignedIn && isLoadingUser)) {
    return (
      <div className="flex justify-center items-center h-screen bg-base-300">
        <div className="text-center max-w-sm px-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content/70">Loading...</p>
          <p className="mt-2 text-sm text-base-content/50">
            First load may take up to 30 seconds as our free server wakes up. Thanks for your patience!
          </p>
        </div>
      </div>
    );
  }

  // Check if user needs to select role
  // Role is null, undefined, OR the role field simply doesn't exist on the object
  const userRole = userData?.role;
  const needsRoleSelection = isSignedIn && userData && !userRole;
  const isTeacher = userRole === "teacher";
  const isStudent = userRole === "student";

  return (
    <>
      <Routes>
        {/* Public route */}
        <Route path="/" element={!isSignedIn ? <HomePage /> : <Navigate to="/dashboard" />} />

        {/* Role selection - shown when user has no role set */}
        <Route
          path="/select-role"
          element={
            isSignedIn ? (
              needsRoleSelection ? <RoleSelectionPage /> : <Navigate to="/dashboard" />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Dashboard - redirects to role selection if needed */}
        <Route
          path="/dashboard"
          element={
            isSignedIn ? (
              needsRoleSelection ? (
                <Navigate to="/select-role" />
              ) : isTeacher ? (
                <TeacherDashboard />
              ) : (
                <DashboardPage />
              )
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route
          path="/questions/create"
          element={
            isSignedIn && isTeacher ? <CreateQuestionPage /> : <Navigate to="/dashboard" />
          }
        />
        <Route
          path="/questions/edit/:id"
          element={
            isSignedIn && isTeacher ? <EditQuestionPage /> : <Navigate to="/dashboard" />
          }
        />
        <Route
          path="/my-questions"
          element={
            isSignedIn && isTeacher ? <MyQuestionsPage /> : <Navigate to="/dashboard" />
          }
        />
        <Route
          path="/sessions"
          element={
            isSignedIn && isTeacher ? <SessionsPage /> : <Navigate to="/dashboard" />
          }
        />
        <Route
          path="/analytics"
          element={
            isSignedIn && isTeacher ? <AnalyticsPage /> : <Navigate to="/dashboard" />
          }
        />

        {/* Student-only routes */}
        <Route
          path="/join-session"
          element={
            isSignedIn && isStudent ? <JoinSessionPage /> : <Navigate to="/dashboard" />
          }
        />
        <Route
          path="/my-progress"
          element={
            isSignedIn && isStudent ? <MyProgressPage /> : <Navigate to="/dashboard" />
          }
        />
        <Route
          path="/my-sessions"
          element={
            isSignedIn && isStudent ? <MySessionsPage /> : <Navigate to="/dashboard" />
          }
        />

        {/* Shared routes (require auth) */}
        <Route
          path="/problems"
          element={isSignedIn ? <ProblemsPage /> : <Navigate to="/" />}
        />
        <Route
          path="/problem/:id"
          element={isSignedIn ? <ProblemPage /> : <Navigate to="/" />}
        />
        <Route
          path="/session/:id"
          element={isSignedIn ? <SessionPage /> : <Navigate to="/" />}
        />
        <Route
          path="/feedback/:id"
          element={isSignedIn ? <FeedbackPage /> : <Navigate to="/" />}
        />
      </Routes>

      <Toaster toastOptions={{ duration: 3000 }} />
    </>
  );
}

export default App;
