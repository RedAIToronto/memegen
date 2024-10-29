import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Trash2, RefreshCw } from "lucide-react"

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [password, setPassword] = useState('')
  const [queue, setQueue] = useState([])
  const [isLoadingQueue, setIsLoadingQueue] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/check-auth', {
          credentials: 'include'
        });
        
        const data = await response.json();
        if (data.authenticated) {
          setIsAuthenticated(true);
          fetchQueue();
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const fetchQueue = async () => {
    setIsLoadingQueue(true);
    try {
      const response = await fetch('/api/models/create/queue', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch queue');
      }
      
      setQueue(data.queue || []);
      
    } catch (error) {
      console.error('Failed to fetch queue:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch model queue",
      });
    } finally {
      setIsLoadingQueue(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const response = await fetch(`/api/models/create/queue/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) throw new Error('Failed to update status');

      toast({
        title: "Success",
        description: "Model status updated successfully",
      });
      
      fetchQueue();
    } catch (error) {
      console.error('Update failed:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update model status",
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`/api/models/create/queue/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to delete model');

      toast({
        title: "Success",
        description: "Model deleted successfully",
      });
      
      fetchQueue();
    } catch (error) {
      console.error('Delete failed:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete model",
      });
    }
  };

  const handleClearQueue = async () => {
    try {
      const response = await fetch('/api/admin/queue/clear', {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to clear queue');

      toast({
        title: "Success",
        description: "Queue cleared successfully",
      });
      
      fetchQueue();
    } catch (error) {
      console.error('Clear queue failed:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to clear queue",
      });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!password.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a password",
      });
      return;
    }
    
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsAuthenticated(true);
        toast({
          title: "Success",
          description: "Welcome to admin panel",
        });
      } else {
        throw new Error(data.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to login",
      });
    }
    
    setPassword('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <h1 className="text-2xl font-bold text-center">Admin Login</h1>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
              />
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Model Queue</h1>
            <div className="space-x-2">
              <Button 
                variant="outline" 
                onClick={fetchQueue}
                disabled={isLoadingQueue}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingQueue ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoadingQueue ? (
              <div className="flex justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : queue.length === 0 ? (
              <p className="text-center text-muted-foreground">No models in queue</p>
            ) : (
              <div className="space-y-4">
                {queue.map((model) => (
                  <Card key={model.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-lg overflow-hidden">
                            <img 
                              src={model.previewImage} 
                              alt={model.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-semibold">{model.name}</h3>
                            <p className="text-sm text-muted-foreground">Status: {model.status}</p>
                            <p className="text-sm text-muted-foreground">
                              Created: {new Date(model.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateStatus(model.id, 'training')}
                          >
                            Start Training
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateStatus(model.id, 'completed')}
                          >
                            Mark Complete
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(model.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
























































































