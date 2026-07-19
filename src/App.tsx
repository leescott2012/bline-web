import { Route, Switch } from "wouter";
import Home from "@/pages/Home";
import Detail from "@/pages/Detail";
import Reserve from "@/pages/Reserve";
import MapView from "@/pages/MapView";
import TrailDetail from "@/pages/TrailDetail";
import Navigate from "@/pages/Navigate";
import Crowd from "@/pages/Crowd";
import MapStyles from "@/pages/MapStyles";
import Friends from "@/pages/Friends";
import Filters from "@/pages/Filters";
import Saved from "@/pages/Saved";

export default function App() {
  return (
    // On desktop, center an iPhone-sized shell; on mobile it's full-bleed.
    <div className="grid h-full place-items-center bg-zinc-950">
      <div className="relative h-full w-full overflow-hidden bg-ink sm:h-[852px] sm:max-h-[95vh] sm:w-[393px] sm:rounded-[2.5rem] sm:shadow-2xl sm:ring-8 sm:ring-zinc-800">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/spot/:id" component={Detail} />
          <Route path="/reserve/:id" component={Reserve} />
          <Route path="/map" component={MapView} />
          <Route path="/trail" component={TrailDetail} />
          <Route path="/navigate" component={Navigate} />
          <Route path="/conditions" component={Crowd} />
          <Route path="/map-styles" component={MapStyles} />
          <Route path="/friends" component={Friends} />
          <Route path="/filters" component={Filters} />
          <Route path="/saved" component={Saved} />
          <Route>404</Route>
        </Switch>
      </div>
    </div>
  );
}
