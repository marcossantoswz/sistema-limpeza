import React, { useState } from 'react';
import { Menu, X } from 'lucide-react'; // Certifique-se de importar esses ícones

export function Layout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* BOTÃO MOBILE */}
      <div className="lg:hidden p-4 bg-white border-b flex justify-between items-center">
        <span className="font-bold text-lg">CleanSync</span>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div className="flex">
        {/* MENU LATERAL - Adicione a lógica de classes aqui */}
        <div className={`fixed inset-y-0 left-0 z-50 bg-white w-64 transform transition-transform duration-300 lg:static lg:transform-none ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          {/* ... seus links (Início, Ranking, Admin) ... */}
        </div>

        {/* OVERLAY (Fundo escuro quando aberto) */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        <main className="flex-1 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}