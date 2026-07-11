import { NavLink } from 'react-router-dom';
import { Home, Trophy, Settings, Skull, X, ClipboardList } from 'lucide-react';
import { CalendarDays } from "lucide-react";
import { ShoppingCart } from "lucide-react";

interface SidebarProps {
  open: boolean;
  setOpen: (value: boolean) => void;
}


export function Sidebar({ open, setOpen }: SidebarProps) {
  const links = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/tarefas', icon: ClipboardList, label: 'Escala' },
    { to: "/compras", icon: ShoppingCart, label: "Compras" },
    { to: '/ranking', icon: Trophy, label: 'Ranking' },
    { to:'/historico', icon:CalendarDays, label:'Histórico'},
    { to: '/ranking-da-vergonha', icon: Skull, label: 'Ranking dos Porcos' },
    { to: '/admin', icon: Settings, label: 'Administração' }
  ];

  return (
    <>
      {/* Fundo escuro no mobile */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
        />
      )}

      <aside
        className={`
          fixed md:sticky top-0 left-0 z-50
          w-64 h-screen bg-white border-r border-gray-200
          flex flex-col
          transition-transform duration-300

          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >

        <div className="p-6 border-b border-gray-200 flex justify-between">
          <h1 className="text-xl font-bold">
            🧹 Apto 404
          </h1>

          <button
            className="md:hidden"
            onClick={() => setOpen(false)}
          >
            <X />
          </button>
        </div>


        <nav className="flex-1 p-4 space-y-1">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              //onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `
                flex items-center gap-3 
                px-3 py-2 
                rounded-xl
                transition-all duration-200
                font-medium

                ${
                  isActive
                    ? to === "/rankingdavergonha"
                      ? "bg-red-50 text-red-700 shadow-sm"
                      : "bg-blue-50 text-blue-700 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }
                `
              }
            >
              <Icon className="w-5 h-5" />

              <span>
                {label}
              </span>

            </NavLink>
          ))}
        </nav>

      </aside>
    </>
  );
}