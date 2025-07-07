import { Info, Social } from '@/components/features/public/contact';

export default function ContactPage() {
  return (
    <main className="py-24 bg-black">
      <h1 className="text-3xl font-bold text-white mb-8 container px-4 mx-auto max-w-6xl">
        Contact Me
      </h1>
      <Info />
      <Social />
    </main>
  );
}
