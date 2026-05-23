import { useState, useEffect } from 'react';

export default function Header({ subnet, isMock, lastUpdated }) {
  const [countdown, setCountdown] = useState(12);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { return 12; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lastUpdated]);

  useEffect(() => { setCountdown(12); }, [lastUpdated]);

  return (
    <header style={{
      borderBottom: '1px solid var(--border)',
      background: 'rgba(10,10,15,0.93)',
      backdropFilter: 'blur(12px)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, background: 'var(--accent)',
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Space Mono, monospace', fontSize: 12, fontWeight: 700, color: '#fff',
          }}>U2C</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>UI2Code Benchmark Arena</div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--accent2)', letterSpacing: 1 }}>
              BITTENSOR SUBNET · UI 设计稿 → 前端代码 · {isMock ? 'MOCK DATA' : 'LIVE'}
            </div>
          </div>
        </div>

        {/* Data source indicator */}
        <div className="mono" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: isMock ? 'var(--warn)' : 'var(--accent2)',
            animation: isMock ? 'none' : 'pulse 2s infinite',
          }} />
          <span style={{ color: isMock ? 'var(--warn)' : 'var(--accent2)' }}>
            {isMock ? 'Mock 数据' : 'taostats.io 实时'}
          </span>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 28 }}>
          {[
            { val: subnet?.activeMiners ?? '—', label: '活跃矿工' },
            { val: subnet ? `#${subnet.block.toLocaleString()}` : '—', label: '当前区块' },
            { val: subnet ? `${subnet.totalTao.toFixed(1)} TAO` : '—', label: '本轮奖励', color: 'var(--accent2)' },
            { val: `0:${String(countdown).padStart(2,'0')}`, label: '下次刷新', color: 'var(--text2)' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'right' }}>
              <div className="mono" style={{ fontSize: 15, fontWeight: 700, color: s.color || 'var(--text)' }}>{s.val}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.8)} }
      `}</style>
    </header>
  );
}
