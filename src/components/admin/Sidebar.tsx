'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';
import {
    LayoutDashboard,
    Trophy,
    BarChart2,
    Dices,
    Users,
    Megaphone,
    Image as ImageIcon,
    LogOut
} from 'lucide-react';

const navItems = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Matches', href: '/admin/matches', icon: Trophy },
    { name: 'Stats', href: '/admin/stats', icon: BarChart2 },
    { name: 'Team Gen', href: '/admin/generator', icon: Dices },
    { name: 'Players', href: '/admin/players', icon: Users },
    { name: 'Announce', href: '/admin/announcements', icon: Megaphone },
    { name: 'Gallery', href: '/admin/gallery', icon: ImageIcon },
];

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logoContainer}>
                <Link href="/admin" className={styles.logo}>
                    <span className={styles.adminTag}>ADMIN</span> PANEL
                </Link>
            </div>

            <nav className={styles.nav}>
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                        >
                            <Icon size={20} className={styles.icon} />
                            <span className={styles.name}>{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className={styles.footer}>
                <Link href="/" className={styles.backLink} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <LogOut size={16} /> Exit Admin
                </Link>
            </div>
        </aside>
    );
}
