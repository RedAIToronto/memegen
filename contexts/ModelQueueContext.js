import { createContext, useContext, useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";

const ModelQueueContext = createContext({});

export function ModelQueueProvider({ children }) {
  const [modelQueue, setModelQueue] = useState([]);
  const { toast } = useToast();

  const fetchQueue = useCallback(async () => {
    try {
      const response = await fetch('/api/queue')
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch queue')
      }
      
      if (data.success) {
        const newQueue = data.queue || [];
        setModelQueue(prevQueue => {
          if (JSON.stringify(prevQueue) !== JSON.stringify(newQueue)) {
            return newQueue;
          }
          return prevQueue;
        });
      }
    } catch (error) {
      console.error('Queue fetch error:', error)
      setModelQueue([]) // Set empty array on error
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load model queue"
      })
    }
  }, [toast]);

  const addToQueue = useCallback(async (modelData) => {
    try {
      const response = await fetch('/api/create-model', {
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

  return (
    <ModelQueueContext.Provider value={{ 
      modelQueue, 
      fetchQueue,
      addToQueue 
    }}>
      {children}
    </ModelQueueContext.Provider>
  );
}

export const useModelQueue = () => useContext(ModelQueueContext);
