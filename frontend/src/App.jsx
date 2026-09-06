import { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import AppShell from './components/navigation/AppShell.jsx';
import HomePage from './pages/app/HomePage.jsx';
import FinancePage from './pages/app/FinancePage.jsx';
import TripPage from './pages/app/TripPage.jsx';
import RecoveryPage from './pages/app/RecoveryPage.jsx';
import GroupPage from './pages/app/GroupPage.jsx';
import DocumentsPage from './pages/app/DocumentsPage.jsx';
import DeadlinesPage from './pages/app/DeadlinesPage.jsx';
import AssistantPage from './pages/app/AssistantPage.jsx';
import SOSModal from './components/emergency/SOSModal.jsx';
import { useTrip } from './context/TripContext.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

export default function App() {
  const { state, dispatch } = useTrip();
  const [sosOpen, setSosOpen] = useState(false);

  // Listen for SOS open event from bottom nav
  useEffect(() => {
    const handler = () => setSosOpen(true);
    window.addEventListener('tripsync:sos-open', handler);
    return () => window.removeEventListener('tripsync:sos-open', handler);
  }, []);

  // Auto-open SOS when requested via reducer
  useEffect(() => {
    if (state.sos?.gpsStatus === 'searching') {
      setSosOpen(true);
    }
  }, [state.sos?.gpsStatus]);

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="finance" element={<FinancePage />} />
          <Route path="trip" element={<TripPage />} />
          <Route path="recovery" element={<RecoveryPage />} />
          <Route path="group" element={<GroupPage />} />
          <Route path="groups" element={<Navigate to="/app/group" replace />} />
          <Route path="documents" element={<DocumentsPage />} />
          <Route path="deadlines" element={<DeadlinesPage />} />
          <Route path="assistant" element={<AssistantPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <SOSModal open={sosOpen} onClose={() => setSosOpen(false)} />
    </>
  );
}
