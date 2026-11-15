import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/layout/Sidebar.jsx';
import { OfflineBanner } from './components/common/ConnectionStatus.jsx';
import useConnection from './hooks/useConnection';
import Dashboard from './pages/Dashboard.jsx';
import Habits from './pages/Habits.jsx';
import Calendar from './pages/Calendar.jsx';
import Analytics from './pages/Analytics.jsx';
import Achievements from './pages/Achievements.jsx';
import NotFound from './pages/NotFound.jsx';
export default function App() {
  const conn = useConnection();
  return (
    <div className="app">
      <Sidebar status={conn.status} />
      <main className="main">
        {conn.status === 'offline' && <OfflineBanner onRetry={conn.retry} />}
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: 12, color: '#2b2838' } }} />
    </div>
  );
}
