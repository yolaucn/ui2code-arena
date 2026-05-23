import { useState } from 'react';
import { useSubnet, useNeuron } from '../hooks/useSubnet';

const RANK_COLORS = ['#ffd700', '#c0c0c0', '#cd7f32'];

function StatusBadge({ status }) {
  const map = {
    ok:        { label: '正常',   bg: 'rgba(0,229,195,0.12)',  color: 'var(--accent2)' },
    flagged:   { label: '异常',   bg: 'rgba(255,107,107,0.15)', color: 'var(--danger)' },
    penalized: { label: '惩罚中', bg: 'rgba(255,215,0,0.12)',  color: 'var(--warn)' },
  };
  const s = map[status] || map.ok;
  return (
    <span className="mono" style={{
      fontSize: 10, padding: '2px 7px', borderRadius: 4,
      background: s.bg, color: s.color,
    }}>{s.label}</span>
  );
}

function MinerDrawer({ uid, onClose }) {
  const { neuron, loading } = useNeuron(uid);

  return (
    <>
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200,
      }} />
      <div style={{
        position: 'fixed', right: 0, top: 0, bottom: 0, width: 400,
        background: 'var(--surface)', borderLeft: '1px solid var(--border)',
        zIndex: 201, overflowY: 'auto', padding: 28,
        animation: 'slideIn 0.3s cubic-bezier(0.4,0,0.2,1)',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 20, right: 20,
          background: 'var(--surface2)', border: '1px solid var(--border)',
          borderRadius: 6, color: 'var(--text2)', width: 32, height: 32,
          cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>✕</button>

        {loading && <div style={{ color: 'var(--text3)', marginTop: 40, textAlign: 'center' }}>加载中...</div>}

        {neuron && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10,
                background: `rgba(124,111,255,0.13)`, color: neuron.color || 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Space Mono,monospace', fontSize: 15, fontWeight: 700,
              }}>{neuron.name?.slice(0,2).toUpperCase() || String(neuron.uid).slice(0,2)}</div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{neuron.name || `Miner-${neuron.uid}`}</div>
                <div className="mono" style={{ fontSize: 12, color: 'var(--text3)' }}>UID {neuron.uid} · {neuron.model}</div>
              </div>
            </div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--text3)', wordBreak: 'break-all', marginBottom: 24 }}>
              {neuron.hotkey}
            </div>

            {/* Stats grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
              {[
                { label: '综合得分', val: neuron.score, color: neuron.color || 'var(--accent)' },
                { label: '响应延迟', val: `${neuron.latency}ms`, color: 'var(--text)' },
                { label: '本轮收益', val: `${neuron.emission?.toFixed(3)} TAO`, color: 'var(--accent)' },
                { label: '权重占比', val: `${(neuron.weight * 100).toFixed(1)}%`, color: 'var(--text)' },
              ].map(s => (
                <div key={s.label} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
                  <div className="mono" style={{ fontSize: 16, fontWeight: 700, marginBottom: 3, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Score history sparkline */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 2, marginBottom: 10, textTransform: 'uppercase' }}>近 10 轮趋势</div>
              <svg viewBox="0 0 300 60" style={{ width: '100%', height: 60 }}>
                {neuron.history?.length > 1 && (() => {
                  const max = Math.max(...neuron.history);
                  const min = Math.min(...neuron.history);
                  const pts = neuron.history.map((v, i) =>
                    `${(i / (neuron.history.length - 1)) * 290 + 5},${50 - ((v - min) / (max - min || 1)) * 44}`
                  ).join(' ');
                  return (
                    <>
                      <polyline points={pts} fill="none" stroke={neuron.color || 'var(--accent)'} strokeWidth="1.5" strokeLinejoin="round" />
                      {neuron.history.map((v, i) => {
                        const isSpike = neuron.status === 'flagged' && i >= 7;
                        return <circle key={i}
                          cx={(i / (neuron.history.length - 1)) * 290 + 5}
                          cy={50 - ((v - min) / (max - min || 1)) * 44}
                          r={isSpike ? 4 : 2.5}
                          fill={isSpike ? 'var(--danger)' : neuron.color || 'var(--accent)'}
                        />;
                      })}
                    </>
                  );
                })()}
              </svg>
            </div>

            {/* Anti-cheat */}
            <div>
              <div style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 2, marginBottom: 10, textTransform: 'uppercase' }}>防作弊检测</div>
              <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
                {[
                  { label: '陷阱题命中', val: neuron.trapHits >= 2 ? `✗ ${neuron.trapHits} 题异常` : '✓ 正常', ok: neuron.trapHits < 2 },
                  { label: '历史一致性', val: `${neuron.consistencyScore || 90}%`, ok: (neuron.consistencyScore || 90) >= 70 },
                  { label: '当前状态', val: neuron.status === 'flagged' ? '⚠ 已标记' : neuron.status === 'penalized' ? '↓ 衰减中' : '✓ 正常', ok: neuron.status === 'ok' },
                ].map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                    <span style={{ color: 'var(--text2)' }}>{r.label}</span>
                    <span className="mono" style={{ color: r.ok ? 'var(--accent2)' : 'var(--danger)' }}>{r.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <style>{`@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>
      </div>
    </>
  );
}

export default function Leaderboard() {
  const { neurons, subnet, loading, error, isMock, lastUpdated } = useSubnet(12000);
  const [selectedUid, setSelectedUid] = useState(null);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 80, color: 'var(--text3)' }} className="mono">
      拉取链上数据中...
    </div>
  );

  if (error) return (
    <div style={{ textAlign: 'center', padding: 80, color: 'var(--danger)' }} className="mono">
      错误：{error}
    </div>
  );

  return (
    <div>
      {/* Mock notice */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        background: isMock ? 'rgba(255,215,0,0.06)' : 'rgba(0,229,195,0.06)',
        border: `1px solid ${isMock ? 'rgba(255,215,0,0.2)' : 'rgba(0,229,195,0.2)'}`,
        borderRadius: 10, padding: '14px 18px', marginBottom: 24, fontSize: 13,
      }}>
        <div style={{ fontSize: 16, flexShrink: 0 }}>{isMock ? '⚠' : '⟳'}</div>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 4, color: isMock ? 'var(--warn)' : 'var(--accent2)' }}>
            {isMock ? '链上 API 受限，显示高保真模拟数据' : '实时链上数据'}
          </div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--text2)' }}>
            数据源：taostats.io/api/v1/subnet/99/neurons · UI2Code Subnet
            {lastUpdated && `  ·  上次更新 ${lastUpdated.toLocaleTimeString('zh-CN')}`}
          </div>
        </div>
      </div>

      {/* Round cards */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Benchmark 类型', val: 'UI 设计稿 → 前端代码', color: 'var(--accent2)' },
          { label: '当前区块', val: subnet?.block?.toLocaleString() || '—' },
          { label: '本轮奖励', val: `${subnet?.totalTao?.toFixed(1) || '—'} TAO`, color: 'var(--accent)' },
          { label: '参与矿工', val: neurons.length },
        ].map(c => (
          <div key={c.label} style={{ flex: 1, minWidth: 140, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '14px 18px' }}>
            <div className="mono" style={{ fontSize: 20, fontWeight: 700, marginBottom: 3, color: c.color || 'var(--text)' }}>{c.val}</div>
            <div style={{ fontSize: 11, color: 'var(--text3)' }}>{c.label}</div>
          </div>
        ))}
      </div>

      {/* Live badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent2)', animation: 'pulse 1.5s infinite' }} />
        <span className="mono" style={{ fontSize: 11, color: 'var(--accent2)' }}>
          {neurons.length} 名矿工 · 每 12 秒刷新
        </span>
        <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
        {/* Header */}
        <div className="mono" style={{
          display: 'grid', gridTemplateColumns: '44px 1fr 140px 100px 90px 80px 80px',
          padding: '10px 20px', borderBottom: '1px solid var(--border)',
          fontSize: 11, color: 'var(--text3)',
        }}>
          <div>#</div><div>矿工 / UID</div><div>得分</div>
          <div>延迟</div><div>权重</div><div>TAO/轮</div><div>状态</div>
        </div>

        {/* Rows */}
        {neurons.map((m, i) => {
          const rankColor = i < 3 ? RANK_COLORS[i] : 'var(--text3)';
          const rowBorder = m.status === 'flagged' ? '3px solid var(--danger)' : m.status === 'penalized' ? '3px solid var(--warn)' : 'none';
          return (
            <div key={m.uid}
              onClick={() => setSelectedUid(m.uid)}
              style={{
                display: 'grid', gridTemplateColumns: '44px 1fr 140px 100px 90px 80px 80px',
                padding: '13px 20px', borderBottom: '1px solid rgba(42,42,61,0.5)',
                alignItems: 'center', cursor: 'pointer', transition: 'background 0.15s',
                borderLeft: rowBorder, opacity: m.status === 'penalized' ? 0.75 : 1,
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* Rank */}
              <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: rankColor }}>
                {String(i + 1).padStart(2, '0')}
              </div>

              {/* Miner */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 7,
                  background: `rgba(124,111,255,0.1)`, color: m.color || 'var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Space Mono, monospace', fontSize: 11, fontWeight: 700, flexShrink: 0,
                }}>{(m.name || String(m.uid)).slice(0, 2).toUpperCase()}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{m.name || `Miner-${m.uid}`}</div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--text3)' }}>UID {m.uid} · {m.hotkey?.slice(0, 10)}…</div>
                </div>
              </div>

              {/* Score bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${m.score}%`, height: '100%', borderRadius: 2, background: m.status !== 'ok' ? 'var(--danger)' : m.color || 'var(--accent)', transition: 'width 0.8s' }} />
                </div>
                <span className="mono" style={{ fontSize: 13, fontWeight: 700, minWidth: 28, textAlign: 'right', color: i < 3 ? m.color : 'var(--text2)' }}>
                  {m.score}
                </span>
              </div>

              {/* Latency */}
              <div className="mono" style={{ fontSize: 12, color: 'var(--text2)' }}>{m.latency}ms</div>

              {/* Weight */}
              <div>
                <span className="mono" style={{
                  fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 4,
                  background: 'rgba(124,111,255,0.1)', color: m.color || 'var(--accent)',
                }}>
                  {(m.weight * 100).toFixed(1)}%
                </span>
              </div>

              {/* TAO */}
              <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>
                {m.emission?.toFixed(3)}
              </div>

              {/* Status */}
              <div><StatusBadge status={m.status} /></div>
            </div>
          );
        })}
      </div>

      {selectedUid != null && (
        <MinerDrawer uid={selectedUid} onClose={() => setSelectedUid(null)} />
      )}
    </div>
  );
}
