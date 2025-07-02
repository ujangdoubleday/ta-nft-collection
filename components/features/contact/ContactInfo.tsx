'use client';

import { motion } from 'framer-motion';
import { Mail, Phone } from 'lucide-react';

export function ContactInfo() {
  return (
    <section className="w-full bg-black">
      <div className="container px-4 md:px-6 mx-auto max-w-6xl">
        <motion.div
          className="bg-black rounded-lg border border-gray-800 shadow-lg overflow-hidden mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-black px-6 py-4 border-b border-gray-800">
            <h2 className="text-xl font-bold text-white">Get in Touch</h2>
          </div>

          <div className="p-8">
            <motion.p
              className="text-gray-300 text-lg leading-relaxed mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              I&apos;d love to hear from you! Whether you have a question about my NFT platform or
              just want to talk about digital art.
            </motion.p>

            <motion.div
              className="bg-black rounded-lg p-6 border border-gray-800"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <h3 className="text-lg font-semibold text-white mb-6">Contact Me Directly</h3>
              <div className="space-y-6">
                <motion.div
                  className="flex items-center"
                  whileHover={{ x: 5 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <div className="w-12 h-12 rounded-full border border-white flex-shrink-0 mr-5 flex items-center justify-center text-white">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Email</p>
                    <p className="text-white text-lg">email@example.com</p>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-center"
                  whileHover={{ x: 5 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <div className="w-12 h-12 rounded-full border border-white flex-shrink-0 mr-5 flex items-center justify-center text-white">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Phone</p>
                    <p className="text-white text-lg">(+62) 812-3456-7890</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
