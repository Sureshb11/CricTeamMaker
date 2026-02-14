'use client';

import { RefreshCw, Trophy, User, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface Props {
    match: any;
    innings: any[];
    recentBalls: any[];
    batters: any[];
    bowler: any;
    allBowlers: any[];
}

export default function LiveMatchView({ match, innings, recentBalls, batters, bowler, allBowlers }: Props) {
    const router = useRouter();
    const currentInning = innings.find(i => i.inning_number === match.current_inning);
    const firstInning = innings.find(i => i.inning_number === 1);
    const secondInning = innings.find(i => i.inning_number === 2);

    // Auto-refresh every 10 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            router.refresh();
        }, 10000);
        return () => clearInterval(interval);
    }, [router]);

    const isCompleted = match.status === 'completed';
    const isLive = match.status === 'live';

    // Filter batters/bowlers by inning
    const currentBatters = batters.filter((b: any) => {
        if (!currentInning) return false;
        return b.inning_number === currentInning.inning_number;
    });
    const currentBowlers = allBowlers.filter((b: any) => {
        if (!currentInning) return false;
        return b.inning_number === currentInning.inning_number;
    });

    // First innings batters/bowlers (for completed innings display)
    const firstInnBatters = batters.filter((b: any) => b.inning_number === 1);
    const firstInnBowlers = allBowlers.filter((b: any) => b.inning_number === 1);

    const calcSR = (runs: number, balls: number) => balls > 0 ? ((runs / balls) * 100).toFixed(1) : '—';
    const calcER = (runs: number, overs: string) => {
        const o = parseFloat(overs);
        return o > 0 ? (runs / o).toFixed(1) : '—';
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', fontFamily: "'Inter', system-ui, sans-serif" }}>
            {/* Header Card */}
            <div className="card" style={{
                textAlign: 'center', marginBottom: '16px', padding: '24px',
                background: 'linear-gradient(135deg, #1a1a1a 0%, #000 100%)',
                border: '1px solid #333', borderRadius: '12px'
            }}>
                {/* Status Badge */}
                {isLive && (
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        background: 'rgba(255,0,0,0.15)', color: '#ff4444',
                        padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 800,
                        border: '1px solid rgba(255,0,0,0.3)', marginBottom: '12px',
                        animation: 'pulse 2s infinite', letterSpacing: '1px'
                    }}>
                        <div style={{ width: '6px', height: '6px', background: '#ff4444', borderRadius: '50%' }} />
                        LIVE
                    </div>
                )}
                {isCompleted && (
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        background: 'rgba(0,255,0,0.1)', color: '#3fb950',
                        padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 800,
                        border: '1px solid rgba(0,255,0,0.2)', marginBottom: '12px', letterSpacing: '1px'
                    }}>
                        <Trophy size={12} /> COMPLETED
                    </div>
                )}

                <h4 style={{ color: '#888', marginBottom: '10px', fontSize: '0.85rem' }}>{match.venue} • {match.date}</h4>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0' }}>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                        <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>{match.home_team}</h2>
                        {firstInning && firstInning.batting_team === match.home_team && (
                            <div style={{ fontSize: '1.1rem', color: '#aaa', marginTop: '4px' }}>
                                {firstInning.total_runs}/{firstInning.wickets}
                                <span style={{ fontSize: '0.8rem' }}> ({Number(firstInning.overs).toFixed(1)})</span>
                            </div>
                        )}
                        {secondInning && secondInning.batting_team === match.home_team && (
                            <div style={{ fontSize: '1.1rem', color: '#aaa', marginTop: '4px' }}>
                                {secondInning.total_runs}/{secondInning.wickets}
                                <span style={{ fontSize: '0.8rem' }}> ({Number(secondInning.overs).toFixed(1)})</span>
                            </div>
                        )}
                    </div>

                    <div style={{ padding: '0 16px' }}>
                        <span style={{ background: '#333', padding: '5px 10px', borderRadius: '4px', fontSize: '0.8rem', color: '#aaa' }}>VS</span>
                    </div>

                    <div style={{ textAlign: 'center', flex: 1 }}>
                        <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>{match.away_team}</h2>
                        {firstInning && firstInning.batting_team === match.away_team && (
                            <div style={{ fontSize: '1.1rem', color: '#aaa', marginTop: '4px' }}>
                                {firstInning.total_runs}/{firstInning.wickets}
                                <span style={{ fontSize: '0.8rem' }}> ({Number(firstInning.overs).toFixed(1)})</span>
                            </div>
                        )}
                        {secondInning && secondInning.batting_team === match.away_team && (
                            <div style={{ fontSize: '1.1rem', color: '#aaa', marginTop: '4px' }}>
                                {secondInning.total_runs}/{secondInning.wickets}
                                <span style={{ fontSize: '0.8rem' }}> ({Number(secondInning.overs).toFixed(1)})</span>
                            </div>
                        )}
                    </div>
                </div>

                {currentInning && isLive ? (
                    <div style={{ marginTop: '12px' }}>
                        <div style={{ fontSize: '2.5rem', fontWeight: '900', color: 'var(--primary-color)', lineHeight: 1 }}>
                            {currentInning.total_runs}/{currentInning.wickets}
                        </div>
                        <div style={{ fontSize: '1rem', color: '#aaa', marginTop: '5px' }}>
                            ({Number(currentInning.overs).toFixed(1)} Overs)
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px', fontSize: '0.85rem', color: '#888' }}>
                            <span>CRR: {Number(currentInning.overs) > 0 ? (currentInning.total_runs / Number(currentInning.overs)).toFixed(2) : '0.00'}</span>
                            {match.current_inning === 2 && firstInning && (
                                <span style={{ color: '#ffeb3b', fontWeight: 700 }}>
                                    Need {Math.max(0, Number(firstInning.total_runs) + 1 - currentInning.total_runs)} runs
                                </span>
                            )}
                        </div>
                        <div style={{ marginTop: '8px', color: '#fff', fontWeight: 'bold', fontSize: '0.9rem' }}>
                            {currentInning.batting_team} batting • {currentInning.inning_number === 1 ? '1st' : '2nd'} Innings
                        </div>
                    </div>
                ) : isCompleted ? (
                    <div style={{ marginTop: '16px' }}>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: '#3fb950', padding: '8px', background: 'rgba(0,255,0,0.05)', borderRadius: '8px' }}>
                            {match.result}
                        </div>
                    </div>
                ) : (
                    <div style={{ marginTop: '20px', color: '#aaa' }}>Match not started yet</div>
                )}
            </div>

            {/* Current Batsmen On Crease */}
            {currentBatters.filter((b: any) => !b.is_out).length > 0 && isLive && (
                <div className="card" style={{ marginBottom: '16px', background: '#1a1a1a', borderRadius: '12px', border: '1px solid #333' }}>
                    <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                        <User size={16} color="var(--primary-color)" /> On Crease
                    </h3>
                    <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                        {currentBatters.filter((b: any) => !b.is_out).slice(0, 2).map((b: any) => {
                            const isStriker = currentInning && b.player_id === currentInning.current_striker_id;
                            return (
                                <div key={b.player_id} style={{ textAlign: 'center', flex: 1 }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                        {b.full_name}
                                        {isStriker && <span style={{ fontSize: '0.8rem', color: '#3fb950' }}>*</span>}
                                    </div>
                                    <div style={{ color: 'var(--primary-color)', fontSize: '1.3rem', fontWeight: '900' }}>
                                        {b.runs_scored}<span style={{ fontSize: '0.8rem', color: '#888' }}>({b.balls_faced})</span>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#666' }}>
                                        4s: {b.fours} • 6s: {b.sixes} • SR: {calcSR(b.runs_scored, b.balls_faced)}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Current Bowler */}
            {bowler && isLive && (
                <div className="card" style={{ marginBottom: '16px', background: '#1a1a1a', borderRadius: '12px', border: '1px solid #333' }}>
                    <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                        <Activity size={16} color="#f85149" /> Bowling
                    </h3>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{bowler.full_name}</div>
                        <div style={{ fontSize: '0.9rem', color: '#aaa', marginTop: '4px' }}>
                            {bowler.calculated_overs || '0'}-{bowler.maidens || 0}-{bowler.runs_conceded || 0}-{bowler.wickets_taken || 0}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '2px' }}>
                            ER: {calcER(bowler.runs_conceded || 0, bowler.calculated_overs || '0')}
                        </div>
                    </div>
                </div>
            )}

            {/* Batting Scorecard */}
            {currentBatters.length > 0 && (
                <div className="card" style={{ marginBottom: '16px', borderRadius: '12px', border: '1px solid #333' }}>
                    <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Trophy size={18} color="var(--primary-color)" /> Batting {currentInning ? `(${currentInning.batting_team})` : ''}
                    </h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', color: '#888', fontSize: '0.8rem' }}>
                                <th style={{ padding: '6px 8px' }}>Batter</th>
                                <th style={{ padding: '6px 4px', textAlign: 'center' }}>R</th>
                                <th style={{ padding: '6px 4px', textAlign: 'center' }}>B</th>
                                <th style={{ padding: '6px 4px', textAlign: 'center' }}>4s</th>
                                <th style={{ padding: '6px 4px', textAlign: 'center' }}>6s</th>
                                <th style={{ padding: '6px 4px', textAlign: 'right' }}>SR</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentBatters.map((b: any) => (
                                <tr key={b.player_id} style={{ borderTop: '1px solid #222' }}>
                                    <td style={{ padding: '8px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                        {b.full_name} {!b.is_out ? '*' : ''}
                                        {b.is_out && b.dismissal_text && <span style={{ fontSize: '0.75rem', color: '#f85149', display: 'block' }}>{b.dismissal_text}</span>}
                                    </td>
                                    <td style={{ padding: '8px', fontWeight: 'bold', color: 'white', textAlign: 'center' }}>{b.runs_scored}</td>
                                    <td style={{ padding: '8px', textAlign: 'center' }}>{b.balls_faced}</td>
                                    <td style={{ padding: '8px', textAlign: 'center' }}>{b.fours}</td>
                                    <td style={{ padding: '8px', textAlign: 'center' }}>{b.sixes}</td>
                                    <td style={{ padding: '8px', textAlign: 'right' }}>{calcSR(b.runs_scored, b.balls_faced)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Bowling Scorecard */}
            {currentBowlers.length > 0 && (
                <div className="card" style={{ marginBottom: '16px', borderRadius: '12px', border: '1px solid #333' }}>
                    <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Activity size={18} color="#f85149" /> Bowling {currentInning ? `(${currentInning.bowling_team})` : ''}
                    </h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', color: '#888', fontSize: '0.8rem' }}>
                                <th style={{ padding: '6px 8px' }}>Bowler</th>
                                <th style={{ padding: '6px 4px', textAlign: 'center' }}>O</th>
                                <th style={{ padding: '6px 4px', textAlign: 'center' }}>M</th>
                                <th style={{ padding: '6px 4px', textAlign: 'center' }}>R</th>
                                <th style={{ padding: '6px 4px', textAlign: 'center' }}>W</th>
                                <th style={{ padding: '6px 4px', textAlign: 'right' }}>ER</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentBowlers.map((b: any) => (
                                <tr key={b.player_id} style={{ borderTop: '1px solid #222' }}>
                                    <td style={{ padding: '8px', fontWeight: 'bold', fontSize: '0.9rem' }}>{b.full_name}</td>
                                    <td style={{ padding: '8px', textAlign: 'center' }}>{b.calculated_overs || '0'}</td>
                                    <td style={{ padding: '8px', textAlign: 'center' }}>{b.maidens}</td>
                                    <td style={{ padding: '8px', textAlign: 'center' }}>{b.runs_conceded}</td>
                                    <td style={{ padding: '8px', fontWeight: 'bold', color: '#3fb950', textAlign: 'center' }}>{b.wickets_taken}</td>
                                    <td style={{ padding: '8px', textAlign: 'right' }}>{calcER(b.runs_conceded, b.calculated_overs || '0')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* 1st Innings Scorecard (when showing 2nd innings) */}
            {match.current_inning === 2 && firstInnBatters.length > 0 && (
                <div className="card" style={{ marginBottom: '16px', borderRadius: '12px', border: '1px solid #333', opacity: 0.8 }}>
                    <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '10px', marginBottom: '10px', fontSize: '0.95rem', color: '#888' }}>
                        1st Innings — {firstInning?.batting_team} ({firstInning?.total_runs}/{firstInning?.wickets})
                    </h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                            <tr style={{ textAlign: 'left', color: '#666', fontSize: '0.75rem' }}>
                                <th style={{ padding: '4px 8px' }}>Batter</th>
                                <th style={{ padding: '4px', textAlign: 'center' }}>R</th>
                                <th style={{ padding: '4px', textAlign: 'center' }}>B</th>
                                <th style={{ padding: '4px', textAlign: 'right' }}>SR</th>
                            </tr>
                        </thead>
                        <tbody>
                            {firstInnBatters.map((b: any) => (
                                <tr key={b.player_id} style={{ borderTop: '1px solid #1a1a1a' }}>
                                    <td style={{ padding: '6px 8px' }}>{b.full_name} {b.is_out ? '' : '*'}</td>
                                    <td style={{ padding: '6px 4px', fontWeight: 'bold', textAlign: 'center' }}>{b.runs_scored}</td>
                                    <td style={{ padding: '6px 4px', textAlign: 'center' }}>{b.balls_faced}</td>
                                    <td style={{ padding: '6px 4px', textAlign: 'right' }}>{calcSR(b.runs_scored, b.balls_faced)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Recent Balls */}
            <div className="card" style={{ borderRadius: '12px', border: '1px solid #333' }}>
                <h3 style={{ marginBottom: '15px', fontSize: '1rem' }}>Recent Balls</h3>
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px' }}>
                    {recentBalls.length === 0 && <span style={{ color: '#666', fontSize: '0.9rem' }}>No balls bowled yet</span>}
                    {[...recentBalls].reverse().map((ball: any) => {
                        let content: string | number = String(ball.runs_off_bat);
                        let bgColor = '#333';

                        // Calculate label
                        if (ball.wicket_type && ball.wicket_type !== 'none') {
                            const totalRuns = Number(ball.runs_off_bat) + Number(ball.extras);
                            content = totalRuns > 0 ? `W+${totalRuns}` : 'W';
                            bgColor = '#da3633';
                        } else if (ball.extra_type === 'wide') {
                            const extraRuns = Number(ball.extras) - 1;
                            content = extraRuns > 0 ? `Wd+${extraRuns}` : 'Wd';
                            bgColor = '#9e6a03';
                        } else if (ball.extra_type === 'no_ball') {
                            const batRuns = Number(ball.runs_off_bat);
                            content = batRuns > 0 ? `Nb+${batRuns}` : 'Nb';
                            bgColor = '#9e6a03';
                        } else if (ball.extra_type === 'bye') {
                            content = `B${ball.extras}`;
                            bgColor = '#1f6feb';
                        } else if (ball.extra_type === 'leg_bye') {
                            content = `Lb${ball.extras}`;
                            bgColor = '#1f6feb';
                        }

                        // Special coloring for boundaries
                        if (content === '4' || content === '6') {
                            bgColor = content === '4' ? '#d29922' : '#8957e5';
                        }

                        return (
                            <div key={ball.id} style={{
                                minWidth: '36px', height: '36px',
                                background: bgColor,
                                borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 'bold', color: 'white', fontSize: '0.75rem',
                                border: '1px solid rgba(255,255,255,0.1)', flexShrink: 0
                            }}>
                                {content}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '20px', color: '#666', fontSize: '0.8rem', paddingBottom: '20px' }}>
                <RefreshCw size={12} style={{ display: 'inline', marginRight: '5px' }} />
                Auto-refreshing every 10 seconds
            </div>
        </div>
    );
}
