import { DndContext, PointerSensor, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarClock, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";
import { formatPriority, formatStatus, isOverdue } from "../lib/utils";
import { fetchProjects } from "../services/projects";
import { createTask, deleteTask, fetchTasks, updateTask } from "../services/tasks";
import { useAuthStore } from "../store/authStore";
import { useAsync } from "../hooks/useAsync";

const statuses = ["TODO", "IN_PROGRESS", "DONE"];

export function TaskBoardPage() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "ADMIN";
  const { data: projectsData } = useAsync(fetchProjects, [], []);
  const { data: tasksData, loading, refetch, setData } = useAsync(() => fetchTasks(), [], []);
  const [filters, setFilters] = useState({ search: "", project: "", due: "" });
  const [form, setForm] = useState({ title: "", description: "", status: "TODO", priority: "MEDIUM", project_id: "", assigned_to_id: "", due_date: "" });
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const projects = Array.isArray(projectsData) ? projectsData : [];
  const tasks = Array.isArray(tasksData) ? tasksData : [];

  const filteredTasks = useMemo(() => tasks.filter((task) => {
    const matchesSearch = `${task.title} ${task.description}`.toLowerCase().includes(filters.search.toLowerCase());
    const matchesProject = filters.project ? String(task.project?.id) === filters.project : true;
    const matchesDue = filters.due === "overdue" ? isOverdue(task) : true;
    return matchesSearch && matchesProject && matchesDue;
  }), [tasks, filters]);

  const selectedProject = projects.find((project) => String(project.id) === String(form.project_id));

  async function submit(event) {
    event.preventDefault();
    try {
      const payload = {
        ...form,
        project_id: Number(form.project_id),
        assigned_to_id: form.assigned_to_id ? Number(form.assigned_to_id) : null,
        due_date: form.due_date || null,
      };
      await createTask(payload);
      setForm({ title: "", description: "", status: "TODO", priority: "MEDIUM", project_id: "", assigned_to_id: "", due_date: "" });
      toast.success("Task created");
      refetch();
    } catch (error) {
      toast.error(Object.values(error.response?.data || {})?.[0]?.[0] || "Could not create task");
    }
  }

  async function onDragEnd(event) {
    const { active, over } = event;
    if (!over) return;
    const task = tasks.find((item) => item.id === active.id);
    const targetTask = tasks.find((item) => item.id === over.id);
    const newStatus = statuses.includes(over.id) ? over.id : targetTask?.status;
    if (!task || task.status === newStatus || !statuses.includes(newStatus)) return;
    setData(tasks.map((item) => item.id === task.id ? { ...item, status: newStatus } : item));
    try {
      await updateTask(task.id, { status: newStatus });
      toast.success("Task moved");
    } catch {
      setData(tasks);
      toast.error("Could not move task");
    }
  }

  async function removeTask(id) {
    try {
      await deleteTask(id);
      setData(tasks.filter((task) => task.id !== id));
      toast.success("Task deleted");
    } catch {
      toast.error("Could not delete task");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Task Board</h1>
        <p className="mt-1 text-muted-foreground">Drag cards between columns to update status.</p>
      </div>
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5" /> New task</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 xl:grid-cols-[1fr_1fr_160px_180px_180px_auto]" onSubmit={submit}>
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Project</Label>
                <Select value={form.project_id} onChange={(e) => setForm({ ...form, project_id: e.target.value, assigned_to_id: "" })} required>
                  <option value="">Select</option>
                  {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Assignee</Label>
                <Select value={form.assigned_to_id} onChange={(e) => setForm({ ...form, assigned_to_id: e.target.value })}>
                  <option value="">Unassigned</option>
                  {selectedProject?.members?.map((member) => <option key={member.id} value={member.id}>{member.username}</option>)}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Due</Label>
                <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
              </div>
              <Button className="xl:col-start-6">Create</Button>
            </form>
          </CardContent>
        </Card>
      )}
      <div className="grid gap-3 md:grid-cols-[1fr_220px_180px]">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search tasks" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
        </div>
        <Select value={filters.project} onChange={(e) => setFilters({ ...filters, project: e.target.value })}>
          <option value="">All projects</option>
          {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
        </Select>
        <Select value={filters.due} onChange={(e) => setFilters({ ...filters, due: e.target.value })}>
          <option value="">All due dates</option>
          <option value="overdue">Overdue</option>
        </Select>
      </div>
      {loading ? <p className="text-muted-foreground">Loading tasks...</p> : (
        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          <div className="grid gap-4 xl:grid-cols-3">
            {statuses.map((status) => (
              <TaskColumn key={status} status={status} tasks={filteredTasks.filter((task) => task.status === status)} onDelete={removeTask} canDelete={isAdmin} />
            ))}
          </div>
        </DndContext>
      )}
    </div>
  );
}

function TaskColumn({ status, tasks, onDelete, canDelete }) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <section ref={setNodeRef} className={`min-h-[28rem] rounded-lg border bg-muted/35 p-3 ${isOver ? "ring-2 ring-ring" : ""}`}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">{formatStatus(status)}</h2>
        <Badge variant="muted">{tasks.length}</Badge>
      </div>
      <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {tasks.map((task) => <TaskCard key={task.id} task={task} onDelete={onDelete} canDelete={canDelete} />)}
        </div>
      </SortableContext>
    </section>
  );
}

function TaskCard({ task, onDelete, canDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <article ref={setNodeRef} style={style} {...attributes} {...listeners} className={`rounded-lg border bg-card p-4 shadow-sm ${isDragging ? "opacity-70" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-medium">{task.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{task.description || "No description."}</p>
        </div>
        {canDelete && (
          <Button variant="ghost" size="icon" onClick={() => onDelete(task.id)} aria-label="Delete task">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        )}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge variant={isOverdue(task) ? "danger" : "warning"}><CalendarClock className="mr-1 h-3 w-3" />{task.due_date || "No due date"}</Badge>
        <Badge variant={task.priority === "URGENT" || task.priority === "HIGH" ? "danger" : "muted"}>{formatPriority(task.priority)}</Badge>
        <Badge variant="muted">{task.project?.name}</Badge>
        {task.assigned_to && <Badge>{task.assigned_to.username}</Badge>}
      </div>
    </article>
  );
}
