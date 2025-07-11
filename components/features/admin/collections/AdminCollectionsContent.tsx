'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CollectionsContent } from '@/components/features/collections/CollectionsContent';
import { AllCollectionsList } from './AllCollectionsList';

export function AdminCollectionsContent() {
  const [activeTab, setActiveTab] = useState('all');

  return (
    <div className="space-y-6">
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Collections</TabsTrigger>
          <TabsTrigger value="mine">My Collections</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <AllCollectionsList />
        </TabsContent>

        <TabsContent value="mine" className="mt-0">
          <CollectionsContent role="admin" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
