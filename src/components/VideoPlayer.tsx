'use client';

import { useEffect, useRef } from 'react';
import videojs from 'video.js';
import Hls from 'hls.js';
import 'video.js/dist/video-js.css';

type Props = {
  src: string;
  title: string;
  onStateChange?: (playing: boolean, currentTime: number) => void;
  externalSeekTo?: number;
  externalPlaying?: boolean;
};

export default function VideoPlayer({ src, title, onStateChange, externalSeekTo, externalPlaying }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<videojs.Player | null>(null);

  useEffect(() => {
    if (!videoRef.current || playerRef.current) return;

    const player = videojs(videoRef.current, {
      controls: true,
      preload: 'metadata',
      autoplay: false,
      responsive: true,
      fluid: true
    });
    playerRef.current = player;

    const isHls = src.endsWith('.m3u8');
    if (isHls && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(videoRef.current);
      player.on('dispose', () => hls.destroy());
    } else {
      player.src({ src, type: isHls ? 'application/x-mpegURL' : 'video/mp4' });
    }

    const notify = () => onStateChange?.(!player.paused(), player.currentTime() ?? 0);
    player.on('play', notify);
    player.on('pause', notify);
    player.on('seeked', notify);

    return () => {
      player.dispose();
      playerRef.current = null;
    };
  }, [onStateChange, src]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player || externalSeekTo === undefined) return;
    if (Math.abs((player.currentTime() ?? 0) - externalSeekTo) > 2) {
      player.currentTime(externalSeekTo);
    }
  }, [externalSeekTo]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player || externalPlaying === undefined) return;
    if (externalPlaying && player.paused()) player.play();
    if (!externalPlaying && !player.paused()) player.pause();
  }, [externalPlaying]);

  return (
    <div data-vjs-player>
      <video ref={videoRef} className="video-js vjs-big-play-centered" aria-label={`${title} player`} />
    </div>
  );
}
