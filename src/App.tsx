import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import ToastContainer from './components/ui/ToastContainer';
import About from './pages/About';
import AccessCodes from './pages/AccessCodes';
import BotAccess from './pages/BotAccess';
import BotGroups from './pages/BotGroups';
import Chat from './pages/Chat';
import Home from './pages/Home';
import Login from './pages/Login';
import PublicBotChat from './pages/PublicBotChat';
import Register from './pages/Register';
import Settings from './pages/Settings';
import VoiceExamsList from './pages/VoiceExams';
import ConversationDetail from './pages/VoiceExams/ConversationDetail';
import ConversationHistory from './pages/VoiceExams/ConversationHistory';
import StudentExam from './pages/VoiceExams/StudentExam';
import VoiceAgentCreate from './pages/VoiceExams/VoiceAgentCreate';
import VoiceAgentDetail from './pages/VoiceExams/VoiceAgentDetail';
import { ThemeProvider } from './providers/ThemeProvider';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ToastContainer />
        <Routes>
          {/* Public routes (no auth required) */}
          <Route path="/public-deployment/bot/:botId" element={<PublicBotChat />} />

          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="access-codes" element={<AccessCodes />} />
            <Route path="settings" element={<Settings />} />
            <Route path="bot-groups" element={<BotGroups />} />
            <Route path="bot-access" element={<BotAccess />} />
            <Route path="bot-access/:botGroupId/:botId" element={<BotAccess />} />
            <Route path="chat" element={<Chat />} />
            <Route path="chat/:botId" element={<Chat />} />
            <Route path="voice-exams" element={<VoiceExamsList />} />
            <Route path="voice-exams/create" element={<VoiceAgentCreate />} />
            <Route path="voice-exams/conversations" element={<ConversationHistory />} />
            <Route path="voice-exams/conversations/:id" element={<ConversationDetail />} />
            <Route path="voice-exams/:id" element={<VoiceAgentDetail />} />
            <Route path="voice-exams/:id/exam" element={<StudentExam />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
