import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SiteSettings, CourseModule, PromptCard, VideoLesson, User } from '../../types/index.js';
import { parseVideoSource } from '../VideoSection';
import {
  X,
  Video,
  BookOpen,
  FileText,
  Users,
  Check,
  AlertTriangle,
  Upload,
  Trash2,
  Plus,
  RefreshCw,
  ExternalLink,
  Save,
  Link,
  Sparkles,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshContent: () => void;
}

type SimpleTab = 'video' | 'modules' | 'prompts' | 'users';

// High reliability sample video for testing with 1 click
const SAMPLE_DEMO_VIDEO_URL = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ isOpen, onClose, onRefreshContent }) => {
  const { token, user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<SimpleTab>('video');

  // State
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [prompts, setPrompts] = useState<PromptCard[]>([]);
  const [video, setVideo] = useState<VideoLesson | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // Video input state
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [videoTitleInput, setVideoTitleInput] = useState('');
  const [videoDurationInput, setVideoDurationInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // User management state
  const [newUsername, setNewUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'aluno' | 'admin'>('aluno');
  const [showNewUserForm, setShowNewUserForm] = useState(false);

  // Password reset state
  const [passwordModalUser, setPasswordModalUser] = useState<User | null>(null);
  const [newPasswordVal, setNewPasswordVal] = useState('');

  // Editing single module
  const [editingModule, setEditingModule] = useState<CourseModule | null>(null);

  // Editing single prompt
  const [editingPrompt, setEditingPrompt] = useState<PromptCard | null>(null);

  // Status feedback
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const notify = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const loadAllData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Video & Settings
      const resVideo = await fetch('/api/admin/video', { headers });
      if (resVideo.ok) {
        const vData = await resVideo.json();
        setVideo(vData.video);
        if (vData.video) {
          setVideoUrlInput(vData.video.filePath || '');
          setVideoTitleInput(vData.video.title || '');
          setVideoDurationInput(vData.video.duration || '');
        }
      }

      const resSettings = await fetch('/api/admin/settings', { headers });
      if (resSettings.ok) {
        const sData = await resSettings.json();
        setSettings(sData.settings);
      }

      // 2. Modules
      const resModules = await fetch('/api/admin/modules', { headers });
      if (resModules.ok) {
        const mData = await resModules.json();
        setModules(mData.modules);
      }

      // 3. Prompts
      const resPrompts = await fetch('/api/admin/prompts', { headers });
      if (resPrompts.ok) {
        const pData = await resPrompts.json();
        setPrompts(pData.prompts);
      }

      // 4. Users
      const resUsers = await fetch('/api/admin/users', { headers });
      if (resUsers.ok) {
        const uData = await resUsers.json();
        setUsers(uData.users);
      }
    } catch (err: any) {
      notify('error', 'Falha ao carregar dados do painel.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAllData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // --- Handlers: Video ---
  const handleSaveVideoUrl = async (customUrl?: string) => {
    if (!token) return;
    const targetUrl = customUrl !== undefined ? customUrl : videoUrlInput.trim();

    try {
      const res = await fetch('/api/admin/video', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          filePath: targetUrl || null,
          title: videoTitleInput || 'Aula Principal — Aprenda na Prática o Método Completo',
          duration: videoDurationInput || '32:45',
          isPublished: true
        })
      });

      const data = await res.json();
      if (res.ok) {
        setVideo(data.video);
        setVideoUrlInput(data.video.filePath || '');
        notify('success', 'Vídeo salvo e publicado com sucesso no site!');
        onRefreshContent();
      } else {
        notify('error', data.error || 'Erro ao salvar vídeo.');
      }
    } catch (err: any) {
      notify('error', err.message || 'Falha de conexão.');
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile || !token) {
      notify('error', 'Selecione um arquivo de vídeo primeiro.');
      return;
    }

    const formData = new FormData();
    formData.append('video', selectedFile);

    setUploading(true);
    try {
      const res = await fetch('/api/admin/video/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        setVideo(data.video);
        setVideoUrlInput(data.video.filePath || '');
        setSelectedFile(null);
        notify('success', 'Arquivo de vídeo enviado e publicado com sucesso!');
        onRefreshContent();
      } else {
        notify('error', data.error || 'Erro no upload.');
      }
    } catch (err: any) {
      notify('error', 'Erro ao enviar arquivo.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveVideo = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/video', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          filePath: null
        })
      });
      if (res.ok) {
        setVideo((prev) => (prev ? { ...prev, filePath: null } : null));
        setVideoUrlInput('');
        notify('success', 'Vídeo desvinculado com sucesso.');
        onRefreshContent();
      }
    } catch (err: any) {
      notify('error', err.message);
    }
  };

  // --- Handlers: Modules ---
  const handleSaveModule = async () => {
    if (!editingModule || !token) return;
    try {
      const res = await fetch(`/api/admin/modules/${editingModule.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editingModule)
      });
      if (res.ok) {
        const data = await res.json();
        setModules((prev) => prev.map((m) => (m.id === editingModule.id ? data.module : m)));
        setEditingModule(null);
        notify('success', 'Aula atualizada com sucesso!');
        onRefreshContent();
      } else {
        notify('error', 'Erro ao salvar aula.');
      }
    } catch (err: any) {
      notify('error', err.message);
    }
  };

  // --- Handlers: Prompts ---
  const handleSavePrompt = async () => {
    if (!editingPrompt || !token) return;
    try {
      const res = await fetch(`/api/admin/prompts/${editingPrompt.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editingPrompt)
      });
      if (res.ok) {
        const data = await res.json();
        setPrompts((prev) => prev.map((p) => (p.id === editingPrompt.id ? data.prompt : p)));
        setEditingPrompt(null);
        notify('success', 'Prompt salvo com sucesso!');
        onRefreshContent();
      }
    } catch (err: any) {
      notify('error', err.message);
    }
  };

  // --- Handlers: Users ---
  const handleCreateUser = async () => {
    if (!newUsername || !newUserPassword || !token) {
      notify('error', 'Informe usuário e senha.');
      return;
    }
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          username: newUsername,
          password: newUserPassword,
          role: newUserRole
        })
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((prev) => [...prev, data.user]);
        setNewUsername('');
        setNewUserPassword('');
        setShowNewUserForm(false);
        notify('success', `Conta ${data.user.username} criada com sucesso!`);
      } else {
        notify('error', data.error || 'Erro ao criar conta.');
      }
    } catch (err: any) {
      notify('error', err.message);
    }
  };

  const handleResetPassword = async () => {
    if (!passwordModalUser || !newPasswordVal || !token) {
      notify('error', 'Informe a nova senha.');
      return;
    }
    try {
      const res = await fetch(`/api/admin/users/${passwordModalUser.id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword: newPasswordVal })
      });
      if (res.ok) {
        notify('success', `Senha de ${passwordModalUser.username} alterada com sucesso!`);
        setPasswordModalUser(null);
        setNewPasswordVal('');
      } else {
        notify('error', 'Erro ao redefinir senha.');
      }
    } catch (err: any) {
      notify('error', err.message);
    }
  };

  const previewSource = parseVideoSource(videoUrlInput);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden animate-fadeIn">
      <div className="w-full max-w-4xl h-[92vh] rounded-2xl bg-[#120722] border border-purple-800/50 shadow-2xl flex flex-col overflow-hidden">
        {/* Simplified Header */}
        <div className="px-5 py-4 bg-[#18092f] border-b border-purple-900/50 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#7028E8] flex items-center justify-center text-white font-bold">
              ⚡
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white font-heading">
                Painel do Administrador
              </h2>
              <p className="text-[11px] text-purple-300">
                Gerencie vídeos, aulas e usuários de forma simples
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onRefreshContent();
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg bg-purple-950 hover:bg-purple-900 border border-purple-700/50 text-purple-200 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Ver Site</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-purple-950 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`px-5 py-2.5 text-xs font-medium flex items-center gap-2 border-b shrink-0 ${
              feedback.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                : 'bg-red-950/80 border-red-500/40 text-red-300'
            }`}
          >
            {feedback.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* 4 Simple Top Tabs */}
        <div className="px-5 pt-3 bg-[#160827] border-b border-purple-900/40 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('video')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'video'
                ? 'bg-[#120722] text-[#A855F7] border-t-2 border-[#A855F7]'
                : 'text-slate-300 hover:text-white hover:bg-purple-950/40'
            }`}
          >
            <Video className="w-4 h-4" />
            <span>1. Vídeo da Aula</span>
          </button>

          <button
            onClick={() => setActiveTab('modules')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'modules'
                ? 'bg-[#120722] text-[#A855F7] border-t-2 border-[#A855F7]'
                : 'text-slate-300 hover:text-white hover:bg-purple-950/40'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>2. Aulas & Conteúdos</span>
          </button>

          <button
            onClick={() => setActiveTab('prompts')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'prompts'
                ? 'bg-[#120722] text-[#A855F7] border-t-2 border-[#A855F7]'
                : 'text-slate-300 hover:text-white hover:bg-purple-950/40'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>3. Prompts de IA</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'users'
                ? 'bg-[#120722] text-[#A855F7] border-t-2 border-[#A855F7]'
                : 'text-slate-300 hover:text-white hover:bg-purple-950/40'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>4. Usuários & Senhas</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 p-5 sm:p-6 overflow-y-auto bg-[#0d0419] text-slate-200">
          {/* TAB 1: VÍDEO DA AULA (Super clean and easy) */}
          {activeTab === 'video' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white font-heading flex items-center gap-2">
                  <Video className="w-5 h-5 text-[#A855F7]" />
                  <span>Configurar Vídeo da Aula Principal</span>
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Você pode colar um link do <strong>YouTube</strong>, <strong>Vimeo</strong>, <strong>link direto MP4</strong> ou fazer upload do seu arquivo.
                </p>
              </div>

              {/* Method A: Paste URL */}
              <div className="p-5 rounded-2xl bg-[#160827] border border-purple-900/50 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Link className="w-4 h-4 text-[#A855F7]" />
                    <span>Opção 1: Colar Link do Vídeo (Recomendado)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setVideoUrlInput(SAMPLE_DEMO_VIDEO_URL);
                      handleSaveVideoUrl(SAMPLE_DEMO_VIDEO_URL);
                    }}
                    className="text-[11px] text-[#A855F7] hover:underline cursor-pointer flex items-center gap-1 font-semibold"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Testar com vídeo demonstrativo (1 clique)</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={videoUrlInput}
                    onChange={(e) => setVideoUrlInput(e.target.value)}
                    placeholder="Ex: https://www.youtube.com/watch?v=... ou https://.../video.mp4"
                    className="w-full px-4 py-3 rounded-xl bg-[#0B0710] border border-purple-900/60 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-[#A855F7]"
                  />
                  <p className="text-[11px] text-slate-400">
                    Funciona com links comuns do YouTube (ex: youtube.com/watch?v=...), Vimeo ou links MP4 na internet.
                  </p>
                </div>

                {/* Instant Video Preview Box */}
                {videoUrlInput && (
                  <div className="rounded-xl overflow-hidden border border-purple-900/50 bg-black aspect-video max-h-56 mx-auto">
                    {previewSource.type === 'youtube' || previewSource.type === 'vimeo' ? (
                      <iframe
                        src={previewSource.embedUrl}
                        title="Prévia"
                        className="w-full h-full border-0"
                      />
                    ) : (
                      <video
                        src={videoUrlInput}
                        controls
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                )}

                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={() => handleSaveVideoUrl()}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#7028E8] to-[#A855F7] hover:from-[#6220D1] hover:to-[#9333EA] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    <span>Salvar Vídeo no Site</span>
                  </button>

                  {video?.filePath && (
                    <button
                      onClick={handleRemoveVideo}
                      className="px-4 py-2.5 rounded-xl bg-red-950/50 hover:bg-red-900 border border-red-500/40 text-red-200 text-xs font-medium cursor-pointer"
                    >
                      Remover Vídeo Atual
                    </button>
                  )}
                </div>
              </div>

              {/* Method B: Upload MP4 File */}
              <div className="p-5 rounded-2xl bg-[#160827] border border-purple-900/50 space-y-4">
                <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#A855F7]" />
                  <span>Opção 2: Enviar Arquivo MP4 do seu Computador</span>
                </label>

                <div className="p-4 border border-dashed border-purple-800/60 rounded-xl bg-purple-950/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <input
                    type="file"
                    id="admin-video-file-input"
                    accept="video/*,.mp4,.webm,.mov"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="admin-video-file-input"
                    className="px-4 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 text-xs font-semibold cursor-pointer border border-purple-700/50"
                  >
                    {selectedFile ? selectedFile.name : 'Escolher arquivo MP4...'}
                  </label>

                  {selectedFile ? (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-purple-300 font-mono">
                        {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                      </span>
                      <button
                        onClick={handleFileUpload}
                        disabled={uploading}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#7028E8] to-[#A855F7] text-white text-xs font-bold cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                      >
                        {uploading ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Enviando...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5" />
                            <span>Fazer Upload</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      Tamanho de até 200MB suportado
                    </span>
                  )}
                </div>
              </div>

              {/* Video Title and Duration */}
              <div className="p-5 rounded-2xl bg-[#160827] border border-purple-900/50 space-y-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Detalhes Exibidos na Página
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-purple-300 font-semibold mb-1">
                      Título da Aula
                    </label>
                    <input
                      type="text"
                      value={videoTitleInput}
                      onChange={(e) => setVideoTitleInput(e.target.value)}
                      placeholder="Aula Principal — Aprenda na Prática"
                      className="w-full px-3 py-2 rounded-xl bg-[#0B0710] border border-purple-900/50 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-purple-300 font-semibold mb-1">
                      Duração (Ex: 32:45)
                    </label>
                    <input
                      type="text"
                      value={videoDurationInput}
                      onChange={(e) => setVideoDurationInput(e.target.value)}
                      placeholder="32:45"
                      className="w-full px-3 py-2 rounded-xl bg-[#0B0710] border border-purple-900/50 text-white text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AULAS E CONTEÚDOS */}
          {activeTab === 'modules' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white font-heading flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#A855F7]" />
                  <span>Editar as 8 Etapas do Curso</span>
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Clique em "Editar Aula" para alterar o texto ou tarefa prática de qualquer módulo.
                </p>
              </div>

              <div className="space-y-3">
                {modules.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 rounded-xl bg-[#160827] border border-purple-900/40 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-[#A855F7]">
                        <span>Etapa {String(m.stepNumber).padStart(2, '0')}</span>
                        {m.badge && <span className="text-purple-300 font-normal">· {m.badge}</span>}
                      </div>
                      <h4 className="text-sm font-bold text-white mt-0.5">{m.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{m.description}</p>
                    </div>

                    <button
                      onClick={() => setEditingModule(m)}
                      className="px-3.5 py-1.5 rounded-lg bg-purple-900/50 hover:bg-purple-800 text-purple-200 text-xs font-semibold cursor-pointer shrink-0"
                    >
                      Editar Aula
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PROMPTS DE IA */}
          {activeTab === 'prompts' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white font-heading flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#A855F7]" />
                  <span>Prompts Prontos por Nicho</span>
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Edite o comando que os alunos copiam para gerar sites em cada categoria.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {prompts.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl bg-[#160827] border border-purple-900/40 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#A855F7]">{p.segmentName}</div>
                      <p className="text-xs text-slate-300 mt-1 line-clamp-2">{p.description}</p>
                    </div>
                    <button
                      onClick={() => setEditingPrompt(p)}
                      className="self-start px-3 py-1 rounded bg-purple-950 hover:bg-purple-900 text-purple-200 text-xs font-semibold cursor-pointer"
                    >
                      Editar Prompt
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: USUÁRIOS E SENHAS */}
          {activeTab === 'users' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white font-heading flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#A855F7]" />
                    <span>Contas de Alunos e Senhas</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Crie novos alunos ou altere senhas salvas no banco de dados.
                  </p>
                </div>
                <button
                  onClick={() => setShowNewUserForm(!showNewUserForm)}
                  className="px-3.5 py-2 rounded-xl bg-[#7028E8] hover:bg-[#6220D1] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Novo Aluno</span>
                </button>
              </div>

              {/* New User Form Box */}
              {showNewUserForm && (
                <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-800/60 space-y-3 animate-fadeIn">
                  <h4 className="text-xs font-bold text-white uppercase">Dados do Novo Usuário</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="Nome de usuário"
                      className="px-3 py-2 rounded-lg bg-[#0B0710] border border-purple-900 text-white text-xs"
                    />
                    <input
                      type="password"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      placeholder="Senha (mínimo 6 dígitos)"
                      className="px-3 py-2 rounded-lg bg-[#0B0710] border border-purple-900 text-white text-xs"
                    />
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as any)}
                      className="px-3 py-2 rounded-lg bg-[#0B0710] border border-purple-900 text-white text-xs"
                    >
                      <option value="aluno">Aluno</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setShowNewUserForm(false)}
                      className="px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleCreateUser}
                      className="px-4 py-1.5 rounded-lg bg-[#7028E8] hover:bg-[#6220D1] text-white text-xs font-bold"
                    >
                      Confirmar Cadastro
                    </button>
                  </div>
                </div>
              )}

              {/* Users List */}
              <div className="rounded-xl bg-[#160827] border border-purple-900/40 overflow-hidden divide-y divide-purple-900/30">
                {users.map((u) => (
                  <div key={u.id} className="p-3.5 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs sm:text-sm">{u.username}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            u.role === 'admin'
                              ? 'bg-purple-900 text-purple-200'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {u.role === 'admin' ? 'Admin' : 'Aluno'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Cadastrado em {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setPasswordModalUser(u);
                        setNewPasswordVal('');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-purple-950 hover:bg-purple-900 border border-purple-800/50 text-purple-200 text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-[#A855F7]" />
                      <span>Alterar Senha</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: EDIT MODULE */}
      {editingModule && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl bg-[#160827] border border-purple-800/60 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-purple-900/40 pb-2">
              <h4 className="font-bold text-white text-base">
                Editar Aula {editingModule.stepNumber}: {editingModule.title}
              </h4>
              <button onClick={() => setEditingModule(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1">Título</label>
                <input
                  type="text"
                  value={editingModule.title}
                  onChange={(e) => setEditingModule({ ...editingModule, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#0B0710] border border-purple-900 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1">Conteúdo da Aula</label>
                <textarea
                  rows={8}
                  value={editingModule.fullContent}
                  onChange={(e) => setEditingModule({ ...editingModule, fullContent: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#0B0710] border border-purple-900 text-white text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1">Tarefa Prática</label>
                <input
                  type="text"
                  value={editingModule.practicalTask}
                  onChange={(e) => setEditingModule({ ...editingModule, practicalTask: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#0B0710] border border-purple-900 text-white text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-purple-900/40">
              <button
                onClick={() => setEditingModule(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveModule}
                className="px-4 py-1.5 rounded-lg bg-[#7028E8] hover:bg-[#6220D1] text-white text-xs font-bold"
              >
                Salvar Aula
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PROMPT */}
      {editingPrompt && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-[#160827] border border-purple-800/60 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-purple-900/40 pb-2">
              <h4 className="font-bold text-white text-base">
                Editar Prompt: {editingPrompt.segmentName}
              </h4>
              <button onClick={() => setEditingPrompt(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1">Texto do Prompt</label>
                <textarea
                  rows={6}
                  value={editingPrompt.promptContent}
                  onChange={(e) => setEditingPrompt({ ...editingPrompt, promptContent: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#0B0710] border border-purple-900 text-white text-xs font-mono leading-relaxed"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-purple-900/40">
              <button
                onClick={() => setEditingPrompt(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePrompt}
                className="px-4 py-1.5 rounded-lg bg-[#7028E8] hover:bg-[#6220D1] text-white text-xs font-bold"
              >
                Salvar Prompt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: RESET PASSWORD */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-[#160827] border border-purple-800/60 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-purple-900/40 pb-2">
              <h4 className="font-bold text-white text-base">
                Mudar Senha de {passwordModalUser.username}
              </h4>
              <button onClick={() => setPasswordModalUser(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1">
                Nova Senha (Mínimo 6 dígitos)
              </label>
              <input
                type="password"
                value={newPasswordVal}
                onChange={(e) => setNewPasswordVal(e.target.value)}
                placeholder="Digite a nova senha..."
                className="w-full px-3 py-2 rounded-lg bg-[#0B0710] border border-purple-900 text-white text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-purple-900/40">
              <button
                onClick={() => setPasswordModalUser(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleResetPassword}
                className="px-4 py-1.5 rounded-lg bg-[#7028E8] hover:bg-[#6220D1] text-white text-xs font-bold"
              >
                Salvar Nova Senha
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
