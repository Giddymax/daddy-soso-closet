"use client";
import { useState } from "react";
import { Play, X } from "lucide-react";
import type { Video } from "@/types";

interface VideoSectionProps {
  videos: Video[];
  bgUrl?: string;
}

function getEmbedUrl(url: string): string | null {
  // YouTube watch URL
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
  // YouTube short URL or already embed
  if (url.includes("youtube.com/embed/")) return url;
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
  return null;
}

function isExternalEmbed(url: string) {
  return url.includes("youtube.com") || url.includes("youtu.be") || url.includes("vimeo.com");
}

export default function VideoSection({ videos, bgUrl }: VideoSectionProps) {
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  if (videos.length === 0) return null;

  return (
    <>
      <section id="videos" className="py-20 relative bg-[#023E8A]">
        {bgUrl && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={bgUrl} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-[#023E8A]/50" />
          </>
        )}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[#D4AF37] font-semibold text-sm uppercase tracking-widest mb-2">
              Watch & Explore
            </p>
            <h2 className="font-playfair text-3xl sm:text-4xl font-bold text-white">
              Our Latest Videos
            </h2>
            <div className="w-16 h-1 bg-[#D4AF37] mx-auto mt-3 rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <button
                type="button"
                key={video.id}
                onClick={() => setActiveVideo(video)}
                className="group relative bg-gray-900 rounded-2xl overflow-hidden aspect-video focus:outline-none focus:ring-2 focus:ring-[#D4AF37] shadow-lg hover:shadow-2xl transition-shadow"
              >
                {video.thumbnail_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-[#023E8A] to-[#0077B6]" />
                )}
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-300" />
                {/* Play button */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Play size={22} className="text-[#023E8A] ml-1" />
                  </div>
                  <div className="text-center px-4">
                    <p className="text-white font-semibold text-sm drop-shadow">{video.title}</p>
                    {video.description && (
                      <p className="text-white/70 text-xs mt-1 line-clamp-2">{video.description}</p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Video Player Modal */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="relative w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setActiveVideo(null)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white transition-colors"
              aria-label="Close video"
            >
              <X size={28} />
            </button>

            <div className="rounded-2xl overflow-hidden bg-black shadow-2xl aspect-video">
              {isExternalEmbed(activeVideo.video_url) ? (
                <iframe
                  src={getEmbedUrl(activeVideo.video_url) ?? activeVideo.video_url}
                  title={activeVideo.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={activeVideo.video_url}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            <div className="mt-4 text-center">
              <p className="text-white font-semibold text-lg">{activeVideo.title}</p>
              {activeVideo.description && (
                <p className="text-white/60 text-sm mt-1">{activeVideo.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
