require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const routes  = require('./routes');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ ok: false, error: `Route ${req.path} not found` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ ok: false, error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Benchmark Arena API`);
  console.log(`   http://localhost:${PORT}/api/health`);
  console.log(`   http://localhost:${PORT}/api/neurons`);
  console.log(`   Subnet ID: ${process.env.SUBNET_ID || 3}`);
  console.log(`   Mode: ${process.env.TAOSTATS_API_KEY ? 'LIVE (taostats)' : 'MOCK (no API key)'}\n`);
});
