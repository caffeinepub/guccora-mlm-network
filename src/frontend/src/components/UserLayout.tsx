import { Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { getToken } from "../utils/format";
import { BottomNav } from "./BottomNav";

export function UserLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!getToken()) {
      navigate({ to: "/login" });
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-mesh">
      <main className="pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
