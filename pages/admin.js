import { useState, useEffect } from 'react';
import { useModelQueue } from "@/contexts/ModelQueueContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, RefreshCw, ExternalLink, Loader2, Sparkles, CheckCircle2, Download } from 'lucide-react';
import { useRouter } from 'next/router';
import { AdminLogin } from '@/components/ui/admin-login';
import { Alert, AlertDescription } from "@/components/ui/alert";

// Add these status configurations
const STATUS_CONFIGS = {
  preparing: {
    label: 'Preparing',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Loader2,
    nextStatus: 'training'
  },
  training: {
    label: 'Training',
    color: 'bg-blue-100 text-blue-800',
    icon: Sparkles,
    nextStatus: 'completed'
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle2,
    nextStatus: null
  },
  queued: {  // Add default status
    label: 'Queued',
    color: 'bg-gray-100 text-gray-800',
    icon: Loader2,
    nextStatus: 'preparing'
  }
};

export default function AdminPanel() {
  // All hooks at the top
  const { modelQueue, removeFromQueue, clearQueue, fetchQueue } = useModelQueue();
  const [uploads, setUploads] = useState([]);
  const [availableModels, setAvailableModels] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newModel, setNewModel] = useState({
    id: '',
    name: '',
    promptPrefix: '',
    previewImage: '',
    description: '',
    owner: '', // Replicate owner
    modelId: '', // Replicate model ID
    config: {}, // Model-specific configuration
  });
  const { toast } = useToast();
  const router = useRouter();

  // Authentication check
  useEffect(() => {
    checkAuth();
  }, []);

  // Data fetching
  useEffect(() => {
    if (isAuthenticated) {
      fetchUploads();
      fetchModels();
    }
  }, [isAuthenticated]);

  // Add useEffect to fetch queue on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchQueue();
    }
  }, [isAuthenticated, fetchQueue]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/admin/check-auth');
      if (!response.ok) {
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
      }
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUploads = async () => {
    try {
      const response = await fetch('/api/admin/uploads');
      const data = await response.json();
      setUploads(data.uploads);
    } catch (error) {
      console.error('Failed to fetch uploads:', error);
    }
  };

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/admin/models');
      const data = await response.json();
      setAvailableModels(data.models);
    } catch (error) {
      console.error('Failed to fetch models:', error);
    }
  };

  const handleDeleteModel = async (modelId) => {
    try {
      const response = await fetch(`/api/admin/models/${modelId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete model');

      toast({
        title: "Model Deleted",
        description: "The model has been removed successfully.",
      });

      // Refresh the models list
      fetchModels();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete model. Please try again.",
      });
    }
  };

  const handleAddModel = async () => {
    try {
      // Format the model data
      const modelData = {
        ...newModel,
        id: newModel.id.toLowerCase(),
        promptPrefix: newModel.promptPrefix.toUpperCase(),
        owner: "redaitoronto", // Fixed owner
        available: true,
        config: {
          owner: "redaitoronto",
          modelId: newModel.modelId,
        }
      };

      const response = await fetch('/api/admin/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modelData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add model');
      }

      toast({
        title: "Model Added",
        description: `${newModel.name} has been added successfully.`,
      });

      // Reset form
      setNewModel({
        id: '',
        name: '',
        promptPrefix: '',
        previewImage: '',
        description: '',
        owner: 'redaitoronto',
        modelId: '',
        config: {}
      });
      
      // Refresh models list
      fetchModels();
    } catch (error) {
      console.error('Add model error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add model",
      });
    }
  };

  const handleStartTraining = async (modelId) => {
    try {
      // First set to preparing
      await fetch(`/api/admin/queue/${modelId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'preparing' }),
      });

      toast({
        title: "Status Updated",
        description: "Model is now preparing for training",
      });

      // Refresh the queue
      await fetchQueue();

    } catch (error) {
      console.error('Failed to start training:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start training",
      });
    }
  };

  const handleUpdateStatus = async (modelId, status) => {
    try {
      await fetch(`/api/admin/queue/${modelId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      toast({
        title: "Status Updated",
        description: `Model status updated to ${status}`,
      });

      await fetchQueue();
    } catch (error) {
      console.error('Failed to update status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update status",
      });
    }
  };

  // Add confirmation dialog for delete
  const confirmDelete = (modelId) => {
    if (window.confirm('Are you sure you want to delete this model?')) {
      handleDeleteModel(modelId);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <AdminLogin onLogin={() => setIsAuthenticated(true)} />;
  }

  // Rest of your component remains the same...
  return (
    <div className="container mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

      {/* Queue Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Training Queue
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchQueue}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" onClick={clearQueue}>Clear All</Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {modelQueue.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No models in queue
              </div>
            ) : (
              modelQueue.map((model) => {
                const statusConfig = STATUS_CONFIGS[model.status] || STATUS_CONFIGS.queued;
                return (
                  <div key={model.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full overflow-hidden">
                        <img 
                          src={model.previewImage} 
                          alt={model.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/placeholder-image.png';
                          }}
                        />
                      </div>
                      <div>
                        <p className="font-medium">{model.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
                            <statusConfig.icon className="h-3 w-3 inline mr-1" />
                            {statusConfig.label}
                          </span>
                          {model.startedAt && (
                            <span className="text-xs text-muted-foreground">
                              Started: {new Date(model.startedAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {model.estimatedTime || 'Queued for training'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Owner: {model.owner.slice(0, 4)}...{model.owner.slice(-4)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Download ZIP button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(model.fileUrl, '_blank')}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Training Data
                      </Button>
                      
                      {statusConfig.nextStatus && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(model.id, statusConfig.nextStatus)}
                        >
                          {statusConfig.nextStatus === 'training' ? 'Start Training' : 'Complete Training'}
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeFromQueue(model.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Available Models */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Available Models
            <Button variant="outline" onClick={fetchModels}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {availableModels.map((model) => (
              <div key={model.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <img 
                      src={model.previewImage} 
                      alt={model.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-image.png';
                      }}
                    />
                  </div>
                  <div>
                    <p className="font-medium">{model.name}</p>
                    <p className="text-sm text-muted-foreground">ID: {model.id}</p>
                    <p className="text-sm text-muted-foreground">Prefix: {model.promptPrefix}</p>
                    <p className="text-sm text-muted-foreground">{model.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => confirmDelete(model.id)}
                    className="text-red-500 hover:text-red-600 hover:bg-red-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add New Model */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Model</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="modelId">Model ID</Label>
                <Input
                  id="modelId"
                  value={newModel.id}
                  onChange={(e) => setNewModel(prev => ({ 
                    ...prev, 
                    id: e.target.value.toLowerCase()
                  }))}
                  placeholder="e.g., pepe"
                />
                <p className="text-xs text-muted-foreground">
                  This will be used as the prefix for prompts (e.g., "PEPE cat")
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="modelName">Display Name</Label>
                <Input
                  id="modelName"
                  value={newModel.name}
                  onChange={(e) => setNewModel(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., PEPE"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="promptPrefix">Prompt Prefix</Label>
              <Input
                id="promptPrefix"
                value={newModel.promptPrefix}
                onChange={(e) => setNewModel(prev => ({ 
                  ...prev, 
                  promptPrefix: e.target.value.toUpperCase() 
                }))}
                placeholder="e.g., PEPE"
              />
              <p className="text-xs text-muted-foreground">
                This will be automatically added to all prompts
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="previewImage">Preview Image URL</Label>
              <Input
                id="previewImage"
                value={newModel.previewImage}
                onChange={(e) => setNewModel(prev => ({ ...prev, previewImage: e.target.value }))}
                placeholder="Image URL for model preview"
              />
              {newModel.previewImage && (
                <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden bg-muted">
                  <img
                    src={newModel.previewImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      toast({
                        variant: "destructive",
                        title: "Invalid Image URL",
                        description: "Please provide a valid image URL",
                      });
                    }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newModel.description}
                onChange={(e) => setNewModel(prev => ({ ...prev, description: e.target.value }))}
                placeholder="e.g., Generate PEPE-style images"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="owner">Replicate Owner</Label>
                <Input
                  id="owner"
                  value={newModel.owner}
                  onChange={(e) => setNewModel(prev => ({ ...prev, owner: e.target.value }))}
                  placeholder="redaitoronto"
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="replicateModel">Replicate Model ID</Label>
                <Input
                  id="replicateModel"
                  value={newModel.modelId}
                  onChange={(e) => setNewModel(prev => ({ ...prev, modelId: e.target.value }))}
                  placeholder="e.g., pepe"
                />
              </div>
            </div>

            <Alert>
              <AlertDescription>
                <ul className="list-disc pl-4 space-y-1 text-sm">
                  <li>Model ID will be used as the prefix in prompts</li>
                  <li>Preview image should be a square image</li>
                  <li>Model will be immediately available after adding</li>
                  <li>Make sure the model exists in Replicate before adding</li>
                </ul>
              </AlertDescription>
            </Alert>

            <Button 
              onClick={handleAddModel} 
              className="w-full"
              disabled={
                !newModel.id || 
                !newModel.name || 
                !newModel.promptPrefix || 
                !newModel.previewImage || 
                !newModel.description ||
                !newModel.modelId
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Model
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
