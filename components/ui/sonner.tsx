'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-black group-[.toaster]:text-white group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-gray-300',
          actionButton: 'group-[.toast]:bg-white group-[.toast]:text-black',
          cancelButton: 'group-[.toast]:bg-gray-700 group-[.toast]:text-white',
          success: 'group-[.toast]:border-l-green-500 group-[.toast]:border-l-2',
          error: 'group-[.toast]:border-l-red-500 group-[.toast]:border-l-2',
          warning: 'group-[.toast]:border-l-yellow-500 group-[.toast]:border-l-2',
          info: 'group-[.toast]:border-l-blue-500 group-[.toast]:border-l-2',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
