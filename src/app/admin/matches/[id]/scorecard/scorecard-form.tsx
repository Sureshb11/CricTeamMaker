'use client';

import { useState, useTransition, useEffect } from 'react';
import {
    submitBall, initializeInning, undoLastBall,
    changeBowler, selectNewBatsman, endInnings, endMatch,
    BallEvent
} from '../../live/actions';

interface Props {
    match: any;
    innings: any[];
    players: any[];
    homePlayers: any[];
    awayPlayers: any[];
    homeRegTeam: string;
    awayRegTeam: string;
    batterStats: any[];
    bowlerStats: any[];
    currentOverBalls: string[];
    firstInning: any;
}

type Step = 'toss' | 'batsmen' | 'bowler' | 'scoring';

export default function ScorecardForm({
    match, innings, players, homePlayers, awayPlayers, homeRegTeam, awayRegTeam,
    batterStats, bowlerStats, currentOverBalls, firstInning
}: Props) {
    const [isPending, startTransition] = useTransition();
    const currentInning = innings.find((i: any) => i.inning_number === match.current_inning) || null;

    const [step, setStep] = useState<Step>(currentInning ? 'scoring' : 'toss');
    const [tossWinner, setTossWinner] = useState(match.toss_winner || '');
    const [tossChoice, setTossChoice] = useState<'bat' | 'bowl'>(match.toss_decision || 'bat');
    const [strikerId, setStrikerId] = useState<number>(currentInning?.current_striker_id || 0);
    const [nonStrikerId, setNonStrikerId] = useState<number>(currentInning?.current_non_striker_id || 0);
    const [bowlerId, setBowlerId] = useState<number>(currentInning?.current_bowler_id || 0);
    const [wb, setWb] = useState(false);
    const [nb, setNb] = useState(false);
    const [bye, setBye] = useState(false);
    const [lb, setLb] = useState(false);
    const [isWicket, setIsWicket] = useState(false);
    const [wicketType, setWicketType] = useState<BallEvent['wicketType']>('none');
    const [playerOutId, setPlayerOutId] = useState(0);
    const [matchOvers, setMatchOvers] = useState(20); // Default to 20 overs
    const [thisOver, setThisOver] = useState<string[]>(currentOverBalls || []);
    const [showMore, setShowMore] = useState(false);
    const [showNewBowler, setShowNewBowler] = useState(false);
    const [showNewBatsman, setShowNewBatsman] = useState(false);
    const [showEndInnings, setShowEndInnings] = useState(false);

    const homeTeam = match.home_team;
    const awayTeam = match.away_team;
    const battingTeam = currentInning?.batting_team ||
        (tossWinner === homeTeam
            ? (tossChoice === 'bat' ? homeTeam : awayTeam)
            : (tossChoice === 'bat' ? awayTeam : homeTeam));
    const bowlingTeam = currentInning?.bowling_team ||
        (battingTeam === homeTeam ? awayTeam : homeTeam);

    // Filter players by team using pre-grouped arrays from server
    const battingPlayers = battingTeam === homeTeam ? homePlayers : awayPlayers;
    const bowlingPlayers = bowlingTeam === homeTeam ? homePlayers : awayPlayers;
    // Fallback to all players if team filtering returns nothing
    const batOptions = battingPlayers.length > 0 ? battingPlayers : players;
    const bowlOptions = bowlingPlayers.length > 0 ? bowlingPlayers : players;

    // Find current batter/bowler stats
    const strikerStats = batterStats.find((b: any) => b.player_id === strikerId);
    const nonStrikerStats = batterStats.find((b: any) => b.player_id === nonStrikerId);
    const currentBowlerStats = bowlerStats.find((b: any) => b.player_id === bowlerId);

    // Helper: get player name
    const getPlayerName = (id: number) => {
        const p = players.find((p: any) => p.id === id);
        return p ? p.full_name : '—';
    };

    // 2nd innings target info
    const isSecondInnings = currentInning?.inning_number === 2;
    const target = isSecondInnings && firstInning ? Number(firstInning.total_runs) + 1 : null;
    const runsNeeded = target ? target - Number(currentInning?.total_runs || 0) : null;

    // ── HANDLERS ──

    const handleTossSubmit = () => {
        if (!tossWinner) return alert('Please select who won the toss');
        setStep('batsmen');
    };
    const handleBatsmenSubmit = () => {
        if (!strikerId || !nonStrikerId) return alert('Select both batsmen');
        if (strikerId === nonStrikerId) return alert('Must be different players');
        setStep('bowler');
    };
    const handleBowlerSubmit = () => {
        if (!bowlerId) return alert('Select a bowler');
        const bt = tossWinner === homeTeam
            ? (tossChoice === 'bat' ? homeTeam : awayTeam)
            : (tossChoice === 'bat' ? awayTeam : homeTeam);
        const bwt = bt === homeTeam ? awayTeam : homeTeam;

        startTransition(async () => {
            await initializeInning(
                match.id, 1, bt, bwt,
                strikerId, nonStrikerId, bowlerId,
                tossWinner, tossChoice,
                matchOvers
            );
            window.location.reload();
        });
    };

    // Start 2nd innings
    const handleStart2ndInnings = (bt: string, bwt: string) => {
        if (!strikerId || !nonStrikerId) return alert('Select both batsmen');
        if (strikerId === nonStrikerId) return alert('Must be different players');
        if (!bowlerId) return alert('Select a bowler');

        startTransition(async () => {
            await initializeInning(
                match.id, 2, bt, bwt,
                strikerId, nonStrikerId, bowlerId
            );
            window.location.reload();
        });
    };

    const handleUndo = () => {
        if (!confirm('Undo last ball?')) return;
        startTransition(async () => {
            const r = await undoLastBall(Number(match.id), Number(currentInning.id));
            if (r.success) {
                setThisOver(prev => prev.slice(0, -1));
                if (r.strikerId) setStrikerId(r.strikerId);
                if (r.nonStrikerId) setNonStrikerId(r.nonStrikerId);
            } else alert('Error: ' + r.error);
        });
    };

    const handleSwap = () => {
        const t = strikerId; setStrikerId(nonStrikerId); setNonStrikerId(t);
    };

    const handleRunClick = (runs: number) => {
        if (!strikerId || !bowlerId) return alert('Select Striker and Bowler');

        // Calculate extras correctly per cricket rules
        const extraType: BallEvent['extraType'] = wb ? 'wide' : nb ? 'no_ball' : bye ? 'bye' : lb ? 'leg_bye' : 'none';
        let extras = 0;
        let runsOffBat = runs;

        if (wb) {
            // Wide: 1 penalty + all additional runs are extras, 0 runs off bat
            extras = 1 + runs;
            runsOffBat = 0;
        } else if (nb) {
            // No Ball: 1 penalty extra + batter can score runs off bat
            extras = 1;
            runsOffBat = runs; // Batter's runs count normally
        } else if (bye) {
            // Bye: runs are extras, 0 off bat. Legal ball.
            extras = runs;
            runsOffBat = 0;
        } else if (lb) {
            // Leg Bye: runs are extras, 0 off bat. Legal ball.
            extras = runs;
            runsOffBat = 0;
        }

        // Player out — for run outs, user can select who is out
        const outPlayer = isWicket ? (playerOutId || strikerId) : undefined;

        const event: BallEvent = {
            matchId: match.id, inningId: currentInning?.id || 0,
            over: 0, ball: 0,
            strikerId, nonStrikerId, bowlerId, runsOffBat, extras, extraType,
            wicketType: isWicket ? wicketType : 'none',
            playerOutId: outPlayer,
        };

        // Build descriptive label for "this over" display
        let label = String(runs);
        if (wb) label = runs > 0 ? `Wd+${runs}` : 'Wd';
        else if (nb) label = runs > 0 ? `Nb+${runs}` : 'Nb';
        else if (bye) label = runs > 0 ? `B${runs}` : '0';
        else if (lb) label = runs > 0 ? `Lb${runs}` : '0';
        if (isWicket) label = runs > 0 ? `W+${runs}` : 'W';

        startTransition(async () => {
            const r = await submitBall(event);
            if (r.success) {
                setThisOver(prev => [...prev, label]);
                setWb(false); setNb(false); setBye(false); setLb(false);
                setIsWicket(false); setWicketType('none'); setPlayerOutId(0);

                if (r.newStrikerId) setStrikerId(r.newStrikerId);
                if (r.newNonStrikerId) setNonStrikerId(r.newNonStrikerId);

                if (r.overComplete) {
                    setThisOver([]);
                    setShowNewBowler(true);
                }

                if (isWicket && wicketType !== 'retired') {
                    setShowNewBatsman(true);
                }
            } else alert('Error: ' + r.error);
        });
    };

    // Active extras description
    const activeExtra = wb ? 'WIDE' : nb ? 'NO BALL' : bye ? 'BYE' : lb ? 'LEG BYE' : '';
    const hasExtra = wb || nb || bye || lb;

    const handleChangeBowler = (newBowlerId: number) => {
        if (!newBowlerId) return;
        startTransition(async () => {
            await changeBowler(match.id, currentInning.id, newBowlerId);
            setBowlerId(newBowlerId);
            setShowNewBowler(false);
        });
    };

    const handleNewBatsman = (newBatsmanId: number) => {
        if (!newBatsmanId) return;
        startTransition(async () => {
            await selectNewBatsman(match.id, currentInning.id, newBatsmanId, true);
            setStrikerId(newBatsmanId);
            setShowNewBatsman(false);
        });
    };

    const handleEndInnings = () => {
        if (!confirm('End this innings?')) return;
        startTransition(async () => {
            const r = await endInnings(match.id, currentInning.id);
            if (r.success) {
                if (r.nextInningNumber && r.nextInningNumber <= 2) {
                    // Reload to show 2nd innings setup
                    window.location.reload();
                } else {
                    // Both innings done, end match
                    await endMatch(match.id);
                    window.location.reload();
                }
            }
        });
    };

    const handleEndMatch = () => {
        if (!confirm('End the match?')) return;
        startTransition(async () => {
            await endMatch(match.id);
            window.location.reload();
        });
    };

    // ── STYLES ──
    const fullScreen: React.CSSProperties = {
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#0d1117',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        display: 'flex', flexDirection: 'column',
        overflow: 'auto', WebkitOverflowScrolling: 'touch',
        color: '#e6edf3'
    };
    const headerBar: React.CSSProperties = {
        background: 'linear-gradient(135deg, #1b5e20, #2e7d32)',
        color: 'white', padding: '12px 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0
    };
    const darkCard: React.CSSProperties = {
        background: '#161b22', borderRadius: '10px',
        border: '1px solid #30363d', flexShrink: 0, overflow: 'hidden'
    };
    const greenBtn = (disabled?: boolean): React.CSSProperties => ({
        width: '100%', padding: '16px', borderRadius: '10px', border: 'none',
        background: disabled ? '#30363d' : 'linear-gradient(135deg, #238636, #2ea043)',
        color: disabled ? '#484f58' : 'white', fontSize: '16px', fontWeight: 800,
        cursor: disabled ? 'default' : 'pointer', letterSpacing: '0.5px'
    });

    // ── Modal overlay style ──
    const modalOverlay: React.CSSProperties = {
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 10000,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    };
    const modalCard: React.CSSProperties = {
        ...darkCard, padding: '24px', width: '100%', maxWidth: '380px', zIndex: 10001
    };

    // ─── 2nd INNINGS SETUP ─────
    // If match is in inning 2 but no 2nd inning record, show setup
    if (match.current_inning === 2 && !currentInning) {
        const firstInn = innings.find((i: any) => i.inning_number === 1);
        const bt2 = firstInn ? String(firstInn.bowling_team) : awayTeam;
        const bwt2 = firstInn ? String(firstInn.batting_team) : homeTeam;
        const targetRuns = firstInn ? Number(firstInn.total_runs) + 1 : 0;

        // Determine which player list to use for batting/bowling in 2nd innings
        const inn2BatPlayers = bt2 === homeTeam ? homePlayers : awayPlayers;
        const inn2BowlPlayers = bwt2 === homeTeam ? homePlayers : awayPlayers;
        // Fallback to all if empty
        const inn2BatOptions = inn2BatPlayers.length > 0 ? inn2BatPlayers : players;
        const inn2BowlOptions = inn2BowlPlayers.length > 0 ? inn2BowlPlayers : players;

        return (
            <div style={fullScreen}>
                <div style={headerBar}>
                    <span style={{ fontSize: '16px', fontWeight: 800 }}>🏏 2nd Innings Setup</span>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ ...darkCard, padding: '28px 24px', width: '100%', maxWidth: '400px' }}>
                        <div style={{
                            background: '#0d2818', borderRadius: '8px', padding: '12px',
                            fontSize: '16px', color: '#3fb950', fontWeight: 800,
                            textAlign: 'center', marginBottom: '20px', border: '1px solid #238636'
                        }}>
                            🎯 Target: {targetRuns} runs<br />
                            <span style={{ fontSize: '13px', fontWeight: 600, opacity: 0.8 }}>
                                {bt2} batting
                            </span>
                        </div>
                        {[
                            { label: 'Striker', val: strikerId, fn: setStrikerId },
                            { label: 'Non-Striker', val: nonStrikerId, fn: setNonStrikerId }
                        ].map(s => (
                            <div key={s.label} style={{ marginBottom: '14px' }}>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#8b949e', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>{s.label}</label>
                                <select value={s.val} onChange={e => s.fn(Number(e.target.value))} style={{
                                    width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #30363d',
                                    fontSize: '15px', background: '#21262d', fontWeight: 600, color: '#e6edf3', outline: 'none'
                                }}>
                                    <option value={0}>Select {s.label}</option>
                                    {inn2BatOptions.map((p: any) =>
                                        <option key={p.id} value={p.id}>{p.full_name}</option>
                                    )}
                                </select>
                            </div>
                        ))}
                        <div style={{ marginBottom: '18px' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#8b949e', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Bowler</label>
                            <select value={bowlerId} onChange={e => setBowlerId(Number(e.target.value))} style={{
                                width: '100%', padding: '12px', borderRadius: '10px', border: '2px solid #30363d',
                                fontSize: '15px', background: '#21262d', fontWeight: 600, color: '#e6edf3', outline: 'none'
                            }}>
                                <option value={0}>Select Bowler</option>
                                {inn2BowlOptions.map((p: any) =>
                                    <option key={p.id} value={p.id}>{p.full_name}</option>
                                )}
                            </select>
                        </div>
                        <button onClick={() => handleStart2ndInnings(bt2, bwt2)} disabled={isPending}
                            style={greenBtn(!strikerId || !nonStrikerId || !bowlerId)}>
                            {isPending ? 'Starting...' : '🏏 Start 2nd Innings'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ─── MATCH COMPLETED ─────
    if (match.status === 'completed') {
        return (
            <div style={fullScreen}>
                <div style={{ ...headerBar, background: 'linear-gradient(135deg, #1b5e20, #2e7d32)' }}>
                    <span style={{ fontSize: '16px', fontWeight: 800 }}>🏆 Match Completed</span>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ ...darkCard, padding: '32px 24px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏆</div>
                        <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '12px', color: '#3fb950' }}>
                            {match.result}
                        </h2>
                        <p style={{ fontSize: '16px', color: '#8b949e', marginBottom: '20px' }}>
                            {match.score}
                        </p>
                        <button onClick={() => window.location.href = '/admin/matches'}
                            style={greenBtn()}>← Back to Matches</button>
                    </div>
                </div>
            </div>
        );
    }

    // ─── STEP 1: TOSS ────────────────
    if (step === 'toss') {
        return (
            <div style={fullScreen}>
                <div style={headerBar}>
                    <span style={{ fontSize: '16px', fontWeight: 800 }}>🏏 {homeTeam} vs {awayTeam}</span>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ ...darkCard, padding: '28px 24px', width: '100%', maxWidth: '400px' }}>
                        <h2 style={{ fontSize: '22px', fontWeight: 900, marginBottom: '24px', textAlign: 'center', color: '#58a6ff' }}>
                            🪙 Toss
                        </h2>
                        <p style={{ fontSize: '11px', fontWeight: 800, color: '#8b949e', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Who won?</p>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '22px' }}>
                            {[homeTeam, awayTeam].map(t => (
                                <button key={t} onClick={() => setTossWinner(t)} style={{
                                    flex: 1, padding: '16px', borderRadius: '10px', fontSize: '14px', fontWeight: 800,
                                    border: tossWinner === t ? '2px solid #238636' : '2px solid #30363d',
                                    background: tossWinner === t ? '#238636' : '#21262d',
                                    color: tossWinner === t ? 'white' : '#8b949e', cursor: 'pointer'
                                }}>{t}</button>
                            ))}
                        </div>
                        <p style={{ fontSize: '11px', fontWeight: 800, color: '#8b949e', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Chose to</p>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '22px' }}>
                            {(['bat', 'bowl'] as const).map(c => (
                                <button key={c} onClick={() => setTossChoice(c)} style={{
                                    flex: 1, padding: '16px', borderRadius: '10px', fontSize: '15px', fontWeight: 800,
                                    border: tossChoice === c ? '2px solid #238636' : '2px solid #30363d',
                                    background: tossChoice === c ? '#238636' : '#21262d',
                                    color: tossChoice === c ? 'white' : '#8b949e', cursor: 'pointer'
                                }}>{c === 'bat' ? '🏏 Bat' : '⚾ Bowl'}</button>
                            ))}
                        </div>
                        {tossWinner && (
                            <div style={{
                                background: '#0d2818', borderRadius: '8px', padding: '12px',
                                fontSize: '14px', color: '#3fb950', fontWeight: 700,
                                textAlign: 'center', marginBottom: '20px', border: '1px solid #238636'
                            }}>
                                {tossWinner} won · <strong>{battingTeam}</strong> bats first
                            </div>
                        )}
                        <div style={{ marginBottom: '20px' }}>
                            <p style={{ fontSize: '11px', fontWeight: 800, color: '#8b949e', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Total Overs</p>
                            <input
                                type="number"
                                value={matchOvers}
                                onChange={(e) => setMatchOvers(Number(e.target.value))}
                                style={{
                                    width: '100%', padding: '16px', borderRadius: '10px',
                                    fontSize: '16px', fontWeight: 800, background: '#21262d',
                                    border: '2px solid #30363d', color: 'white', outline: 'none'
                                }}
                            />
                        </div>
                        <button onClick={handleTossSubmit} style={greenBtn(!tossWinner || matchOvers <= 0)}>Next →</button>
                    </div>
                </div>
            </div>
        );
    }

    // ─── STEP 2: BATSMEN ─────────────
    if (step === 'batsmen') {
        return (
            <div style={fullScreen}>
                <div style={headerBar}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button onClick={() => setStep('toss')} style={{ background: 'none', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer', padding: 0 }}>←</button>
                        <span style={{ fontSize: '16px', fontWeight: 800 }}>Opening Batsmen</span>
                    </div>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ ...darkCard, padding: '28px 24px', width: '100%', maxWidth: '400px' }}>
                        <div style={{
                            background: '#0d2818', borderRadius: '8px', padding: '10px',
                            fontSize: '14px', color: '#3fb950', fontWeight: 700,
                            textAlign: 'center', marginBottom: '22px', border: '1px solid #238636'
                        }}>{battingTeam} batting first</div>
                        {[{ label: 'Striker', val: strikerId, fn: setStrikerId }, { label: 'Non-Striker', val: nonStrikerId, fn: setNonStrikerId }].map(s => (
                            <div key={s.label} style={{ marginBottom: '18px' }}>
                                <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#8b949e', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>{s.label}</label>
                                <select value={s.val} onChange={e => s.fn(Number(e.target.value))} style={{
                                    width: '100%', padding: '14px', borderRadius: '10px', border: '2px solid #30363d',
                                    fontSize: '15px', background: '#21262d', fontWeight: 600, color: '#e6edf3', outline: 'none'
                                }}>
                                    <option value={0}>Select {s.label}</option>
                                    {batOptions.map((p: any) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                                </select>
                            </div>
                        ))}
                        <button onClick={handleBatsmenSubmit} style={greenBtn(!strikerId || !nonStrikerId)}>Next →</button>
                    </div>
                </div>
            </div>
        );
    }

    // ─── STEP 3: BOWLER ──────────────
    if (step === 'bowler') {
        return (
            <div style={fullScreen}>
                <div style={headerBar}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button onClick={() => setStep('batsmen')} style={{ background: 'none', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer', padding: 0 }}>←</button>
                        <span style={{ fontSize: '16px', fontWeight: 800 }}>Opening Bowler</span>
                    </div>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ ...darkCard, padding: '28px 24px', width: '100%', maxWidth: '400px' }}>
                        <div style={{
                            background: '#0d2818', borderRadius: '8px', padding: '10px',
                            fontSize: '14px', color: '#3fb950', fontWeight: 700,
                            textAlign: 'center', marginBottom: '22px', border: '1px solid #238636'
                        }}>{bowlingTeam} bowling</div>
                        <div style={{ marginBottom: '18px' }}>
                            <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#8b949e', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Bowler</label>
                            <select value={bowlerId} onChange={e => setBowlerId(Number(e.target.value))} style={{
                                width: '100%', padding: '14px', borderRadius: '10px', border: '2px solid #30363d',
                                fontSize: '15px', background: '#21262d', fontWeight: 600, color: '#e6edf3', outline: 'none'
                            }}>
                                <option value={0}>Select Bowler</option>
                                {bowlOptions.map((p: any) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                            </select>
                        </div>
                        <button onClick={handleBowlerSubmit} disabled={!bowlerId || isPending} style={greenBtn(!bowlerId)}>
                            {isPending ? 'Starting...' : '🏏 Start Match'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ─── STEP 4: FULL SCORING ──
    const overs = Number(currentInning.overs).toFixed(1);
    const crr = Number(currentInning.overs) > 0
        ? (Number(currentInning.total_runs) / Number(currentInning.overs)).toFixed(2) : '0.00';

    const gridRow: React.CSSProperties = {
        display: 'grid',
        gridTemplateColumns: '1fr 30px 30px 26px 26px 36px',
        padding: '4px 10px', alignItems: 'center'
    };
    const hdrRow: React.CSSProperties = { ...gridRow, padding: '3px 10px', background: '#0d1117' };
    const hdrCell: React.CSSProperties = { fontSize: '12px', color: '#8b949e', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.5px' };
    const valCell: React.CSSProperties = { textAlign: 'center' as const, fontSize: '16px', color: '#484f58', fontWeight: 700 };
    const valBold: React.CSSProperties = { ...valCell, color: '#e6edf3', fontWeight: 800 };

    // Format strike rate
    const calcSR = (runs: number, balls: number) => balls > 0 ? ((runs / balls) * 100).toFixed(1) : '—';
    const calcER = (runs: number, oversStr: string) => {
        const o = parseFloat(oversStr);
        return o > 0 ? (runs / o).toFixed(1) : '—';
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999,
            background: '#0d1117',
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden', color: '#e6edf3'
        }}>

            {/* ── Header + Score ── */}
            <div style={{
                background: 'linear-gradient(135deg, #1b5e20, #2e7d32, #388e3c)',
                color: 'white', padding: '8px 12px',
                flexShrink: 0
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span onClick={() => window.location.href = '/admin/matches'} style={{ fontSize: '18px', opacity: 0.8, cursor: 'pointer' }}>←</span>
                        <span style={{ fontSize: '15px', fontWeight: 700, opacity: 0.9 }}>
                            {currentInning.batting_team} v/s {currentInning.bowling_team}
                        </span>
                    </div>
                    <span style={{
                        background: 'rgba(255,255,255,0.25)', fontSize: '11px', fontWeight: 900,
                        padding: '3px 10px', borderRadius: '20px', letterSpacing: '0.8px', textTransform: 'uppercase'
                    }}>
                        {currentInning.inning_number === 1 ? '1st Inn' : '2nd Inn'}
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                        <span style={{ fontSize: '40px', fontWeight: 800, letterSpacing: '-1px', lineHeight: 1 }}>
                            {currentInning.total_runs}
                        </span>
                        <span style={{ fontSize: '22px', fontWeight: 300, opacity: 0.5 }}>-</span>
                        <span style={{ fontSize: '40px', fontWeight: 800, letterSpacing: '-1px', lineHeight: 1 }}>
                            {currentInning.wickets}
                        </span>
                        <span style={{ fontSize: '16px', fontWeight: 600, opacity: 0.7, marginLeft: '4px' }}>
                            ({overs}{Number(match.overs) > 0 ? ` / ${match.overs}` : ''})
                        </span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, opacity: 0.7, letterSpacing: '1px' }}>CRR </span>
                        <span style={{ fontSize: '26px', fontWeight: 800, color: '#a5d6a7' }}>{crr}</span>
                    </div>
                </div>
                {/* Target info for 2nd innings */}
                {isSecondInnings && target && (
                    <div style={{
                        fontSize: '13px', fontWeight: 700, color: '#ffeb3b',
                        marginTop: '2px', textAlign: 'center'
                    }}>
                        🎯 Need {runsNeeded! > 0 ? runsNeeded : 0} runs
                        {Number(match.overs) > 0 ? '' : ' to win'}
                    </div>
                )}
            </div>

            {/* ── Batsman + Bowler with LIVE STATS ── */}
            <div style={{ ...darkCard, margin: '3px 8px 0' }}>
                <div style={hdrRow}>
                    <span style={hdrCell}>Batsman</span>
                    <span style={{ ...hdrCell, textAlign: 'center' }}>R</span>
                    <span style={{ ...hdrCell, textAlign: 'center' }}>B</span>
                    <span style={{ ...hdrCell, textAlign: 'center' }}>4s</span>
                    <span style={{ ...hdrCell, textAlign: 'center' }}>6s</span>
                    <span style={{ ...hdrCell, textAlign: 'right' }}>SR</span>
                </div>
                {/* Striker */}
                <div style={{ ...gridRow, borderBottom: '1px solid #21262d' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3fb950', flexShrink: 0, boxShadow: '0 0 6px #3fb950' }} />
                        <select value={strikerId} onChange={e => setStrikerId(Number(e.target.value))} style={{
                            border: 'none', background: 'transparent', fontSize: '16px', fontWeight: 800,
                            color: '#3fb950', outline: 'none', width: '100%', padding: 0, cursor: 'pointer'
                        }}>
                            <option value={0}>Striker ▾</option>
                            {batOptions.map((p: any) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                        </select>
                    </div>
                    <span style={valBold}>{strikerStats?.runs_scored ?? 0}</span>
                    <span style={valCell}>{strikerStats?.balls_faced ?? 0}</span>
                    <span style={valCell}>{strikerStats?.fours ?? 0}</span>
                    <span style={valCell}>{strikerStats?.sixes ?? 0}</span>
                    <span style={{ ...valCell, textAlign: 'right' }}>{calcSR(strikerStats?.runs_scored || 0, strikerStats?.balls_faced || 0)}</span>
                </div>
                {/* Non-Striker */}
                <div style={{ ...gridRow, borderBottom: '1px solid #21262d' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <select value={nonStrikerId} onChange={e => setNonStrikerId(Number(e.target.value))} style={{
                            border: 'none', background: 'transparent', fontSize: '16px', fontWeight: 600,
                            color: '#c9d1d9', outline: 'none', width: '100%', padding: 0, cursor: 'pointer'
                        }}>
                            <option value={0}>Non-Striker ▾</option>
                            {batOptions.map((p: any) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                        </select>
                    </div>
                    <span style={valBold}>{nonStrikerStats?.runs_scored ?? 0}</span>
                    <span style={valCell}>{nonStrikerStats?.balls_faced ?? 0}</span>
                    <span style={valCell}>{nonStrikerStats?.fours ?? 0}</span>
                    <span style={valCell}>{nonStrikerStats?.sixes ?? 0}</span>
                    <span style={{ ...valCell, textAlign: 'right' }}>{calcSR(nonStrikerStats?.runs_scored || 0, nonStrikerStats?.balls_faced || 0)}</span>
                </div>
                {/* Bowler hdr */}
                <div style={hdrRow}>
                    <span style={hdrCell}>Bowler</span>
                    <span style={{ ...hdrCell, textAlign: 'center' }}>O</span>
                    <span style={{ ...hdrCell, textAlign: 'center' }}>M</span>
                    <span style={{ ...hdrCell, textAlign: 'center' }}>R</span>
                    <span style={{ ...hdrCell, textAlign: 'center' }}>W</span>
                    <span style={{ ...hdrCell, textAlign: 'right' }}>ER</span>
                </div>
                <div style={gridRow}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f85149', flexShrink: 0, boxShadow: '0 0 6px #f85149' }} />
                        <select value={bowlerId} onChange={e => setBowlerId(Number(e.target.value))} style={{
                            border: 'none', background: 'transparent', fontSize: '16px', fontWeight: 800,
                            color: '#f85149', outline: 'none', width: '100%', padding: 0, cursor: 'pointer'
                        }}>
                            <option value={0}>Bowler ▾</option>
                            {bowlOptions.map((p: any) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                        </select>
                    </div>
                    <span style={valBold}>{currentBowlerStats?.calculated_overs ?? '0'}</span>
                    <span style={valCell}>{currentBowlerStats?.maidens ?? 0}</span>
                    <span style={valCell}>{currentBowlerStats?.runs_conceded ?? 0}</span>
                    <span style={valCell}>{currentBowlerStats?.wickets_taken ?? 0}</span>
                    <span style={{ ...valCell, textAlign: 'right' }}>{calcER(currentBowlerStats?.runs_conceded || 0, currentBowlerStats?.calculated_overs || '0')}</span>
                </div>
            </div>

            {/* ── This Over + Extras ── */}
            <div style={{ ...darkCard, margin: '3px 8px 0', padding: '6px 10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#8b949e', whiteSpace: 'nowrap', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Over</span>
                    <div style={{ width: '1px', height: '16px', background: '#30363d' }} />
                    <div style={{ display: 'flex', gap: '4px', overflowX: 'auto' }}>
                        {thisOver.length === 0 && <span style={{ fontSize: '13px', color: '#484f58', fontStyle: 'italic' }}>—</span>}
                        {thisOver.map((b, i) => (
                            <span key={i} style={{
                                width: '26px', height: '26px', borderRadius: '50%', display: 'inline-flex',
                                alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 900,
                                background: b === 'W' ? '#da3633' : b === '4' ? '#d29922' : b === '6' ? '#8957e5' : b === 'Wd' || b === 'Nb' ? '#9e6a03' : '#30363d',
                                color: '#fff', flexShrink: 0
                            }}>{b}</span>
                        ))}
                    </div>
                </div>

                {/* Active Extra Banner */}
                {(hasExtra || isWicket) && (
                    <div style={{
                        padding: '6px 10px', borderRadius: '6px', textAlign: 'center',
                        fontSize: '13px', fontWeight: 900, letterSpacing: '0.5px',
                        background: isWicket ? 'rgba(218,54,51,0.15)' : 'rgba(158,106,3,0.15)',
                        color: isWicket ? '#f85149' : '#d29922',
                        border: `1px solid ${isWicket ? 'rgba(218,54,51,0.3)' : 'rgba(158,106,3,0.3)'}`,
                    }}>
                        {isWicket && hasExtra ? `${activeExtra} + WICKET` :
                            isWicket ? 'WICKET' : activeExtra}
                        {' '}&nbsp;→ Tap runs below
                        <span onClick={() => { setWb(false); setNb(false); setBye(false); setLb(false); setIsWicket(false); setWicketType('none'); setPlayerOutId(0); }}
                            style={{ marginLeft: '8px', cursor: 'pointer', fontSize: '16px', opacity: 0.7 }}>✕</span>
                    </div>
                )}

                {/* Extras Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '5px' }}>
                    {[
                        { l: 'WD', v: wb, f: () => { setWb(!wb); setNb(false); setBye(false); setLb(false); }, on: '#9e6a03', off: '#21262d' },
                        { l: 'NB', v: nb, f: () => { setNb(!nb); setWb(false); setBye(false); setLb(false); }, on: '#9e6a03', off: '#21262d' },
                        { l: 'BYE', v: bye, f: () => { setBye(!bye); setWb(false); setNb(false); setLb(false); }, on: '#1f6feb', off: '#21262d' },
                        { l: 'LB', v: lb, f: () => { setLb(!lb); setWb(false); setNb(false); setBye(false); }, on: '#1f6feb', off: '#21262d' },
                        { l: 'WKT', v: isWicket, f: () => { setIsWicket(!isWicket); if (!isWicket) setWicketType('caught'); else { setWicketType('none'); setPlayerOutId(0); } }, on: '#da3633', off: '#21262d' },
                    ].map(x => (
                        <button key={x.l} onClick={x.f} style={{
                            padding: '7px 4px', borderRadius: '6px', fontSize: '14px', fontWeight: 900,
                            border: 'none', letterSpacing: '0.5px',
                            background: x.v ? x.on : x.off,
                            color: x.v ? '#fff' : '#8b949e', cursor: 'pointer',
                            WebkitTapHighlightColor: 'transparent'
                        }}>{x.l}</button>
                    ))}
                </div>

                {/* Wicket Type + Who Is Out */}
                {isWicket && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '2px' }}>
                        <select value={wicketType} onChange={e => { setWicketType(e.target.value as any); if (e.target.value !== 'run_out') setPlayerOutId(0); }} style={{
                            fontSize: '15px', border: '1px solid #30363d', borderRadius: '6px',
                            padding: '8px 10px', width: '100%', fontWeight: 700, outline: 'none',
                            background: '#21262d', color: '#f85149'
                        }}>
                            <option value="caught">Caught</option>
                            <option value="caught_and_bowled">Caught &amp; Bowled</option>
                            <option value="bowled">Bowled</option>
                            <option value="lbw">LBW</option>
                            <option value="run_out">Run Out</option>
                            <option value="stumped">Stumped</option>
                            <option value="hit_wicket">Hit Wicket</option>
                            <option value="obstructing_field">Obstructing the Field</option>
                            <option value="timed_out">Timed Out</option>
                            <option value="retired">Retired Hurt</option>
                        </select>

                        {/* Who is out? — important for run outs */}
                        {wicketType === 'run_out' && strikerId && nonStrikerId && (
                            <div style={{
                                display: 'flex', gap: '5px', fontSize: '13px',
                            }}>
                                <span style={{ color: '#8b949e', fontWeight: 700, alignSelf: 'center', whiteSpace: 'nowrap' }}>Out:</span>
                                {[{ id: strikerId, label: 'Striker' }, { id: nonStrikerId, label: 'Non-Striker' }].map(opt => (
                                    <button key={opt.id} onClick={() => setPlayerOutId(opt.id)} style={{
                                        flex: 1, padding: '6px', borderRadius: '6px', border: 'none',
                                        fontSize: '13px', fontWeight: 800, cursor: 'pointer',
                                        background: (playerOutId === opt.id || (!playerOutId && opt.label === 'Striker')) ? '#da3633' : '#21262d',
                                        color: (playerOutId === opt.id || (!playerOutId && opt.label === 'Striker')) ? '#fff' : '#8b949e',
                                        WebkitTapHighlightColor: 'transparent'
                                    }}>
                                        {opt.label} ({players.find((p: any) => p.id === opt.id)?.full_name?.split(' ')[0] || '?'})
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Hint for combination scoring */}
                        {(wb || nb) && (
                            <div style={{ fontSize: '11px', color: '#8b949e', textAlign: 'center', fontStyle: 'italic' }}>
                                {wb ? 'Wide + Wicket (e.g. stumped off wide) — tap 0 for runs' : 'No Ball + Wicket (e.g. run out off no ball) — tap runs scored'}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── Action Buttons ── */}
            <div style={{ margin: '3px 8px 0', display: 'flex', gap: '5px', flexShrink: 0 }}>
                <button onClick={handleSwap} style={{
                    flex: 1, padding: '9px', borderRadius: '6px', border: 'none',
                    background: '#238636', color: 'white',
                    fontSize: '14px', fontWeight: 800, cursor: 'pointer',
                    WebkitTapHighlightColor: 'transparent'
                }}>↔ Swap</button>
                <button onClick={handleUndo} disabled={isPending} style={{
                    flex: 1, padding: '9px', borderRadius: '6px', border: 'none',
                    background: '#9e6a03', color: 'white',
                    fontSize: '14px', fontWeight: 800, cursor: 'pointer',
                    WebkitTapHighlightColor: 'transparent'
                }}>↩ Undo</button>
                <button onClick={handleEndInnings} style={{
                    flex: 1, padding: '9px', borderRadius: '6px', border: 'none',
                    background: '#1f6feb', color: 'white',
                    fontSize: '14px', fontWeight: 800, cursor: 'pointer',
                    WebkitTapHighlightColor: 'transparent'
                }}>🏁 End Inn</button>
            </div>

            {/* ── Run Keypad ── */}
            <div style={{
                flex: 1, ...darkCard, margin: '3px 8px 6px',
                padding: '8px 12px', display: 'flex', flexDirection: 'column',
                justifyContent: 'center', alignItems: 'center', minHeight: 0, overflow: 'hidden'
            }}>
                <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '10px', width: '100%', maxWidth: '400px',
                    alignContent: 'center', flex: 1
                }}>
                    {[0, 1, 2, 3, 4, 5, 6].map(n => {
                        const is4 = n === 4;
                        const is6 = n === 6;
                        const bg = isPending ? '#21262d' : is4 ? '#9e6a03' : is6 ? '#8957e5' : '#238636';
                        return (
                            <button key={n} onClick={() => handleRunClick(n)} disabled={isPending} style={{
                                aspectRatio: '1', borderRadius: '50%', border: 'none',
                                background: bg, color: '#fff',
                                fontSize: '24px', fontWeight: 900,
                                cursor: isPending ? 'default' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                WebkitTapHighlightColor: 'transparent',
                                boxShadow: `0 2px 10px ${bg}66`,
                                transition: 'transform 0.08s',
                                width: '100%', maxHeight: '100%'
                            }}>{n}</button>
                        );
                    })}
                    <button onClick={() => setShowMore(true)} style={{
                        aspectRatio: '1', borderRadius: '50%', border: 'none',
                        background: '#30363d', color: '#c9d1d9',
                        fontSize: '22px', fontWeight: 900,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: '100%', maxHeight: '100%',
                        WebkitTapHighlightColor: 'transparent'
                    }}>⋯</button>
                </div>

                {/* More Options Bottom Sheet */}
                {showMore && (
                    <>
                        <div onClick={() => setShowMore(false)} style={{
                            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 10000
                        }} />
                        <div style={{
                            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 10001,
                            background: '#161b22', borderRadius: '16px 16px 0 0',
                            padding: '20px 16px 32px', border: '1px solid #30363d', borderBottom: 'none'
                        }}>
                            <div style={{ width: '36px', height: '4px', background: '#30363d', borderRadius: '2px', margin: '0 auto 16px' }} />
                            <div style={{ fontSize: '15px', fontWeight: 800, color: '#e6edf3', marginBottom: '16px', textAlign: 'center' }}>More Options</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                {[
                                    { label: '7 Runs', icon: '7️⃣', action: () => { handleRunClick(7); setShowMore(false); } },
                                    { label: 'Penalty (+5)', icon: '⚠️', action: () => { handleRunClick(5); setShowMore(false); } },
                                    { label: 'Dead Ball', icon: '🚫', action: () => { setShowMore(false); } },
                                    { label: 'New Bowler', icon: '🔄', action: () => { setShowMore(false); setShowNewBowler(true); } },
                                    { label: 'End Match', icon: '🏆', action: () => { setShowMore(false); handleEndMatch(); } },
                                    { label: 'Cancel', icon: '✕', action: () => setShowMore(false) },
                                ].map(opt => (
                                    <button key={opt.label} onClick={opt.action} style={{
                                        padding: '14px', borderRadius: '10px', border: '1px solid #30363d',
                                        background: opt.label === 'Cancel' ? '#21262d' : '#161b22',
                                        fontSize: '14px', fontWeight: 700, color: '#c9d1d9',
                                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', gap: '8px',
                                        WebkitTapHighlightColor: 'transparent'
                                    }}>
                                        <span style={{ fontSize: '18px' }}>{opt.icon}</span>
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* ── New Bowler Modal ── */}
            {showNewBowler && (
                <div style={modalOverlay}>
                    <div style={modalCard}>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px', textAlign: 'center', color: '#58a6ff' }}>
                            🔄 Select New Bowler
                        </h3>
                        <p style={{ fontSize: '13px', color: '#8b949e', textAlign: 'center', marginBottom: '16px' }}>
                            Over complete! Choose the next bowler.
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                            {bowlOptions.filter(p => p.id !== bowlerId).map((p: any) => (
                                <button key={p.id} onClick={() => handleChangeBowler(p.id)} disabled={isPending}
                                    style={{
                                        padding: '14px', borderRadius: '10px', border: '1px solid #30363d',
                                        background: '#21262d', color: '#e6edf3', fontSize: '15px', fontWeight: 700,
                                        cursor: 'pointer', textAlign: 'left',
                                        WebkitTapHighlightColor: 'transparent'
                                    }}>
                                    {p.full_name}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setShowNewBowler(false)} style={{
                            marginTop: '12px', width: '100%', padding: '12px', borderRadius: '10px',
                            border: '1px solid #30363d', background: '#161b22', color: '#8b949e',
                            fontSize: '14px', fontWeight: 700, cursor: 'pointer'
                        }}>Keep Current Bowler</button>
                    </div>
                </div>
            )}

            {/* ── New Batsman Modal (after wicket) ── */}
            {showNewBatsman && (
                <div style={modalOverlay}>
                    <div style={modalCard}>
                        <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px', textAlign: 'center', color: '#da3633' }}>
                            🏏 Wicket! Select New Batsman
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
                            {batOptions
                                .filter(p => p.id !== strikerId && p.id !== nonStrikerId)
                                .filter(p => {
                                    // Filter out already-out batsmen
                                    const perf = batterStats.find((b: any) => b.player_id === p.id);
                                    return !perf || !perf.is_out;
                                })
                                .map((p: any) => (
                                    <button key={p.id} onClick={() => handleNewBatsman(p.id)} disabled={isPending}
                                        style={{
                                            padding: '14px', borderRadius: '10px', border: '1px solid #30363d',
                                            background: '#21262d', color: '#e6edf3', fontSize: '15px', fontWeight: 700,
                                            cursor: 'pointer', textAlign: 'left',
                                            WebkitTapHighlightColor: 'transparent'
                                        }}>
                                        {p.full_name}
                                    </button>
                                ))}
                        </div>
                        <button onClick={() => setShowNewBatsman(false)} style={{
                            marginTop: '12px', width: '100%', padding: '12px', borderRadius: '10px',
                            border: '1px solid #30363d', background: '#161b22', color: '#8b949e',
                            fontSize: '14px', fontWeight: 700, cursor: 'pointer'
                        }}>Cancel</button>
                    </div>
                </div>
            )}

        </div>
    );
}
