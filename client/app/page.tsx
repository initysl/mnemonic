'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

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
          className='absolute left-0 text-sm text-neutral-500'
        >
          {QUERY_SUGGESTIONS[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className='min-h-screen bg-neutral-950 text-neutral-100 overflow-hidden p-2'>
      {/* Navbar */}
      <header className='flex items-center justify-start py-6 max-w-7xl mx-auto sticky  '>
        <div className='flex items-center gap-2 text-lg font-semibold'>
          <span className='inline-flex h-8 w-8 items-center justify-center rounded-md bg-white text-black font-bold'>
            M
          </span>
          <span>Mnemonic</span>
        </div>
      </header>

      {/* Hero Section */}
      <section className='max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center py-20'>
        {/* Left */}
        <motion.div
          initial='hidden'
          animate='visible'
          variants={fadeUp}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className='space-y-8'
        >
          <h1 className='text-5xl lg:text-6xl font-semibold leading-tight tracking-tight'>
            Your memory,
            <br />
            structured.
            <br />
            searchable.
          </h1>

          <p className='text-neutral-400 max-w-xl text-lg leading-relaxed'>
            Mnemonic turns{' '}
            <span className='bg-orange-500 p-1 text-white'>
              your notes into a living knowledge base
            </span>
            . Write naturally, then ask questions—by text or voice—and get
            precise answers from your own thoughts.
          </p>

          <div className='flex items-center gap-4'>
            <button className='rounded-full bg-white px-8 py-3 text-black font-medium hover:bg-neutral-200 transition'>
              Start building memory
            </button>
            <span className='text-sm  bg-green-500 p-1 text-white'>
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
          <div className='rounded-2xl bg-neutral-900 border border-neutral-800 p-6 shadow-2xl'>
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
              className='relative rounded-xl bg-neutral-100 text-neutral-900 p-6 border border-neutral-300 shadow-[0_1px_0_rgba(0,0,0,0.05)] space-y-4'
            >
              {/* Marginal meta */}
              <span className='absolute -left-6 top-6 -rotate-90 text-xs tracking-tight leading-snug bg-white p-1'>
                NOTE
              </span>

              <h3 className='font-serif text-lg tracking-tight leading-snug'>
                Embeddings & Semantic Recall
              </h3>

              <div className='h-px bg-neutral-300' />

              <p className='text-sm leading-relaxed text-neutral-700'>
                Vector embeddings enable semantic retrieval, allowing notes to
                be recalled by meaning rather than exact phrasing.
              </p>

              <p className='text-sm leading-relaxed text-neutral-700'>
                Pinecone will act as the vector store, while metadata filtering
                controls relevance, recency, and scope.
              </p>

              <span className='block text-xs text-neutral-500 italic'>
                Last edited • 2 days ago
              </span>
            </motion.div>

            {/* Ask Interface */}
            <div className='mt-5 rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3 space-y-1'>
              <span className='text-[11px] uppercase tracking-widest text-neutral-500'>
                Ask your notes
              </span>

              {/* Animated Suggestions */}
              <QuerySuggestions />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className='max-w-7xl mx-auto px-8 py-24'>
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
              className='border border-neutral-800 rounded-xl p-6 bg-neutral-900/40'
            >
              <h3 className='text-lg font-medium mb-3'>{feature.title}</h3>
              <p className='text-sm text-neutral-400 leading-relaxed'>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className='py-8 text-center text-sm text-neutral-500 border-t border-neutral-800'>
        © {new Date().getFullYear()} Mnemonic — remember less, think better.
      </footer>
    </main>
  );
}
