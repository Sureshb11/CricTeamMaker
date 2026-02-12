'use client';

import { deletePlayer } from './actions';
import { useTransition } from 'react';

export default function DeletePlayerButton({ id, disabled }: { id: number, disabled?: boolean }) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (confirm('Are you sure you want to delete this player? This action cannot be undone.')) {
            startTransition(async () => {
                await deletePlayer(id);
            });
        }
    };

    return (
        <button
            onClick={handleDelete}
            style={{
                background: 'transparent',
                border: 'none',
                cursor: disabled || isPending ? 'not-allowed' : 'pointer',
                fontSize: '1.2rem',
                opacity: disabled || isPending ? 0.5 : 1
            }}
            title="Delete User"
            disabled={disabled || isPending}
        >
            {isPending ? '⏳' : '❌'}
        </button>
    );
}
