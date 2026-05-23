const express = require('express');
const router = express.Router();
const { getSubnetInfo, getNeurons, getNeuronHistory, getCacheStats } = require('./bittensorService');

const SUBNET_ID = parseInt(process.env.SUBNET_ID) || 3;

// ── GET /api/subnet ──
// Returns subnet metadata: block, activeMiners, totalTao, isMock
router.get('/subnet', async (req, res) => {
  try {
    const info = await getSubnetInfo(SUBNET_ID);
    res.json({ ok: true, data: info });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ── GET /api/neurons ──
// Returns sorted miner list with scores, weights, status
router.get('/neurons', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 15, 50);
    const neurons = await getNeurons(SUBNET_ID, limit);
    res.json({ ok: true, data: neurons, count: neurons.length });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ── GET /api/neurons/:uid ──
// Returns single neuron with history
router.get('/neurons/:uid', async (req, res) => {
  try {
    const uid = parseInt(req.params.uid);
    const neurons = await getNeurons(SUBNET_ID, 50);
    const neuron = neurons.find(n => n.uid === uid);
    if (!neuron) return res.status(404).json({ ok: false, error: 'Neuron not found' });
    const history = await getNeuronHistory(SUBNET_ID, uid);
    res.json({ ok: true, data: { ...neuron, history } });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ── POST /api/tasks ──
// Submit a new benchmark task (stored in memory for demo)
const tasks = [];
router.post('/tasks', (req, res) => {
  const { name, domain, dimensions, questionCount, tao, note } = req.body;
  if (!name || !domain) {
    return res.status(400).json({ ok: false, error: '任务名称和领域不能为空' });
  }
  const task = {
    id:            Date.now(),
    name,
    domain,
    dimensions:    dimensions || [],
    questionCount: parseInt(questionCount) || 100,
    tao:           parseFloat(tao) || 5,
    note:          note || '',
    status:        'pending',
    createdAt:     new Date().toISOString(),
    minerCount:    47,
  };
  tasks.push(task);
  // Simulate task processing after 3s
  setTimeout(() => {
    const t = tasks.find(t => t.id === task.id);
    if (t) t.status = 'running';
  }, 3000);
  setTimeout(() => {
    const t = tasks.find(t => t.id === task.id);
    if (t) t.status = 'completed';
  }, 15000);
  res.status(201).json({ ok: true, data: task });
});

// ── GET /api/tasks ──
router.get('/tasks', (req, res) => {
  res.json({ ok: true, data: tasks, count: tasks.length });
});

// ── GET /api/health ──
router.get('/health', (req, res) => {
  res.json({
    ok:        true,
    uptime:    Math.round(process.uptime()),
    cache:     getCacheStats(),
    subnet:    SUBNET_ID,
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
