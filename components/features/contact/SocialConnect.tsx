'use client';

import { motion } from 'framer-motion';
import { Github } from 'lucide-react';

type SocialLink = {
  name: string;
  url: string;
  icon: React.ReactNode;
  description: string;
};

const socialLinks: SocialLink[] = [
  {
    name: 'GitHub',
    url: 'https://github.com/ujangbedog',
    icon: <Github className="w-6 h-6" />,
    description: 'Check out my code repositories and open-source projects',
  },
];

export function SocialConnect() {
  return (
    <section className="w-full bg-black">
      <div className="container px-4 md:px-6 mx-auto max-w-6xl">
        <motion.div
          className="bg-black rounded-lg border border-gray-800 shadow-lg overflow-hidden mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-black px-6 py-4 border-b border-gray-800">
            <h2 className="text-xl font-bold text-white">Connect Online</h2>
          </div>

          <div className="p-8">
            <motion.p
              className="text-gray-300 text-lg leading-relaxed mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Find me on these platforms to stay connected with my latest projects.
            </motion.p>

            <div className="grid grid-cols-1 gap-4">
              {socialLinks.map((link, index) => (
                <motion.div
                  key={link.name}
                  className="bg-black rounded-lg p-6 border border-gray-800 hover:border-white transition-all duration-200 cursor-pointer"
                  onClick={() => window.open(link.url, '_blank')}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-full border border-white flex-shrink-0 mr-5 flex items-center justify-center text-white">
                      {link.icon}
                    </div>
                    <h3 className="font-semibold text-white text-xl">{link.name}</h3>
                  </div>
                  <p className="text-gray-300 text-lg mb-3">{link.description}</p>
                  <div className="text-sm text-gray-400">{link.url}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
