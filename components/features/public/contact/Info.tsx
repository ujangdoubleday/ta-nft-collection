'use client';

import { motion } from 'framer-motion';
import { Mail, Phone } from 'lucide-react';
import Link from 'next/link';

export function Info() {
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
            <h2 className="text-lg sm:text-xl font-bold text-white">Get in Touch</h2>
          </div>

          <div className="p-4 sm:p-6 md:p-8 text-gray-200">
            <motion.p
              className="text-base sm:text-lg leading-relaxed mb-6 sm:mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              I&apos;d love to hear from you! Whether you have a question about my NFT platform or
              just want to talk about digital art.
            </motion.p>

            <motion.div
              className="bg-black rounded-lg p-4 sm:p-6 border border-gray-800"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <h3 className="text-base sm:text-lg font-semibold text-white mb-4 sm:mb-6">
                Contact Me Directly
              </h3>
              <div className="space-y-4 sm:space-y-6">
                <Link href="mailto:ilham28alfath@gmail.com" className="block">
                  <motion.div
                    className="flex items-center group cursor-pointer"
                    whileHover={{ x: 5 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-white flex-shrink-0 mr-4 sm:mr-5 flex items-center justify-center text-white group-hover:bg-white/10 transition-all duration-200">
                      <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-400">Email</p>
                      <p className="text-white text-base sm:text-lg group-hover:underline">
                        ilham28alfath@gmail.com
                      </p>
                    </div>
                  </motion.div>
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
