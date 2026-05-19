import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import Login from '../../pages/Login';

export default function AppLayout() {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (!user) {
    return <Login />;
  }

  return (
    <div className="h-screen bg-[#0b0f19] text-slate-100 flex flex-col selection:bg-purple-500 selection:text-white overflow-hidden">
      <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex flex-1 w-full max-w-[1920px] mx-auto overflow-hidden">
        <Sidebar isOpen={isSidebarOpen} />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full transition-all duration-300">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
