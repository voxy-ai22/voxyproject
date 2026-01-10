'use client'

import { useEffect, useState } from "react"
import { ProjectCard } from "@/components/project-card"
import { Input } from "@/components/ui/input"
import { Search, Rocket } from "lucide-react"

export default function LandingPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetch("/api/collections")
      .then(res => res.json())
      .then(data => {
        setProjects(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.tags && p.tags.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="container mx-auto px-4 py-12 space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
          Selamat Datang di <span className="text-primary">Voxy Project!</span>
        </h1>
        <p className="text-xl text-muted-foreground font-medium">
          “Kalian boleh coba web bikin Gobel. Inilah koleksi saya. Kalau ada bug lapor admin ya 🤗”
        </p>
      </section>

      {/* Search & Filter */}
      <div className="max-w-md mx-auto relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
        <Input 
          className="pl-10 h-12 rounded-2xl bg-muted/50 border-muted focus:bg-background transition-all"
          placeholder="Cari project atau tag..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-80 rounded-3xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 space-y-4">
          <div className="text-6xl">🙈</div>
          <h3 className="text-xl font-bold">Project tidak ditemukan</h3>
          <p className="text-muted-foreground">Coba gunakan kata kunci lain atau cek lagi nanti.</p>
        </div>
      )}
    </div>
  )
}
