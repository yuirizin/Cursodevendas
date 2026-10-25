import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Zap, Eye, EyeOff, Lock, User, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

const ZEUS_HERO_IMAGE = '/src/assets/images/zeus_mentor_portrait_1792940298413.jpg';

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage('Por favor, informe seu usuário e senha.');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);
    const result = await login(username, password);
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Credenciais inválidas. Verifique seu usuário e senha.');
    }
  };


  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#0B0710] relative overflow-hidden">
      {/* Background radial glows and atmospheric effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[55vw] h-[55vw] rounded-full bg-[#7028E8]/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#A855F7]/12 blur-[130px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-7xl bg-[radial-gradient(circle_at_center,rgba(112,40,232,0.06)_0%,transparent_70%)] pointer-events-none" />

      {/* Main Container */}
      <div className="relative w-full max-w-5xl rounded-2xl bg-[#160827]/90 border border-purple-900/40 shadow-2xl backdrop-blur-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[620px]">
        {/* Left Zeus Artwork Zone */}
        <div className="lg:col-span-5 relative flex flex-col justify-between p-6 sm:p-8 overflow-hidden bg-gradient-to-br from-[#1b0a33] to-[#0c0418] border-b lg:border-b-0 lg:border-r border-purple-900/30">
          {/* Zeus Cyber Image */}
          <div className="absolute inset-0 z-0">
            <img
              src={ZEUS_HERO_IMAGE}
              alt="Zeus - Mentor Digital e Deus dos Raios IA"
              className="w-full h-full object-cover object-top opacity-75 transform hover:scale-105 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
            {/* Scrim overlay for optimal text contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#160827] via-[#160827]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#160827]/30 to-[#160827]" />
          </div>

          {/* Top Brand Badge */}
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7028E8] to-[#A855F7] p-0.5 shadow-lg shadow-purple-900/50 flex items-center justify-center">
              <div className="w-full h-full bg-[#0B0710] rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#A855F7] fill-[#A855F7]" />
              </div>
            </div>
            <div>
              <span className="font-heading font-extrabold tracking-wider text-white text-lg block leading-none">
                ZEUS SITES IA
              </span>
              <span className="text-[11px] text-purple-300 font-medium tracking-wide">
                MENTORIA & CRIAÇÃO DIGITAL
              </span>
            </div>
          </div>

          {/* Bottom Zeus Quote */}
          <div className="relative z-10 mt-36 lg:mt-0 pt-6">
            <div className="flex items-center gap-2 mb-2 text-[#A855F7] text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>O Poder dos Raios Digitais</span>
            </div>
            <p className="text-sm text-purple-100 font-medium leading-relaxed italic">
              "Domine a inteligência artificial, construa sites modernos e transforme a presença digital das empresas da sua cidade em faturamento real."
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-purple-300/80">
              <span className="font-semibold text-white">Zeus</span>
              <span>·</span>
              <span>Mentor Principal</span>
            </div>
          </div>
        </div>

        {/* Right Form Zone */}
        <div className="lg:col-span-7 flex flex-col justify-center p-6 sm:p-10 lg:p-12 relative z-10">
          <div className="max-w-md w-full mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-500/30 text-purple-300 text-xs font-medium mb-3">
                <ShieldCheck className="w-3.5 h-3.5 text-[#A855F7]" />
                Área de Membros Protegida
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-heading">
                Acesse o seu Curso
              </h1>
              <p className="text-sm text-slate-300 mt-1.5">
                Entre com suas credenciais para acessar as 8 etapas, vídeo aulas e prompts de alta conversão.
              </p>
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <div
                role="alert"
                className="mb-6 p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn"
              >
                <div className="w-2 h-2 rounded-full bg-red-400 mt-1.5 shrink-0" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username Field */}
              <div>
                <label className="block text-xs font-semibold text-purple-200 uppercase tracking-wider mb-2">
                  Usuário de Acesso
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Digite seu usuário de acesso"
                    autoComplete="username"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-[#0B0710]/80 border border-purple-900/50 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#A855F7] focus:ring-1 focus:ring-[#A855F7] transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs font-semibold text-purple-200 uppercase tracking-wider mb-2">
                  Senha
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-purple-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite sua senha secreta"
                    autoComplete="current-password"
                    required
                    className="w-full pl-10 pr-12 py-3 bg-[#0B0710]/80 border border-purple-900/50 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#A855F7] focus:ring-1 focus:ring-[#A855F7] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-purple-400 hover:text-purple-200 transition-colors"
                    aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#7028E8] via-[#8B3BEB] to-[#A855F7] hover:from-[#6220D1] hover:to-[#9333EA] text-white font-semibold text-sm shadow-lg shadow-purple-900/40 hover:shadow-purple-900/60 transition-all flex items-center justify-center gap-2 group disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Entrar no curso</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
