import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inbox from './pages/Inbox';
import Campaigns from './pages/Campaigns';
import Templates from './pages/Templates';
import Automation from './pages/Automation';
import Catalog from './pages/Catalog';
import Contacts from './pages/Contacts';
import Agents from './pages/Agents';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import Integrations from './pages/Integrations';
import EmailChat from './pages/EmailChat';
import EmailChatSettings from './pages/EmailChatSettings';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<Layout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/inbox" element={<Inbox />} />
                <Route path="/campaigns" element={<Campaigns />} />
                <Route path="/templates" element={<Templates />} />
                <Route path="/automation" element={<Automation />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/agents" element={<Agents />} />
                <Route path="/integrations" element={<Integrations />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/email-chat" element={<EmailChat />} />
                <Route path="/email-chat/settings" element={<EmailChatSettings />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
