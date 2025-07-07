'use client';

import { motion } from 'framer-motion';

export function Social() {
  return (
    <section className="w-full bg-black">
      <div className="container px-4 md:px-6 mx-auto max-w-6xl">
        <motion.div
          className="bg-black rounded-lg border border-zinc-800 shadow-lg overflow-hidden mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-black px-6 py-4 border-b border-zinc-800">
            <h2 className="text-xl font-bold text-white">Connect Online</h2>
          </div>

          <div className="p-8 text-gray-200">
            <motion.p
              className="text-lg leading-relaxed mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Find me on these platforms to stay connected with my latest projects.
            </motion.p>

            <div className="grid grid-cols-1 gap-4">
              <motion.div
                className="bg-black rounded-lg p-6 border border-gray-800 hover:border-white transition-all duration-200 cursor-pointer"
                onClick={() => window.open('https://github.com/ujangbedog', '_blank')}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full border border-white flex-shrink-0 mr-5 flex items-center justify-center text-white">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-white text-xl">GitHub</h3>
                </div>
                <p className="text-gray-300 text-lg mb-3">
                  Check out my code repositories and open-source projects
                </p>
                <div className="text-sm text-gray-400">https://github.com/ujangbedog</div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
