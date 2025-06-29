import React, { useState } from 'react';
import Sidebar from '../shared/Sidebar'; 
import { Outlet } from 'react-router-dom';

export default function ProtectedLayout() {
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setSidebarOpen((prev) => !prev);
    };

    return (
        <div className="app-container">
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <main className={`main-content ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
            <Outlet />
        </main>
        </div>
    );
}
