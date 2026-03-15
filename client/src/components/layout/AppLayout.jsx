import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import { motion } from 'framer-motion';

export default function AppLayout() {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 min-w-0 ml-0 md:ml-[260px] p-2 pt-4 pb-20 md:p-6 md:pb-6 lg:p-8"
      >
        <Outlet />
      </motion.main>
      <MobileNav />
    </div>
  );
}
