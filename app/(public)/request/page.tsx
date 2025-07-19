import { RequestForm, RequestHeader } from '@/components/features/public/request';

export default function Page() {
  return (
    <main className="py-24 bg-black min-h-screen">
      <div className="container px-4 mx-auto max-w-6xl">
        <div className="max-w-2xl mx-auto">
          <RequestHeader />

          <div className="border border-zinc-800 rounded-lg p-8 shadow-lg">
            <RequestForm />
          </div>
        </div>
      </div>
    </main>
  );
}
