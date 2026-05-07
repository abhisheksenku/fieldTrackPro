import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
    const { userInfo, logoutAction } = useContext(AuthContext);
    const navigate = useNavigate();
    const handleLogout = () => {
        logoutAction();
        navigate('/');
    };
    if(!userInfo) return null;
    return (
        <nav className="bg-slate-900 p-4 text-white flex justify-between items-center shadow-md">
            {/* Logo */}
            <div className="font-bold text-xl tracking-tight text-blue-400">
                FieldTrack<span className="text-white">Pro</span>
            </div>
            
            {/* --- 2. NEW: DYNAMIC NAVIGATION MENU --- */}
            <div className="flex gap-6 font-medium text-sm">
                
                {/* Admin-only links */}
                {userInfo.user.role === 'Admin' && (
                    <>
                        <Link to="/admin" className="hover:text-blue-400 transition-colors">Command Center</Link>
                        <Link to="/admin/logs" className="hover:text-blue-400 transition-colors">Audit Logs</Link>
                        <Link to="/admin/users" className="hover:text-blue-400 transition-colors">User Manager</Link>
                        <Link to="/admin/analytics" className="hover:text-blue-400 transition-colors">Analytics</Link>
                    </>
                )}

                {/* Editor-only links */}
                {userInfo.user.role === 'Editor' && (
                    <Link to="/editor" className="hover:text-blue-400 transition-colors">Reports & Logs</Link>
                )}

                {/* User-only links */}
                {userInfo.user.role === 'User' && (
                    <Link to="/user" className="hover:text-blue-400 transition-colors">Field Punch</Link>
                )}
                
            </div>
            {/* ----------------------------------------- */}

            {/* User Info & Logout */}
            <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                    <div className="text-sm font-bold">{userInfo.user.name}</div>
                    <div className="text-xs text-slate-400">{userInfo.user.role}</div>
                </div>
                <button 
                    onClick={handleLogout} 
                    className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-sm font-bold transition-all"
                >
                    Logout
                </button>
            </div>
        </nav>
    );
}
export default Navbar;