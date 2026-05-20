import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft, LogIn, School } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isAdminLoggedIn, setAdminLoggedIn } from "@/lib/admin-storage";

const DEMO_USERNAME = "admin";
const DEMO_PASSWORD = "1234";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (isAdminLoggedIn()) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
      setAdminLoggedIn();
      navigate("/admin", { replace: true });
      return;
    }

    setError("帳號或密碼錯誤");
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-8"
      style={{
        background: "linear-gradient(180deg, hsl(150 35% 88%) 0%, hsl(200 55% 92%) 55%, hsl(42 38% 96%) 100%)",
      }}
    >
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-card">
            <School className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">後台管理登入</h1>
          <p className="mt-1 text-sm text-muted-foreground">三棧國小行動校園 App</p>
        </div>

        <form onSubmit={handleSubmit} className="card-base space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="username">帳號</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="rounded-xl"
              placeholder="請輸入帳號"
              autoComplete="username"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">密碼</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-xl"
              placeholder="請輸入密碼"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full rounded-xl">
            <LogIn className="h-4 w-4" />
            登入
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            示範帳號：admin · 示範密碼：1234
          </p>
        </form>

        <div className="mt-4 text-center">
          <Button variant="link" asChild className="text-primary">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              返回前台
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
