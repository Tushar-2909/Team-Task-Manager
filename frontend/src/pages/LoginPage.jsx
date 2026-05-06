import { motion } from "framer-motion";
import { LockKeyhole } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { login } from "../services/auth";
import { useAuthStore } from "../store/authStore";

export function LoginPage() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const data = await login(form);
      setAuth(data);
      toast.success("Welcome back");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.non_field_errors?.[0] || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <Card className="w-full max-w-md shadow-soft">
        <CardHeader>
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <CardTitle>Sign in</CardTitle>
          <p className="text-sm text-muted-foreground">Use your workspace credentials to continue.</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label>Username</Label>
              <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            </div>
            <Button className="w-full" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</Button>
          </form>
          <p className="mt-5 text-center text-sm text-muted-foreground">
            New here? <Link className="font-medium text-primary" to="/signup">Create an account</Link>
          </p>
        </CardContent>
      </Card>
    </AuthShell>
  );
}

export function AuthShell({ children }) {
  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-[1fr_520px]">
      <section className="hidden bg-[linear-gradient(135deg,hsl(176_56%_28%),hsl(33_86%_72%))] p-10 text-white lg:flex lg:flex-col lg:justify-end">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-xl">
          <h1 className="text-5xl font-semibold leading-tight">Team Task Manager</h1>
          <p className="mt-4 text-lg text-white/85">Plan projects, assign work, and keep delivery visible without the usual tab overload.</p>
        </motion.div>
      </section>
      <section className="flex items-center justify-center px-4 py-10">{children}</section>
    </div>
  );
}
