import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  if (session.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        user={{ 
          email: session.email, 
          nom: session.nom, 
          prenom: session.prenom, 
          role: session.role 
        }} 
      />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-4 pb-24 lg:p-6 lg:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
