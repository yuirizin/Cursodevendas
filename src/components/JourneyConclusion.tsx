import React from 'react';
import { SiteSettings } from '../types/index.js';
import { Zap, ArrowUp, Award } from 'lucide-react';

const ZEUS_TRIUMPH_IMAGE = '/src/assets/images/zeus_triumph_mentor_1792940299198.jpg';

interface JourneyConclusionProps {
  settings: SiteSettings;
  onRestartClick: () => void;
}

export const JourneyConclusion: React.FC<JourneyConclusionProps> = ({ settings, onRestartClick }) => {
  return (
    <section id="conclusao" className="py-20 sm:py-28 relative overflow-hidden bg-gradient-to-b from-[#0B0710] via-[#150824] to-[#0B0710]">
      {/* Background radial glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#7028E8]/15 blur-[150px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="rounded-3xl bg-[#160827]/90 border border-purple-600/40 p-6 sm:p-10 lg:p-12 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {/* Top Zeus decorative badge */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#7028E8] to-[#A855F7] p-0.5 shadow-xl shadow-purple-900/60 mb-6 flex items-center justify-center">
              <div className="w-full h-full bg-[#0B0710] rounded-[14px] flex items-center justify-center">
                <Award className="w-8 h-8 text-[#A855F7]" />
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/70 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-4">
              <Zap className="w-3.5 h-3.5 text-[#A855F7] fill-[#A855F7]" />
              <span>Conclusão da Jornada Zeus Sites IA</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight font-heading max-w-3xl leading-snug">
              {settings.conclusionTitle}
            </h2>

            {/* Zeus Triumph Mentor Visual */}
            <div className="my-8 relative w-48 sm:w-56 aspect-square rounded-2xl overflow-hidden border-2 border-purple-500/50 shadow-2xl shadow-purple-900/50">
              <img
                src={ZEUS_TRIUMPH_IMAGE}
                alt="Zeus no encerramento triunfante da jornada"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#160827]/80 via-transparent to-transparent" />
            </div>

            {/* Text blocks */}
            <div className="max-w-3xl text-slate-200 text-sm sm:text-base leading-relaxed space-y-4 text-left sm:text-center">
              {settings.conclusionText.split('\n\n').map((paragraph, index) => (
                <p key={index} className="text-slate-200 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Final Action Button */}
            <div className="mt-10">
              <button
                onClick={onRestartClick}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-[#7028E8] via-[#8B3BEB] to-[#A855F7] hover:from-[#6220D1] hover:to-[#9333EA] text-white font-bold text-sm sm:text-base tracking-wide shadow-xl shadow-purple-900/60 hover:shadow-purple-900/80 transition-all flex items-center gap-3 cursor-pointer group"
              >
                <span>REVISAR AS OITO ETAPAS</span>
                <ArrowUp className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
