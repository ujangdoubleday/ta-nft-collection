'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-black">
      <div className="container px-4 md:px-6 mx-auto max-w-6xl">
        <div className="grid gap-3 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_500px] items-center">
          <motion.div
            className="flex flex-col justify-center space-y-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-white">
                Create, Mint & Own Digital Masterpieces
              </h1>
              <p className="max-w-[600px] text-gray-400 md:text-xl">
                Express your creativity through digital art on the blockchain. Create unique
                collectibles, build your portfolio, and own exclusive digital assets.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link
                href="/collections"
                className="inline-flex h-10 items-center justify-center rounded-md bg-white px-8 text-sm font-medium text-black shadow transition-colors hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-500"
              >
                Getting Started
              </Link>
            </div>
          </motion.div>
          <motion.div
            className="mx-auto flex justify-center lg:justify-end"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="relative h-[350px] w-[350px] md:h-[400px] md:w-[400px] overflow-hidden rounded-xl bg-gradient-to-br p-1">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm rounded-lg"></div>
              <Image
                src="/assets/images/example/cat.jpg"
                alt="NFT Art Showcase"
                width={500}
                height={500}
                className="h-full w-full object-cover rounded-lg"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
