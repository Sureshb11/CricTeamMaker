'use client';

import { useState } from 'react';
import styles from './page.module.css';
import {
    Search,
    UserCircle,
    Shield,
    PlayCircle,
    TrendingUp,
    Target,
    Users
} from 'lucide-react';

export default function TeamList({ players }: { players: any[] }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [teamFilter, setTeamFilter] = useState('All');

    // Get unique teams and roles for dropdowns
    const uniqueTeams = Array.from(new Set(players.map(p => p.team_name || 'Unassigned'))).sort();
    const uniqueRoles = ['All', 'Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper'];

    // Filter Logic
    const filteredPlayers = players.filter(player => {
        const matchesSearch = player.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'All' || player.playing_role === roleFilter;
        const matchesTeam = teamFilter === 'All' || (player.team_name || 'Unassigned') === teamFilter;
        return matchesSearch && matchesRole && matchesTeam;
    });

    // Group filtered players by team for display
    const groupedTeams: { [key: string]: { players: any[], logo_url: string | null } } = {};
    filteredPlayers.forEach(player => {
        const teamName = player.team_name || "Unassigned";
        if (!groupedTeams[teamName]) {
            groupedTeams[teamName] = {
                players: [],
                logo_url: player.logo_url
            };
        }
        groupedTeams[teamName].players.push(player);
    });

    return (
        <div>
            {/* Search & Filter Controls */}
            <div style={{
                marginBottom: '40px',
                display: 'flex',
                gap: '15px',
                flexWrap: 'wrap',
                background: 'rgba(255,255,255,0.05)',
                padding: 'clamp(15px, 4vw, 25px)',
                borderRadius: '12px',
                alignItems: 'center'
            }}>
                <div style={{ flex: '1 1 250px', position: 'relative' }}>
                    <Search
                        size={18}
                        style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }}
                    />
                    <input
                        type="text"
                        placeholder="Search player name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 12px 12px 40px',
                            borderRadius: '8px',
                            border: '1px solid #333',
                            background: '#1a1a1a',
                            color: 'white'
                        }}
                    />
                </div>

                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className={styles.filterSelect}
                >
                    <option value="All">All Roles</option>
                    <option value="Batsman">Batsman</option>
                    <option value="Bowler">Bowler</option>
                    <option value="All-Rounder">All-Rounder</option>
                    <option value="Wicket-Keeper">Wicket-Keeper</option>
                </select>

                <select
                    value={teamFilter}
                    onChange={(e) => setTeamFilter(e.target.value)}
                    className={styles.filterSelect}
                >
                    <option value="All">All Teams</option>
                    {uniqueTeams.map(team => (
                        <option key={team} value={team}>{team}</option>
                    ))}
                </select>
            </div>

            {/* Registered Teams Section */}
            {Object.keys(groupedTeams).length > 0 ? (
                <div>
                    {Object.entries(groupedTeams).map(([teamName, { players, logo_url }]) => (
                        <div key={teamName} style={{ marginBottom: '60px' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '15px',
                                marginBottom: '25px',
                                borderBottom: '1px solid var(--primary-color)',
                                paddingBottom: '15px',
                                flexWrap: 'wrap'
                            }}>
                                {logo_url ? (
                                    <div style={{ width: 'clamp(50px, 15vw, 80px)', height: 'clamp(50px, 15vw, 80px)', borderRadius: '50%', overflow: 'hidden', background: '#222', border: '2px solid var(--primary-color)', flexShrink: 0 }}>
                                        <img src={logo_url} alt={`${teamName} Logo`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                ) : (
                                    <div style={{ width: 'clamp(50px, 15vw, 80px)', height: 'clamp(50px, 15vw, 80px)', borderRadius: '50%', overflow: 'hidden', background: '#222', border: '2px solid var(--primary-color)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Shield size={32} color="var(--primary-color)" />
                                    </div>
                                )}
                                <h3 style={{
                                    fontSize: 'clamp(1.5rem, 6vw, 2rem)',
                                    color: 'var(--text-main)',
                                    margin: 0
                                }}>
                                    {teamName}
                                </h3>
                            </div>

                            <div className={styles.grid}>
                                {players.map((player) => (
                                    <div key={player.id} className={styles.playerCard}>
                                        <div className={styles.imageContainer} style={{ background: '#1e1e1e' }}>
                                            <img
                                                src={player.photo_url || `https://placehold.co/400x400/1a1a1a/00ff88?text=${player.full_name?.[0] || 'P'}+${player.full_name?.split(' ')[1]?.[0] || ''}`}
                                                alt={player.full_name}
                                                className={styles.playerImage}
                                            />
                                        </div>
                                        <div className={styles.info}>
                                            <span className={styles.role}>{player.playing_role}</span>
                                            <h2 className={styles.name}>{player.full_name}</h2>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                                Exp: {player.experience_level}
                                            </p>
                                            <div className={styles.stats}>
                                                <div className={styles.stat}>
                                                    <span className={styles.statLabel} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <PlayCircle size={12} /> Matches
                                                    </span>
                                                    <span className={styles.statValue}>{player.matches_played || 0}</span>
                                                </div>
                                                <div className={styles.stat}>
                                                    <span className={styles.statLabel} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <TrendingUp size={12} /> Runs
                                                    </span>
                                                    <span className={styles.statValue}>{player.total_runs || 0}</span>
                                                </div>
                                                <div className={styles.stat}>
                                                    <span className={styles.statLabel} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <Target size={12} /> Wickets
                                                    </span>
                                                    <span className={styles.statValue}>{player.total_wickets || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', marginTop: '50px', color: 'var(--text-muted)' }}>
                    <p>No players match your search.</p>
                </div>
            )}
        </div>
    );
}
