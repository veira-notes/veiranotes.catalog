// Site text and links. Edit here; no other file needs to change.
import { siInstagram, siTiktok, siThreads } from "simple-icons";

export const SITE = {
  name: "veiranotes",
  title: "veiranotes – everyday style finds",
  description: "A journal of everyday style, thoughtfully curated. Daily outfit inspo and affordable finds.",
  intro: [
    "A journal of everyday style, thoughtfully curated ✨", // non-breaking spaces keep ✨ with the last word
    "Feminine • Modern • Casual",
    "Daily outfit inspo & affordable finds",
    "↓ Find your next look ↓",
  ],
  logo: "/vn-main-logo.jpeg",
  footerNote: "Thank you for stopping by. May you find the piece that feels like you.",
  // Days a product keeps its "New" badge, counted in exact hours from its Published On date and time.
  newBadgeDays: 3,
};

// X is added when the account exists.
export const SOCIALS = [
  { label: "Instagram", url: "https://www.instagram.com/veiranotes/", path: siInstagram.path },
  { label: "TikTok", url: "https://www.tiktok.com/@veiranotes", path: siTiktok.path },
  { label: "Threads", url: "https://www.threads.com/@veiranotes", path: siThreads.path },
];
