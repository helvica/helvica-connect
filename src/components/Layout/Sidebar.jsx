import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, MessageCircle, Rocket, Layers, Zap, Settings, Headset, BookOpen, Store, Sun, Moon, Blocks, Bot } from 'lucide-react';
import clsx from 'clsx';
import { useTheme } from '../../contexts/ThemeContext';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: Home },
  { name: 'Inbox', path: '/inbox', icon: MessageCircle },
  { name: 'Contacts', path: '/contacts', icon: BookOpen },
  { name: 'Campaigns', path: '/campaigns', icon: Rocket },
  { name: 'Templates', path: '/templates', icon: Layers },
  { name: 'Automation', path: '/automation', icon: Zap },
  { name: 'Catalog', path: '/catalog', icon: Store },
  { name: 'Agents', path: '/agents', icon: Headset },
  { name: 'Integrations', path: '/integrations', icon: Blocks },
];

export default function Sidebar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex h-full w-64 flex-col bg-white text-neutral-600 border-r border-neutral-200 dark:bg-black dark:text-neutral-300 dark:border-neutral-800 transition-colors">
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-neutral-200 dark:border-neutral-800 transition-colors">
        <Bot className="h-8 w-8 text-indigo-500 mr-2" />
        <span className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">Helvica<span className="text-indigo-500">Connect</span></span>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6">
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                    : 'hover:bg-neutral-50 hover:text-neutral-900 dark:hover:bg-neutral-900/50 dark:hover:text-white',
                  'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors'
                )
              }
            >
              <item.icon className="mr-3 h-5 w-5 shrink-0" aria-hidden="true" />
              {item.name}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-2">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              clsx(
                isActive
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400'
                  : 'hover:bg-neutral-50 hover:text-neutral-900 dark:hover:bg-neutral-900/50 dark:hover:text-white',
                'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors'
              )
            }
          >
            <Settings className="mr-3 h-5 w-5 shrink-0" aria-hidden="true" />
            Settings
          </NavLink>
          <button
            onClick={toggleTheme}
            className="group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-neutral-50 hover:text-neutral-900 dark:hover:bg-neutral-900/50 dark:hover:text-white text-left w-full"
          >
            {theme === 'dark' ? (
              <Sun className="mr-3 h-5 w-5 shrink-0 text-amber-500" aria-hidden="true" />
            ) : (
              <Moon className="mr-3 h-5 w-5 shrink-0 text-indigo-500" aria-hidden="true" />
            )}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
      </div>
    </div>
  );
}
