import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import db from '@/lib/db';

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

    if (!user || user.role !== 'admin') {
        redirect('/'); // Redirect non-admins to home
    }

    return (
        <div style={{ padding: '20px' }}>
            {children}
        </div>
    );
}
