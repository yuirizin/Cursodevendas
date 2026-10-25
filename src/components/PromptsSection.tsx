import React, { useState } from 'react';
import { PromptCard } from '../types/index.js';
import {
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Scissors,
  Utensils,
  Wrench,
  Sparkles,
  ShoppingBag,
  HeartPulse,
  Dumbbell,
  PawPrint,
  Code
} from 'lucide-react';

interface PromptsSectionProps {
  prompts: PromptCard[];
}

export const PromptsSection: React.FC<PromptsSectionProps> = ({ prompts }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const [filterQuery, setFilterQuery] = useState('');

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const copyPrompt = (prompt: PromptCard) => {
    navigator.clipboard.writeText(prompt.promptContent);
    setCopiedId(prompt.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getSegmentIcon = (name: string, iconName?: string) => {
    const key = (iconName || name).toLowerCase();
    if (key.includes('barbearia') || key.includes('scissors')) return <Scissors className="w-5 h-5 text-[#A855F7]" />;
    if (key.includes('restaurante') || key.includes('utensils')) return <Utensils className="w-5 h-5 text-[#A855F7]" />;
    if (key.includes('oficina') || key.includes('wrench')) return <Wrench className="w-5 h-5 text-[#A855F7]" />;
    if (key.includes('beleza') || key.includes('sparkles')) return <Sparkles className="w-5 h-5 text-[#A855F7]" />;
    if (key.includes('roupas') || key.includes('shopping')) return <ShoppingBag className="w-5 h-5 text-[#A855F7]" />;
    if (key.includes('estética') || key.includes('heart')) return <HeartPulse className="w-5 h-5 text-[#A855F7]" />;
    if (key.includes('academia') || key.includes('dumbbell')) return <Dumbbell className="w-5 h-5 text-[#A855F7]" />;
    if (key.includes('pet') || key.includes('paw')) return <PawPrint className="w-5 h-5 text-[#A855F7]" />;
    return <Code className="w-5 h-5 text-[#A855F7]" />;
  };

  const filteredPrompts = prompts.filter((p) => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return p.segmentName.toLowerCase().includes(q) || p.promptContent.toLowerCase().includes(q);
  });

  return (
    <section id="prompts-prontos" className="py-16 sm:py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#A855F7]" />
            <span>Biblioteca Comercial Pronta</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight font-heading">
            PROMPTS PRONTOS — COPIE, COLE E CRIE
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
            Você não precisa começar com uma página em branco. Utilize os exemplos abaixo como ponto de partida, adapte cada instrução às necessidades do negócio e revise todas as informações antes de publicar.
          </p>

          {/* Quick Filter Search */}
          <div className="mt-6 max-w-md mx-auto">
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filtrar por nicho (ex: barbearia, restaurante, oficina)..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#160827] border border-purple-900/50 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-[#A855F7] transition-all"
            />
          </div>
        </div>

        {/* Prompts Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {filteredPrompts.map((card, index) => {
            const isExpanded = expandedIds.has(card.id);
            const isCopied = copiedId === card.id;

            return (
              <div
                key={card.id}
                className="rounded-2xl bg-[#160827]/80 border border-purple-900/40 hover:border-purple-600/40 p-6 flex flex-col justify-between transition-all duration-300 backdrop-blur-sm shadow-lg hover:shadow-purple-950/40"
              >
                <div>
                  {/* Card Top Row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-800/40 flex items-center justify-center shrink-0">
                        {getSegmentIcon(card.segmentName, card.iconName)}
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider">
                          Prompt {index + 1}
                        </div>
                        <h3 className="text-lg font-bold text-white font-heading">
                          {card.segmentName}
                        </h3>
                      </div>
                    </div>

                    {/* Copy Button */}
                    <button
                      onClick={() => copyPrompt(card)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isCopied
                          ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/60 shadow-md'
                          : 'bg-purple-900/50 hover:bg-purple-800 text-purple-200 hover:text-white border border-purple-700/40'
                      }`}
                      title="Copiar prompt completo"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar prompt</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300 mb-4">{card.description}</p>

                  {/* Prompt Text Box */}
                  <div className="relative rounded-xl bg-[#0B0710]/90 border border-purple-900/50 p-4 font-mono text-xs text-purple-200 leading-relaxed">
                    <p className={isExpanded ? 'whitespace-pre-wrap' : 'line-clamp-4 whitespace-pre-wrap'}>
                      "{card.promptContent}"
                    </p>
                  </div>
                </div>

                {/* Bottom Toggle */}
                <div className="mt-4 pt-3 border-t border-purple-900/30 flex items-center justify-between">
                  <button
                    onClick={() => toggleExpand(card.id)}
                    className="text-xs text-purple-300 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>{isExpanded ? 'Recolher detalhes' : 'Expandir prompt completo'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <span className="text-[11px] text-slate-400">Pronto para colar na IA</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
