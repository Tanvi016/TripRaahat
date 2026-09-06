import { Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar.jsx';
import BottomNav from './BottomNav.jsx';
import Toasts from '../Toasts.jsx';

export default function AppShell() {
  const location = useLocation();
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="min-w-0 flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-8">
        <div className="mx-auto w-full max-w-5xl">
          {/* Restrained page transition — respects prefers-reduced-motion */}
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
      <BottomNav />
      <Toasts />
    </div>
  );
}