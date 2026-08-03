import { useEffect, useState } from "react";
import Screen from "@/components/Screen";
import { useAuth, startAnonymousSession, signOut } from "@/lib/auth";
import FriendsPanel from "@/components/FriendsPanel";
import FriendsMap from "@/components/FriendsMap";
import { listFriendships, type FriendEdge } from "@/lib/friends";
import { usePublishLocation } from "@/lib/location";

// No email/SMS: one tap mints an anonymous Supabase user, then FriendsPanel
// immediately asks for the @username that actually identifies you to friends.
function StartCard() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    setBusy(true);
    setError(null);
    const { error: err } = await startAnonymousSession();
    setBusy(false);
    if (err) setError(err.message);
  };

  return (
    <div className="mx-3 mt-4 rounded-2xl bg-white p-6 text-center shadow-sm">
      <p className="text-[17px] font-bold text-zinc-900">Find your friends on the trail</p>
      <p className="mt-1 text-[14px] text-zinc-500">
        Pick a username — no email, no password, nothing to verify.
      </p>
      <button onClick={start} disabled={busy}
        className="mt-4 w-full rounded-xl bg-[#c9187e] py-3 text-[15px] font-semibold text-white disabled:opacity-50">
        {busy ? "Setting up…" : "Get started"}
      </button>
      {error && <p className="mt-2 text-[13px] text-red-600">{error}</p>}
    </div>
  );
}

export default function Friends() {
  const { user, loading } = useAuth();
  const [acceptedFriends, setAcceptedFriends] = useState<FriendEdge[]>([]);

  useEffect(() => {
    if (!user) return;
    listFriendships(user.id).then((edges) =>
      setAcceptedFriends(edges.filter((e) => e.status === "accepted")));
  }, [user]);

  // Publishes this device's position while signed in. The master switch inside
  // FriendsPanel gates who can READ it; RLS enforces that server-side.
  usePublishLocation(user?.id, !!user);
  return (
    <Screen className="bg-[#fafafa] text-zinc-900">
      <header className="pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="relative px-4 text-center">
          <p className="text-[22px] font-extrabold tracking-tight text-[#c9187e]">Ⓑ B-line</p>
          <h1 className="mt-0.5 text-[15px] font-bold tracking-[.08em] text-[#c9187e]">
            FRIENDS ON THE TRAIL
          </h1>
          {user && (
            <button onClick={() => signOut()}
              className="absolute right-4 top-1 text-[13px] font-semibold text-zinc-400">
              Sign out
            </button>
          )}
        </div>
      </header>

      {loading ? null : !user ? (
        <StartCard />
      ) : (
      <>
      <FriendsMap friends={acceptedFriends} meId={user.id} />

      <FriendsPanel userId={user.id} />
      </>
      )}
      <div className="h-[var(--bline-nav-space)]" />
    </Screen>
  );
}
