'use client';

import { Mic, Search, Loader2, Send } from 'lucide-react';
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

  function handleSubmit() {
    if (!query.trim()) return;
    // TODO: Implement search/query
    console.log('Searching for:', query);
  }

  return (
    <div className='p-5'>
      <div className='flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700'>
        {/* Search Icon */}
        <Search className='h-5 w-5 text-neutral-400 shrink-0' />

        {/* Input */}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder='Search notes, ideas, or decisions…'
          className='flex-1 bg-transparent text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none'
        />

        {/* Voice */}
        {supported && (
          <button
            onClick={startListening}
            disabled={listening}
            className='flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600 disabled:opacity-50 transition-colors shrink-0'
            aria-label='Voice search'
          >
            {listening ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Mic className='h-4 w-4' />
            )}
          </button>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!query.trim()}
          className='flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0'
          aria-label='Search'
        >
          <Send className='h-4 w-4' />
        </button>
      </div>

      {/* Helper */}
      <div className='mt-3 text-xs text-neutral-500 dark:text-neutral-400'>
        {listening
          ? '🎤 Listening… speak naturally'
          : 'Try "What did I decide about embeddings?"'}
      </div>
    </div>
  );
}
