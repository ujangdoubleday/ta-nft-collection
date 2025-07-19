'use client';

import { motion } from 'framer-motion';

export function RequestHeader() {
  return (
    <div className="mb-8 sm:mb-12 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
          Request Sepolia Testnet ETH
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto">
          Fill out the form below to request tokens for testing purposes.
        </p>
      </motion.div>
    </div>
  );
}
