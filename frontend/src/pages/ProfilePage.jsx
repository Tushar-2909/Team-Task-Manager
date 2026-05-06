import { ShieldCheck, UserRound } from "lucide-react";

import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { useAuthStore } from "../store/authStore";

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Profile</h1>
        <p className="mt-1 text-muted-foreground">Account details used across projects and tasks.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><UserRound className="h-5 w-5" /> {user?.username}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Info label="Name" value={`${user?.first_name || ""} ${user?.last_name || ""}`.trim() || "Not set"} />
          <Info label="Email" value={user?.email || "Not set"} />
          <Info label="Role" value={<Badge><ShieldCheck className="mr-1 h-3 w-3" />{user?.role}</Badge>} />
        </CardContent>
      </Card>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-md border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}
