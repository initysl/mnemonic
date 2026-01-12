'use client';

import { Mic, Search, Loader2, Send, X } from 'lucide-react';
import { useState, useRef } from 'react';
import { useTextQuery, useVoiceQuery } from '@/hooks/useKuery';
import { toast } from 'sonner';
import QueryAnswer from '@/components/query/QueryAnswer';

interface NoteQueryProps {
  onSearchResults?: (results: any[], query: string) => void;
  onVoiceResultSelect?: (noteId: string) => void;
  onAnswerNoteClick?: (noteId: string) => void;
}

export default function NoteQuery({
  onSearchResults,
  onVoiceResultSelect,
  onAnswerNoteClick,
}: NoteQueryProps) {
  const [query, setQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const textQuery = useTextQuery();
  const voiceQuery = useVoiceQuery();

  const isSearching = textQuery.isPending || voiceQuery.isPending;
  const currentResult = textQuery.data || voiceQuery.data;

  // Text Query
  const handleTextSearch = async () => {
    if (!query.trim()) return;

    try {
      const result = await textQuery.mutateAsync({
        query: query.trim(),
        top_k: 5,
        min_similarity: 0.3,
      });

      const notes = result.retrieved_notes;
      onSearchResults?.(notes, result.query);
      setShowAnswer(true);

      if (notes.length > 0) {
        toast.success(`Found ${notes.length} matching notes`, {
          duration: 4000,
        });
      } else {
        toast.info('No matching notes found');
      }
    } catch (error) {
      toast.error('Search failed. Please try again.');
      console.error('Text query error:', error);
    }
  };

  // Voice Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        handleVoiceSearch(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info('🎤 Recording... Ask your notes');
    } catch (error) {
      toast.error('Microphone access denied');
      console.error('Recording error:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // Voice Query
  const handleVoiceSearch = async (blob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');
      formData.append('top_k', '5');
      formData.append('min_similarity', '0.3');

      const result = await voiceQuery.mutateAsync(formData);
      setQuery(result.query);

      const notes = result.retrieved_notes;
      onSearchResults?.(notes, result.query);
      setShowAnswer(true); // Show answer panel

      if (notes.length > 0) {
        onVoiceResultSelect?.(notes[0].id);
        toast.success(
          `Voice query: "${result.query}" - Found ${notes.length} notes`,
          { duration: 5000 }
        );
      } else {
        toast.info(`No results for: "${result.query}"`);
      }
    } catch (error) {
      toast.error('Voice search failed. Please try again.');
      console.error('Voice search error:', error);
    }
  };

  // Clear search
  const handleClear = () => {
    setQuery('');
    onSearchResults?.([], '');
    setShowAnswer(false); // Hide answer
    textQuery.reset();
    voiceQuery.reset();
  };

  const hasActiveSearch = query.trim() || textQuery.data || voiceQuery.data;

  return (
    <div className='space-y-4'>
      {/* AI Answer - NEW */}
      {showAnswer && currentResult && !isSearching && (
        <div className='px-5 pb-5'>
          <QueryAnswer result={currentResult} onNoteClick={onAnswerNoteClick} />
        </div>
      )}
      {/* Search Input */}
      <div className='p-5'>
        <div className='flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700'>
          {isSearching ? (
            <Loader2 className='h-5 w-5 text-blue-500 animate-spin shrink-0' />
          ) : (
            <Search className='h-5 w-5 text-neutral-400 shrink-0' />
          )}

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleTextSearch()}
            placeholder='Search your notes…'
            disabled={isSearching || isRecording}
            className='flex-1 bg-transparent text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none disabled:opacity-50'
          />

          {hasActiveSearch && !isSearching && (
            <button
              onClick={handleClear}
              className='flex h-9 w-9 items-center justify-center rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors shrink-0'
            >
              <X className='h-4 w-4 text-neutral-500' />
            </button>
          )}

          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isSearching}
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors shrink-0 ${
              isRecording
                ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
                : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600 disabled:opacity-50'
            }`}
          >
            {isRecording ? (
              <div className='h-3 w-3 rounded-sm bg-white' />
            ) : (
              <Mic className='h-4 w-4' />
            )}
          </button>

          <button
            onClick={handleTextSearch}
            disabled={!query.trim() || isSearching || isRecording}
            className='flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0'
          >
            <Send className='h-4 w-4' />
          </button>
        </div>

        {/* Helper Text */}
        <div className='mt-3 text-xs text-neutral-500 dark:text-neutral-400'>
          {isRecording ? (
            <span className='text-red-500 font-medium'>
              🎤 Recording… Click to stop
            </span>
          ) : isSearching ? (
            <span className='text-blue-500 font-medium'>
              Processing your query…
            </span>
          ) : (
            'Try "What is in my grocery list?" or use voice'
          )}
        </div>
      </div>
    </div>
  );
}
