import React from 'react';
import { Menu, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 h-16 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg md:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold text-gray-800 md:hidden">Menu</h2>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-600 hidden sm:block">
          Admin Logado
        </span>
        <NavLink
          to="/admin"
          className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-200 transition"
        >
          <User className="w-4 h-4" />
        </NavLink>
      </div>
    </header>
  );
}