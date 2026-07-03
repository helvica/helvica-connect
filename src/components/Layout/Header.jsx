import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, Sun, Moon, Menu } from 'lucide-react';
import NotificationDropdown from '../Notifications/NotificationDropdown';

export default function Header({ setSidebarOpen }) {
  const { currentUser, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <>
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-neutral-200 bg-white px-4 md:px-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 transition-colors">
      <div className="flex items-center">
        <button 
          className="mr-3 md:hidden p-1 -ml-1 text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-white rounded-md"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold text-neutral-900 dark:text-white">Workspace</h1>
      </div>
      <div className="flex items-center gap-4">
        <NotificationDropdown />
        <div className="h-8 w-px bg-neutral-200 dark:bg-neutral-700" />
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right">
            <span className="text-sm font-medium text-neutral-900 dark:text-white">{currentUser?.displayName}</span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">Admin</span>
          </div>
          <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold dark:bg-indigo-900 dark:text-indigo-300">
            {currentUser?.displayName?.charAt(0) || 'A'}
          </div>
          <button onClick={() => setShowLogoutModal(true)} className="ml-2 text-neutral-400 hover:text-red-500 transition-colors">
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                <LogOut className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-2">Sign Out</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Are you sure you want to sign out? You will need to enter your credentials to access the dashboard again.
              </p>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-800/50 px-6 py-4 flex gap-3 justify-end border-t border-neutral-100 dark:border-neutral-800">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-600 dark:hover:bg-neutral-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutModal(false);
                  logout();
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
