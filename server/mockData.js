// Mock data for UI-to-Code Benchmark Subnet
// Miners compete to convert UI design screenshots → runnable frontend code

const MOCK_MINERS = [
  { uid: 100, hotkey: '5GrwvaEF5zxb26zuPjciQgEc', model: 'GPT-4o-Vision 路由',    base: 94, color: '#7c6fff' },
  { uid: 101, hotkey: '5FHneW46xGXgs5mUiveU4sb',  model: '自训 Qwen2.5-VL-72B',  base: 89, color: '#00e5c3' },
  { uid: 102, hotkey: '5DAAnrj7VhtUKcCgRPPhdUFG', model: 'Claude-3.5-Sonnet-V',  base: 85, color: '#ff9f43' },
  { uid: 103, hotkey: '5HGjWAeFDfFXWon2Tbh7dSHR', model: 'Gemini-2.0-Flash',      base: 77, color: '#ff6b9d' },
  { uid: 104, hotkey: '5CiPPseXPECbDkbxBMJEwp4b', model: 'LLaMA-3.2-Vision-90B', base: 69, color: '#a29bfe' },
  { uid: 105, hotkey: '5GNJqTPyNqAn1qAGCNBbAd9K', model: 'InternVL2-76B',         base: 62, color: '#55efc4' },
  { uid: 106, hotkey: '5HpG9w8EBLe4NLahezZjX2bE', model: 'MiniCPM-V-2.6 + 微调', base: 54, color: '#fdcb6e' },
  { uid: 107, hotkey: '5Ck5SLLi6YnkAoB5KQfpPLJ8', model: 'CogVLM2-19B',           base: 46, color: '#ff6b6b', flagged: true  },
  { uid: 108, hotkey: '5DfhbVQMs7DgRh7GjAmp4tqb', model: 'Phi-3.5-Vision',        base: 38, color: '#74b9ff', penalized: true },
  { uid: 109, hotkey: '5F3sa2TJAWMqBitiHqGftzAZ', model: 'LLaVA-1.6-34B',         base: 27, color: '#b2bec3' },
];

function generateMockNeurons(blockNumber) {
  const totalSq = MOCK_MINERS.reduce((s, m) => {
    const score = Math.max(10, m.base + Math.floor(Math.random() * 5 - 2));
    return s + score * score;
  }, 0);

  return MOCK_MINERS.map((m) => {
    const score = Math.max(10, Math.min(99, m.base + Math.floor(Math.random() * 5 - 2)));
    const weight = (score * score) / totalSq;
    return {
      uid:           m.uid,
      hotkey:        m.hotkey,
      model:         m.model,
      color:         m.color,
      score,
      latency:       Math.round(Math.random() * 800 + 400), // UI转代码推理延迟更高
      weight:        parseFloat(weight.toFixed(4)),
      emission:      parseFloat((weight * 12.4).toFixed(4)),
      status:        m.flagged ? 'flagged' : m.penalized ? 'penalized' : 'ok',
      trapHits:      m.flagged ? 2 : 0,
      consistencyScore: m.flagged ? 42 : m.penalized ? 68 : Math.round(Math.random() * 15 + 82),
      history:       Array.from({ length: 10 }, (_, i) => {
        if (m.flagged && i >= 7) return m.base + Math.floor(Math.random() * 20 + 15);
        return Math.max(10, m.base + Math.floor(Math.random() * 8 - 4));
      }),
      block: blockNumber,
    };
  }).sort((a, b) => b.score - a.score);
}

function generateMockSubnetInfo(blockNumber) {
  return {
    netuid:       99,
    name:         'UI2Code Subnet (Mock)',
    block:        blockNumber,
    emission:     0.124,
    tempo:        100,
    activeMiners: MOCK_MINERS.length,
    totalTao:     12.4,
    isMock:       true,
  };
}

module.exports = { generateMockNeurons, generateMockSubnetInfo };
