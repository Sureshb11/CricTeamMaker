'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './navbar.module.css';

interface NavLinksProps {
    session: any;
    user: any;
}

export default function NavLinks({ session, user }: NavLinksProps) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);
    const closeMenu = () => setIsOpen(false);

    return (
        <>
            <button className={styles.menuButton} onClick={toggleMenu} aria-label="Toggle Menu">
                {isOpen ? '✕' : '☰'}
            </button>
            <ul className={`${styles.navLinks} ${isOpen ? styles.navLinksActive : ''}`}>
                <li><Link href="/" className={styles.navLink} onClick={closeMenu}>Home</Link></li>
                <li><Link href="/team" className={styles.navLink} onClick={closeMenu}>Our Teams</Link></li>
                <li><Link href="/matches" className={styles.navLink} onClick={closeMenu}>Matches</Link></li>
                <li><Link href="/gallery" className={styles.navLink} onClick={closeMenu}>Gallery</Link></li>
                {session ? (
                    <li><Link href="/dashboard" className={styles.navLink} style={{ color: 'var(--primary-color)' }} onClick={closeMenu}>Hi, {user?.full_name?.split(' ')[0]}</Link></li>
                ) : (
                    <li><Link href="/login" className={styles.navLink} onClick={closeMenu}>Login</Link></li>
                )}
                {!session && <li><Link href="/register" className="btn" onClick={closeMenu}>Join Team</Link></li>}
            </ul>
        </>
    );
}
