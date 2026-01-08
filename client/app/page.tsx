'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaGithubSquare } from 'react-icons/fa';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const QUERY_SUGGESTIONS = [
  'What decisions did say about sport?',
  'What is my notes on semantic search',
  'I updateed my grocery list yesterday, what items are on it?',
  'Show related notes about sport and health',
];

const features = [
  {
    title: 'Semantic Search',
    description:
      'Find ideas by meaning, not keywords. Mnemonic understands what you wrote.',
  },
  {
    title: 'Ask Your Notes',
    description: 'Query your knowledge base using natural language or voice.',
  },
  {
    title: 'Memory That Grows',
    description:
      'Every note strengthens the system—connections emerge automatically.',
  },
];

function QuerySuggestions() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % QUERY_SUGGESTIONS.length);
    }, 3200);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className='relative h-5 overflow-hidden'>
      <AnimatePresence mode='wait'>
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className='absolute left-0 text-sm text-neutral-500 dark:text-neutral-400'
        >
          {QUERY_SUGGESTIONS[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className='min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 px-3'>
      {/* Navbar */}
      <header className='flex items-center justify-center py-6 gap-10 sticky top-0 bg-white dark:bg-neutral-950 z-10 border-b border-neutral-200 dark:border-neutral-800'>
        <div className='flex items-center gap-2 text-lg font-semibold'>
          <motion.span
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className='inline-flex h-8 w-8 items-center justify-center rounded-md bg-neutral-900 dark:bg-white text-white dark:text-black font-bold'
          >
            M
          </motion.span>

          <span>Mnemonic</span>
        </div>
        <div>
          <Link href='https://github.com/initysl' target='_blank'>
            <FaGithubSquare
              size={30}
              className=' text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition cursor-pointer'
            />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className='max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center py-18'>
        {/* Left */}
        <motion.div
          initial='hidden'
          animate='visible'
          variants={fadeUp}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className='space-y-8'
        >
          <motion.h1
            initial='hidden'
            animate='visible'
            variants={{
              visible: { transition: { staggerChildren: 0.12 } },
            }}
            className='text-5xl lg:text-6xl font-semibold leading-tight tracking-tight'
          >
            {['Your memory,', 'structured.', 'searchable.'].map((line) => (
              <motion.span key={line} variants={fadeUp} className='block'>
                {line}
              </motion.span>
            ))}
          </motion.h1>

          <p className='text-neutral-600 dark:text-neutral-400 max-w-xl text-lg leading-relaxed'>
            Mnemonic turns{' '}
            <span className='bg-orange-500 p-1 text-white'>
              your notes into a living knowledge base
            </span>
            . Write naturally, then ask questions, by text or voice and get
            precise answers from your own{' '}
            <span className='bg-orange-500 p-1 text-white'>thoughts</span>. ~{' '}
            {''}
            <span className='italic underline '>
              Coupled with llm reasoning
            </span>
          </p>

          <div className='flex items-center gap-4'>
            <button className='rounded-full bg-neutral-900 dark:bg-white px-4 py-3 text-white dark:text-black font-medium hover:bg-neutral-700 dark:hover:bg-neutral-200 transition'>
              Continue
            </button>
            <span className='text-sm bg-green-500 p-1 text-white'>
              No setup. No friction.
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: 'easeOut', delay: 0.25 }}
          className='relative'
        >
          <div className='rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 shadow-2xl'>
            {/* Window controls */}
            <div className='flex items-center gap-2 mb-6'>
              <span className='h-3 w-3 rounded-full bg-red-500' />
              <span className='h-3 w-3 rounded-full bg-yellow-500' />
              <span className='h-3 w-3 rounded-full bg-green-500' />
            </div>

            {/* Paper Surface */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className='relative rounded-xl bg-white dark:bg-neutral-100 text-neutral-900 p-6 border border-neutral-200 dark:border-neutral-300 shadow-[0_1px_0_rgba(0,0,0,0.05)] space-y-4'
            >
              {/* Marginal meta */}
              <span className='absolute -left-6 top-6 -rotate-90 text-xs font-serif tracking-tight leading-snug bg-white p-1'>
                NOTE
              </span>

              <h3 className='font-serif text-lg tracking-tight leading-snug'>
                The Unchanging Icon: A Note on the Porsche 911
              </h3>

              <div className='h-px bg-neutral-200 dark:bg-neutral-300' />

              <p className='text-sm leading-relaxed text-neutral-700'>
                The Porsche 911 is arguably the most iconic and enduring sports
                car in automotive history, a masterpiece of engineering that has
                defined performance driving for over six decades
              </p>

              <p className='text-sm leading-relaxed text-neutral-700'>
                The core philosophy of the 911 centers around its unique
                rear-engine layout.
              </p>

              <span className='block text-xs text-neutral-500 italic'>
                #Porsche911 #SportsCar #AutomotiveIcon #FlatSix
              </span>
            </motion.div>

            {/* Ask Interface */}
            <div className='mt-5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 px-4 py-3 space-y-1'>
              <span className='text-[11px] uppercase tracking-widest text-neutral-500 dark:text-neutral-400'>
                Ask your notes
              </span>

              {/* Animated Suggestions */}
              <QuerySuggestions />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className='px-8 py-24'>
        <motion.div
          initial='hidden'
          whileInView='visible'
          viewport={{ once: true }}
          variants={stagger}
          className='grid grid-cols-1 md:grid-cols-3 gap-10'
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              className=' outline-2 outline-offset-4 outline-solid rounded-xl p-6 bg-neutral-50 dark:bg-neutral-900/40 hover:translate-y-1 hover:shadow-lg transition cursor-pointer '
            >
              <h3 className='text-lg font-medium mb-3'>{feature.title}</h3>
              <p className='text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed'>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className='py-8 text-center text-sm text-neutral-500 dark:text-neutral-400 border-t border-neutral-200 dark:border-neutral-800'>
        © {new Date().getFullYear()} Mnemonic — remember less, think{' '}
        <span className='bg-green-500 p-1 text-white'>better</span>.
      </footer>
    </main>
  );
}
