'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ImageUpload } from "@/components/ui/image-upload"
import { UploadDropzone } from "@/components/ui/upload-dropzone"
import { useUploadFiles } from "@better-upload/client"
import { Loader2, Link as LinkIcon, Play } from "lucide-react"
import { toast } from "sonner"

interface ProjectFormProps {
  type: 'link' | 'run'
  initialData?: any
  onSuccess: () => void
  onCancel: () => void
}

export function ProjectForm({ type, initialData, onSuccess, onCancel }: ProjectFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    tags: initialData?.tags || "",
    link: initialData?.link || "",
    thumbnail: initialData?.thumbnail || "",
    storagePath: initialData?.storagePath || "",
  })

  const [uploadingRunFile, setUploadingRunFile] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = initialData 
        ? `/api/collections/${initialData.id}` 
        : '/api/collections'
      
      const method = initialData ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, type }),
      })

      if (response.ok) {
        onSuccess()
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleRunFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingRunFile(true)
    const fd = new FormData()
    
    // Support for folder upload (webkitRelativePath)
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      // Use webkitRelativePath if available to preserve folder structure
      const path = (file as any).webkitRelativePath || file.name
      fd.append("file", file, path)
    }

    try {
      const res = await fetch("/api/upload/run", {
        method: "POST",
        body: fd,
      })
      const data = await res.json()
      if (data.storagePath) {
        setFormData(prev => ({ ...prev, storagePath: data.storagePath }))
        toast.success("Files uploaded successfully!")
      } else if (data.error) {
        toast.error(data.error)
      }
    } catch (error) {
      console.error(error)
      toast.error("Upload failed")
    } finally {
      setUploadingRunFile(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Project Name</Label>
        <Input 
          id="name" 
          value={formData.name} 
          onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required 
          placeholder="Nama project..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description" 
          value={formData.description} 
          onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
          required 
          placeholder="Deskripsi singkat project..."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma separated)</Label>
        <Input 
          id="tags" 
          placeholder="web, animation, react"
          value={formData.tags} 
          onChange={e => setFormData(prev => ({ ...prev, tags: e.target.value }))}
        />
      </div>

      {type === 'link' ? (
        <div className="space-y-2">
          <Label htmlFor="link">Project Link</Label>
          <Input 
            id="link" 
            type="url"
            value={formData.link} 
            onChange={e => setFormData(prev => ({ ...prev, link: e.target.value }))}
            required 
            placeholder="https://example.com"
          />
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <Label>Thumbnail Image</Label>
            <ImageUpload 
              value={formData.thumbnail} 
              onChange={val => setFormData(prev => ({ ...prev, thumbnail: val }))}
              route="images"
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Upload Files (ZIP or Multiple Files)</Label>
              <Input 
                type="file" 
                multiple
                accept=".zip,.html,.js,.css,.png,.jpg,.jpeg,.json" 
                onChange={handleRunFileUpload}
                className="cursor-pointer"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Upload Folder (Directly)</Label>
              <Input 
                type="file" 
                // @ts-ignore
                webkitdirectory=""
                // @ts-ignore
                directory=""
                onChange={handleRunFileUpload}
                className="cursor-pointer"
              />
              <p className="text-[10px] text-muted-foreground">Pilih folder untuk upload seluruh isinya.</p>
            </div>

            {uploadingRunFile && (
              <div className="flex items-center gap-2 text-primary font-bold animate-pulse">
                <Loader2 className="animate-spin" size={16} />
                <span>Sedang mengupload...</span>
              </div>
            )}
            {formData.storagePath && (
              <div className="p-2 bg-green-500/10 border border-green-500/20 rounded text-xs text-green-500 font-medium">
                ✅ Project ID: {formData.storagePath}
              </div>
            )}
          </div>
        </>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={loading || uploadingRunFile}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? "Update Project" : "Add Project"}
        </Button>
      </div>
    </form>
  )
}
