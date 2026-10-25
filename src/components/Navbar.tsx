import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Zap, Settings, LogOut, Shield } from 'lucide-react';

interface NavbarProps {
  onOpenAdmin: () => void;
  platformName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAdmin, platformName = 'ZEUS SITES IA' }) => {
  const { user, isAdmin, logout } = useAuth();

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0B0710]/90 border-b border-purple-900/30 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single element Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7028E8] to-[#A855F7] p-0.5 shadow-md shadow-purple-900/40 flex items-center justify-center">
            <div className="w-full h-full bg-[#0B0710] rounded-[10px] flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#A855F7] fill-[#A855F7]" />
            </div>
          </div>
          <a
            href="#topo"
            onClick={(e) => {
              e.preventDefault();
              scrollTo('topo');
            }}
            className="text-lg font-extrabold tracking-wider text-white font-heading whitespace-nowrap hover:text-purple-300 transition-colors"
          >
            {platformName}
          </a>
        </div>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs lg:text-sm font-medium text-slate-300">
          <button
            onClick={() => scrollTo('apresentacao')}
            className="hover:text-white transition-colors whitespace-nowrap cursor-pointer"
          >
            Apresentação
          </button>
          <button
            onClick={() => scrollTo('etapas')}
            className="hover:text-white transition-colors whitespace-nowrap cursor-pointer"
          >
            As 8 Etapas
          </button>
          <button
            onClick={() => scrollTo('video-aula')}
            className="hover:text-white transition-colors whitespace-nowrap cursor-pointer"
          >
            Aula em Vídeo
          </button>
          <button
            onClick={() => scrollTo('prompts-prontos')}
            className="hover:text-white transition-colors whitespace-nowrap cursor-pointer"
          >
            Prompts Prontos
          </button>
          <button
            onClick={() => scrollTo('conclusao')}
            className="hover:text-white transition-colors whitespace-nowrap cursor-pointer"
          >
            Conclusão
          </button>
        </nav>

        {/* Zone 3: Actions (Admin Button if admin + User info + Logout) */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Admin Dashboard trigger - strictly visible ONLY to admins */}
          {isAdmin && (
            <button
              onClick={onOpenAdmin}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-900/60 to-purple-800/40 hover:from-purple-800 hover:to-purple-700 border border-purple-500/40 text-purple-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer whitespace-nowrap"
              title="Abrir painel administrativo para editar o conteúdo do site"
            >
              <Settings className="w-3.5 h-3.5 text-[#A855F7]" />
              <span className="hidden sm:inline">Painel Admin</span>
            </button>
          )}

          {/* User Status pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-950/40 border border-purple-900/40 text-[11px] text-purple-300">
            {isAdmin ? (
              <Shield className="w-3 h-3 text-[#A855F7]" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
            <span className="font-semibold text-white">{user?.username}</span>
            <span className="text-purple-400/80">({user?.role === 'admin' ? 'Admin' : 'Aluno'})</span>
          </div>

          {/* Logout button */}
          <button
            onClick={() => logout()}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-purple-950/50 border border-transparent hover:border-purple-800/40 transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            title="Sair da conta"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
};
