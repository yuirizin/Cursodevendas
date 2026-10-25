import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginScreen } from './components/LoginScreen';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ModulesSection } from './components/ModulesSection';
import { VideoSection } from './components/VideoSection';
import { PromptsSection } from './components/PromptsSection';
import { JourneyConclusion } from './components/JourneyConclusion';
import { Footer } from './components/Footer';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SiteSettings, CourseModule, PromptCard, VideoLesson } from './types/index.js';
import { Zap, RefreshCw } from 'lucide-react';

const MainPlatform: React.FC = () => {
  const { isAuthenticated, loading: authLoading, token, isAdmin } = useAuth();

  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [prompts, setPrompts] = useState<PromptCard[]>([]);
  const [video, setVideo] = useState<VideoLesson | null>(null);
  const [contentLoading, setContentLoading] = useState(true);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const fetchContent = useCallback(async () => {
    if (!token) return;
    try {
      setContentLoading(true);
      const res = await fetch('/api/content/public', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        setModules(data.modules);
        setPrompts(data.prompts);
        setVideo(data.video);
      }
    } catch (err) {
      console.error('Failed to load course content:', err);
    } finally {
      setContentLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchContent();
    }
  }, [isAuthenticated, fetchContent]);

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0B0710]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#7028E8] to-[#A855F7] p-0.5 shadow-xl flex items-center justify-center animate-pulse">
            <Zap className="w-6 h-6 text-white fill-white" />
          </div>
          <p className="text-xs text-purple-300 font-semibold tracking-wider uppercase">
            Iniciando Zeus Sites IA...
          </p>
        </div>
      </div>
    );
  }

  // Unauthenticated visitors see the Login Screen
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Course content loading state
  if (contentLoading && !settings) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#0B0710]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-[#A855F7] animate-spin" />
          <p className="text-xs text-purple-200">Carregando aulas e conteúdos do curso...</p>
        </div>
      </div>
    );
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToModules = () => {
    const el = document.getElementById('etapas');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div id="topo" className="min-h-screen flex flex-col bg-[#0B0710] text-slate-100 selection:bg-[#7028E8] selection:text-white">
      {/* Top Navbar */}
      <Navbar
        onOpenAdmin={() => setIsAdminOpen(true)}
        platformName={settings?.platformName || 'ZEUS SITES IA'}
      />

      {/* Hero Presentation */}
      {settings && (
        <HeroSection
          settings={settings}
          onExploreClick={scrollToModules}
        />
      )}

      {/* The 8 Modules Section */}
      <ModulesSection modules={modules} />

      {/* Video Aula Section */}
      <VideoSection video={video} />

      {/* 8 Ready-to-use Prompts */}
      <PromptsSection prompts={prompts} />

      {/* Course Conclusion */}
      {settings && (
        <JourneyConclusion
          settings={settings}
          onRestartClick={scrollToTop}
        />
      )}

      {/* Footer */}
      <Footer
        platformName={settings?.platformName}
        supportEmail={settings?.supportEmail}
      />

      {/* Admin Panel (accessible only if user is admin) */}
      {isAdmin && (
        <AdminDashboard
          isOpen={isAdminOpen}
          onClose={() => setIsAdminOpen(false)}
          onRefreshContent={fetchContent}
        />
      )}
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainPlatform />
    </AuthProvider>
  );
}

export default App;
