import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, ListChecks } from "lucide-react";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { formatStatus } from "../lib/utils";
import { fetchDashboard } from "../services/tasks";
import { useAuthStore } from "../store/authStore";
import { useAsync } from "../hooks/useAsync";

const colors = ["#0f766e", "#d97706", "#2563eb"];

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const { data, loading } = useAsync(fetchDashboard, []);

  if (loading) return <DashboardSkeleton />;

  const chartData = (data?.by_status || []).map((item) => ({
    name: formatStatus(item.status),
    value: item.total,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Good to see you, {user?.first_name || user?.username}. Here is the work pulse.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard icon={ListChecks} label="Total tasks" value={data.total_tasks} />
        <StatCard icon={CheckCircle2} label="Completed" value={data.completed_tasks} />
        <StatCard icon={AlertTriangle} label="Overdue" value={data.overdue_tasks} tone="danger" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Status breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={70} outerRadius={105} paddingAngle={4}>
                  {chartData.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tasks per user</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.tasks_per_user || []}>
                <XAxis dataKey="username" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="total" fill="#0f766e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 xl:grid-cols-[.8fr]">
        <Card>
          <CardHeader>
            <CardTitle>Due soon</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.due_soon?.length ? data.due_soon.map((task) => (
              <div key={task.id} className="rounded-md border p-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium">{task.title}</p>
                  <Badge variant="muted">{formatStatus(task.status)}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{task.project?.name}</p>
                <p className="mt-2 text-xs text-muted-foreground">Due {task.due_date}</p>
              </div>
            )) : <p className="text-sm text-muted-foreground">No upcoming due dates.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardContent className="flex items-center justify-between p-5">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="mt-2 text-3xl font-semibold">{value}</p>
          </div>
          <div className={tone === "danger" ? "text-destructive" : "text-primary"}>
            <Icon className="h-7 w-7" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-56" />
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <Skeleton className="h-80" />
    </div>
  );
}
