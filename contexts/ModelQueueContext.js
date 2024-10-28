import { createContext, useContext, useState, useCallback } from 'react';

const ModelQueueContext = createContext();

export function ModelQueueProvider({ children }) {
  const [modelQueue, setModelQueue] = useState([]);

  const fetchQueue = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/queue', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
        // Removed credentials: 'include' since it's a public endpoint
      });

      const data = await response.json();
      setModelQueue(data.queue || []);
    } catch (error) {
      console.error('Failed to fetch queue:', error);
      setModelQueue([]); // Set empty queue on error
    }
  }, []);

  const addToQueue = useCallback(async (modelData) => {
    try {
      const response = await fetch('/api/admin/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modelData),
      });
      
      if (!response.ok) throw new Error('Failed to add to queue');
      
      await fetchQueue(); // Refresh queue after adding
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
