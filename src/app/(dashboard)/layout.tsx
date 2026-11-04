import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/navbar";
import type { Profile } from "@/lib/types";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Auto-create profile if missing (handles users created before trigger was set up)
  if (!profile) {
    const username = user.email?.split("@")[0] ?? "user";
    const { data: created } = await supabase
      .from("profiles")
      .insert({ id: user.id, username, role: "cashier" })
      .select()
      .single();
    profile = created;
  }

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col h-full">
      <Navbar profile={profile as Profile} />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
