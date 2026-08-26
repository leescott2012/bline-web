import { useCallback, useEffect, useState } from "react";
import { MessageSquare, Search, X } from "lucide-react";
import { SAMPLE_CONTACTS, inviteByText } from "@/lib/contacts";
import ProfileCard, { ProfileAvatar } from "@/components/ProfileCard";
import LocationShareSheet from "@/components/LocationShareSheet";
import { setProfile } from "@/lib/profile";
import { clearLocation } from "@/lib/location";
import {
  acceptRequest, grantLocationShare, listFriendships, removeFriendship, revokeLocationShare,
  searchProfiles, sendRequest, setSharingEnabled, type FriendEdge, type Profile,
} from "@/lib/friends";

// Instagram's visual language: near-white surfaces, a pill search field with no
// border, bold-but-small row titles over grey secondary text, and compact filled
// action buttons. Brand pink stands in for Instagram blue on primary actions.
const CARD = "rounded-2xl bg-white p-4 shadow-sm";
const FIELD = "w-full rounded-xl bg-[#efefef] px-4 py-3 text-[15px] text-zinc-900 outline-none placeholder:text-zinc-500";
const BTN_PRIMARY = "shrink-0 rounded-lg bg-accent px-4 py-1.5 text-[13px] font-semibold text-on-brand disabled:opacity-50";
const BTN_NEUTRAL = "shrink-0 rounded-lg bg-[#efefef] px-4 py-1.5 text-[13px] font-semibold text-zinc-900 disabled:opacity-50";

// Instagram's row shape: avatar, stacked name/handle, trailing action.
function Row({ title, subtitle, avatar, children }: {
  title: string; subtitle: string;
  avatar?: Pick<Profile, "username" | "display_name" | "avatar_url">;
  children?: React.ReactNode;
}) {
  return (
    <li className="flex items-center gap-3 py-1.5">
      <ProfileAvatar profile={avatar ?? { username: title, display_name: title, avatar_url: null }} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold leading-tight text-zinc-900">{title}</p>
        <p className="truncate text-[13px] leading-tight text-zinc-500">{subtitle}</p>
      </div>
      {children}
    </li>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-[15px] font-bold text-zinc-900">{children}</p>;
}

export default function FriendsPanel({ profile }: { profile: Profile }) {
  const userId = profile.id;
  // Off by default -- see supabase-location-migration-v2.sql. Falls back to
  // false, not true, so a not-yet-loaded profile never briefly reads as
  // "sharing on".
  const sharing = profile.sharing_enabled ?? false;
  const [edges, setEdges] = useState<FriendEdge[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  // Person to prompt for per-friend location consent, shown right after
  // their request is accepted. Not just a boolean -- we need their username
  // and id for the sheet and the grant.
  const [shareTarget, setShareTarget] = useState<Profile | null>(null);

  const refresh = useCallback(async () => {
    setEdges(await listFriendships(userId));
  }, [userId]);

  useEffect(() => { refresh(); }, [refresh]);

  // debounce so typing doesn't fire a query per keystroke
  useEffect(() => {
    const t = setTimeout(async () => setResults(await searchProfiles(query, userId)), 250);
    return () => clearTimeout(t);
  }, [query, userId]);

  const incoming = edges.filter((e) => e.status === "pending" && e.incoming);
  const outgoing = edges.filter((e) => e.status === "pending" && !e.incoming);
  const accepted = edges.filter((e) => e.status === "accepted");
  const edgeByOtherId = new Map(edges.map((e) => [e.other.id, e]));
  const searching = query.trim().length >= 2;

  const act = async (id: string, fn: () => Promise<unknown>) => {
    setBusyId(id);
    await fn();
    await refresh();
    setBusyId(null);
  };

  return (
    <div className="mx-3 mt-3 space-y-3">
      <ProfileCard profile={profile} onChange={setProfile} />

      {/* Sharing is opt-in, never assumed. Off is enforced by RLS on `locations`,
          so friends genuinely can't read your position -- not merely hidden. */}
      <div className={CARD}>
        <div className="flex items-center gap-3">
          <span className={`size-2.5 shrink-0 rounded-full ${sharing ? "bg-[#34d399]" : "bg-zinc-400"}`} />
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold text-zinc-900">
              {sharing ? "Sharing location" : "Location off"}
            </p>
            <p className="text-[13px] text-zinc-500">
              {sharing
                ? "Friends you allow see where you are. The crowd map counts you, anonymously."
                : "You're invisible to everyone, and out of the crowd map."}
            </p>
          </div>
          <button role="switch" aria-checked={sharing} aria-label="Share my location"
            onClick={() => {
              const next = !sharing;
              setProfile({ ...profile, sharing_enabled: next });
              setSharingEnabled(userId, next);
              // Stopping the publisher isn't enough on its own -- the last
              // position you sent would sit there until it aged out.
              if (!next) clearLocation(userId);
            }}
            className={`h-7 w-12 shrink-0 rounded-full p-0.5 transition-colors ${sharing ? "bg-accent" : "bg-zinc-300"}`}>
            <span className={`block size-6 rounded-full bg-white transition-transform ${sharing ? "translate-x-5" : ""}`} />
          </button>
        </div>
      </div>

      {/* search -- the visual anchor of the screen, Instagram-style */}
      <div className={CARD}>
        <div className="flex items-center gap-2 rounded-xl bg-[#efefef] px-3.5">
          <Search size={16} className="shrink-0 text-zinc-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by username"
            autoCapitalize="none"
            autoCorrect="off"
            aria-label="Search people by username"
            className="w-full bg-transparent py-3 text-[16px] text-zinc-900 outline-none placeholder:text-zinc-500"
          />
          {query && (
            <button aria-label="Clear search" onClick={() => setQuery("")} className="shrink-0 text-zinc-500">
              <X size={16} />
            </button>
          )}
        </div>
        <p className="mt-2 text-[13px] text-zinc-500">
          You are <span className="font-semibold text-zinc-900">@{profile.username}</span>
        </p>

        {searching && (
          <ul className="mt-2">
            {results.length === 0 && <li className="py-2 text-[13px] text-zinc-500">No one found.</li>}
            {results.map((p) => {
              const edge = edgeByOtherId.get(p.id);
              return (
                <Row key={p.id} title={p.display_name || p.username} subtitle={`@${p.username}`} avatar={p}>
                  {edge ? (
                    <span className="shrink-0 text-[13px] text-zinc-500">
                      {edge.status === "accepted" ? "Friends" : edge.incoming ? "Wants to add you" : "Requested"}
                    </span>
                  ) : (
                    <button disabled={busyId === p.id}
                      onClick={() => act(p.id, () => sendRequest(userId, p.id))}
                      className={BTN_PRIMARY}>
                      Add
                    </button>
                  )}
                </Row>
              );
            })}
          </ul>
        )}
      </div>

      {/* incoming requests -- the "accept" half of the flow */}
      {incoming.length > 0 && (
        <div className={CARD}>
          <SectionTitle>Requests</SectionTitle>
          <ul className="mt-1.5">
            {incoming.map((e) => (
              <Row key={e.id} title={e.other.display_name || e.other.username} subtitle={e.other.status ? e.other.status : `@${e.other.username}`} avatar={e.other}>
                <button disabled={busyId === e.id}
                  onClick={async () => {
                    await act(e.id, () => acceptRequest(e.id));
                    // Accepting only makes you friends -- it grants nothing.
                    // Ask separately whether to also share location with them.
                    setShareTarget(e.other);
                  }}
                  className={BTN_PRIMARY}>
                  Confirm
                </button>
                <button aria-label={`Decline ${e.other.username}`} disabled={busyId === e.id}
                  onClick={() => act(e.id, () => removeFriendship(e.id))}
                  className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#efefef] text-zinc-700 disabled:opacity-50">
                  <X size={15} />
                </button>
              </Row>
            ))}
          </ul>
        </div>
      )}

      {/* friends + still-pending outgoing */}
      <div className={CARD}>
        <SectionTitle>Friends</SectionTitle>
        {accepted.length === 0 && outgoing.length === 0 ? (
          <p className="mt-1.5 text-[13px] text-zinc-500">
            No friends yet — search a username above to add someone.
          </p>
        ) : (
          <ul className="mt-1.5">
            {accepted.map((e) => (
              <Row key={e.id} title={e.other.display_name || e.other.username} subtitle={e.other.status ? e.other.status : `@${e.other.username}`} avatar={e.other}>
                <button disabled={busyId === e.id}
                  onClick={() => act(e.id, async () => {
                    await removeFriendship(e.id);
                    // Ending the friendship should end any location grant you
                    // gave them too -- RLS scopes this delete to grants you
                    // own, so it's a no-op if you never shared with them.
                    await revokeLocationShare(userId, e.other.id);
                  })}
                  className={BTN_NEUTRAL}>
                  Remove
                </button>
              </Row>
            ))}
            {outgoing.map((e) => (
              <Row key={e.id} title={e.other.display_name || e.other.username} subtitle={e.other.status ? e.other.status : `@${e.other.username}`} avatar={e.other}>
                <span className="shrink-0 text-[13px] text-zinc-500">Requested</span>
              </Row>
            ))}
          </ul>
        )}
      </div>

      {/* Contacts: sample names for now, but Invite is real -- it opens the
          Messages composer prefilled. See src/lib/contacts.ts. */}
      <div className={CARD}>
        <div className="flex items-center gap-2">
          <SectionTitle>From your contacts</SectionTitle>
          <span className="rounded-md bg-[#efefef] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
            Sample
          </span>
        </div>
        <p className="mt-1 text-[13px] text-zinc-500">Not on B-line yet — invite them by text.</p>
        <ul className="mt-1.5">
          {SAMPLE_CONTACTS.map((c) => (
            <Row key={c.id} title={c.name} subtitle="Not on B-line">
              <button onClick={() => inviteByText(c)}
                className={`${BTN_NEUTRAL} flex items-center gap-1.5`}>
                <MessageSquare size={13} /> Invite
              </button>
            </Row>
          ))}
        </ul>
      </div>

      <LocationShareSheet
        open={!!shareTarget}
        username={shareTarget?.username ?? ""}
        onClose={() => setShareTarget(null)}
        onShare={async () => {
          if (shareTarget) await grantLocationShare(userId, shareTarget.id);
          setShareTarget(null);
        }}
      />
    </div>
  );
}
