'use client';

import { motion } from 'framer-motion';

export function Welcome() {
  return (
    <section className="w-full bg-black">
      <div className="container px-4 md:px-6 mx-auto max-w-6xl">
        <motion.div
          className="bg-black rounded-lg border border-zinc-800 shadow-lg overflow-hidden mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-black px-6 py-4 border-b border-zinc-800">
            <h2 className="text-xl font-bold text-white">Welcome</h2>
          </div>

          <div className="p-8 text-gray-200">
            <motion.div
              className="flex flex-col gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <h3 className="text-2xl font-light text-white mb-4">Digital Art. Reimagined.</h3>
                <p className="text-lg leading-relaxed mb-6">
                  A space where art meets blockchain in perfect harmony. Simple, elegant, powerful.
                </p>
                <p className="text-gray-400 text-base leading-relaxed">
                  Designed for creators and collectors who appreciate minimalism and functionality.
                </p>
              </motion.div>

              <motion.div
                className="bg-black rounded-lg p-6 border border-gray-800 mt-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <h3 className="text-xl font-semibold text-white mb-3">Why This Platform?</h3>
                <p className="text-gray-300 leading-relaxed">
                  We believe in letting the art speak for itself. Clean interfaces, intuitive
                  navigation, and powerful technology working silently in the background.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
