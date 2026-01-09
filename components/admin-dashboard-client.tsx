"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ProjectCard } from "@/components/project-card";
import { ProjectForm } from "@/components/project-form";
import {
  Plus,
  Link as LinkIcon,
  Play,
  LogOut,
  Loader2,
  RefreshCw,
  Activity,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

export function AdminDashboardClient() {
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [activeFormType, setActiveFormType] = useState<"link" | "run">("link");
  const [realTimeStats, setRealTimeStats] = useState({
    activeUsers: 0,
    apiCalls: 0,
  });

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/collections");
      const data = await res.json();
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Gagal mengambil data project");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (data.totalHits !== undefined) {
        setRealTimeStats({
          activeUsers: data.activeUsers,
          apiCalls: data.totalHits,
        });
      }
    } catch (err) {
      console.error("Stats fetch error", err);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchStats();

    // Real-time updates from Backend
    const interval = setInterval(() => {
      fetchStats();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus project ini, Tuan?")) return;

    try {
      const res = await fetch(`/api/collections/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Project dihapus!");
        fetchProjects();
      }
    } catch (error) {
      toast.error("Gagal menghapus project");
    }
  };

  const handleEdit = (project: any) => {
    setEditingProject(project);
    setActiveFormType(project.type);
    setIsFormOpen(true);
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      toast.success("Logout Berhasil!");
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      toast.error("Logout Gagal!");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header & Stats Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-600 mb-1">
            <ShieldCheck size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Session Active</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-blue-900">VOXY ADMIN</h1>
          <p className="text-blue-600/70 text-sm">Real-time Dashboard — Monitoring projects & services.</p>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm flex items-center gap-4 min-w-[140px]">
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <Activity size={20} className="animate-pulse" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">Live Users</div>
              <div className="text-xl font-black text-blue-900">{realTimeStats.activeUsers}</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-blue-100 shadow-sm flex items-center gap-4 min-w-[140px]">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <RefreshCw size={20} />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase">Total Hits</div>
              <div className="text-xl font-black text-blue-900">{realTimeStats.apiCalls.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b pb-6">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={fetchProjects}
            disabled={loading}
            className="rounded-xl border-blue-100 text-blue-600 hover:bg-blue-50"
          >
            <RefreshCw className={loading ? "animate-spin" : ""} size={18} />
          </Button>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <div className="flex gap-2">
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingProject(null);
                    setActiveFormType("link");
                  }}
                  className="bg-blue-600 hover:bg-blue-700 font-bold rounded-xl px-6"
                >
                  <LinkIcon className="mr-2 w-4 h-4" /> Add Link
                </Button>
              </DialogTrigger>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingProject(null);
                    setActiveFormType("run");
                  }}
                  variant="secondary"
                  className="font-bold rounded-xl px-6"
                >
                  <Play className="mr-2 w-4 h-4" /> Add Run
                </Button>
              </DialogTrigger>
            </div>
            <DialogContent className="sm:max-w-[600px] overflow-y-auto max-h-[90vh] rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black uppercase text-blue-900">
                  {editingProject ? "Edit Project" : `Add via ${activeFormType}`}
                </DialogTitle>
              </DialogHeader>
              <ProjectForm
                type={activeFormType}
                initialData={editingProject}
                onSuccess={() => {
                  setIsFormOpen(false);
                  fetchProjects();
                  toast.success("Berhasil disimpan!");
                }}
                onCancel={() => setIsFormOpen(false)}
              />
            </DialogContent>
          </Dialog>
          <Button
            variant="destructive"
            size="icon"
            onClick={handleLogout}
            className="rounded-xl"
          >
            <LogOut size={18} />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 h-12 bg-blue-50/50 p-1 rounded-xl">
          <TabsTrigger
            value="all"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm font-bold"
          >
            Semua
          </TabsTrigger>
          <TabsTrigger
            value="link"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm font-bold"
          >
            Link
          </TabsTrigger>
          <TabsTrigger
            value="run"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm font-bold"
          >
            Run
          </TabsTrigger>
        </TabsList>

        <div className="mt-8">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="animate-spin text-blue-600" size={48} />
              <p className="text-blue-600/60 font-medium animate-pulse">Syncing data...</p>
            </div>
          ) : (
            <>
              <TabsContent value="all">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((p) => (
                    <ProjectCard
                      key={p.id}
                      project={p}
                      isAdmin
                      onDelete={handleDelete}
                      onEdit={handleEdit}
                    />
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="link">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects
                    .filter((p) => p.type === "link")
                    .map((p) => (
                      <ProjectCard
                        key={p.id}
                        project={p}
                        isAdmin
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                      />
                    ))}
                </div>
              </TabsContent>
              <TabsContent value="run">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects
                    .filter((p) => p.type === "run")
                    .map((p) => (
                      <ProjectCard
                        key={p.id}
                        project={p}
                        isAdmin
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                      />
                    ))}
                </div>
              </TabsContent>
            </>
          )}
        </div>
      </Tabs>
    </div>
  );
}
