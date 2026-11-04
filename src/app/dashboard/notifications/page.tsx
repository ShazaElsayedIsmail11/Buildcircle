import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import Link from "next/link";
import { EmptyState } from "@/app/EmptyState";
import MarkAllRead from './MarkAllRead'

export default async function Notifications() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user?.id)
    .order("created_at", { ascending: false });

  await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", user?.id)
    .eq("is_read", false);

  return (
    <div>
        <MarkAllRead />
      <h1 className="text-2xl font-semibold mb-6">Notifications</h1>

      {(!notifications || notifications.length === 0) && (
        <EmptyState
          icon="🔔"
          title="No notifications yet"
          subtitle="You're all caught up."
        />
      )}

      <div className="space-y-2">
        {notifications?.map((n) => (
          <Link
            key={n.id}
            href={n.link || "#"}
            className="block bg-bg-surface border border-border rounded-xl p-4 hover:border-accent transition"
          >
            <p className="text-sm">{n.message}</p>
            <p className="text-text-muted text-xs mt-1">
              {new Date(n.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
