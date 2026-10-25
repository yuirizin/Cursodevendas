import React from 'react';
import { SiteSettings } from '../types/index.js';
import { Zap, ArrowDown, Sparkles, CheckCircle2, Rocket } from 'lucide-react';

interface HeroSectionProps {
  settings: SiteSettings;
  onExploreClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ settings, onExploreClick }) => {
  return (
    <section id="apresentacao" className="relative pt-8 pb-16 sm:pt-12 sm:pb-20 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#7028E8]/10 blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main 2-column split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Text Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Tagline kicker */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-semibold tracking-wide">
              <Zap className="w-3.5 h-3.5 text-[#A855F7] fill-[#A855F7]" />
              <span>Plataforma Oficial de Formação Digital</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15] font-heading">
              {settings.mainTitle}
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-[#A855F7] font-semibold leading-relaxed">
              {settings.subtitle}
            </p>

            {/* Presentation Body Text */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#160827]/80 border border-purple-900/40 backdrop-blur-md shadow-xl text-slate-200 text-sm sm:text-base leading-relaxed space-y-3.5">
              {settings.welcomeText.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {/* Value Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-900/30 flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#A855F7] shrink-0" />
                <span className="text-xs text-slate-200 font-medium">8 Módulos Completos</span>
              </div>
              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-900/30 flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-[#A855F7] shrink-0" />
                <span className="text-xs text-slate-200 font-medium">Prompts para 8 Nichos</span>
              </div>
              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-900/30 flex items-center gap-2.5">
                <Rocket className="w-4 h-4 text-[#A855F7] shrink-0" />
                <span className="text-xs text-slate-200 font-medium">Método de Prospecção</span>
              </div>
            </div>

            {/* CTA Anchor button */}
            <div className="pt-2">
              <button
                onClick={onExploreClick}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#7028E8] to-[#A855F7] hover:from-[#6220D1] hover:to-[#9333EA] text-white font-semibold text-sm shadow-lg shadow-purple-900/50 hover:shadow-purple-900/70 transition-all flex items-center gap-2.5 cursor-pointer group"
              >
                <span>Explorar as 8 Etapas da Formação</span>
                <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Zeus Mentor Visual (5 cols) */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl overflow-hidden border border-purple-500/30 shadow-2xl bg-gradient-to-br from-[#1b0a33] to-[#0c0418] group">
              {/* Image */}
              <div className="relative aspect-square w-full overflow-hidden">
                <img
                  src={settings.zeusImage || '/src/assets/images/zeus_mentor_portrait_1792940298413.jpg'}
                  alt="Zeus Mentor - Criador de Sites com IA"
                  className="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#160827] via-transparent to-transparent opacity-90" />
              </div>

              {/* Character Badge Overlay */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-[#160827]/90 border border-purple-500/40 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-extrabold text-white font-heading flex items-center gap-2">
                      <span>Zeus · Cyber Mentor</span>
                      <Zap className="w-4 h-4 text-[#A855F7] fill-[#A855F7]" />
                    </h3>
                    <p className="text-xs text-purple-200/90 mt-0.5">
                      Inteligência, autoridade e domínio prático de mercado.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
