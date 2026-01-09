'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Play, Trash2, Edit, Eye } from "lucide-react"
import Link from "next/link"

interface Project {
  id: string
  type: 'link' | 'run'
  name: string
  description: string
  tags: string | null
  link?: string | null
  thumbnail?: string | null
  views?: number
}

interface ProjectCardProps {
  project: Project
  isAdmin?: boolean
  onDelete?: (id: string) => void
  onEdit?: (project: Project) => void
}

export function ProjectCard({ project, isAdmin, onDelete, onEdit }: ProjectCardProps) {
  const tags = project.tags ? project.tags.split(',').map(t => t.trim()) : []

  const previewUrl = project.type === 'link' 
    ? project.link 
    : `/runner/${project.id}/index.html`;

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-all border-muted">
      <div className="aspect-video relative bg-muted flex items-center justify-center overflow-hidden">
        {previewUrl ? (
          <div className="w-full h-full relative">
            <iframe 
              src={previewUrl} 
              className="w-[1024px] h-[576px] origin-top-left border-none pointer-events-none select-none"
              style={{ 
                transform: 'scale(0.35)', // Scale down to fit aspect-video (approx)
                width: '285.7%', // 100 / 0.35
                height: '285.7%'
              }}
              scrolling="no"
              loading="lazy"
              sandbox="allow-scripts allow-same-origin"
            />
            {/* Overlay to prevent interaction and handle group hover */}
            <div className="absolute inset-0 z-10 bg-transparent" />
          </div>
        ) : (
          <div className="text-muted-foreground flex flex-col items-center">
            {project.type === 'link' ? <ExternalLink size={40} /> : <Play size={40} />}
            <span className="text-xs mt-2 font-mono uppercase opacity-50">{project.type}</span>
          </div>
        )}
      </div>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold line-clamp-1">{project.name}</CardTitle>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <>
                <div className="flex items-center gap-1 text-[10px] font-bold text-blue-500/60 bg-blue-50 px-2 py-1 rounded-full">
                  <Eye size={12} />
                  {project.views || 0}
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => onEdit?.(project)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => onDelete?.(project.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
        <CardDescription className="line-clamp-2 h-10">{project.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1">
          {tags.map((tag, i) => (
            <Badge key={i} variant="secondary" className="text-[10px] px-2 py-0">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        {project.type === 'link' ? (
          <Button asChild className="w-full">
            <Link href={`/view/link/${project.id}`}>
              <ExternalLink className="mr-2 w-4 h-4" />
              View Project
            </Link>
          </Button>
        ) : (
          <Button asChild className="w-full" variant="default">
            <Link href={`/view/run/${project.id}`}>
              <Play className="mr-2 w-4 h-4" />
              Run Preview
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
