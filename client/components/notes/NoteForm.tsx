'use client';

import { useState } from 'react';
import { NoteCreate } from '@/types/note';
import { X, Loader2, Plus, Tag as TagIcon } from 'lucide-react';

interface NoteFormProps {
  initialData?: Partial<NoteCreate>;
  onSubmit: (data: NoteCreate) => void;
  onCancel?: () => void;
  submitLabel?: string;
  isLoading?: boolean;
}

export default function NoteForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save Note',
  isLoading = false,
}: NoteFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    onSubmit({
      title: title.trim(),
      content: content.trim(),
      tags,
    });
  };

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {/* Title */}
      <div>
        <label
          htmlFor='title'
          className='block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300'
        >
          Title
        </label>
        <input
          id='title'
          type='text'
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder='Enter note title...'
          className='w-full p-3 rounded-xl text-neutral-900 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg'
          required
          disabled={isLoading}
        />
      </div>

      {/* Content */}
      <div>
        <label
          htmlFor='content'
          className='block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300'
        >
          Content
        </label>
        <textarea
          id='content'
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder='Write your note...'
          rows={8}
          className='w-full p-3 rounded-xl text-neutral-900 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
          required
          disabled={isLoading}
        />
      </div>

      {/* Tags */}
      <div>
        <label className='block text-sm font-medium mb-2 text-neutral-700 dark:text-neutral-300'>
          Tags
        </label>
        <div className='flex gap-2 mb-3'>
          <div className='relative flex-1'>
            <TagIcon
              size={18}
              className='absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400'
            />
            <input
              type='text'
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder='Add a tag...'
              className='w-full pl-10 pr-4 py-2 rounded-lg text-neutral-900 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
              disabled={isLoading}
            />
          </div>
          <button
            type='button'
            onClick={handleAddTag}
            disabled={isLoading}
            className='px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2'
          >
            <Plus size={18} />
            Add
          </button>
        </div>

        {/* Tag List */}
        {tags.length > 0 && (
          <div className='flex flex-wrap gap-2'>
            {tags.map((tag) => (
              <span
                key={tag}
                className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-sm'
              >
                <TagIcon size={12} />
                {tag}
                <button
                  type='button'
                  onClick={() => handleRemoveTag(tag)}
                  disabled={isLoading}
                  className=' hover:text-red-500 transition-colors'
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className='flex gap-3 pt-4'>
        <button
          type='submit'
          disabled={!title.trim() || !content.trim() || isLoading}
          className='flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isLoading && <Loader2 className='animate-spin' size={18} />}
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type='button'
            onClick={onCancel}
            disabled={isLoading}
            className='px-6 py-3 rounded-xl border text-red-600 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors'
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
