import { Welcome, Creator } from '@/components/features/about';

export default function AboutPage() {
  return (
    <main className="py-24 bg-black">
      <h1 className="text-3xl font-bold text-white mb-8 container px-4 mx-auto max-w-6xl">
        About Me
      </h1>
      <Welcome />
      <Creator />
    </main>
  );
}
