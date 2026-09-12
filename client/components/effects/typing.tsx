'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface TypingTextProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  onComplete?: () => void;
}

export function TypingText({
  text,
  speed = 30,
  delay = 0,
  className = '',
  onComplete,
}: TypingTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  // With no delay there is nothing to wait for, so start in the started
  // state rather than setting it from an effect after the first paint.
  const [started, setStarted] = useState(delay <= 0);
  const [typedText, setTypedText] = useState(text);

  // Start over when the text changes. Adjusting state during render rather
  // than in an effect: an effect resets after paint, so a new answer would
  // flash the previous answer's worth of characters before restarting.
  if (typedText !== text) {
    setTypedText(text);
    setCurrentIndex(0);
  }

  // Derived rather than accumulated: a reused instance receiving new text used
  // to keep appending to the previous answer's buffer, rendering the new text
  // onto the tail of the old one.
  const displayedText = text.slice(0, currentIndex);

  // Handle initial delay
  useEffect(() => {
    if (delay <= 0) return;

    const delayTimeout = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(delayTimeout);
  }, [delay]);

  // Handle typing
  useEffect(() => {
    if (!started) return;

    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else if (currentIndex === text.length && onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete, started]);

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: started ? 1 : 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {displayedText}
      {started && currentIndex < text.length && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className='inline-block w-0.5 h-4 bg-blue-500 ml-0.5'
        />
      )}
    </motion.span>
  );
}

// Word-by-word animation - smoother, faster alternative to character typing
// Best for: titles, short phrases, or when you want impact without slow character reveal
export function TypingTextWords({
  text,
  delayPerWord = 100,
  className = '',
  onComplete,
}: {
  text: string;
  delayPerWord?: number;
  className?: string;
  onComplete?: () => void;
}) {
  const words = text.split(' ');
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!completed) {
      const totalDelay = words.length * delayPerWord;
      const timeout = setTimeout(() => {
        setCompleted(true);
        onComplete?.();
      }, totalDelay);

      return () => clearTimeout(timeout);
    }
  }, [completed, words.length, delayPerWord, onComplete]);

  return (
    <motion.p className={className}>
      {words.map((word, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: index * (delayPerWord / 1000),
            duration: 0.3,
          }}
          className='inline-block mr-1'
        >
          {word}
        </motion.span>
      ))}
    </motion.p>
  );
}