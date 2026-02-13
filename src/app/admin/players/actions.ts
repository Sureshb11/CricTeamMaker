'use server';

import db from '@/lib/db';
import { revalidatePath } from 'next/cache';

import { getSession } from '@/lib/session';

export async function deletePlayer(id: number) {
    const session = await getSession();
    if (!session) throw new Error('Unauthorized');

    // Check if current user is Super Admin
    const currentUserResult = await db.execute({
        sql: 'SELECT role FROM registrations WHERE id = ?',
        args: [session.userId]
    });
    const currentUserRole = (currentUserResult.rows[0] as any)?.role;

    // Check target user role
    const targetUserResult = await db.execute({
        sql: 'SELECT role FROM registrations WHERE id = ?',
        args: [id]
    });
    const targetUserRole = (targetUserResult.rows[0] as any)?.role;

    // Prevent deleting Super Admin
    if (targetUserRole === 'super_admin') {
        throw new Error('Cannot delete Super Admin');
    }

    // Only Super Admin can delete other Admins
    if (targetUserRole === 'admin' && currentUserRole !== 'super_admin') {
        throw new Error('Only Super Admin can delete Admins');
    }

    try {
        await db.execute({
            sql: 'DELETE FROM registrations WHERE id = ?',
            args: [id]
        });
        revalidatePath('/team');
        revalidatePath('/admin/players');
    } catch (error) {
        console.error('Failed to delete player:', error);
        throw error;
    }
}

export async function toggleAdminRole(id: number) {
    const session = await getSession();
    if (!session) throw new Error('Unauthorized');

    // Verify Super Admin status
    const result = await db.execute({
        sql: 'SELECT role FROM registrations WHERE id = ?',
        args: [session.userId]
    });
    const currentUser = result.rows[0] as any;

    if (currentUser?.role !== 'super_admin') {
        throw new Error('Only Super Admin can change roles');
    }

    // Get target user current role
    const targetResult = await db.execute({
        sql: 'SELECT role FROM registrations WHERE id = ?',
        args: [id]
    });
    const targetUser = targetResult.rows[0] as any;

    if (targetUser?.role === 'super_admin') {
        throw new Error('Cannot change Super Admin role');
    }

    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';

    try {
        await db.execute({
            sql: 'UPDATE registrations SET role = ? WHERE id = ?',
            args: [newRole, id]
        });
        revalidatePath('/admin/players');
    } catch (error) {
        console.error('Failed to toggle admin role:', error);
        throw error;
    }
}
