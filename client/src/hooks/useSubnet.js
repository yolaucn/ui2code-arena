import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

export function useSubnet(pollInterval = 12000) {
  const [neurons, setNeurons]   = useState([]);
  const [subnet,  setSubnet]    = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState(null);
  const [isMock,  setIsMock]    = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetch = useCallback(async () => {
    try {
      const [subnetRes, neuronsRes] = await Promise.all([
        api.getSubnet(),
        api.getNeurons(12),
      ]);
      setSubnet(subnetRes.data);
      setNeurons(neuronsRes.data);
      setIsMock(subnetRes.data.isMock || false);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
    const timer = setInterval(fetch, pollInterval);
    return () => clearInterval(timer);
  }, [fetch, pollInterval]);

  return { neurons, subnet, loading, error, isMock, lastUpdated, refetch: fetch };
}

export function useNeuron(uid) {
  const [neuron,  setNeuron]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (uid == null) return;
    setLoading(true);
    api.getNeuron(uid)
      .then(r => { setNeuron(r.data); setError(null); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [uid]);

  return { neuron, loading, error };
}

export function useTasks() {
  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const loadTasks = useCallback(() => {
    api.getTasks()
      .then(r => setTasks(r.data))
      .catch(e => setError(e.message));
  }, []);

  useEffect(() => { loadTasks(); }, [loadTasks]);

  const submitTask = useCallback(async (body) => {
    setLoading(true);
    try {
      const r = await api.createTask(body);
      setTasks(prev => [r.data, ...prev]);
      return r.data;
    } catch (e) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { tasks, loading, error, submitTask, refetch: loadTasks };
}
