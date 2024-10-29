import { useState, useEffect } from 'react';







import { useModelQueue } from "@/contexts/ModelQueueContext";







import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";







import { Button } from "@/components/ui/button";







import { Input } from "@/components/ui/input";







import { Label } from "@/components/ui/label";







import { useToast } from "@/hooks/use-toast";







import { Trash2, Plus, RefreshCw, Download, Loader2, Sparkles, CheckCircle2, Upload, XCircle } from 'lucide-react';







import { useRouter } from 'next/router';







import { UploadButton } from "@/utils/uploadthing";







import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";







import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

















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







  queued: {







    label: 'Queued',







    color: 'bg-gray-100 text-gray-800',







    icon: Loader2,







    nextStatus: 'preparing'







  }







};















export default function AdminPage() {







  const [models, setModels] = useState([]);







  const [queue, setQueue] = useState([]);







  const [isLoading, setIsLoading] = useState(true);







  const [newModel, setNewModel] = useState({







    id: '',







    name: '',







    previewImage: '',







    description: ''







  });







  const { toast } = useToast();







  const router = useRouter();







  const [showAddModelDialog, setShowAddModelDialog] = useState(false);







  const [isAuthenticated, setIsAuthenticated] = useState(false);







  const [password, setPassword] = useState('');
















  useEffect(() => {







    fetchData();







  }, []);















  const fetchData = async () => {







    try {







      await Promise.all([







        fetchModels(),







        fetchQueue()







      ]);







    } finally {







      setIsLoading(false);







    }







  };















  const fetchModels = async () => {







    const response = await fetch('/api/admin/models');







    const data = await response.json();







    if (data.success) setModels(data.models);







  };















  const fetchQueue = async () => {







    const response = await fetch('/api/generations/queue');







    const data = await response.json();







    if (data.success) setQueue(data.queue);







  };















  const handleDeleteModel = async (modelId) => {







    try {







      const response = await fetch(`/api/admin/models/${modelId}`, {







        method: 'DELETE'







      });















      if (!response.ok) throw new Error('Failed to delete model');















      toast({







        title: "Success",







        description: "Model deleted successfully"







      });















      fetchModels();







    } catch (error) {







      toast({







        variant: "destructive",







        title: "Error",







        description: "Failed to delete model"







      });







    }







  };















  const handleAddModel = async (e) => {







    e.preventDefault();







    try {







      const response = await fetch('/api/admin/models', {







        method: 'POST',







        headers: { 'Content-Type': 'application/json' },







        body: JSON.stringify(newModel)







      });















      if (!response.ok) throw new Error('Failed to add model');















      toast({







        title: "Success",







        description: "Model added successfully"







      });















      setNewModel({ id: '', name: '', previewImage: '', description: '' });







      fetchModels();







    } catch (error) {







      toast({







        variant: "destructive",







        title: "Error",







        description: "Failed to add model"







      });







    }







  };















  const handleUpdateStatus = async (modelId, newStatus) => {







    try {







      const response = await fetch(`/api/admin/queue/${modelId}`, {







        method: 'PATCH',







        headers: { 'Content-Type': 'application/json' },







        body: JSON.stringify({ status: newStatus })







      });















      if (!response.ok) throw new Error('Failed to update status');















      toast({







        title: "Success",







        description: "Status updated successfully"







      });















      fetchQueue();







    } catch (error) {







      toast({







        variant: "destructive",







        title: "Error",







        description: "Failed to update status"







      });







    }







  };















  const handleDownloadTraining = async (fileUrl) => {







    try {







      const response = await fetch(fileUrl);







      const blob = await response.blob();







      const url = window.URL.createObjectURL(blob);







      const a = document.createElement('a');







      a.href = url;







      a.download = 'training-data.zip';







      document.body.appendChild(a);







      a.click();







      window.URL.revokeObjectURL(url);







      document.body.removeChild(a);







    } catch (error) {







      toast({







        variant: "destructive",







        title: "Error",







        description: "Failed to download file"







      });







    }







  };















  const handleDeleteFromQueue = async (itemId) => {







    try {







      const response = await fetch(`/api/admin/queue/${itemId}`, {







        method: 'DELETE',







        headers: {







          'x-admin-token': process.env.NEXT_PUBLIC_ADMIN_SECRET







        }







      });















      if (!response.ok) {







        const error = await response.json();







        throw new Error(error.error || 'Failed to delete from queue');







      }















      toast({







        title: "Success",







        description: "Item removed from queue",







      });















      fetchQueue(); // Refresh the queue







    } catch (error) {







      console.error('Delete error:', error);







      toast({







        variant: "destructive",







        title: "Error",







        description: error.message || "Failed to delete from queue",







      });







    }







  };















  const handleAuthenticate = (e) => {







    e.preventDefault();







    if (password === process.env.NEXT_PUBLIC_ADMIN_SECRET) {







      setIsAuthenticated(true);







      localStorage.setItem('adminAuthenticated', 'true');







    } else {







      toast({







        variant: "destructive",







        title: "Error",







        description: "Invalid password"







      });







    }







  };















  useEffect(() => {







    const isAuth = localStorage.getItem('adminAuthenticated');







    if (isAuth === 'true') {







      setIsAuthenticated(true);







    }







  }, []);















  if (!isAuthenticated) {







    return (







      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-500/5 to-purple-500/5">







        <Card className="w-[400px] p-6">







          <CardHeader>







            <CardTitle>Admin Authentication</CardTitle>







          </CardHeader>







          <CardContent>







            <form onSubmit={handleAuthenticate} className="space-y-4">







              <div className="space-y-2">







                <Label>Password</Label>







                <Input







                  type="password"







                  value={password}







                  onChange={(e) => setPassword(e.target.value)}







                  placeholder="Enter admin password"







                />







              </div>







              <Button type="submit" className="w-full">







                Login







              </Button>







            </form>







          </CardContent>







        </Card>







      </div>







    );







  }















  if (isLoading) {







    return (







      <div className="flex items-center justify-center min-h-screen">







        <Loader2 className="h-8 w-8 animate-spin" />







      </div>







    );







  }















  return (







    <div className="container mx-auto px-4 py-8">







      <div className="flex justify-between items-center mb-8">







        <h1 className="text-2xl font-bold">Admin Dashboard</h1>







        <Button 







          variant="ghost" 







          onClick={() => {







            localStorage.removeItem('adminAuthenticated');







            setIsAuthenticated(false);







          }}







        >







          Logout







        </Button>







      </div>







      <Tabs defaultValue="models">







        <TabsList className="mb-8">







          <TabsTrigger value="models">Models</TabsTrigger>







          <TabsTrigger value="queue">Queue</TabsTrigger>







          <TabsTrigger value="add">Add Model</TabsTrigger>







        </TabsList>















        <TabsContent value="models">







          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">







            <AddModelCard onClick={() => setShowAddModelDialog(true)} />







            {models.map(model => (







              <ModelCard 







                key={model.id} 







                model={model} 







                onDelete={handleDeleteModel}







              />







            ))}







          </div>







        </TabsContent>















        <TabsContent value="queue">







          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">







            {queue.map(item => (







              <QueueCard 







                key={item.id} 







                item={item}







                onUpdateStatus={handleUpdateStatus}







                onDownload={handleDownloadTraining}







                onDelete={handleDeleteFromQueue}







              />







            ))}







          </div>







        </TabsContent>















        <TabsContent value="add">







          <Dialog open={showAddModelDialog} onOpenChange={setShowAddModelDialog}>







            <DialogContent>







              <DialogHeader>







                <DialogTitle>Add New Model</DialogTitle>







                <DialogDescription>







                  Add a new model by providing its details or uploading training data.







                </DialogDescription>







              </DialogHeader>







              <form onSubmit={handleAddModel} className="space-y-4">







                <div>







                  <Label>Model ID</Label>







                  <Input 







                    value={newModel.id}







                    onChange={e => setNewModel(prev => ({ ...prev, id: e.target.value }))}







                    placeholder="e.g., fwog"







                  />







                </div>







                <div>







                  <Label>Name</Label>







                  <Input 







                    value={newModel.name}







                    onChange={e => setNewModel(prev => ({ ...prev, name: e.target.value }))}







                    placeholder="Model name"







                  />







                </div>







                <div>







                  <Label>Preview Image</Label>







                  <div className="space-y-2">







                    <Input 







                      value={newModel.previewImage}







                      onChange={e => setNewModel(prev => ({ ...prev, previewImage: e.target.value }))}







                      placeholder="Image URL"







                    />







                    <p className="text-sm text-muted-foreground">







                      Or upload an image:







                    </p>







                    <UploadButton







                      endpoint="imageUploader"







                      onClientUploadComplete={(res) => {







                        if (res?.[0]?.url) {







                          setNewModel(prev => ({ ...prev, previewImage: res[0].url }));







                        }







                      }}







                    />







                  </div>







                </div>







                <div>







                  <Label>Description</Label>







                  <Input 







                    value={newModel.description}







                    onChange={e => setNewModel(prev => ({ ...prev, description: e.target.value }))}







                    placeholder="Model description"







                  />







                </div>







                <DialogFooter>







                  <Button type="button" variant="outline" onClick={() => setShowAddModelDialog(false)}>







                    Cancel







                  </Button>







                  <Button type="submit">Add Model</Button>







                </DialogFooter>







              </form>







            </DialogContent>







          </Dialog>







        </TabsContent>







      </Tabs>







    </div>







  );







}















const ModelCard = ({ model, onDelete }) => (







  <Card>







    <CardContent className="p-6">







      <div className="flex justify-between items-start mb-4">







        <div>







          <h3 className="text-lg font-semibold">{model.name}</h3>







          <p className="text-sm text-muted-foreground">{model.id}</p>







        </div>







        <Button







          variant="ghost"







          size="icon"







          onClick={() => onDelete(model.id)}







        >







          <Trash2 className="h-4 w-4" />







        </Button>







      </div>















      {model.previewImage && (







        <div className="aspect-square relative rounded-lg overflow-hidden">







          <img







            src={model.previewImage}







            alt={model.name}







            className="object-cover w-full h-full"







          />







        </div>







      )}







    </CardContent>







  </Card>







);















const QueueCard = ({ item, onUpdateStatus, onDownload, onDelete }) => {







  const config = STATUS_CONFIGS[item.status || 'queued'];







  const StatusIcon = config.icon;















  return (







    <Card>







      <CardContent className="p-6">







        <div className="flex justify-between items-start mb-4">







          <div>







            <h3 className="text-lg font-semibold">{item.name}</h3>







            <div className={`${config.color} px-3 py-1 rounded-full text-sm inline-flex items-center mt-2`}>







              <StatusIcon className="h-4 w-4 mr-2" />







              {config.label}







            </div>







          </div>







          <div className="flex gap-2">







            {item.fileUrl && (







              <Button







                variant="ghost"







                size="icon"







                onClick={() => onDownload(item.fileUrl)}







              >







                <Download className="h-4 w-4" />







              </Button>







            )}







            <Button







              variant="ghost"







              size="icon"







              onClick={() => onDelete(item.id)}







              className="text-red-500 hover:text-red-600 hover:bg-red-50"







            >







              <Trash2 className="h-4 w-4" />







            </Button>







          </div>







        </div>







        {config.nextStatus && (







          <Button







            className="w-full mt-4"







            onClick={() => onUpdateStatus(item.id, config.nextStatus)}







          >







            Update to {STATUS_CONFIGS[config.nextStatus].label}







          </Button>







        )}







      </CardContent>







    </Card>







  );







};















const AddModelCard = ({ onClick }) => (







  <Card 







    className="cursor-pointer hover:shadow-lg transition-shadow"







    onClick={onClick}







  >







    <CardContent className="flex flex-col items-center justify-center p-6">







      <Plus className="h-12 w-12 mb-4" />







      <h3 className="text-lg font-semibold">Add New Model</h3>







    </CardContent>







  </Card>







);



























































