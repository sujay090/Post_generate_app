import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Squares2X2Icon,
  CalendarIcon,
  UsersIcon,
  UserPlusIcon,
  PhotoIcon,
  CloudArrowUpIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

const menuItems = [
  { label: 'Dashboard', icon: Squares2X2Icon, path: '/dashboard' },
  { label: 'Schedule', icon: CalendarIcon, path: '/schedule' },
  { label: 'Schedule List', icon: CalendarIcon, path: '/schedule-list' },
  { label: 'Customers List', icon: UsersIcon, path: '/customers-list' },
  { label: 'Add Customer', icon: UserPlusIcon, path: '/customers' },
  // { label: 'Posters', icon: PhotoIcon, path: '/posterList' },
  { label: 'Upload Poster', icon: CloudArrowUpIcon, path: '/upload' },
  { label: 'Profile', icon: CalendarIcon, path: '/profile' },
];

const SidebarLayout = ({ children }) => {
  const location = useLocation();
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef();

  // Close sidebar on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);

  // Trap focus inside sidebar when open
  useEffect(() => {
    if (!sidebarOpen || !sidebarRef.current) return;

    const focusableElements = sidebarRef.current.querySelectorAll(
      'a, button, [tabindex]:not([tabindex="-1"])'
    );
    const firstEl = focusableElements[0];
    const lastEl = focusableElements[focusableElements.length - 1];

    const trapFocus = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };

    document.addEventListener('keydown', trapFocus);
    firstEl?.focus();

    return () => document.removeEventListener('keydown', trapFocus);
  }, [sidebarOpen]);

  return (
    <div className="flex min-h-screen font-['Inter',sans-serif] bg-success/5">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between bg-[#144DA8] text-white px-4 py-3 fixed top-0 left-0 right-0 z-20 shadow-lg">
        <div className="text-xl font-bold">
          <span className="text-yellow-400">Post</span> Generator
        </div>
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
      </header>

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        role="dialog"
        aria-label="Sidebar navigation"
        className={`
          fixed top-0 left-0 h-full w-64 bg-success text-white flex flex-col
          transform transition-transform duration-300 ease-in-out z-30
          md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Close button */}
        <div className="md:hidden flex justify-end p-4">
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-white"
            aria-label="Close sidebar"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Logo */}
        <div className="text-xl font-bold px-6 py-5 border-b border-blue-800">
          <span className="text-yellow-400">Post</span> Generator
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {menuItems.map(({ label, icon: Icon, path }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setSidebarOpen(false)}
                className={`text-decoration-none flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-green-500 text-white shadow-inner font-semibold'
                    : 'hover:bg-blue-900 hover:text-white text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            );
          })}
          <button
            onClick={() => {
              logout();
              setSidebarOpen(false);
            }}
            className="mt-6 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-lg transition-transform hover:scale-105 w-full"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            Logout
          </button>
        </nav>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-40 z-20 md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Main Content */}
      <main className="flex-1 p-6 pt-16 md:pt-6 ml-0 md:ml-64 overflow-auto bg-success/5 shadow-inner min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default SidebarLayout;
