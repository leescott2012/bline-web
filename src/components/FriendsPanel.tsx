import { useCallback, useEffect, useState } from "react";
import { Check, MessageSquare, Search, X } from "lucide-react";
import { SAMPLE_CONTACTS, inviteByText } from "@/lib/contacts";
import {
  acceptRequest, claimUsername, getMyProfile, listFriendships, removeFriendship,
  searchProfiles, sendRequest, getSharingEnabled, setSharingEnabled,
  type FriendEdge, type Profile,
} from "@/lib/friends";

const USERNAME_RE = /^[a-z0-9_.]{3,20}$/;

// Instagram's visual language: near-white surfaces, a pill search field with no
// border, bold-but-small row titles over grey secondary text, and compact filled
// action buttons. Brand pink stands in for Instagram blue on primary actions.
const CARD = "rounded-2xl bg-white p-4 shadow-sm";
const FIELD = "w-full rounded-xl bg-[#efefef] px-4 py-3 text-[15px] text-zinc-900 outline-none placeholder:text-zinc-500";
const BTN_PRIMARY = "shrink-0 rounded-lg bg-[#c9187e] px-4 py-1.5 text-[13px] font-semibold text-white disabled:opacity-50";
const BTN_NEUTRAL = "shrink-0 rounded-lg bg-[#efefef] px-4 py-1.5 text-[13px] font-semibold text-zinc-900 disabled:opacity-50";

// First run after sign-in: pick the @handle other people will search for.
function UsernamePicker({ userId, onDone }: { userId: string; onDone: () => void }) {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const handle = username.trim().toLowerCase();
    if (!USERNAME_RE.test(handle)) {
      setError("3–20 characters: letters, numbers, underscore or dot.");
      return;
    }
    setSaving(true);
    setError(null);
    const { error: err } = await claimUsername(userId, handle, displayName.trim() || handle);
    setSaving(false);
    // 23505 = unique violation, i.e. the handle is taken
    if (err) setError(err.code === "23505" ? "That username is taken." : err.message);
    else onDone();
  };

  return (
    <div className={`mx-3 mt-4 ${CARD}`}>
      <p className="text-[17px] font-bold text-zinc-900">Pick your username</p>
      <p className="mt-1 text-[14px] text-zinc-500">This is how friends find you on B-line.</p>
      <form onSubmit={submit} className="mt-4 space-y-2.5">
        <div className="flex items-center rounded-xl bg-[#efefef] px-4">
          <span className="text-zinc-500">@</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="yourname"
            autoCapitalize="none"
            autoCorrect="off"
            className="w-full bg-transparent py-3 pl-1 text-[15px] text-zinc-900 outline-none placeholder:text-zinc-500"
          />
        </div>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Display name (optional)"
          className={FIELD}
        />
        <button type="submit" disabled={saving}
          className="w-full rounded-xl bg-[#c9187e] py-3 text-[15px] font-semibold text-white disabled:opacity-50">
          {saving ? "Saving…" : "Continue"}
        </button>
        {error && <p className="text-center text-[13px] text-red-600">{error}</p>}
      </form>
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <div className="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#c9187e] to-[#7c3aed] text-[16px] font-semibold text-white">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

// Instagram's row shape: avatar, stacked name/handle, trailing action.
function Row({ title, subtitle, children }: { title: string; subtitle: string; children?: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3 py-1.5">
      <Avatar name={title} />
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

export default function FriendsPanel({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checkedProfile, setCheckedProfile] = useState(false);
  const [edges, setEdges] = useState<FriendEdge[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [sharing, setSharing] = useState(true);

  const refresh = useCallback(async () => {
    setEdges(await listFriendships(userId));
  }, [userId]);

  useEffect(() => {
    getMyProfile(userId).then((p) => {
      setProfile(p);
      setCheckedProfile(true);
      if (p) {
        refresh();
        getSharingEnabled(userId).then(setSharing);
      }
    });
  }, [userId, refresh]);

  // debounce so typing doesn't fire a query per keystroke
  useEffect(() => {
    if (!profile) return;
    const t = setTimeout(async () => setResults(await searchProfiles(query, userId)), 250);
    return () => clearTimeout(t);
  }, [query, userId, profile]);

  if (!checkedProfile) return null;
  if (!profile) {
    return <UsernamePicker userId={userId} onDone={() => getMyProfile(userId).then((p) => { setProfile(p); refresh(); })} />;
  }

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
              {sharing ? "Friends you allow can see where you are." : "You're invisible to everyone."}
            </p>
          </div>
          <button role="switch" aria-checked={sharing} aria-label="Share my location"
            onClick={() => { const next = !sharing; setSharing(next); setSharingEnabled(userId, next); }}
            className={`h-7 w-12 shrink-0 rounded-full p-0.5 transition-colors ${sharing ? "bg-[#c9187e]" : "bg-zinc-300"}`}>
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
            className="w-full bg-transparent py-3 text-[15px] text-zinc-900 outline-none placeholder:text-zinc-500"
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
                <Row key={p.id} title={p.display_name || p.username} subtitle={`@${p.username}`}>
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
              <Row key={e.id} title={e.other.display_name || e.other.username} subtitle={`@${e.other.username}`}>
                <button disabled={busyId === e.id}
                  onClick={() => act(e.id, () => acceptRequest(e.id))}
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
              <Row key={e.id} title={e.other.display_name || e.other.username} subtitle={`@${e.other.username}`}>
                <button disabled={busyId === e.id}
                  onClick={() => act(e.id, () => removeFriendship(e.id))}
                  className={BTN_NEUTRAL}>
                  Remove
                </button>
              </Row>
            ))}
            {outgoing.map((e) => (
              <Row key={e.id} title={e.other.display_name || e.other.username} subtitle={`@${e.other.username}`}>
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
    </div>
  );
}
