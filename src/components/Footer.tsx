import React from 'react';
import { Zap, Mail } from 'lucide-react';

interface FooterProps {
  platformName?: string;
  supportEmail?: string;
}

export const Footer: React.FC<FooterProps> = ({
  platformName = 'ZEUS SITES IA',
  supportEmail = 'contato@zeussitesia.com'
}) => {
  return (
    <footer className="w-full bg-[#08040d] border-t border-purple-900/30 py-10 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#7028E8] flex items-center justify-center">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
          <div>
            <span className="font-heading font-bold text-white text-sm tracking-wider">
              {platformName}
            </span>
            <span className="block text-[11px] text-purple-400">
              Crie Sites com IA e Revenda para Empresas
            </span>
          </div>
        </div>

        {/* Support info */}
        <div className="flex items-center gap-4 text-center sm:text-right">
          <a
            href={`mailto:${supportEmail}`}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-[#A855F7]" />
            <span>Suporte: {supportEmail}</span>
          </a>
        </div>

        {/* Copyright */}
        <div className="text-[11px] text-slate-400">
          © {new Date().getFullYear()} {platformName}. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};
