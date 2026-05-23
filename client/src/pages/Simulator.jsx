import { useState, useEffect, useRef } from 'react';

const MINER_NAMES = ['NeuralNomad','SilentWeight','GradientGhost','LossLord','TokenWarden','ChainMind','WarpNode','DeepForge','VoidMesh','NullLayer'];
const COLORS = ['#7c6fff','#00e5c3','#ff9f43','#ff6b9d','#a29bfe','#55efc4','#fdcb6e','#ff6b6b','#74b9ff','#b2bec3'];
const BASE_SCORES  = [95,85,75,65,55,45,38,30,22,15];
const BASE_SPEEDS  = [0.95,0.80,0.70,0.88,0.60,0.75,0.50,0.65,0.40,0.55];

function Slider({ label, value, min, max, step = 1, format, onChange }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
        <span>{label}</span>
        <span className="mono" style={{ color: 'var(--accent)' }}>{format ? format(value) : value}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
      />
    </div>
  );
}

export default function Simulator() {
  const [accWeight,  setAccWeight]  = useState(70);
  const [spdWeight,  setSpdWeight]  = useState(30);
  const [totalTao,   setTotalTao]   = useState(12);
  const [numMiners,  setNumMiners]  = useState(5);
  const canvasRef = useRef(null);

  const miners = Array.from({ length: numMiners }, (_, i) => {
    const score = BASE_SCORES[i] * (accWeight / 100) + BASE_SPEEDS[i] * 100 * (spdWeight / 100);
    return { name: MINER_NAMES[i], score, color: COLORS[i] };
  });

  const totalSq = miners.reduce((s, m) => s + m.score * m.score, 0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.parentElement.offsetWidth;
    const H = 260;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    const pad = { l: 42, r: 16, t: 16, b: 32 };
    const cW = W - pad.l - pad.r;
    const cH = H - pad.t - pad.b;

    // Grid
    ctx.strokeStyle = 'rgba(42,42,61,0.8)'; ctx.lineWidth = 0.5;
    [0, 0.25, 0.5, 0.75, 1].forEach(v => {
      const y = pad.t + cH * (1 - v);
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(pad.l + cW, y); ctx.stroke();
      ctx.fillStyle = '#555570'; ctx.font = '10px Space Mono, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(Math.round(v * 100) + '%', pad.l - 4, y + 4);
    });

    // Curve
    ctx.beginPath();
    for (let s = 0; s <= 100; s++) {
      const share = Math.min((s * s) / (totalSq / numMiners), 1);
      const x = pad.l + (s / 100) * cW;
      const y = pad.t + cH * (1 - share);
      s === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'rgba(124,111,255,0.45)'; ctx.lineWidth = 1.5; ctx.stroke();

    // Miner dots
    miners.forEach(m => {
      const share = Math.min((m.score * m.score) / totalSq * numMiners, 1);
      const x = pad.l + (m.score / 100) * cW;
      const y = pad.t + cH * (1 - share);
      ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2);
      ctx.fillStyle = m.color; ctx.fill();
    });

    // X labels
    ctx.fillStyle = '#555570'; ctx.font = '10px Space Mono, monospace'; ctx.textAlign = 'center';
    [0, 25, 50, 75, 100].forEach(v => ctx.fillText(v, pad.l + (v / 100) * cW, H - 6));
  }, [accWeight, spdWeight, totalTao, numMiners, miners, totalSq]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 24 }}>

      {/* Controls */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 20, fontWeight: 600 }}>
          调整参数
        </div>

        <Slider label="准确率权重" value={accWeight} min={0} max={100} format={v => v + '%'} onChange={v => { setAccWeight(v); setSpdWeight(100 - v); }} />
        <Slider label="速度权重"   value={spdWeight} min={0} max={100} format={v => v + '%'} onChange={v => { setSpdWeight(v); setAccWeight(100 - v); }} />
        <Slider label="本轮 TAO 奖池" value={totalTao} min={5} max={50} format={v => v.toFixed(1) + ' TAO'} onChange={setTotalTao} />
        <Slider label="参与矿工数" value={numMiners} min={2} max={10} format={v => v + ' 名'} onChange={setNumMiners} />

        <div style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 16px', fontFamily: 'Space Mono, monospace', fontSize: 12, color: 'var(--accent2)', lineHeight: 1.8, marginTop: 4 }}>
          得分 = 准确率 × <span style={{ color: 'var(--accent)' }}>{(accWeight / 100).toFixed(2)}</span><br />
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ 速度 × <span style={{ color: 'var(--accent)' }}>{(spdWeight / 100).toFixed(2)}</span><br />
          TAO 份额 ∝ 得分²
        </div>

        {/* Miner bars */}
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {miners.map(m => {
            const share = m.score * m.score / totalSq;
            const pct   = Math.round(share * 100);
            const tao   = (share * totalTao).toFixed(2);
            return (
              <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="mono" style={{ fontSize: 11, color: 'var(--text2)', width: 62, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name.slice(0, 9)}</div>
                <div style={{ flex: 1, height: 20, background: 'var(--surface)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.max(pct, 4)}%`, height: '100%', background: m.color,
                    borderRadius: 4, transition: 'width 0.5s', display: 'flex', alignItems: 'center',
                    paddingLeft: 6, fontFamily: 'Space Mono,monospace', fontSize: 9, fontWeight: 700,
                    color: pct > 15 ? '#000' : 'transparent',
                  }}>{pct > 15 ? pct + '%' : ''}</div>
                </div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--accent)', width: 52, textAlign: 'right', flexShrink: 0 }}>{tao}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chart */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text2)', marginBottom: 16 }}>
          TAO 分配 vs 得分曲线（二次方激励）
        </div>
        <canvas ref={canvasRef} style={{ display: 'block', width: '100%' }} />
        <div style={{ marginTop: 16, fontSize: 12, color: 'var(--text3)', lineHeight: 1.8 }}>
          得分越高，拿到的 TAO 不是线性增加——而是<span style={{ color: 'var(--accent)' }}>指数级增加</span>。<br />
          这迫使矿工持续优化，而非"差不多就行"。Yuma 共识的核心博弈逻辑。
        </div>
      </div>
    </div>
  );
}
