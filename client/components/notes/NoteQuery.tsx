'use client';

import { Mic, Search, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export default function NoteQuery() {
  const [query, setQuery] = useState('');
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setQuery(transcript);
    };

    recognitionRef.current = recognition;
  }, []);

  function startListening() {
    if (!recognitionRef.current) return;
    recognitionRef.current.start();
  }

  return (
    <div className='rounded-2xl bg-white p-5 shadow-sm'>
      <div className='flex items-center gap-3'>
        {/* Search Icon */}
        <Search className='h-5 w-5 text-neutral-400' />

        {/* Input */}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Search notes, ideas, or decisions…'
          className='flex-1 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none'
        />

        {/* Voice */}
        {supported && (
          <button
            onClick={startListening}
            disabled={listening}
            className='flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200 disabled:opacity-50'
            aria-label='Voice search'
          >
            {listening ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Mic className='h-4 w-4' />
            )}
          </button>
        )}
      </div>

      {/* Helper / State */}
      <div className='mt-2 text-xs text-neutral-500'>
        {listening
          ? 'Listening… speak naturally'
          : 'Try “What did I decide about embeddings?”'}
      </div>
    </div>
  );
}
