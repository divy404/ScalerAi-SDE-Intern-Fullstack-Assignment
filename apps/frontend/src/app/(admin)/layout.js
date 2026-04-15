import Sidebar from '@/components/Sidebar';

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto w-full">
        {children}
      </main>
    </div>
  );
}
