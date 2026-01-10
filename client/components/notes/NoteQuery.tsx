'use client';

import { Mic, Search, Loader2, Send, X, Sparkles } from 'lucide-react';
import { useState, useRef } from 'react';
import { useTextQuery, useVoiceQuery } from '@/hooks/useKuery';
import { toast } from 'sonner';

interface NoteQueryProps {
  onSearchResults?: (results: any[], query: string) => void;
  onVoiceResultSelect?: (noteId: string) => void;
}

export default function NoteQuery({
  onSearchResults,
  onVoiceResultSelect,
}: NoteQueryProps) {
  const [query, setQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const textQuery = useTextQuery();
  const voiceQuery = useVoiceQuery();

  const isSearching = textQuery.isPending || voiceQuery.isPending;

  // Text Search
  const handleTextSearch = async () => {
    if (!query.trim()) return;

    try {
      const result = await textQuery.mutateAsync({
        query: query.trim(),
        top_k: 5,
        min_similarity: 0.3,
      });

      if (result.results.length > 0) {
        onSearchResults?.(result.results, query);
        toast.success(`Found ${result.total_results} matching notes`);
      } else {
        onSearchResults?.([], query);
        toast.info('No matching notes found');
      }
    } catch (error) {
      toast.error('Search failed. Please try again.');
      console.error('Text search error:', error);
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
        setAudioBlob(blob);
        handleVoiceSearch(blob);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info('Recording... Speak your query');
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

  // Voice Search
  const handleVoiceSearch = async (blob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', blob, 'recording.webm');
      formData.append('top_k', '5');
      formData.append('min_similarity', '0.3');

      const result = await voiceQuery.mutateAsync(formData);

      // Update query input with transcribed text
      setQuery(result.query);

      if (result.results.length > 0) {
        onSearchResults?.(result.results, result.query);

        // Auto-select first result
        onVoiceResultSelect?.(result.results[0].id);

        toast.success(
          `Voice query processed: "${result.query}" - Found ${result.total_results} notes`,
          { duration: 5000 }
        );
      } else {
        onSearchResults?.([], result.query);
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
    setAudioBlob(null);
    onSearchResults?.([], '');
    textQuery.reset();
    voiceQuery.reset();
  };

  const hasActiveSearch = query.trim() || textQuery.data || voiceQuery.data;

  return (
    <div className='p-5'>
      <div className='relative'>
        <div className='flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700'>
          {/* Search Icon or Loading */}
          {isSearching ? (
            <Loader2 className='h-5 w-5 text-blue-500 animate-spin shrink-0' />
          ) : (
            <Search className='h-5 w-5 text-neutral-400 shrink-0' />
          )}

          {/* Input */}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleTextSearch()}
            placeholder='Search notes, ideas, or decisions…'
            disabled={isSearching || isRecording}
            className='flex-1 bg-transparent text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none disabled:opacity-50'
          />

          {/* Clear Button */}
          {hasActiveSearch && !isSearching && (
            <button
              onClick={handleClear}
              className='flex h-9 w-9 items-center justify-center rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors shrink-0'
              aria-label='Clear search'
            >
              <X className='h-4 w-4 text-neutral-500' />
            </button>
          )}

          {/* Voice Button */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isSearching}
            className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors shrink-0 ${
              isRecording
                ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
                : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600 disabled:opacity-50'
            }`}
            aria-label={isRecording ? 'Stop recording' : 'Voice search'}
          >
            {isRecording ? (
              <div className='h-3 w-3 rounded-sm bg-white' />
            ) : (
              <Mic className='h-4 w-4' />
            )}
          </button>

          {/* Submit Button */}
          <button
            onClick={handleTextSearch}
            disabled={!query.trim() || isSearching || isRecording}
            className='flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0'
            aria-label='Search'
          >
            <Send className='h-4 w-4' />
          </button>
        </div>

        {/* Search Results Summary */}
        {(textQuery.data || voiceQuery.data) && !isSearching && (
          <div className='mt-3 flex items-center gap-2 text-xs'>
            <Sparkles className='h-3 w-3 text-blue-500' />
            <span className='text-neutral-600 dark:text-neutral-400'>
              {textQuery.data?.total_results ||
                voiceQuery.data?.total_results ||
                0}{' '}
              results for "{textQuery.data?.query || voiceQuery.data?.query}"
            </span>
          </div>
        )}
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
          'Try "What did I decide about embeddings?" or use voice'
        )}
      </div>
    </div>
  );
}
