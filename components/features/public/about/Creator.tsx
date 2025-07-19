'use client';

import { motion } from 'framer-motion';

export function Creator() {
  return (
    <section className="w-full bg-black">
      <div className="container px-4 md:px-6 mx-auto max-w-6xl">
        <motion.div
          className="bg-black rounded-lg border border-zinc-800 shadow-lg overflow-hidden mb-6 sm:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-black px-4 sm:px-6 py-3 sm:py-4 border-b border-zinc-800">
            <h2 className="text-lg sm:text-xl font-bold text-white">Creator</h2>
          </div>

          <div className="p-4 sm:p-6 md:p-8 text-gray-200">
            <p className="mb-6 sm:mb-8 text-base sm:text-lg leading-relaxed">
              A minimalist NFT platform crafted with precision and purpose.
            </p>

            <motion.div
              className="bg-black rounded-lg p-4 sm:p-6 md:p-8 border border-gray-800"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-center">
                <motion.div
                  className="h-28 w-28 sm:h-32 sm:w-32 md:h-36 md:w-36 rounded-full bg-black flex-shrink-0 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold border-2 border-white"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300, duration: 0.3 }}
                >
                  IA
                </motion.div>
                <div className="flex-1">
                  <motion.h3
                    className="text-xl sm:text-2xl font-semibold text-white mb-1 text-center sm:text-left"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    ILHAM ALFATH
                  </motion.h3>
                  <motion.p
                    className="text-gray-400 mb-4 sm:mb-6 text-base sm:text-lg text-center sm:text-left"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    Developer
                  </motion.p>

                  <motion.div
                    className="bg-black rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-800"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                  >
                    <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                      Blockchain enthusiast focused on creating elegant digital experiences.
                      Building the bridge between art and technology through clean design and robust
                      functionality.
                    </p>
                  </motion.div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <motion.div
                      className="bg-black rounded-lg p-4 sm:p-5 border border-gray-700"
                      whileHover={{ y: -5 }}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.7, duration: 0.5 }}
                    >
                      <h4 className="text-white font-semibold mb-2 text-base sm:text-lg">
                        Expertise
                      </h4>
                      <p className="text-gray-300 text-sm sm:text-base">
                        Web3, DApps, UI/UX, Front-end
                      </p>
                    </motion.div>
                    <motion.div
                      className="bg-black rounded-lg p-4 sm:p-5 border border-gray-700"
                      whileHover={{ y: -5 }}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8, duration: 0.5 }}
                    >
                      <h4 className="text-white font-semibold mb-2 text-base sm:text-lg">Focus</h4>
                      <p className="text-gray-300 text-sm sm:text-base">
                        Minimalism, Digital Art, NFTs
                      </p>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
