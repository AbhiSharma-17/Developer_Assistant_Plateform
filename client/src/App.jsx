import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Snippets from './pages/Snippets';
import Notes from './pages/Notes';
import PromptVault from './pages/PromptVault';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import GitHub from './pages/GitHub';
import AICopilot from './pages/AICopilot';
import ActivityLogs from './pages/ActivityLogs';
import FileStorage from './pages/FileStorage';
import Notifications from './pages/Notifications';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <ThemeProvider>
          <AuthProvider>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected App Routes */}
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="projects" element={<Projects />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="copilot" element={<AICopilot />} />
                <Route path="chat" element={<Chat />} />
                <Route path="github" element={<GitHub />} />
                <Route path="files" element={<FileStorage />} />
                <Route path="snippets" element={<Snippets />} />
                <Route path="notes" element={<Notes />} />
                <Route path="prompts" element={<PromptVault />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="activity" element={<ActivityLogs />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="settings" element={<Settings />} />
              </Route>





              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </ThemeProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}


