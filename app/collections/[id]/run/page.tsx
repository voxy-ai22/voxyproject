'use client'

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Maximize2, RefreshCw, Loader2, Info } from "lucide-react"
import Link from "next/link"

export default function RunPreviewPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [key, setKey] = useState(0) // Used to force reload iframe

  useEffect(() => {
    // Record view when running the preview
    fetch(`/api/collections/${params.id}/view`, { method: "POST" }).catch(() => {});

    fetch(`/api/collections/${params.id}`)
      .then(res => res.json())
      .then(data => {
        setProject(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.id])

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4 text-center">
        <div className="text-6xl">🚫</div>
        <h2 className="text-2xl font-bold">Project tidak ditemukan!</h2>
        <Button asChild>
          <Link href="/">Kembali ke Showcase</Link>
        </Button>
      </div>
    )
  }

  const previewUrl = `/api/preview/${project.storagePath}/index.html`

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-black">
      {/* Top Bar */}
      <div className="bg-muted/10 backdrop-blur-xl border-b px-4 h-14 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/"><ArrowLeft size={20} /></Link>
          </Button>
          <div>
            <h1 className="text-sm font-bold line-clamp-1">{project.name}</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">LIVE PREVIEW</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="hidden sm:flex h-9" onClick={() => setKey(k => k + 1)}>
            <RefreshCw size={14} className="mr-2" /> Reload
          </Button>
          <Button variant="outline" size="sm" asChild className="h-9">
            <a href={previewUrl} target="_blank" rel="noopener noreferrer">
              <Maximize2 size={14} className="mr-2" /> Open Full
            </a>
          </Button>
        </div>
      </div>

      {/* Sandbox Iframe */}
      <div className="flex-1 relative bg-white">
        <iframe 
          key={key}
          src={previewUrl} 
          className="w-full h-full border-none"
          title={project.name}
          sandbox="allow-scripts allow-forms allow-modals allow-popups allow-same-origin"
        />
      </div>

      {/* Details Footer (Collapsible or small info) */}
      <div className="p-2 bg-muted/20 border-t flex items-center justify-center gap-4 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1">
          <Info size={10} />
          <span>Running in Voxy Sandbox v1.0</span>
        </div>
        <span>•</span>
        <span>Storage ID: {project.storagePath}</span>
      </div>
    </div>
  )
}
