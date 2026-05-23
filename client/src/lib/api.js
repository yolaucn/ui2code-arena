const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'API error');
  return json;
}

export const api = {
  getSubnet:  ()           => request('/subnet'),
  getNeurons: (limit = 15) => request(`/neurons?limit=${limit}`),
  getNeuron:  (uid)        => request(`/neurons/${uid}`),
  getTasks:   ()           => request('/tasks'),
  createTask: (body)       => request('/tasks', { method: 'POST', body: JSON.stringify(body) }),
  getHealth:  ()           => request('/health'),
};
