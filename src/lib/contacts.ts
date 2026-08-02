// Contact suggestions for the Friends screen.
//
// The CONTACT LIST here is sample data -- reading the real address book needs a
// native contacts plugin plus phone numbers on accounts to match against, and
// account matching is blocked on phone signup (see auth.ts). The INVITE action
// below is real: it opens the device's Messages app with the text prefilled.

export interface SuggestedContact {
  id: string;
  name: string;
  phone: string;
}

// ponytail: sample data until the address book is wired -- the UI labels these
// as samples rather than passing them off as the user's real contacts.
export const SAMPLE_CONTACTS: SuggestedContact[] = [
  { id: "c1", name: "Jordan Ellis", phone: "+14045550137" },
  { id: "c2", name: "Sam Rivera", phone: "+14045550182" },
  { id: "c3", name: "Casey Nguyen", phone: "+14045550164" },
  { id: "c4", name: "Riley Brooks", phone: "+14045550119" },
];

export const APP_LINK = "https://bline-web.vercel.app";

export function inviteMessage(name: string) {
  const first = name.split(" ")[0];
  return `Hey ${first} — I'm using B-line to find food and spots along the Atlanta BeltLine. Join me: ${APP_LINK}`;
}

// Opens the SMS composer with recipient + body prefilled; the user taps send.
// iOS wants `&body=` after the number while Android wants `?body=`, so pick per
// platform rather than shipping one that silently drops the message text.
export function inviteByText(contact: SuggestedContact) {
  const separator = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent) ? "&" : "?";
  const href = `sms:${contact.phone}${separator}body=${encodeURIComponent(inviteMessage(contact.name))}`;
  window.location.href = href;
}
