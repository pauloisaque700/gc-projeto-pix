import { ReactNode } from 'react';

interface MobileContainerProps {
  children: ReactNode;
}

export default function Tela({ children }: MobileContainerProps) {
  return (
    <div className="min-h-screen bg-slate-50 md:flex md:justify-center md:items-center">
      <main className="w-full min-h-screen bg-white px-4 py-6 flex flex-col font-sans md:max-w-[440px] md:min-h-[840px] md:shadow-lg md:rounded-2xl">
        {children}
      </main>
    </div>
  );
}
