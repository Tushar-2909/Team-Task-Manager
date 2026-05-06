import { UserPlus } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { register } from "../services/auth";
import { useAuthStore } from "../store/authStore";
import { AuthShell } from "./LoginPage";

export function SignupPage() {
  const [form, setForm] = useState({ username: "", email: "", password: "", first_name: "", last_name: "" });
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const data = await register(form);
      setAuth(data);
      toast.success("Account created");
      navigate("/");
    } catch (error) {
      toast.error(Object.values(error.response?.data || {})?.[0]?.[0] || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell>
      <Card className="w-full max-w-md shadow-soft">
        <CardHeader>
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <UserPlus className="h-5 w-5" />
          </div>
          <CardTitle>Create account</CardTitle>
          <p className="text-sm text-muted-foreground">Create your account, then start a project or join your team.</p>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input placeholder="First name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
              <Input placeholder="Last name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Username</Label>
              <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={8} required />
            </div>
            <Button disabled={loading}>{loading ? "Creating..." : "Create account"}</Button>
          </form>
          <p className="mt-5 text-center text-sm text-muted-foreground">
            Already registered? <Link className="font-medium text-primary" to="/login">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </AuthShell>
  );
}
