import { createContext, useContext, useState, useCallback } from 'react';

const ModelQueueContext = createContext();

export function ModelQueueProvider({ children }) {
  const [modelQueue, setModelQueue] = useState([]);

  const fetchQueue = useCallback(async () => {
    if (typeof window === 'undefined') return;
    
    try {
      const response = await fetch('/api/generations/queue');
      const data = await response.json();
      if (data.success) {
        setModelQueue(data.queue || []);
      }
    } catch (error) {
      console.error('Failed to fetch queue:', error);
      setModelQueue([]);
    }
  }, []);

  const addToQueue = useCallback(async (modelData) => {
    try {
      const response = await fetch('/api/generations/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modelData),
      });
      
      if (!response.ok) throw new Error('Failed to add to queue');
      
      await fetchQueue();
      return true;
    } catch (error) {
      console.error('Failed to add to queue:', error);
      return false;
    }
  }, [fetchQueue]);

  const removeFromQueue = useCallback(async (modelId) => {
    try {
      const response = await fetch(`/api/admin/queue/${modelId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Failed to remove from queue');
      
      await fetchQueue(); // Refresh queue after removing
    } catch (error) {
      console.error('Failed to remove from queue:', error);
    }
  }, [fetchQueue]);

  const clearQueue = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/queue/clear', { 
        method: 'POST' 
      });
      
      if (!response.ok) throw new Error('Failed to clear queue');
      
      setModelQueue([]);
    } catch (error) {
      console.error('Failed to clear queue:', error);
    }
  }, []);

  return (
    <ModelQueueContext.Provider value={{
      modelQueue,
      addToQueue,
      removeFromQueue,
      clearQueue,
      fetchQueue
    }}>
      {children}
    </ModelQueueContext.Provider>
  );
}

export const useModelQueue = () => {
  const context = useContext(ModelQueueContext);
  if (context === undefined) {
    throw new Error('useModelQueue must be used within a ModelQueueProvider');
  }
  return context;
};
