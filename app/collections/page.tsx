import { TrpcCollectionsPage } from '@/components/features/collections/collection';

export const revalidate = 60;

export default function MyCollectionsPage() {
  return (
    <>
      <TrpcCollectionsPage />
    </>
  );
}
