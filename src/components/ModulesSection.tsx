import React, { useState } from 'react';
import { CourseModule } from '../types/index.js';
import { ModuleDetailModal } from './ModuleDetailModal.js';
import {
  Compass,
  Briefcase,
  Cpu,
  Code2,
  Sliders,
  Send,
  Handshake,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  BookOpen
} from 'lucide-react';

interface ModulesSectionProps {
  modules: CourseModule[];
}

export const ModulesSection: React.FC<ModulesSectionProps> = ({ modules }) => {
  const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null);
  const [completedModules, setCompletedModules] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('zeus_completed_modules');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const toggleComplete = (id: string) => {
    setCompletedModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      localStorage.setItem('zeus_completed_modules', JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1:
        return <Compass className="w-5 h-5 text-[#A855F7]" />;
      case 2:
        return <Briefcase className="w-5 h-5 text-[#A855F7]" />;
      case 3:
        return <Cpu className="w-5 h-5 text-[#A855F7]" />;
      case 4:
        return <Code2 className="w-5 h-5 text-[#A855F7]" />;
      case 5:
        return <Sliders className="w-5 h-5 text-[#A855F7]" />;
      case 6:
        return <Send className="w-5 h-5 text-[#A855F7]" />;
      case 7:
        return <Handshake className="w-5 h-5 text-[#A855F7]" />;
      case 8:
        return <TrendingUp className="w-5 h-5 text-[#A855F7]" />;
      default:
        return <BookOpen className="w-5 h-5 text-[#A855F7]" />;
    }
  };

  const currentIdx = selectedModule ? modules.findIndex((m) => m.id === selectedModule.id) : -1;
  const nextModule = currentIdx >= 0 && currentIdx < modules.length - 1 ? modules[currentIdx + 1] : undefined;

  return (
    <section id="etapas" className="py-16 sm:py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <span>Metodologia Zeus Sites IA</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight font-heading">
            Sua jornada começa aqui
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
            Oito módulos práticos desenvolvidos para guiar você desde a identificação do primeiro cliente até o fechamento e a escala do seu negócio digital.
          </p>

          {/* Progress bar */}
          <div className="mt-6 max-w-md mx-auto p-3 rounded-xl bg-[#160827]/80 border border-purple-900/40">
            <div className="flex justify-between text-xs text-purple-300 mb-1.5 font-medium">
              <span>Seu Progresso no Curso</span>
              <span className="font-mono tabular-nums text-white">
                {completedModules.size} de {modules.length} etapas concluídas
              </span>
            </div>
            <div className="w-full bg-purple-950/60 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#7028E8] to-[#A855F7] h-2 transition-all duration-500"
                style={{
                  width: `${modules.length > 0 ? (completedModules.size / modules.length) * 100 : 0}%`
                }}
              />
            </div>
          </div>
        </div>

        {/* 8 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((mod) => {
            const isDone = completedModules.has(mod.id);
            return (
              <div
                key={mod.id}
                className="group relative rounded-2xl bg-[#160827]/70 hover:bg-[#160827] border border-purple-900/40 hover:border-purple-500/50 p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-purple-950/50 backdrop-blur-sm"
              >
                <div>
                  {/* Top Row: Step Number & Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-heading font-extrabold text-xl text-purple-400/80 group-hover:text-purple-300 transition-colors">
                      {String(mod.stepNumber).padStart(2, '0')}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-purple-950/70 border border-purple-800/40 flex items-center justify-center group-hover:border-purple-500/50 transition-colors">
                      {getStepIcon(mod.stepNumber)}
                    </div>
                  </div>

                  {/* Badge */}
                  {mod.badge && (
                    <div className="text-[11px] font-semibold text-purple-300 tracking-wide uppercase mb-1.5">
                      {mod.badge}
                    </div>
                  )}

                  {/* Title */}
                  <h3 className="text-base font-bold text-white font-heading group-hover:text-[#A855F7] transition-colors leading-snug line-clamp-2">
                    {mod.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-2.5 text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                {/* Bottom Action */}
                <div className="mt-6 pt-4 border-t border-purple-900/30 flex items-center justify-between">
                  {isDone ? (
                    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Concluída</span>
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">Não iniciada</span>
                  )}

                  <button
                    onClick={() => setSelectedModule(mod)}
                    className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-900/60 to-purple-800/40 group-hover:from-[#7028E8] group-hover:to-[#A855F7] text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <span>Estudar etapa</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Module Detail Modal */}
      {selectedModule && (
        <ModuleDetailModal
          module={selectedModule}
          onClose={() => setSelectedModule(null)}
          onSelectNext={nextModule ? () => setSelectedModule(nextModule) : undefined}
          isCompleted={completedModules.has(selectedModule.id)}
          onToggleComplete={toggleComplete}
        />
      )}
    </section>
  );
};
