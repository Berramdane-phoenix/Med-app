import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../shared/Header';
import Sidebar from '../shared/Sidebar';
import Footer from '../shared/Footer';

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="sidebar-layout">
      <div className="sidebar-layout__sidebar">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      </div>
      <div className="sidebar-layout__content">
        <Header toggleSidebar={toggleSidebar} />
        <main className="app-layout__main">
          <div className="container-fluid">
            <Outlet />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default MainLayout;