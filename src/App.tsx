import { Route, Switch, useLocation } from "wouter";
import FeedbackButton from "@/components/FeedbackButton";
import FloatingNav from "@/components/FloatingNav";
import Onboarding from "@/components/Onboarding";
import PinGate from "@/components/PinGate";
import { useAuth } from "@/lib/auth";
import { useProfile } from "@/lib/profile";
import { usePublishLocation } from "@/lib/location";
import { installErrorCapture } from "@/lib/bugReport";

installErrorCapture();
import Home from "@/pages/Home";
import Detail from "@/pages/Detail";
import Reserve from "@/pages/Reserve";
import MapView from "@/pages/MapView";
import TrailDetail from "@/pages/TrailDetail";
import NavigateEnhanced from "@/pages/NavigateEnhanced";
import Navigate3D from "@/pages/Navigate3D";
import MapStyles from "@/pages/MapStyles";
import Friends from "@/pages/Friends";
import Filters from "@/pages/Filters";
import Saved from "@/pages/Saved";
import Profile from "@/pages/Profile";
import BugBin from "@/pages/BugBin";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Playground3D from "@/pages/Playground3D";

// Nobody reaches the app without an identity, so the crowd heatmap sees every
// user rather than the fraction who happened to open the Friends tab.
function Gate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [path] = useLocation();

  // Publishing lives here, not on the Friends page, so a position keeps flowing
  // while you're anywhere in the app. The switch is the profile's own
  // sharing_enabled -- flip it off and this stops writing at all, which is what
  // makes "you're invisible to everyone" literally true rather than a UI state.
  usePublishLocation(user?.id, !!profile?.sharing_enabled);

  // The bug bin is an internal tool, not the app -- don't lock admins out of it.
  // Privacy/Terms are exempt too so logged-out users and App Store/Play Store
  // reviewers can reach them without going through anonymous sign-up first.
  if (path === "/bug-bin" || path === "/playground-3d" || path === "/privacy" || path === "/terms") return <>{children}</>;
  if (loading || (user && profileLoading)) return null;
  if (!user || !profile) return <Onboarding userId={user?.id} />;
  return <><PinGate />{children}</>;
}

export default function App() {
  return (
    // On desktop, center an iPhone-sized shell; on mobile it's full-bleed.
    <div className="grid h-full place-items-center bg-zinc-950">
      <div className="relative h-full w-full overflow-hidden bg-ink sm:h-[852px] sm:max-h-[95vh] sm:w-[393px] sm:rounded-[2.5rem] sm:shadow-2xl sm:ring-8 sm:ring-zinc-800">
        <Gate>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/spot/:id" component={Detail} />
            <Route path="/reserve/:id" component={Reserve} />
            <Route path="/map" component={MapView} />
            <Route path="/trail" component={TrailDetail} />
            <Route path="/navigate" component={NavigateEnhanced} />
            <Route path="/navigate/:id" component={NavigateEnhanced} />
            <Route path="/navigate-3d/:id" component={Navigate3D} />
            <Route path="/map-styles" component={MapStyles} />
            <Route path="/friends" component={Friends} />
            <Route path="/filters" component={Filters} />
            <Route path="/saved" component={Saved} />
            <Route path="/profile" component={Profile} />
            <Route path="/bug-bin" component={BugBin} />
            <Route path="/privacy" component={Privacy} />
            <Route path="/terms" component={Terms} />
            <Route path="/playground-3d" component={Playground3D} />
            <Route>404</Route>
          </Switch>
          <FloatingNav />
          <FeedbackButton />
        </Gate>
      </div>
    </div>
  );
}
