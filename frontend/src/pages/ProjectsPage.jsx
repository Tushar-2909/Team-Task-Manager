import { FolderPlus, Trash2, UserMinus, UserPlus } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select } from "../components/ui/select";
import { addMember, createProject, deleteProject, fetchProjects, removeMember } from "../services/projects";
import { fetchUsers } from "../services/users";
import { useAuthStore } from "../store/authStore";
import { useAsync } from "../hooks/useAsync";

export function ProjectsPage() {
  const user = useAuthStore((state) => state.user);
  const setAuth = useAuthStore((state) => state.setAuth);
  const [form, setForm] = useState({ name: "", description: "" });
  const [memberForms, setMemberForms] = useState({});
  const { data: projectsData, loading, refetch } = useAsync(fetchProjects, [], []);
  const { data: usersData } = useAsync(fetchUsers, [], []);
  const projects = Array.isArray(projectsData) ? projectsData : [];
  const users = Array.isArray(usersData) ? usersData : [];

  async function submit(event) {
    event.preventDefault();
    try {
      await createProject(form);
      if (user?.role !== "ADMIN") {
        const currentAuth = useAuthStore.getState();
        setAuth({
          access: currentAuth.access,
          refresh: currentAuth.refresh,
          user: { ...currentAuth.user, role: "ADMIN" },
        });
      }
      setForm({ name: "", description: "" });
      toast.success("Project created");
      refetch();
    } catch {
      toast.error("Could not create project");
    }
  }

  async function addProjectMember(projectId) {
    const userId = memberForms[projectId];
    if (!userId) return;
    try {
      await addMember(projectId, Number(userId));
      setMemberForms({ ...memberForms, [projectId]: "" });
      toast.success("Member added");
      refetch();
    } catch {
      toast.error("Could not add member");
    }
  }

  async function removeProjectMember(projectId, userId) {
    try {
      await removeMember(projectId, userId);
      toast.success("Member removed");
      refetch();
    } catch {
      toast.error("Could not remove member");
    }
  }

  async function remove(id) {
    try {
      await deleteProject(id);
      toast.success("Project deleted");
      refetch();
    } catch {
      toast.error("Only the project owner admin can delete this project");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-semibold">Projects</h1>
          <p className="mt-1 text-muted-foreground">Organize workspaces and team membership.</p>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FolderPlus className="h-5 w-5" /> New project</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 lg:grid-cols-[280px_1fr_auto]" onSubmit={submit}>
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <Button className="self-end">Create</Button>
          </form>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? <p className="text-muted-foreground">Loading projects...</p> : projects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <CardTitle>{project.name}</CardTitle>
                {project.owner?.id === user.id && (
                  <Button variant="ghost" size="icon" onClick={() => remove(project.id)} aria-label="Delete project">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground">Owner: {project.owner?.username}</p>
            </CardHeader>
            <CardContent>
              <p className="min-h-12 text-sm text-muted-foreground">{project.description || "No description yet."}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {project.members?.map((member) => (
                  <Badge key={member.id} variant="muted" className="gap-1">
                    {member.username}
                    {project.owner?.id === user.id && member.id !== user.id && (
                      <button type="button" onClick={() => removeProjectMember(project.id, member.id)} aria-label={`Remove ${member.username}`}>
                        <UserMinus className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
              {project.owner?.id === user.id && (
                <div className="mt-4 flex gap-2">
                  <Select value={memberForms[project.id] || ""} onChange={(event) => setMemberForms({ ...memberForms, [project.id]: event.target.value })}>
                    <option value="">Add member</option>
                    {users
                      .filter((candidate) => !project.members?.some((member) => member.id === candidate.id))
                      .map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.username}</option>)}
                  </Select>
                  <Button type="button" size="icon" onClick={() => addProjectMember(project.id)} aria-label="Add member">
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
