import { Win98Window } from '@/components/ui/organisms/Win98Window';

export const ManageCollectionsContent = () => {
  return (
    <Win98Window
      title="Manage Collections"
      icon="/assets/icons/window/gallery.png"
      className="mb-4"
    >
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Collections Management</h1>
      </div>
    </Win98Window>
  );
};
