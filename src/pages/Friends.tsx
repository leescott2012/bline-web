import { useEffect, useState } from "react";
import Screen from "@/components/Screen";
import { signOut } from "@/lib/auth";
import { useProfile } from "@/lib/profile";
import FriendsPanel from "@/components/FriendsPanel";
import FriendsMap from "@/components/FriendsMap";

import { listFriendships, type FriendEdge } from "@/lib/friends";

// Sign-in and username picking both moved to first launch (see Onboarding), so
// by the time anyone gets here they already have a profile and are already
// publishing a position.
export default function Friends() {
  const { profile } = useProfile();
  const meId = profile?.id;
  const [acceptedFriends, setAcceptedFriends] = useState<FriendEdge[]>([]);

  useEffect(() => {
    if (!meId) return;
    listFriendships(meId).then((edges) =>
      setAcceptedFriends(edges.filter((e) => e.status === "accepted")));
  }, [meId]);

  return (
    <Screen className="bg-[#fafafa] text-zinc-900">
      <header className="pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="relative px-4 text-center">
          <p className="text-[22px] font-extrabold tracking-tight text-[#c9187e]">Ⓑ B-line</p>
          <h1 className="mt-0.5 text-[15px] font-bold tracking-[.08em] text-[#c9187e]">
            FRIENDS ON THE TRAIL
          </h1>
          <button onClick={() => signOut()}
            className="absolute right-4 top-1 text-[13px] font-semibold text-zinc-400">
            Sign out
          </button>
        </div>
      </header>

      {profile && (
        <>
          <FriendsMap friends={acceptedFriends} meId={profile.id} />
          <FriendsPanel profile={profile} />
        </>
      )}
      <div className="h-[var(--bline-nav-space)]" />
    </Screen>
  );
}
