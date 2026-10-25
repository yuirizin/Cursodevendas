import React, { useState } from 'react';
import { CourseModule } from '../types/index.js';
import { X, CheckCircle, Copy, Check, ArrowRight, BookOpen, Target, Sparkles, Layers } from 'lucide-react';

interface ModuleDetailModalProps {
  module: CourseModule | null;
  onClose: () => void;
  onSelectNext?: () => void;
  isCompleted?: boolean;
  onToggleComplete?: (moduleId: string) => void;
}

export const ModuleDetailModal: React.FC<ModuleDetailModalProps> = ({
  module,
  onClose,
  onSelectNext,
  isCompleted,
  onToggleComplete
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!module) return null;

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] my-auto rounded-2xl bg-[#160827] border border-purple-800/50 shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Top Header */}
        <div className="p-5 sm:p-6 border-b border-purple-900/40 bg-gradient-to-r from-[#1c0b33] to-[#120622] flex items-start justify-between gap-4 sticky top-0 z-20">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#A855F7] uppercase tracking-wider">
              <span>Etapa {String(module.stepNumber).padStart(2, '0')}</span>
              {module.badge && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-purple-300">{module.badge}</span>
                </>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white font-heading">
              {module.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">{module.description}</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-purple-950/60 transition-colors cursor-pointer shrink-0"
            aria-label="Fechar janela"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-8 overflow-y-auto space-y-8 text-slate-200 text-sm leading-relaxed">
          {/* Main Content Paragraphs */}
          <div className="space-y-4 prose prose-invert max-w-none">
            {module.fullContent.split('\n\n').map((block, i) => {
              if (block.startsWith('### ')) {
                return (
                  <h3 key={i} className="text-base sm:text-lg font-bold text-white font-heading pt-2 text-[#A855F7]">
                    {block.replace('### ', '')}
                  </h3>
                );
              }
              if (block.startsWith('> ')) {
                return (
                  <blockquote
                    key={i}
                    className="p-4 rounded-xl bg-purple-950/40 border border-purple-700/40 text-purple-100 text-xs sm:text-sm italic"
                  >
                    {block.replace('> ', '')}
                  </blockquote>
                );
              }
              if (block.startsWith('```text')) {
                const code = block.replace('```text\n', '').replace('\n```', '');
                return (
                  <div key={i} className="relative rounded-xl bg-[#0B0710] border border-purple-900/60 p-4 font-mono text-xs text-purple-200">
                    <button
                      onClick={() => copyToClipboard(code, i)}
                      className="absolute top-3 right-3 px-2.5 py-1 rounded bg-purple-900/50 hover:bg-purple-800 text-purple-200 text-[11px] font-sans flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedIndex === i ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-300">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar texto</span>
                        </>
                      )}
                    </button>
                    <p className="pr-24 whitespace-pre-wrap">{code}</p>
                  </div>
                );
              }
              return (
                <p key={i} className="text-slate-200 leading-relaxed">
                  {block}
                </p>
              );
            })}
          </div>

          {/* Table Data (for Etapa 1 or custom) */}
          {module.tableData && module.tableData.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#A855F7]" />
                Tabela de Destaques por Segmento
              </h4>
              <div className="overflow-x-auto rounded-xl border border-purple-900/40 bg-[#0B0710]/60">
                <table className="w-full text-left text-xs">
                  <thead className="bg-purple-950/40 text-purple-300 border-b border-purple-900/40 font-semibold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4 w-1/3">Segmento Comercial</th>
                      <th className="py-3 px-4">Elementos Recomendados no Site</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-900/30 text-slate-300">
                    {module.tableData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-purple-950/20 transition-colors">
                        <td className="py-3 px-4 font-semibold text-white whitespace-nowrap">{row.niche}</td>
                        <td className="py-3 px-4 leading-relaxed">{row.highlights}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Packages (for Etapa 2) */}
          {module.packages && module.packages.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#A855F7]" />
                Os Três Níveis de Oferta Comercial
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {module.packages.map((pkg, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-xl bg-purple-950/30 border border-purple-800/40 flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <h5 className="font-bold text-white text-base font-heading text-[#A855F7]">
                        {pkg.name}
                      </h5>
                      <p className="text-xs text-slate-300 mt-1">{pkg.description}</p>
                      <ul className="mt-4 space-y-2">
                        {pkg.features.map((feat, fIdx) => (
                          <li key={fIdx} className="text-xs text-slate-200 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#A855F7] mt-1.5 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Practical Task & Expected Result Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-purple-900/30">
            {/* Practical Task Box */}
            <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-purple-950/50 to-[#120622] border border-purple-700/40 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#A855F7] uppercase tracking-wider">
                <BookOpen className="w-4 h-4" />
                <span>Tarefa Prática</span>
              </div>
              <p className="text-xs sm:text-sm text-white font-medium leading-relaxed">
                {module.practicalTask}
              </p>
            </div>

            {/* Expected Result Box */}
            <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-br from-[#1b0c36]/60 to-[#0B0710] border border-purple-700/40 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <Target className="w-4 h-4" />
                <span>Resultado Esperado</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                {module.expectedResult}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-purple-900/40 bg-[#120622] flex flex-wrap items-center justify-between gap-3 sticky bottom-0 z-20">
          {onToggleComplete ? (
            <button
              onClick={() => onToggleComplete(module.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                isCompleted
                  ? 'bg-emerald-950/70 border border-emerald-500/50 text-emerald-300'
                  : 'bg-purple-950/60 hover:bg-purple-900/60 border border-purple-700/40 text-purple-200'
              }`}
            >
              <CheckCircle className={`w-4 h-4 ${isCompleted ? 'text-emerald-400' : 'text-purple-400'}`} />
              <span>{isCompleted ? 'Etapa Concluída!' : 'Marcar como Concluída'}</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-purple-950/40 hover:bg-purple-900/40 border border-purple-900/40 transition-colors cursor-pointer"
            >
              Fechar
            </button>
            {onSelectNext && (
              <button
                onClick={onSelectNext}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#7028E8] to-[#A855F7] hover:from-[#6220D1] hover:to-[#9333EA] transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <span>Próxima Etapa</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
