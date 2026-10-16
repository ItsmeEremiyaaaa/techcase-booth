/**
 * All booth copy lives here so it can be edited without touching components.
 * Dimensions are in metres. Anything with `estimate: true` is a planning estimate —
 * confirm with the TechCase organizers and your print shop before ordering.
 * No supplier prices are listed on purpose: get local quotes.
 */

export type ObjectId = 'table' | 'backdrop' | 'banner' | 'devices' | 'qr' | 'students'

export interface Spec {
  label: string
  /** metres; formatted by the unit toggle */
  value?: number[]
  text?: string
  estimate?: boolean
}

export interface BoothObject {
  id: ObjectId
  kicker: string
  title: string
  summary: string
  specs: Spec[]
  materials?: string[]
  notes?: string[]
  messages?: string[]
  headline?: string
  tagline?: string
  purpose?: string
  printFormat?: string[]
  steps?: { title: string; body: string }[]
  image?: string
  imageAlt?: string
}

export const boothObjects: Record<ObjectId, BoothObject> = {
  table: {
    id: 'table',
    kicker: 'Booth & table',
    title: 'Demo table',
    summary:
      'A standard folding table with a fitted royal-blue cover. It holds the demo phones and tablet, two QR stands and a stack of StudyQuest brochures.',
    specs: [
      { label: 'Table (W × D)', value: [1.83, 0.76], estimate: true },
      { label: 'Table height', value: [0.74], estimate: true },
      { label: 'Booth footprint (W × D)', value: [4.4, 3.4], estimate: true },
      { label: 'Visitor clearance in front', value: [1.0], estimate: true },
    ],
    materials: [
      'Fitted stretch polyester table cover in royal blue with a printed front panel',
      'Optional blue floor mat or carpet tiles under the booth (check gym floor rules)',
      'Acrylic phone and tablet stands, one per device',
      'Extension cord, cable ties and a power bank for each device',
    ],
    notes: [
      'Protect the court: felt pads under the table legs and no tape residue on the wood floor.',
      'Keep the front edge clear so two or three visitors can stand at the table at once.',
      'Charge every device the night before and keep cables tucked under the cover.',
      'Pin the StudyQuest app on demo devices (Android screen pinning) so visitors stay in the demo.',
    ],
  },
  backdrop: {
    id: 'backdrop',
    kicker: 'Main backdrop',
    title: 'Promotional backdrop',
    summary:
      'The large wall behind the table. It carries the TechCase event branding and introduces StudyQuest with its headline and four core features.',
    headline: 'StudyQuest — Level up your study game.',
    tagline: 'A gamified quiz app for students — answer, earn XP and keep your streak alive.',
    messages: ['Category quizzes', 'XP & levels', 'Daily streaks', 'Leaderboards', 'Scan the QR at our table to try the beta'],
    purpose: 'Makes the booth recognizable from across the court and frames the demo for photos.',
    specs: [
      { label: 'Printed area (W × H)', value: [3.0, 2.4], estimate: true },
      { label: 'Viewing distance', text: '5–15 m across the court' },
    ],
    printFormat: [
      'Tarpaulin or dye-sublimated fabric on a pop-up or aluminium frame',
      'Design at full size, 100–150 dpi, CMYK; add the bleed your print shop asks for',
      'Keep text and logos away from frame edges and the table line (lower ~0.8 m is hidden)',
    ],
    image: 'assets/textures/backdrop.webp',
    imageAlt: 'Backdrop design: TechCase branding, StudyQuest headline, four feature tiles and two phones showing the app.',
  },
  banner: {
    id: 'banner',
    kicker: 'Vertical banner',
    title: 'Roll-up banner',
    summary: 'A tall pull-up standee at the aisle edge of the booth that catches students walking past.',
    headline: 'Level up your study game.',
    tagline: 'Quizzes, XP, streaks and badges — built for students.',
    messages: ['Earn XP and level up', 'Keep your daily streak', 'Collect badges', 'English & Tagalog', 'Try the beta at our table'],
    purpose:
      'Pulls foot traffic from the aisle toward the table. The headline sits at eye level; the lower panel lists features and the call to action.',
    specs: [
      { label: 'Banner (W × H)', value: [0.85, 2.0], estimate: true },
      { label: 'Readable from', text: '3–6 m' },
    ],
    printFormat: [
      'Standard roll-up stand with cassette base (common 85 × 200 cm size — confirm)',
      'Polyester film or tarpaulin; 150 dpi at full size, CMYK',
      'Leave extra length at the bottom for the cassette, as specified by the printer',
    ],
    image: 'assets/textures/rollup.webp',
    imageAlt: 'Roll-up banner design: TechCase header, StudyQuest logo, headline, phone mockup, feature list and a call to action.',
  },
  devices: {
    id: 'devices',
    kicker: 'Device demo area',
    title: 'Phones & tablet',
    summary:
      'Two phones and a tablet on stands run the StudyQuest beta so visitors can play right away. Booth reps guide first-time players.',
    specs: [
      { label: 'Demo devices', text: '2 Android phones + 1 tablet' },
      { label: 'Session length', text: 'One quiz or the daily challenge' },
    ],
    notes: [
      'Use a shared demo account so visitors see XP, streaks and badges in action.',
      'Set brightness to maximum and disable auto-lock during the event.',
      'Have the APK ready to share for students who want to install the beta.',
    ],
  },
  qr: {
    id: 'qr',
    kicker: 'QR stands',
    title: 'QR code stands',
    summary:
      'Two acrylic table stands and a floor sign link straight to StudyQuest. The QR code is generated from the link in the site config, so it is easy to change.',
    specs: [
      { label: 'Table stands', text: 'A5 acrylic sign holder (148 × 210 mm)' },
      { label: 'Floor sign', text: 'A3 poster on a pedestal stand' },
      { label: 'Minimum QR size', text: '3 cm for arm’s-length scanning' },
    ],
    notes: [
      'Test-scan every printed QR with Android and iPhone cameras before the event.',
      'Print a short URL under each code for students whose camera will not scan.',
    ],
  },
  students: {
    id: 'students',
    kicker: 'Student engagement area',
    title: 'How students try StudyQuest',
    summary:
      'The open space in front of the table, inside the court’s centre circle, is where visitors gather, scan and play.',
    steps: [
      { title: 'Discover', body: 'Students spot the backdrop and roll-up from the aisle, and a booth rep invites them over.' },
      { title: 'Scan', body: 'They scan the QR code on a table stand or the floor sign to open the StudyQuest link.' },
      { title: 'Try', body: 'They play a quick quiz or the daily challenge on a demo phone and see their XP and streak update.' },
      { title: 'Share feedback', body: 'Before leaving, they can send feedback through the StudyQuest feedback page.' },
    ],
    specs: [
      { label: 'Booth reps', text: '2 — one demos, one helps with scanning and installs' },
      { label: 'Visitors at once', text: '4–6 comfortably', estimate: true },
    ],
  },
}

export const objectOrder: ObjectId[] = ['table', 'backdrop', 'banner', 'devices', 'qr', 'students']

/** App preview screens (PLACEHOLDER mockups — replace the files with real screenshots). */
export const appScreens = [
  { id: 'home', src: 'assets/screens/home.webp', title: 'Home', caption: 'Greeting, streak, level and XP, the daily challenge, a week calendar and quiz categories.' },
  { id: 'quiz', src: 'assets/screens/quiz.webp', title: 'Quiz', caption: 'Each question has a 20-second countdown.' },
  { id: 'results', src: 'assets/screens/results.webp', title: 'Results', caption: 'Score, accuracy and XP — awarded on the first clear of each quiz — plus unlocked badges.' },
  { id: 'leaderboard', src: 'assets/screens/leaderboard.webp', title: 'Leaderboard', caption: 'Global, friends and per-quiz rankings.' },
  { id: 'profile', src: 'assets/screens/profile.webp', title: 'Profile', caption: 'Badge collection (32 in total) and the English / Tagalog language setting.' },
] as const

export const tabletScreen = { src: 'assets/screens/tablet-home.webp', title: 'Tablet', caption: 'The home dashboard on a tablet (sample layout).' }

/** Rows for the Materials & implementation table. */
export interface MaterialRow {
  item: string
  material: string
  size?: number[]
  sizeText?: string
  print: string
  notes: string
}

export const materials: MaterialRow[] = [
  { item: 'Main backdrop', material: 'Tarpaulin or fabric on pop-up / aluminium frame', size: [3.0, 2.4], print: 'Full-size artwork, 100–150 dpi, CMYK', notes: 'Bottom ~0.8 m hidden by the table' },
  { item: 'Roll-up banner', material: 'Polyester film or tarpaulin, cassette stand', size: [0.85, 2.0], print: 'Full-size artwork, 150 dpi, CMYK', notes: 'Extra bottom length for the cassette' },
  { item: 'Table cover', material: 'Fitted stretch polyester, printed front', size: [1.83, 0.76], print: 'Dye-sublimation or heat-transfer logo', notes: 'Royal blue to match the backdrop' },
  { item: 'QR table stands (×2)', material: 'Acrylic A5 sign holders', sizeText: '148 × 210 mm', print: 'Glossy photo paper or cardstock', notes: 'Test-scan before printing in bulk' },
  { item: 'QR floor sign', material: 'A3 poster on a pedestal stand', sizeText: '297 × 420 mm', print: 'Matte to avoid gym-light glare', notes: 'Place at the aisle side' },
  { item: 'Floor mat (optional)', material: 'Carpet tiles or rubber mat', size: [4.4, 3.4], print: '—', notes: 'Ask if mats are allowed on the court' },
  { item: 'Brochures', material: 'StudyQuest tri-fold brochure', sizeText: 'Letter, landscape', print: 'Double-sided, 2 folds', notes: 'Stack at the table corner' },
]

export const construction = [
  'Confirm the booth slot size, power outlets and setup time with the TechCase organizers.',
  'Protect the court: rubber feet on stands, no tape on the wood finish, and nothing dragged across the floor.',
  'Weigh down the roll-up and floor sign bases — gym doors and fans create drafts.',
  'Route extension cords along the back edge of the booth and cover them with a cable mat.',
  'Do a full dry run: devices charged, demo account signed in, QR codes test-scanned.',
]
