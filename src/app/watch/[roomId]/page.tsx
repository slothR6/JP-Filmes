'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { onValue, push, ref, set } from 'firebase/database';
import { allMovies, getMovieBySlug } from '@/lib/movies';
import { db, firebaseReady } from '@/lib/firebase';
import { ChatMessage } from '@/lib/types';
import { isValidRoomId, sanitizeText } from '@/lib/security';

const VideoPlayer = dynamic(() => import('@/components/VideoPlayer'), { ssr: false });

export default function WatchPartyPage({ params }: { params: { roomId: string } }) {
  const roomId = params.roomId;
  const movie = getMovieBySlug(roomId) ?? allMovies[0];
  const [nickname, setNickname] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [syncState, setSyncState] = useState<{ playing: boolean; currentTime: number }>({ playing: false, currentTime: 0 });

  useEffect(() => {
    setNickname(`guest-${Math.random().toString(36).slice(2, 7)}`);
  }, []);

  useEffect(() => {
    if (!firebaseReady || !db || !isValidRoomId(roomId)) return;

    const syncRef = ref(db, `watchParty/${roomId}/sync`);
    const chatRef = ref(db, `watchParty/${roomId}/chat`);

    const unsubSync = onValue(syncRef, (snapshot) => {
      const next = snapshot.val();
      if (next && typeof next.currentTime === 'number') setSyncState(next);
    });

    const unsubChat = onValue(chatRef, (snapshot) => {
      const val = snapshot.val() ?? {};
      const rows = Object.entries(val)
        .map(([id, raw]) => ({ id, ...(raw as Omit<ChatMessage, 'id'>) }))
        .sort((a, b) => a.timestamp - b.timestamp);
      setMessages(rows);
    });

    return () => {
      unsubSync();
      unsubChat();
    };
  }, [roomId]);

  const roomError = useMemo(() => !isValidRoomId(roomId), [roomId]);

  const onStateChange = async (playing: boolean, currentTime: number) => {
    if (!firebaseReady || !db || roomError) return;
    await set(ref(db, `watchParty/${roomId}/sync`), { playing, currentTime, updatedAt: Date.now() });
  };

  const sendMessage = async () => {
    if (!firebaseReady || !db || roomError) return;
    const text = sanitizeText(chatInput, 180);
    const user = sanitizeText(nickname, 24);
    if (!text || !user) return;
    await push(ref(db, `watchParty/${roomId}/chat`), { nickname: user, text, timestamp: Date.now() });
    setChatInput('');
  };

  if (roomError) {
    return <p>Invalid room id format.</p>;
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Watch Party: {movie.title}</h1>
        {!firebaseReady && <p className="text-yellow-300">Firebase env vars missing. Live sync/chat disabled in this environment.</p>}
        <VideoPlayer
          src={movie.streamUrl}
          title={movie.title}
          onStateChange={onStateChange}
          externalSeekTo={syncState.currentTime}
          externalPlaying={syncState.playing}
        />
        <Link href={`/movie/${movie.slug}`} className="text-accent underline">Back to movie details</Link>
      </div>
      <aside className="rounded-lg border border-white/10 bg-card p-4">
        <h2 className="mb-3 text-lg font-semibold">Live Chat</h2>
        <label className="mb-2 block text-sm">Nickname</label>
        <input
          aria-label="Nickname"
          className="mb-3 w-full rounded bg-surface p-2"
          value={nickname}
          onChange={(e) => setNickname(sanitizeText(e.target.value, 24))}
        />
        <div className="mb-3 h-72 space-y-2 overflow-y-auto rounded bg-surface p-2" role="log" aria-live="polite">
          {messages.map((msg) => (
            <p key={msg.id} className="text-sm">
              <span className="font-semibold text-accent">{msg.nickname}:</span> {msg.text}
            </p>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            aria-label="Message"
            className="w-full rounded bg-surface p-2"
            value={chatInput}
            maxLength={180}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage} className="rounded bg-accent px-4 py-2 font-semibold text-black">Send</button>
        </div>
      </aside>
    </section>
  );
}
