import React, { useRef, useState } from 'react';
import { VideoLesson } from '../types/index.js';
import { Play, Pause, Volume2, VolumeX, Maximize, Clock, Video as VideoIcon, Film } from 'lucide-react';

interface VideoSectionProps {
  video: VideoLesson | null;
}

export function parseVideoSource(url: string | null): { type: 'youtube' | 'vimeo' | 'direct' | 'none'; embedUrl: string } {
  if (!url || !url.trim()) return { type: 'none', embedUrl: '' };

  const clean = url.trim();

  // YouTube match: youtu.be, youtube.com/watch?v=, youtube.com/embed/
  const ytMatch = clean.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`
    };
  }

  // Vimeo match
  const vimeoMatch = clean.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)/i);
  if (vimeoMatch && vimeoMatch[3]) {
    return {
      type: 'vimeo',
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[3]}`
    };
  }

  // Direct MP4 / Video file or local path
  return {
    type: 'direct',
    embedUrl: clean
  };
}

export const VideoSection: React.FC<VideoSectionProps> = ({ video }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const videoSource = parseVideoSource(video?.filePath || null);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  return (
    <section id="video-aula" className="py-16 sm:py-20 bg-[#0c0418] relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-[#7028E8]/10 blur-[130px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-3">
            <Film className="w-3.5 h-3.5 text-[#A855F7]" />
            <span>Demonstração Prática em Vídeo</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight font-heading">
            AULA PRINCIPAL — APRENDA NA PRÁTICA
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed">
            Agora que você conhece as oito etapas, chegou a hora de acompanhar o processo na prática. Nesta aula, você poderá observar como pesquisar empresas no Google Maps, identificar oportunidades, utilizar a inteligência artificial para criar um site, personalizar o resultado e apresentar uma proposta comercial. Assista com atenção e aplique cada etapa no seu próprio projeto.
          </p>
        </div>

        {/* Video Container Box */}
        <div className="rounded-2xl bg-[#160827] border border-purple-800/40 shadow-2xl overflow-hidden backdrop-blur-md">
          {videoSource.type === 'youtube' || videoSource.type === 'vimeo' ? (
            /* Embedded YouTube / Vimeo Player */
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={videoSource.embedUrl}
                title={video?.title || 'Aula Principal'}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
          ) : videoSource.type === 'direct' && video?.filePath ? (
            /* Real Direct MP4 / HTML5 Video Player */
            <div className="relative group bg-black aspect-video flex items-center justify-center">
              <video
                ref={videoRef}
                src={video.filePath}
                className="w-full h-full object-contain"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                onClick={togglePlay}
                controls
              />
            </div>
          ) : (
            /* State when no video is published yet */
            <div className="aspect-video w-full flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-gradient-to-b from-[#160827] to-[#0d0417] relative">
              <div className="w-20 h-20 rounded-2xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center mb-5 shadow-lg shadow-purple-950">
                <VideoIcon className="w-10 h-10 text-[#A855F7]" />
              </div>
              <h3 className="text-xl font-bold text-white font-heading">
                {video?.title || 'Aula em Vídeo: Da Prospecção à Primeira Venda'}
              </h3>
              <p className="max-w-lg text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                Nenhum vídeo vinculado no momento. O administrador da plataforma pode colar o link do vídeo (YouTube, Vimeo, MP4) ou fazer upload do arquivo diretamente no <strong className="text-purple-300">Painel Admin</strong>.
              </p>
              <div className="mt-6 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-purple-950/60 border border-purple-800/40 text-purple-300 text-xs">
                <Clock className="w-3.5 h-3.5" />
                <span>Formatos suportados: Links do YouTube, Vimeo, MP4 direto ou Upload</span>
              </div>
            </div>
          )}

          {/* Video Metadata strip */}
          <div className="p-5 sm:p-6 border-t border-purple-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-white text-base font-heading">
                {video?.title || 'Aula Principal — Aprenda na Prática'}
              </h4>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                {video?.description || 'Acompanhe passo a passo a execução real do método Zeus Sites IA com exemplos ao vivo.'}
              </p>
            </div>
            {video?.duration && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950/40 border border-purple-900/40 text-xs text-purple-300 font-mono self-start sm:self-center shrink-0">
                <Clock className="w-3.5 h-3.5 text-[#A855F7]" />
                <span>Duração: {video.duration}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
