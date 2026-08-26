/**
 * Privacy Policy.
 *
 * Written to match what the app actually does — do not genericize this.
 * App Store / Play Store review compares this text against the permissions
 * B-line actually requests (NSLocationWhenInUseUsageDescription on iOS,
 * nothing location-related in the Android manifest) and the data flows
 * below. Misalignment = rejection.
 *
 * Source of truth for data flows:
 *   - Location (live share): navigator.geolocation, upserted to Supabase
 *     `locations` (one row per user, no history). See src/lib/location.ts.
 *   - Location (nav/recenter/routing origin): in-memory only, never stored.
 *     See src/lib/useLiveLocation.ts, src/pages/MapView.tsx,
 *     src/pages/NavigateEnhanced.tsx, src/pages/Navigate3D.tsx.
 *   - Walking directions: origin/destination coords sent to OpenRouteService.
 *     See src/lib/routing.ts.
 *   - Crowd heatmap: security-definer RPCs return only rounded, k-anonymized
 *     (>=3 people) aggregates — never raw coordinates. See src/lib/crowd.ts,
 *     supabase-crowd-migration.sql.
 *   - Account: anonymous Supabase auth + public @username, no email/phone
 *     collected. See src/lib/auth.ts.
 *   - Friends: username search + mutual accept, profiles/friendships tables.
 *     See src/lib/friends.ts, src/components/FriendsPanel.tsx.
 *   - Bug reports / "suggest a place" / "claim this business": free text +
 *     optional contact + optional embedded screenshot, in Supabase
 *     `bug_reports`. See src/lib/bugReport.ts, src/components/FeedbackButton.tsx,
 *     src/components/TellUsSheet.tsx.
 *   - Errors: Sentry, browser tracing only, no session replay. See src/lib/sentry.ts.
 *   - Map tiles: CARTO / Esri / OpenTopoMap load directly from the browser.
 */
import LegalLayout, { H2, P, Strong, UL, LI, A } from "@/components/LegalLayout";

export default function Privacy() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="August 26, 2026">
      <P>
        B-line is operated by <Strong>Chamillion Collective</Strong> ("B-line," "we,"
        "us"). Contact: <A href="mailto:ariyaonellc@outlook.com">ariyaonellc@outlook.com</A>.
        This page describes exactly what we collect, why, where it lives, and
        how to delete it.
      </P>

      <H2>The TL;DR</H2>
      <UL>
        <LI><Strong>No email or phone required.</Strong> Your account is anonymous by
          default — just a public @username. We never see a real email address
          or phone number through the sign-up flow.</LI>
        <LI><Strong>Location powers three features.</Strong> Centering the map, live
          sharing with friends you choose, and an anonymous crowd-density
          count. We describe exactly what's stored for each below.</LI>
        <LI><Strong>Live location sharing defaults to on</Strong> the moment you have an
          account, and turning it off immediately deletes your stored
          position — there's no history to "turn off" retroactively.</LI>
        <LI><Strong>The crowd heatmap never reveals anyone's exact location.</Strong> It's
          rounded to city-block-sized cells and only shown once at least
          three people are in a cell.</LI>
        <LI><Strong>Walking directions go to OpenRouteService</Strong>, a routing provider
          that receives your start and end coordinates to calculate the route.</LI>
        <LI><Strong>Your real contacts are never read or uploaded.</Strong> The Friends
          "invite" feature only opens your phone's text-message app.</LI>
        <LI><Strong>You can delete everything.</Strong> Email us and your account and all
          associated data are gone within 7 days.</LI>
      </UL>

      <H2>1. Account information</H2>
      <P>
        Opening B-line for the first time creates an anonymous account — no
        email, phone number, or password is required. You then choose a
        public <Strong>@username</Strong> and, optionally, a display name, avatar photo,
        and a short free-text status line. These are stored in our database
        and are visible to other users (your avatar is stored in a public
        image bucket; anyone with the link can view it).
      </P>
      <P>
        If you choose to add a password or a passkey (Face ID / Touch ID /
        Windows Hello, available in the mobile-browser version of B-line) so
        you can sign back in on a new device, the credential itself never
        reaches us: passkeys are verified by your device's operating system
        via WebAuthn, and a password is attached to a non-deliverable,
        internal placeholder address rather than a real email inbox. We
        never receive biometric data of any kind.
      </P>

      <H2>2. Location data</H2>
      <P>Your device location is used in four different ways, with different sensitivity:</P>
      <UL>
        <LI><Strong>Live sharing with friends (highest sensitivity).</Strong> While you're
          signed in and location sharing is on, your device checks in
          roughly every 20 seconds and we store your <Strong>current</Strong> latitude,
          longitude, GPS accuracy, and (on the native app) approximate
          battery level. This is a single row per account that gets
          overwritten each update — <Strong>we do not keep a location history.</Strong>
          Sharing is on by default when your account is created; you can
          turn it off at any time from Friends settings, and doing so
          deletes the stored row immediately.</LI>
        <LI><Strong>Turn-by-turn navigation.</Strong> While an active walking route is on
          screen, your position is used to move the on-screen marker and
          reroute you. This is never sent to our servers — it only lives in
          the app while navigation is open.</LI>
        <LI><Strong>Recentering the map.</Strong> Tapping the locate button on the map
          takes a one-time position reading to pan the map to you. Not stored.</LI>
        <LI><Strong>Routing origin.</Strong> Starting a walking route takes a one-time
          position reading as your starting point. Not stored by us — but see
          below, it is sent to our routing provider.</LI>
      </UL>
      <P>
        <Strong>Crowd density map.</Strong> B-line shows how busy different parts of the
        Atlanta BeltLine are. This is computed entirely on the server from
        the live-sharing data above: positions are rounded to roughly a
        city-block-sized grid, grouped, and a count is only shown for a cell
        with at least <Strong>three</Strong> distinct people in it in the last 30
        minutes. Your device never downloads anyone else's coordinates for
        this feature — only rounded counts. Turning off location sharing
        also excludes you from this count.
      </P>
      <P>
        <Strong>Platform permissions.</Strong> On iOS, the app requests "When In Use"
        location access, used only while B-line is open. On Android, no
        location permission is declared in the app manifest — the browser
        engine inside the app prompts for location access itself when a
        page requests it. Location is never accessed in the background on
        either platform.
      </P>

      <H2>3. Friends and what's shared with them</H2>
      <P>
        Finding a friend requires a search by @username and a request that
        the other person must accept — you are never automatically
        connected to anyone. Once you're friends, we store the friendship
        (both usernames and its status) so it can be shown in the app; if
        either of you removes the connection, that record is deleted.
      </P>
      <P>
        Your profile info (username, display name, avatar, status) and, when
        location sharing is on, your live position, battery level, and
        saved/favorited spots are the categories of information a friend
        connection is designed to make visible to accepted friends, gated by
        your sharing switch. You control the sharing switch at all times and
        can remove a friend to end that connection.
      </P>
      <P>
        <Strong>Your contacts are never read.</Strong> The "invite a friend" feature does
        not access, upload, or transmit your phone's real address book. It
        opens your device's own text-message app with a pre-filled invite
        for you to send (or not) yourself.
      </P>

      <H2>4. Reservations</H2>
      <P>
        If you reserve a spot at a restaurant or bar through B-line, we
        store the spot, party size, requested day/time, and status of that
        request, tied to your account if you're signed in. B-line is not
        the merchant of record for these reservations — we route the request
        to the venue and do not process any payment.
      </P>

      <H2>5. "Suggest a place," "claim this business," and bug reports</H2>
      <P>
        If you submit feedback, report a bug, suggest a new spot, or claim a
        business listing, we store your message, the page you were on, your
        browser/device info, and, if you chose to include one, a contact
        method (email or phone) and a screenshot. Screenshots are shrunk
        client-side and stored as part of that same submission record — they
        are not published anywhere or shown to other users. Unhandled
        technical errors in the app are also logged this way automatically,
        without any contact info attached. Access to this data is
        restricted to us for triage and follow-up.
      </P>

      <H2>Third-party services we use</H2>
      <P>The services below receive data as part of running B-line:</P>
      <UL>
        <LI><Strong>Supabase</Strong> — our database, authentication, and file storage
          provider. Holds your account, profile, friendships, live location
          (while sharing is on), favorites, reservations, and
          feedback/bug-report submissions. <A href="https://supabase.com/privacy">Supabase Privacy Policy</A>.</LI>
        <LI><Strong>Vercel</Strong> — hosts the application and its serverless functions;
          sees standard request metadata (like IP address) in server logs.
          <A href="https://vercel.com/legal/privacy-policy"> Vercel Privacy Policy</A>.</LI>
        <LI><Strong>OpenRouteService</Strong> — calculates walking directions. Receives your
          starting coordinates and your chosen destination's coordinates for
          each route you request. <A href="https://openrouteservice.org/privacy-policy/">OpenRouteService Privacy Policy</A>.</LI>
        <LI><Strong>CARTO, Esri ArcGIS Online, and OpenTopoMap</Strong> — supply the map's
          base imagery (standard, satellite, and terrain styles). Each
          receives the map area you're viewing (which reveals your
          approximate location) and your IP address directly from your
          browser as you pan and zoom, the way any map tile provider works.</LI>
        <LI><Strong>Open-Meteo</Strong> — provides the BeltLine weather conditions shown in
          the app. Only ever queried for one fixed reference point on the
          trail; your own location is not sent to it.</LI>
        <LI><Strong>Sentry</Strong> — error and performance monitoring. Receives crash
          reports, stack traces, and performance traces. We do not enable
          Sentry's session-recording feature. <A href="https://sentry.io/privacy/">Sentry Privacy Policy</A>.</LI>
        <LI><Strong>Photo hosts for spot images</Strong> — photos shown on spot pages are
          loaded directly from their original hosts (including Unsplash and
          Yelp), which see your IP address and browser info when an image
          loads, the same as any hotlinked image on the web.</LI>
      </UL>
      <P>
        B-line also links out to restaurant and venue websites and to Google
        Maps. Opening one of these links takes you to that site directly;
        nothing about you is passed to it beyond what any browser link
        click sends.
      </P>

      <H2>Data retention</H2>
      <UL>
        <LI><Strong>Live location:</Strong> only your current position is kept, and it's
          deleted the moment you turn sharing off. There is no location
          history table.</LI>
        <LI><Strong>Account and profile data:</Strong> kept until you ask us to delete your
          account.</LI>
        <LI><Strong>Friendships and favorites:</Strong> kept until you remove them.</LI>
        <LI><Strong>Reservations:</Strong> kept as a record of the request.</LI>
        <LI><Strong>Feedback, bug reports, and screenshots:</Strong> kept until we've
          resolved the issue or you ask us to delete it.</LI>
        <LI><Strong>Error reports:</Strong> retained per Sentry's standard retention window,
          then auto-purged.</LI>
      </UL>

      <H2>Your rights</H2>
      <UL>
        <LI><Strong>Access</Strong> the data we have on you — email us and we'll tell you
          what's on file.</LI>
        <LI><Strong>Correct</Strong> your username, display name, avatar, and status inside
          the app at any time.</LI>
        <LI><Strong>Turn off location sharing</Strong> at any time from Friends settings —
          this immediately deletes your stored live position.</LI>
        <LI><Strong>Delete</Strong> your entire account and associated data by emailing us.
          We honor deletion requests within 7 days.</LI>
      </UL>
      <P>
        If you're in the EU, UK, or California, applicable regional privacy
        laws (GDPR, UK GDPR, CCPA) give you additional rights, including
        portability and objection. To exercise any of these, email
        <A href="mailto:ariyaonellc@outlook.com"> ariyaonellc@outlook.com</A>.
      </P>

      <H2>Children</H2>
      <P>
        B-line is not directed at children under 13, and we do not knowingly
        collect data from anyone under 13. If you believe a child has an
        account, email us and we will delete it.
      </P>

      <H2>Changes</H2>
      <P>
        If we make a material change to this policy, we'll update the "last
        updated" date above.
      </P>

      <H2>Contact</H2>
      <P>
        Questions, deletion requests, or anything else:
        <A href="mailto:ariyaonellc@outlook.com"> ariyaonellc@outlook.com</A>.
      </P>
    </LegalLayout>
  );
}
