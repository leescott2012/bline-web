import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import { BatteryMedium } from "lucide-react";
import RealMap from "@/components/RealMap";
import { useFriendLocations, timeAgo } from "@/lib/location";
import type { FriendEdge } from "@/lib/friends";

// Friend avatars on the real map. Per the wireframe the pin itself is just the
// avatar -- battery and last-seen only appear once you tap one, so a trail full
// of friends doesn't turn into a wall of chips.
export default function FriendsMap({ friends, meId }: { friends: FriendEdge[]; meId: string }) {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markers = useRef<Map<string, maplibregl.Marker>>(new Map());
  const [selected, setSelected] = useState<string | null>(null);
  const locations = useFriendLocations(true);

  const byId = new Map(friends.map((f) => [f.other.id, f.other]));

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const seen = new Set<string>();
    for (const loc of locations) {
      if (loc.user_id === meId) continue;
      const person = byId.get(loc.user_id);
      if (!person) continue; // a share exists but they aren't an accepted friend
      seen.add(loc.user_id);

      let marker = markers.current.get(loc.user_id);
      if (!marker) {
        const el = document.createElement("button");
        el.className = "bline-friend-pin";
        el.setAttribute("aria-label", `${person.display_name || person.username} on the map`);
        // real picture when they've uploaded one, initial otherwise
        if (person.avatar_url) {
          el.style.backgroundImage = `url("${person.avatar_url}")`;
          el.style.backgroundSize = "cover";
          el.style.backgroundPosition = "center";
        } else {
          el.textContent = (person.display_name || person.username).charAt(0).toUpperCase();
        }
        el.onclick = () => setSelected((cur) => (cur === loc.user_id ? null : loc.user_id));
        marker = new maplibregl.Marker({ element: el });
        markers.current.set(loc.user_id, marker);
      }
      marker.setLngLat([loc.lng, loc.lat]).addTo(map);
    }

    // drop pins for anyone who stopped sharing
    for (const [id, marker] of markers.current) {
      if (!seen.has(id)) { marker.remove(); markers.current.delete(id); }
    }
  }, [locations, friends, meId]);

  const sel = locations.find((l) => l.user_id === selected);
  const selPerson = selected ? byId.get(selected) : undefined;

  return (
    <div className="relative mx-3 mt-3 h-[34%] overflow-hidden rounded-2xl">
      <RealMap zoom={12.8} decorations={false} autoPitch={false}
        onMap={(m) => (mapRef.current = m)} className="absolute inset-0" />

      {locations.filter((l) => l.user_id !== meId && byId.has(l.user_id)).length === 0 && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <p className="rounded-full bg-white/85 px-4 py-2 text-[13px] font-medium text-zinc-600 shadow">
            No friends sharing right now
          </p>
        </div>
      )}

      {/* Details appear only for the tapped avatar. */}
      {sel && selPerson && (
        <div className="absolute inset-x-3 bottom-3 rounded-xl bg-white/95 px-3.5 py-2.5 shadow-lg backdrop-blur">
          <div className="flex items-center gap-2">
            <p className="min-w-0 flex-1 truncate text-[14px] font-semibold text-zinc-900">
              {selPerson.display_name || selPerson.username}
            </p>
            {sel.battery != null && (
              <span className="flex shrink-0 items-center gap-1 text-[13px] text-zinc-600">
                <BatteryMedium size={14} /> {sel.battery}%
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[13px] text-zinc-500">
            {selPerson.status ? `${selPerson.status} · ` : `@${selPerson.username} · `}{timeAgo(sel.updated_at)}
          </p>
        </div>
      )}
    </div>
  );
}
