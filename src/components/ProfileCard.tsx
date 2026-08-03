import { useEffect, useRef, useState } from "react";
import { Camera, Heart } from "lucide-react";
import { Link } from "wouter";
import { updateProfile, uploadAvatar, listFavoriteSpotIds, type Profile } from "@/lib/friends";
import { useSpots } from "@/lib/spots";

// Avatar that falls back to the initial when there's no picture -- shared by
// the profile card, friend rows and map pins so one person looks the same
// everywhere they appear.
export function ProfileAvatar({ profile, size = 44 }: { profile: Pick<Profile, "username" | "display_name" | "avatar_url">; size?: number }) {
  const name = profile.display_name || profile.username;
  if (profile.avatar_url) {
    return (
      <img src={profile.avatar_url} alt=""
        style={{ width: size, height: size }}
        className="shrink-0 rounded-full object-cover" />
    );
  }
  return (
    <div style={{ width: size, height: size, fontSize: size * 0.38 }}
      className="grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#c9187e] to-[#7c3aed] font-semibold text-white">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

// Your own profile: editable avatar and status, plus the spots you've saved.
export default function ProfileCard({ profile, onChange }: { profile: Profile; onChange: (p: Profile) => void }) {
  const spots = useSpots();
  const [status, setStatus] = useState(profile.status ?? "");
  const [saving, setSaving] = useState(false);
  const [favIds, setFavIds] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { listFavoriteSpotIds(profile.id).then(setFavIds); }, [profile.id]);

  const saveStatus = async () => {
    const next = status.trim();
    if (next === (profile.status ?? "")) return;
    setSaving(true);
    await updateProfile(profile.id, { status: next });
    setSaving(false);
    onChange({ ...profile, status: next });
  };

  const pickAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    const url = await uploadAvatar(profile.id, file);
    if (url) {
      await updateProfile(profile.id, { avatar_url: url });
      onChange({ ...profile, avatar_url: url });
    }
    setSaving(false);
  };

  const saved = spots.filter((s) => favIds.includes(s.id));

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <button onClick={() => fileRef.current?.click()} aria-label="Change profile photo"
          className="relative shrink-0">
          <ProfileAvatar profile={profile} size={56} />
          <span className="absolute -bottom-0.5 -right-0.5 grid size-6 place-items-center rounded-full bg-[#c9187e] text-white ring-2 ring-white">
            <Camera size={12} />
          </span>
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={pickAvatar} className="hidden" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[16px] font-bold text-zinc-900">
            {profile.display_name || profile.username}
          </p>
          <p className="truncate text-[13px] text-zinc-500">@{profile.username}</p>
        </div>
      </div>

      {/* Status is the "At New Realm" line from the wireframe -- it's what makes
          a friend pin feel current rather than just a dot on a map. */}
      <input
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        onBlur={saveStatus}
        maxLength={60}
        placeholder="What are you up to?"
        aria-label="Your status"
        className="mt-3 w-full rounded-xl bg-[#efefef] px-4 py-2.5 text-[14px] text-zinc-900 outline-none placeholder:text-zinc-500"
      />
      {saving && <p className="mt-1 text-[12px] text-zinc-400">Saving…</p>}

      <div className="mt-4">
        <p className="text-[14px] font-bold text-zinc-900">
          Saved spots <span className="font-normal text-zinc-500">({saved.length})</span>
        </p>
        {saved.length === 0 ? (
          <p className="mt-1 text-[13px] text-zinc-500">
            Tap the heart on any spot and it shows up here.
          </p>
        ) : (
          <div className="no-scrollbar -mx-1 mt-2 flex gap-2 overflow-x-auto px-1">
            {saved.map((s) => (
              <Link key={s.id} href={`/spot/${s.id}`} className="w-28 shrink-0">
                <img src={s.img} alt="" className="h-20 w-full rounded-lg object-cover" loading="lazy" />
                <p className="mt-1 truncate text-[12px] font-medium text-zinc-800">{s.name}</p>
                <p className="flex items-center gap-1 text-[11px] text-zinc-500">
                  <Heart size={10} className="fill-[#c9187e] text-[#c9187e]" /> {s.rating}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
