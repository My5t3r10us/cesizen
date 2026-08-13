import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { MobileNav } from '@/components/layout/mobile-nav';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect('/login');
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
      <main className="container mx-auto px-4 py-6 pb-24 md:pb-6">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
