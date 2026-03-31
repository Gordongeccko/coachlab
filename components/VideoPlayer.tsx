"use client";

import { useState } from "react";

interface VideoPlayerProps {
  url: string;
}

interface VideoSource {
  type: "youtube" | "vimeo" | "iframe" | "external";
  embedUrl: string;
  sourceName: string;
}

function getVideoSource(url: string): VideoSource {
  const youtubeMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/
  );
  if (youtubeMatch) {
    return {
      type: "youtube",
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}?rel=0`,
      sourceName: "YouTube",
    };
  }

  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) {
    return {
      type: "vimeo",
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
      sourceName: "Vimeo",
    };
  }

  // For SVFF and other sites — try embedding directly, strip hash fragment
  let cleanUrl = url;
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    cleanUrl = parsed.toString();
  } catch {
    // keep original
  }

  let sourceName = "Extern video";
  try {
    const host = new URL(url).hostname.replace("www.", "");
    if (host.includes("svenskfotboll")) sourceName = "SVFF Övningsbanken";
    else if (host.includes("uefa")) sourceName = "UEFA";
    else sourceName = host;
  } catch {
    // keep default
  }

  return { type: "iframe", embedUrl: cleanUrl, sourceName };
}

export default function VideoPlayer({ url }: VideoPlayerProps) {
  const source = getVideoSource(url);
  const [iframeBlocked, setIframeBlocked] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (source.type === "youtube" || source.type === "vimeo") {
    return (
      <div className="aspect-video rounded-xl overflow-hidden border border-border">
        <iframe
          src={source.embedUrl}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          title="Exercise video"
        />
      </div>
    );
  }

  // iframe attempt for SVFF / other sites
  if (!iframeBlocked) {
    return (
      <div className="space-y-2">
        <div className="aspect-video rounded-xl overflow-hidden border border-border bg-surface-3 relative">
          {!loaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-accent/40 border-t-accent rounded-full animate-spin" />
            </div>
          )}
          <iframe
            src={source.embedUrl}
            className="w-full h-full"
            allow="autoplay; fullscreen"
            allowFullScreen
            title="Exercise video"
            onLoad={() => setLoaded(true)}
            onError={() => setIframeBlocked(true)}
          />
        </div>
        <div className="flex items-center justify-between px-1">
          <p className="text-[11px] text-ink-muted">
            {source.sourceName}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIframeBlocked(true)}
              className="text-[11px] text-ink-muted hover:text-ink-secondary transition-colors"
            >
              Videon syns inte?
            </button>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-accent-fg hover:underline flex items-center gap-1"
            >
              Öppna i ny flik
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Fallback: external link card
  return (
    <div className="space-y-2">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="group aspect-video bg-surface-3 rounded-xl border border-border flex flex-col items-center justify-center gap-3 hover:bg-surface-4 hover:border-border-strong transition-colors"
      >
        <div className="w-14 h-14 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="text-accent-fg ml-1">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-ink-primary group-hover:text-accent-fg transition-colors">
            Spela upp video
          </p>
          <p className="text-xs text-ink-muted mt-0.5">{source.sourceName} · öppnas i ny flik</p>
        </div>
      </a>
      <button
        onClick={() => setIframeBlocked(false)}
        className="w-full text-[11px] text-ink-muted hover:text-ink-secondary transition-colors text-center"
      >
        Försök bädda in igen
      </button>
    </div>
  );
}
