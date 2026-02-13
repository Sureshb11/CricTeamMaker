'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './navbar.module.css';
import {
    Home,
    Users,
    Trophy,
    Image as ImageIcon,
    LogIn,
    UserPlus,
    ArrowRightLeft
} from 'lucide-react';

interface NavLinksProps {
    session: any;
    user: any;
}

export default function NavLinks({ session, user }: NavLinksProps) {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);
    const closeMenu = () => setIsOpen(false);

    const linkStyle = { display: 'flex', alignItems: 'center', gap: '8px' };

    return (
        <>
            <button className={styles.menuButton} onClick={toggleMenu} aria-label="Toggle Menu">
                {isOpen ? '✕' : '☰'}
            </button>
            <ul className={`${styles.navLinks} ${isOpen ? styles.navLinksActive : ''}`}>
                <li><Link href="/" className={styles.navLink} onClick={closeMenu} style={linkStyle}><Home size={18} /> Home</Link></li>
                <li><Link href="/team" className={styles.navLink} onClick={closeMenu} style={linkStyle}><Users size={18} /> Our Teams</Link></li>
                <li><Link href="/compare" className={styles.navLink} onClick={closeMenu} style={linkStyle}><ArrowRightLeft size={18} /> Compare</Link></li> {/* Added Compare link */}
                <li><Link href="/matches" className={styles.navLink} onClick={closeMenu} style={linkStyle}><Trophy size={18} /> Matches</Link></li>
                <li><Link href="/gallery" className={styles.navLink} onClick={closeMenu} style={linkStyle}><ImageIcon size={18} /> Gallery</Link></li>
                {session ? (
                    <li><Link href="/dashboard" className={styles.navLink} style={{ ...linkStyle, color: 'var(--primary-color)' }} onClick={closeMenu}>Hi, {user?.full_name?.split(' ')[0]}</Link></li>
                ) : (
                    <li><Link href="/login" className={styles.navLink} onClick={closeMenu} style={linkStyle}><LogIn size={18} /> Login</Link></li>
                )}
                {!session && <li><Link href="/register" className="btn" onClick={closeMenu} style={linkStyle}><UserPlus size={18} /> Join Team</Link></li>}
            </ul>
        </>
    );
}
