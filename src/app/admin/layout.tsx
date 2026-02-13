import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import db from '@/lib/db';
import AdminSidebar from '@/components/admin/Sidebar';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();

    if (!session) {
        redirect('/login');
    }

    const result = await db.execute({
        sql: 'SELECT role FROM registrations WHERE id = ?',
        args: [session.userId]
    });
    const user = result.rows[0] as any;

    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
        redirect('/'); // Redirect non-admins to home
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background-start)' }}>
            <AdminSidebar />
            <main style={{
                flex: 1,
                padding: '40px',
                maxHeight: '100vh',
                overflowY: 'auto',
                position: 'relative'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    {children}
                </div>
            </main>
        </div>
    );
}
