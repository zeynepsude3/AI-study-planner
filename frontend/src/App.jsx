import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout       from './components/Layout';
import AuthPage     from './pages/AuthPage';
import Dashboard    from './pages/Dashboard';
import CoursesPage  from './pages/CoursesPage';
import TasksPage    from './pages/TasksPage';
import ExamsPage    from './pages/ExamsPage';
import StudyPlanPage from './pages/StudyPlanPage';
import AdminPage from './pages/AdminPage'; 

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: "'DM Sans', sans-serif", color: '#9094a4' }}>
      Loading...
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route path="dashboard"   element={<Dashboard />} />
          <Route path="courses"     element={<CoursesPage />} />
          <Route path="tasks"       element={<TasksPage />} />
          <Route path="exams"       element={<ExamsPage />} />
          <Route path="study-plan"  element={<StudyPlanPage />} />
          <Route path="admin" element={<AdminPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
