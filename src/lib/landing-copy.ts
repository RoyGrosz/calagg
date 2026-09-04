export const benefits = [
  {
    title: "See every calendar in one place",
    body: "Work, personal, and side projects show up on a single dedicated calendar you already open every day.",
  },
  {
    title: "Keep your Primary calendar clean",
    body: "Mirrors land on a dedicated target — CalAgg never writes to Primary, so your main calendar stays yours.",
  },
  {
    title: "Share only what you mean to",
    body: "Choose full detail, title-only, or busy blocks per source so colleagues see availability without oversharing.",
  },
  {
    title: "Know where each event came from",
    body: "Title prefixes and description tags make mirrored events easy to spot and trace back to the source account.",
  },
  {
    title: "Stay in Google Calendar",
    body: "No browser extension. Mirrored events are normal events on web and phone — sync about every 5 minutes.",
  },
];

export const steps = [
  {
    n: "1",
    title: "Sign in with Google",
    body: "Your first account becomes the main (target) account.",
  },
  {
    n: "2",
    title: "Pick a dedicated target",
    body: "CalAgg creates or uses a calendar that is never Primary.",
  },
  {
    n: "3",
    title: "Mirror sources",
    body: "Link accounts, choose calendars, set privacy modes — sync runs on its own.",
  },
];

export const faqs = [
  {
    q: "Can I use CalAgg while the Google Cloud app is in Testing?",
    a: "Yes. In Testing mode, only accounts you add as test users on the OAuth consent screen can sign in. Ask the project owner to add your Google account before you continue with Google.",
  },
  {
    q: "Why might I need to sign in again after about a week?",
    a: "While the app is in Google's Testing publishing status, refresh tokens may expire after roughly 7 days. Reconnect the account from CalAgg when sync stops; this improves once the app is verified / in production.",
  },
  {
    q: "Does CalAgg ever write to my Primary calendar?",
    a: "No. Mirrors always go to a dedicated target calendar you choose. Primary is never written.",
  },
  {
    q: "Can a friend try it?",
    a: "While the OAuth app is in Testing, they must be listed as a test user on the Google Cloud consent screen. After that they sign in the same way you do.",
  },
  {
    q: "How do I disconnect or revoke access?",
    a: "Remove accounts inside CalAgg, and/or revoke CalAgg under your Google Account → Security → Third-party access. You can also delete mirrored events from the target calendar anytime.",
  },
  {
    q: "What's the difference between busy and full?",
    a: "Full copies title (and more detail as configured). Busy shows opaque blocks so others see that you're occupied without revealing the event name. Title-only sits in between.",
  },
  {
    q: "Is CalAgg free? Do I need a card?",
    a: "CalAgg is a free personal tool. There is no paid plan and no credit card required.",
  },
  {
    q: "How often does sync run?",
    a: "About every 5 minutes. Changes on a source calendar usually appear on the target shortly after the next poll.",
  },
];
