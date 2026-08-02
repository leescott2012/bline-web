import { useCallback, useEffect, useState } from "react";
import { Check, MessageSquare, Search, UserPlus, X } from "lucide-react";
import { SAMPLE_CONTACTS, inviteByText } from "@/lib/contacts";
import {
  acceptRequest, claimUsername, getMyProfile, listFriendships, removeFriendship,
  searchProfiles, sendRequest, type FriendEdge, type Profile,
} from "@/lib/friends";

const USERNAME_RE = /^[a-z0-9_.]{3,20}$/;

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
    <div className="mx-3 mt-4 rounded-3xl bg-white/90 p-6 shadow-xl backdrop-blur">
      <p className="text-lg font-bold text-[#c9187e]">Pick your username</p>
      <p className="mt-1 text-zinc-600">This is how friends find you on B-line.</p>
      <form onSubmit={submit} className="mt-4 space-y-3">
        <div className="flex items-center rounded-full border border-zinc-300 px-4">
          <span className="text-zinc-400">@</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="yourname"
            autoCapitalize="none"
            autoCorrect="off"
            className="w-full bg-transparent py-3 pl-1 text-zinc-900 outline-none"
          />
        </div>
        <input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Display name (optional)"
          className="w-full rounded-full border border-zinc-300 px-4 py-3 text-zinc-900 outline-none"
        />
        <button type="submit" disabled={saving}
          className="w-full rounded-full bg-[#c9187e] py-3.5 text-lg font-semibold text-white disabled:opacity-50">
          {saving ? "Saving…" : "Continue"}
        </button>
        {error && <p className="text-center text-sm text-red-600">{error}</p>}
      </form>
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  return (
    <div className="grid size-11 shrink-0 place-items-center rounded-full bg-[#c9187e] text-lg font-bold text-white">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export default function FriendsPanel({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checkedProfile, setCheckedProfile] = useState(false);
  const [edges, setEdges] = useState<FriendEdge[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setEdges(await listFriendships(userId));
  }, [userId]);

  useEffect(() => {
    getMyProfile(userId).then((p) => {
      setProfile(p);
      setCheckedProfile(true);
      if (p) refresh();
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

  const act = async (id: string, fn: () => Promise<unknown>) => {
    setBusyId(id);
    await fn();
    await refresh();
    setBusyId(null);
  };

  return (
    <div className="mx-3 mt-3 space-y-3">
      {/* search */}
      <div className="rounded-3xl bg-white/90 p-4 shadow-xl backdrop-blur">
        <p className="text-sm text-zinc-500">You are <span className="font-bold text-[#c9187e]">@{profile.username}</span></p>
        <div className="mt-2 flex items-center gap-2 rounded-full border border-zinc-300 px-4">
          <Search size={16} className="shrink-0 text-zinc-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by username"
            autoCapitalize="none"
            autoCorrect="off"
            className="w-full bg-transparent py-2.5 text-zinc-900 outline-none"
          />
        </div>

        {query.trim().length >= 2 && (
          <ul className="mt-3 space-y-2">
            {results.length === 0 && <li className="text-sm text-zinc-500">No one found.</li>}
            {results.map((p) => {
              const edge = edgeByOtherId.get(p.id);
              return (
                <li key={p.id} className="flex items-center gap-3">
                  <Avatar name={p.display_name || p.username} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-zinc-900">{p.display_name || p.username}</p>
                    <p className="truncate text-sm text-zinc-500">@{p.username}</p>
                  </div>
                  {edge ? (
                    <span className="shrink-0 text-sm text-zinc-500">
                      {edge.status === "accepted" ? "Friends" : edge.incoming ? "Wants to add you" : "Requested"}
                    </span>
                  ) : (
                    <button
                      disabled={busyId === p.id}
                      onClick={() => act(p.id, () => sendRequest(userId, p.id))}
                      className="flex shrink-0 items-center gap-1 rounded-full bg-[#c9187e] px-3.5 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      <UserPlus size={14} /> Add
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* incoming requests -- the "accept" half of the flow */}
      {incoming.length > 0 && (
        <div className="rounded-3xl bg-white/90 p-4 shadow-xl backdrop-blur">
          <p className="font-bold text-zinc-900">Requests</p>
          <ul className="mt-2 space-y-2">
            {incoming.map((e) => (
              <li key={e.id} className="flex items-center gap-3">
                <Avatar name={e.other.display_name || e.other.username} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-zinc-900">{e.other.display_name || e.other.username}</p>
                  <p className="truncate text-sm text-zinc-500">@{e.other.username}</p>
                </div>
                <button aria-label="Accept" disabled={busyId === e.id}
                  onClick={() => act(e.id, () => acceptRequest(e.id))}
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-[#c9187e] text-white disabled:opacity-50">
                  <Check size={16} />
                </button>
                <button aria-label="Decline" disabled={busyId === e.id}
                  onClick={() => act(e.id, () => removeFriendship(e.id))}
                  className="grid size-9 shrink-0 place-items-center rounded-full bg-zinc-200 text-zinc-700 disabled:opacity-50">
                  <X size={16} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* friends + still-pending outgoing */}
      <div className="rounded-3xl bg-white/90 p-4 shadow-xl backdrop-blur">
        <p className="font-bold text-zinc-900">Friends</p>
        {accepted.length === 0 && outgoing.length === 0 && (
          <p className="mt-2 text-sm text-zinc-500">No friends yet — search a username above to add someone.</p>
        )}
        <ul className="mt-2 space-y-2">
          {accepted.map((e) => (
            <li key={e.id} className="flex items-center gap-3">
              <Avatar name={e.other.display_name || e.other.username} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-zinc-900">{e.other.display_name || e.other.username}</p>
                <p className="truncate text-sm text-zinc-500">@{e.other.username}</p>
              </div>
              <button disabled={busyId === e.id}
                onClick={() => act(e.id, () => removeFriendship(e.id))}
                className="shrink-0 text-sm text-zinc-500 underline disabled:opacity-50">
                Remove
              </button>
            </li>
          ))}
          {outgoing.map((e) => (
            <li key={e.id} className="flex items-center gap-3 opacity-60">
              <Avatar name={e.other.display_name || e.other.username} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-zinc-900">{e.other.display_name || e.other.username}</p>
                <p className="truncate text-sm text-zinc-500">@{e.other.username}</p>
              </div>
              <span className="shrink-0 text-sm text-zinc-500">Requested</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Contacts: sample names for now, but Invite is real -- it opens the
          Messages composer prefilled. See src/lib/contacts.ts. */}
      <div className="rounded-3xl bg-white/90 p-4 shadow-xl backdrop-blur">
        <div className="flex items-center gap-2">
          <p className="font-bold text-zinc-900">From your contacts</p>
          <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-600">
            Sample
          </span>
        </div>
        <p className="mt-1 text-sm text-zinc-500">
          Not on B-line yet — invite them by text.
        </p>
        <ul className="mt-3 space-y-2">
          {SAMPLE_CONTACTS.map((c) => (
            <li key={c.id} className="flex items-center gap-3">
              <Avatar name={c.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-zinc-900">{c.name}</p>
                <p className="truncate text-sm text-zinc-500">Not on B-line</p>
              </div>
              <button
                onClick={() => inviteByText(c)}
                className="flex shrink-0 items-center gap-1 rounded-full border border-[#c9187e] px-3.5 py-2 text-sm font-semibold text-[#c9187e]"
              >
                <MessageSquare size={14} /> Invite
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
