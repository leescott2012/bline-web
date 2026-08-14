import type { MouseEvent } from "react";
import { Browser } from "@capacitor/browser";
import { Capacitor } from "@capacitor/core";

/**
 * Preserve normal browser links on the web, but open external destinations in
 * the native SFSafariViewController on Capacitor so provider handoffs do not
 * depend on the WebView's target="_blank" behavior.
 */
export async function openExternalLink(event: MouseEvent<HTMLAnchorElement>, url: string) {
  if (!Capacitor.isNativePlatform()) return;
  event.preventDefault();
  await Browser.open({ url, toolbarColor: "#111116" });
}
