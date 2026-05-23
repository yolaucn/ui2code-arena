import { useState } from 'react';
import { useTasks } from '../hooks/useSubnet';

const DOMAINS = ['电商落地页','移动端 App','后台管理系统','数据可视化大屏','营销活动页','SaaS 产品界面'];
const DIMS     = ['视觉还原度','代码可运行性','响应式适配','Lighthouse 评分','组件语义化','交互还原度'];
const QTYS     = [{ val: 50, label: '50 题（快速）'}, { val: 100, label: '100 题（标准）'}, { val: 200, label: '200 题（深度）'}, { val: 500, label: '500 题（全面）'}];
const TIME_MAP = { 50: '~4 分钟', 100: '~8 分钟', 200: '~15 分钟', 500: '~35 分钟' };

export function TaskSubmit() {
  const { tasks, loading, submitTask } = useTasks();
  const [form, setForm] = useState({ name: '', domain: '', dimensions: [], questionCount: 100, tao: 5, note: '' });
  const [toast, setToast] = useState('');

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const toggleDim = (d) => set('dimensions', form.dimensions.includes(d) ? form.dimensions.filter(x => x !== d) : [...form.dimensions, d]);

  const handleSubmit = async () => {
    if (!form.name || !form.domain) { showToast('请填写任务名称和领域'); return; }
    try {
      await submitTask(form);
      setForm({ name: '', domain: '', dimensions: [], questionCount: 100, tao: 5, note: '' });
      showToast('✓ 任务已发布，矿工开始作答...');
    } catch (e) {
      showToast('发布失败：' + e.message);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const statusColor = { pending: 'var(--text3)', running: 'var(--accent2)', completed: 'var(--accent)' };
  const statusLabel = { pending: '等待中', running: '进行中', completed: '已完成' };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24, alignItems: 'start' }}>

      {/* Form */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 28 }}>
        <div style={{ fontSize: 11, letterSpacing: 2, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: 20, fontWeight: 600 }}>发布新评测任务</div>

        {[
          { label: '任务名称', node: <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="例：电商首页设计稿还原评测" style={inputStyle} /> },
          { label: '评测领域', node: (
            <select value={form.domain} onChange={e => set('domain', e.target.value)} style={inputStyle}>
              <option value="">选择领域...</option>
              {DOMAINS.map(d => <option key={d}>{d}</option>)}
            </select>
          )},
          { label: '评测维度（可多选）', node: (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
              {DIMS.map(d => (
                <button key={d} onClick={() => toggleDim(d)} style={{
                  padding: '4px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                  fontFamily: 'Space Mono, monospace', transition: 'all 0.15s',
                  border: `1px solid ${form.dimensions.includes(d) ? 'var(--accent)' : 'var(--border)'}`,
                  background: form.dimensions.includes(d) ? 'rgba(124,111,255,0.15)' : 'transparent',
                  color: form.dimensions.includes(d) ? 'var(--accent)' : 'var(--text2)',
                }}>{d}</button>
              ))}
            </div>
          )},
          { label: '题目数量', node: (
            <select value={form.questionCount} onChange={e => set('questionCount', parseInt(e.target.value))} style={inputStyle}>
              {QTYS.map(q => <option key={q.val} value={q.val}>{q.label}</option>)}
            </select>
          )},
          { label: '支付金额（TAO）', node: <input type="number" value={form.tao} onChange={e => set('tao', parseFloat(e.target.value))} min={1} max={100} style={inputStyle} /> },
          { label: '补充说明（可选）', node: <textarea value={form.note} onChange={e => set('note', e.target.value)} placeholder="例：设计稿为 Figma 导出，重点考察 Flex 布局还原..." style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }} /> },
        ].map(({ label, node }) => (
          <div key={label} style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text2)', letterSpacing: 0.5, marginBottom: 8 }}>{label}</label>
            {node}
          </div>
        ))}

        <button onClick={handleSubmit} disabled={loading} style={{
          width: '100%', padding: 14, background: 'var(--accent)', color: '#fff',
          border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: 'Syne, sans-serif', transition: 'all 0.2s', opacity: loading ? 0.7 : 1,
        }}>
          {loading ? '发布中...' : '发布任务 · 支付 TAO'}
        </button>
      </div>

      {/* Right column */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Preview */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
          <div style={{ fontSize: 12, color: 'var(--text3)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>任务预览</div>
          {[
            { k: '任务名称', v: form.name || '—' },
            { k: '领域', v: form.domain || '—' },
            { k: '题目数', v: form.questionCount + ' 题' },
            { k: '预计完成', v: TIME_MAP[form.questionCount] || '—' },
            { k: '参与矿工', v: '47 名（当前在线）' },
            { k: '结果交付', v: '排行榜 + PDF 报告' },
          ].map(r => (
            <div key={r.k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '9px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
              <span style={{ color: 'var(--text3)' }}>{r.k}</span>
              <span className="mono" style={{ fontSize: 12, maxWidth: 180, textAlign: 'right', wordBreak: 'break-all' }}>{r.v}</span>
            </div>
          ))}
          <div style={{ marginTop: 20, background: 'rgba(124,111,255,0.08)', border: '1px solid rgba(124,111,255,0.2)', borderRadius: 10, padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6 }}>矿工激励总额</div>
            <div className="mono" style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent)' }}>{Number(form.tao || 0).toFixed(1)} TAO</div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>≈ ¥{Math.round((form.tao || 0) * 2160).toLocaleString()} 人民币</div>
          </div>
        </div>

        {/* Task list */}
        {tasks.length > 0 && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 24 }}>
            <div style={{ fontSize: 12, color: 'var(--text3)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16 }}>历史任务</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {tasks.slice(0, 5).map(t => (
                <div key={t.id} style={{ background: 'var(--surface2)', borderRadius: 8, padding: '10px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</span>
                    <span className="mono" style={{ fontSize: 10, color: statusColor[t.status] || 'var(--text3)' }}>{statusLabel[t.status] || t.status}</span>
                  </div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--text3)' }}>{t.domain} · {t.questionCount}题 · {t.tao} TAO</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--surface2)', border: '1px solid var(--accent2)',
          borderRadius: 10, padding: '12px 24px', fontSize: 13, color: 'var(--accent2)',
          fontFamily: 'Space Mono, monospace', zIndex: 999, whiteSpace: 'nowrap',
          animation: 'fadeUp 0.3s ease',
        }}>{toast}</div>
      )}
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateX(-50%) translateY(20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  );
}

const inputStyle = {
  width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)',
  borderRadius: 8, padding: '10px 14px', color: 'var(--text)',
  fontFamily: 'Syne, sans-serif', fontSize: 14, outline: 'none',
};

// ── Anti-cheat page ──
const TRAP_COUNT = 15;

export function AntiCheat() {
  const trapIndices = new Set();
  while (trapIndices.size < TRAP_COUNT) trapIndices.add(Math.floor(Math.random() * 100));

  const miners5 = [
    { name: 'GPT-4o-Vision',    status: 'ok',        history: [93,91,96,89,93,95,90,92,94,93], cs: 94 },
    { name: 'Qwen2.5-VL-72B',  status: 'ok',        history: [88,90,85,92,87,89,91,88,87,90], cs: 91 },
    { name: 'Claude-3.5-V',    status: 'ok',        history: [84,85,88,80,84,83,86,85,84,87], cs: 87 },
    { name: 'CogVLM2-19B',     status: 'flagged',   history: [47,49,45,48,46,47,50,72,88,91], cs: 42 },
    { name: 'Phi-3.5-Vision',  status: 'penalized', history: [39,62,38,55,40,38,41,37,40,39], cs: 68 },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

      {/* Trap grid */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 22 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>陷阱题分布（本轮 100 题）</div>
        <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16, lineHeight: 1.6 }}>
          红色格子为陷阱图，使用已知"坏设计"（故意破坏布局/颜色/间距）。若矿工对陷阱图输出高还原度代码（> 80%），触发作弊检测——说明矿工在缓存或复制答案，而非真正在跑视觉理解模型。
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 4, marginBottom: 12 }}>
          {Array.from({ length: 100 }, (_, i) => (
            <div key={i} style={{
              aspectRatio: 1, borderRadius: 3,
              background: trapIndices.has(i) ? 'rgba(255,107,107,0.15)' : 'rgba(0,229,195,0.12)',
              border: `1px solid ${trapIndices.has(i) ? 'rgba(255,107,107,0.4)' : 'rgba(0,229,195,0.25)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 8, fontWeight: 700, color: trapIndices.has(i) ? 'var(--danger)' : 'transparent',
              fontFamily: 'Space Mono, monospace',
            }}>{trapIndices.has(i) ? '!' : ''}</div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--text3)' }}>
          <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: 'rgba(0,229,195,0.4)', marginRight: 4 }}></span>正常设计稿</span>
          <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: 'rgba(255,107,107,0.4)', marginRight: 4 }}></span>陷阱图（15 张）</span>
        </div>
        <div className="mono" style={{ marginTop: 14, fontSize: 12, color: 'var(--text3)' }}>
          本轮：<span style={{ color: 'var(--danger)' }}>CogVLM2-19B 命中 2 张陷阱图 → 触发作弊检测</span>
        </div>
      </div>

      {/* Penalty log */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 22 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>惩罚日志</div>
        <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16, lineHeight: 1.6 }}>
          最近触发的自动惩罚记录，由验证者共识触发，不可人为干预。
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { cls: 'danger', time: 'Block #3421801', miner: 'CogVLM2-19B',      msg: '陷阱图命中率 13.3%（2/15），对已知破损布局输出高还原度代码，触发缓存作弊检测，权重衰减开始。' },
            { cls: 'warn',   time: 'Block #3421756', miner: 'Phi-3.5-Vision',   msg: '连续 3 轮视觉还原度波动 >25%（39→62→38），历史一致性降至 68%，触发轻度惩罚。' },
            { cls: 'danger', time: 'Block #3421699', miner: 'Unknown-UID-142',  msg: '生成代码与 InternVL2-76B 输出重合率 94%，推断直接调用同一 API 转发，已踢出本轮。' },
            { cls: 'warn',   time: 'Block #3421623', miner: 'LLaVA-1.6-34B',   msg: '响应延迟突然从 1200ms 降至 45ms（↓96%），疑似返回预缓存代码而非实时推理，标记观察。' },
          ].map((p, i) => (
            <div key={i} style={{
              background: 'var(--surface2)', borderRadius: 8, padding: '10px 12px',
              borderLeft: `3px solid var(--${p.cls})`,
            }}>
              <div className="mono" style={{ fontSize: 10, color: 'var(--text3)', marginBottom: 3 }}>{p.time}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.6 }}>
                <span style={{ color: 'var(--text)', fontWeight: 600 }}>{p.miner}</span>：{p.msg}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Consistency */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: 22, gridColumn: '1 / -1' }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>历史一致性检测</div>
        <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 16, lineHeight: 1.6 }}>
          连续 10 轮得分分布。绿色正常，黄色轻微异常（突增 &gt;20%），红色触发惩罚。
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {miners5.map(m => (
            <div key={m.name} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{m.name}</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {m.history.map((v, i) => {
                    const prev = m.history[i - 1];
                    const isAnomaly = m.status === 'flagged' && i >= 7;
                    const isWarn    = prev && Math.abs(v - prev) > 20;
                    const color = isAnomaly ? 'var(--danger)' : isWarn ? 'var(--warn)' : 'var(--accent2)';
                    return <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: color }} title={v} />;
                  })}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, color: 'var(--text3)', width: 70 }}>一致性</span>
                <div style={{ flex: 1, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    width: `${m.cs}%`, height: '100%', borderRadius: 2,
                    background: m.cs < 70 ? 'var(--danger)' : m.cs < 80 ? 'var(--warn)' : 'var(--accent2)',
                    transition: 'width 0.6s',
                  }} />
                </div>
                <span className="mono" style={{ fontSize: 11, width: 32, color: m.cs < 70 ? 'var(--danger)' : m.cs < 80 ? 'var(--warn)' : 'var(--accent2)' }}>
                  {m.cs}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
