import { useState } from 'react';
import Header from './components/Header';
import Leaderboard from './pages/Leaderboard';
import Simulator from './pages/Simulator';
import { TaskSubmit, AntiCheat } from './pages/TaskAndAntiCheat';
import { useSubnet } from './hooks/useSubnet';

const TABS = [
  { id: 'leaderboard', label: '矿工排行榜' },
  { id: 'simulator',   label: '激励曲线模拟器' },
  { id: 'submit',      label: '发布评测任务' },
  { id: 'anticheat',   label: '防作弊机制' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('leaderboard');
  const { subnet, isMock, lastUpdated } = useSubnet(12000);

  return (
    <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
      <Header subnet={subnet} isMock={isMock} lastUpdated={lastUpdated} />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, padding: '24px 0 0', borderBottom: '1px solid var(--border)', marginBottom: 0 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              padding: '10px 20px', borderRadius: '8px 8px 0 0', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'Syne, sans-serif',
              border: '1px solid transparent', borderBottom: 'none',
              color: activeTab === t.id ? 'var(--accent)' : 'var(--text2)',
              background: activeTab === t.id ? 'var(--surface)' : 'transparent',
              borderColor: activeTab === t.id ? 'var(--border)' : 'transparent',
              marginBottom: activeTab === t.id ? -1 : 0,
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Panel */}
        <div style={{ padding: '28px 0' }}>
          {activeTab === 'leaderboard' && <Leaderboard />}
          {activeTab === 'simulator'   && <Simulator />}
          {activeTab === 'submit'      && <TaskSubmit />}
          {activeTab === 'anticheat'   && <AntiCheat />}
        </div>
      </div>
    </div>
  );
}
