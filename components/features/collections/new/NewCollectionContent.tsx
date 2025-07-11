'use client';

import { NewCollectionHeader } from './NewCollectionHeader';
import { NewCollectionForm } from './NewCollectionForm';

interface NewCollectionContentProps {
  /**
   * The route prefix to use for redirects after collection creation
   * @example 'admin' for admin routes, 'user' for user routes
   */
  routePrefix: string;
}

export function NewCollectionContent({ routePrefix }: NewCollectionContentProps) {
  return (
    <>
      <NewCollectionHeader />
      <NewCollectionForm routePrefix={routePrefix} />
    </>
  );
}
