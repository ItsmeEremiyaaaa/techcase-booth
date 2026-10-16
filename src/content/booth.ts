/**
 * All showcase copy lives here so it can be edited without touching components.
 * Dimensions are in metres. Anything with `estimate: true` is a planning estimate.
 */

export type ObjectId = 'table' | 'backdrop' | 'banner' | 'devices' | 'qr' | 'students'

export interface Spec {
  label: string
  /** metres */
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
      'A folding table with a fitted royal-blue cover. It holds the demo phones and tablet running StudyQuest, two QR stands and a stack of StudyQuest brochures.',
    specs: [
      { label: 'Table (W × D)', value: [1.83, 0.76], estimate: true },
      { label: 'Table height', value: [0.74], estimate: true },
      { label: 'Booth footprint (W × D)', value: [4.4, 3.4], estimate: true },
    ],
    materials: [
      'Fitted royal-blue table cover with a printed StudyQuest front panel',
      'Blue floor mat under the booth',
      'Acrylic stands for the phones and the tablet',
      'Extension cord and power banks to keep the demo devices charged',
    ],
  },
  backdrop: {
    id: 'backdrop',
    kicker: 'Main backdrop',
    title: 'Promotional backdrop',
    summary:
      'The large wall behind the table. It carries the TechCase event branding and introduces StudyQuest with real screens from the app.',
    headline: 'StudyQuest — Level up your study game.',
    tagline: 'A gamified quiz app for students: play quizzes, earn XP and climb the weekly league.',
    messages: ['Daily quests', 'Weekly leagues', 'Versus & boss fights', 'Flashcard review', 'Scan the QR at our table to play'],
    purpose: 'Makes the booth recognizable from across the court and frames the demo for photos.',
    specs: [
      { label: 'Printed area (W × H)', value: [3.0, 2.4], estimate: true },
      { label: 'Viewing distance', text: '5–15 m across the court' },
    ],
    image: 'assets/textures/backdrop.webp',
    imageAlt: 'Backdrop design: TechCase branding, the StudyQuest headline, four feature tiles and two phones showing the app.',
  },
  banner: {
    id: 'banner',
    kicker: 'Vertical banner',
    title: 'Roll-up banner',
    summary: 'A tall pull-up standee at the aisle edge of the booth that catches students walking past.',
    headline: 'Level up your study game.',
    tagline: 'Quizzes, XP, leagues and achievements, built for students.',
    messages: ['Earn XP and level up', 'Climb the weekly league', 'Versus & boss fights', '30 achievements to unlock', 'Play it now at our table'],
    purpose: 'Pulls foot traffic from the aisle toward the table. The headline sits at eye level; the lower panel lists features and the call to action.',
    specs: [
      { label: 'Banner (W × H)', value: [0.85, 2.0], estimate: true },
      { label: 'Readable from', text: '3–6 m' },
    ],
    image: 'assets/textures/rollup.webp',
    imageAlt: 'Roll-up banner design: TechCase header, StudyQuest logo, headline, the app home screen, a feature list and a call to action.',
  },
  devices: {
    id: 'devices',
    kicker: 'Device demo area',
    title: 'Phones & tablet',
    summary:
      'Two phones and a tablet on stands run StudyQuest so visitors can play right away. Booth reps guide first-time players through a quiz.',
    specs: [
      { label: 'Demo devices', text: '2 phones + 1 tablet' },
      { label: 'Try it', text: 'Daily challenge or one subject quiz' },
    ],
  },
  qr: {
    id: 'qr',
    kicker: 'QR stands',
    title: 'QR code stands',
    summary: 'Two table stands and a floor sign open StudyQuest on the visitor’s own phone, so they can keep playing after they leave the booth.',
    specs: [
      { label: 'Table stands', text: 'A5 acrylic sign holders' },
      { label: 'Floor sign', text: 'A3 poster on a pedestal stand' },
    ],
  },
  students: {
    id: 'students',
    kicker: 'Visitor area',
    title: 'How students try StudyQuest',
    summary: 'The open space in front of the table, inside the court’s centre circle, is where visitors gather, scan and play.',
    steps: [
      { title: 'Discover', body: 'Students spot the backdrop and roll-up from the aisle, and a booth rep invites them over.' },
      { title: 'Scan', body: 'They scan the QR code on a table stand or the floor sign to open StudyQuest on their phone.' },
      { title: 'Play', body: 'They try the daily challenge or a subject quiz on a demo device and watch their XP and level go up.' },
      { title: 'Compete', body: 'They join the weekly league and leaderboards, and come back for daily quests and the boss of the week.' },
    ],
    specs: [{ label: 'Booth reps', text: '2 — one demos, one helps visitors scan and sign in' }],
  },
}

export const objectOrder: ObjectId[] = ['table', 'backdrop', 'banner', 'devices', 'qr', 'students']

/** Real StudyQuest screenshots (public/assets/screens). Replace the files to update them. */
export const appScreens = [
  { id: 'home', src: 'assets/screens/home.webp', title: 'Home', caption: 'Level and XP, coins, streak and league, the daily challenge, quick actions and the Mystery quiz of the day.' },
  { id: 'home-more', src: 'assets/screens/home-more.webp', title: 'Bosses', caption: 'The weekly boss fight, your subjects, course results, your section, teacher mode and friends.' },
  { id: 'quizzes', src: 'assets/screens/quizzes.webp', title: 'Quizzes', caption: 'Subject quizzes by difficulty, mastery stars, Survival mode and Write a question.' },
  { id: 'league', src: 'assets/screens/league.webp', title: 'League', caption: 'Weekly Bronze, Silver, Gold and Diamond leagues: the top 5 move up, the bottom 5 move down.' },
  { id: 'subjects', src: 'assets/screens/subjects.webp', title: 'Subjects', caption: 'Weekly subject boards: the top 4 earn a Diamond, Gold, Silver or Copper title.' },
  { id: 'achievements', src: 'assets/screens/achievements.webp', title: 'Achievements', caption: '30 achievements, each with bonus XP.' },
  { id: 'profile', src: 'assets/screens/profile.webp', title: 'Profile', caption: 'Level progress, XP, streak, titles, section and badges.' },
] as const

export const tabletScreen = { src: 'assets/screens/tablet.webp', title: 'Tablet', caption: 'Home and the weekly league side by side on the demo tablet.' }

/** "About StudyQuest" panel content. Every item is visible in the live app. */
export const appInfo = {
  tagline: 'Level up your study game.',
  intro:
    'StudyQuest turns reviewing into a game. Students play subject quizzes, earn XP and coins, keep streaks, and compete in weekly leagues with classmates.',
  groups: [
    {
      title: 'Play and learn',
      icon: 'book',
      items: [
        'Subject quizzes (Cybersecurity, Networking Basics, Programming and more) with Easy, Medium and Hard filters',
        'Quiz of the day: a Mystery quiz in sudden-death mode, where one miss ends it',
        'Survival mode: 3 lives, endless questions',
        'Mastery stars: ★ finish, ★★ score 90%+, ★★★ perfect in under 10 seconds a question',
        'Flashcard review with cards due each day, plus your own decks',
      ],
    },
    {
      title: 'Daily motivation',
      icon: 'flame',
      items: [
        'A daily challenge with bonus XP',
        'Daily quests that pay coins, and a mystery chest for finishing them all',
        'Levels, XP, coins and streaks on the home screen',
        'A shop and a study planner',
      ],
    },
    {
      title: 'Compete together',
      icon: 'trophy',
      items: [
        'Weekly leagues (Bronze, Silver, Gold and Diamond), where the top 5 move up and the bottom 5 move down',
        'Leaderboards: Overall, Subjects, Friends and Versus',
        'Weekly subject titles for the top 4 in each subject',
        'Versus matches, a rival of the week and a weekly boss fight',
        'Course vs course results every week',
      ],
    },
    {
      title: 'Grow and get recognized',
      icon: 'award',
      items: ['30 achievements with bonus XP', 'Badges and profile titles such as “Programming Student”'],
    },
    {
      title: 'Built for classes',
      icon: 'users',
      items: [
        'My section: questionnaires from your teachers',
        'Teacher mode for managing sections and questionnaires',
        'Write a question: students can add their own questions to the app',
      ],
    },
  ],
  builtWith: 'Built with React Native (Expo) and Firebase by a six-person BSIT capstone team.',
} as const
