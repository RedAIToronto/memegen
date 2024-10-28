import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CreateModel } from "@/components/ui/create-model"
import { Card, CardContent } from "@/components/ui/card"
import { Plus } from 'lucide-react'

export function CreateModelDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className="cursor-pointer hover:border-primary transition-colors">
          <CardContent className="p-4 flex flex-col items-center justify-center h-full min-h-[200px] text-muted-foreground">
            <Plus className="h-8 w-8 mb-2" />
            <p className="font-medium">Create Your Model</p>
            <p className="text-sm">4.2M tokens</p>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Your Own Model</DialogTitle>
        </DialogHeader>
        <CreateModel />
      </DialogContent>
    </Dialog>
  )
}
