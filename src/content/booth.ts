/**
 * All showcase copy lives here so it can be edited without touching components.
 * Dimensions are in metres. Anything with `estimate: true` is a planning estimate.
 */

export type ObjectId = 'table' | 'backdrop' | 'banner' | 'devices' | 'qr' | 'students' | 'brochure'

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
  /** tall images (banners) are shown narrower */
  tall?: boolean
}

export const boothObjects: Record<ObjectId, BoothObject> = {
  table: {
    id: 'table',
    kicker: 'Booth & table',
    title: 'Demo table',
    summary:
      'A folding table dressed in StudyQuest orange, with the app logo and “Study. Compete. Level Up.” on the front. It holds the demo phones and tablet, two QR stands and the StudyQuest brochures.',
    specs: [
      { label: 'Table (W × D)', value: [1.83, 0.76], estimate: true },
      { label: 'Table height', value: [0.74], estimate: true },
      { label: 'Booth footprint (W × D)', value: [4.4, 3.4], estimate: true },
    ],
    materials: [
      'Fitted StudyQuest-orange table cover with a printed front panel',
      'Dark brown floor mat with an orange edge, matching the app colours',
      'Acrylic stands for the phones and the tablet',
      'Extension cord and power banks to keep the demo devices charged',
    ],
  },
  backdrop: {
    id: 'backdrop',
    kicker: 'Main backdrop',
    title: 'Promotional backdrop',
    summary:
      'The large wall behind the team, styled like the StudyQuest roll-up: the fox mascot, the app on a phone, the four headline features and the courses it covers.',
    headline: 'Turn review time into a quest.',
    tagline: 'Timed quizzes, real XP and weekly leagues for you and your classmates.',
    messages: ['20-second rounds', '30 achievements', 'Weekly leagues, Bronze to Diamond', 'Boss battles every week', 'Quizzes for BSED, BSBA, BEED, BSIT and Basic Ed'],
    purpose: 'Makes the booth recognizable from across the court and frames the team and demo for photos.',
    specs: [
      { label: 'Printed area (W × H)', value: [3.0, 2.4], estimate: true },
      { label: 'Viewing distance', text: '5–15 m across the court' },
    ],
    image: 'assets/textures/backdrop.webp',
    imageAlt: 'StudyQuest backdrop: logo, “Turn review time into a quest.”, the fox mascot, a phone with the app, four feature tiles and the supported courses.',
  },
  banner: {
    id: 'banner',
    kicker: 'Roll-up banner',
    title: 'StudyQuest roll-up',
    summary: 'The team’s 33 × 80 inch pull-up banner at the aisle edge of the booth. It catches students walking past and ends with a QR code to start playing.',
    headline: 'Turn review time into a quest.',
    tagline: 'Study. Compete. Level Up.',
    messages: ['20-second rounds', '30 achievements with bonus XP', 'Weekly leagues, Bronze to Diamond', 'Boss battles, a new boss every week', 'Scan to start your quest · English & Tagalog'],
    purpose: 'Pulls foot traffic from the aisle toward the table. The headline and the fox sit at eye level; the QR code is within reach at the bottom.',
    specs: [
      { label: 'Size', text: '33 × 80 in (84 × 203 cm)' },
      { label: 'Readable from', text: '3–6 m' },
    ],
    image: 'assets/textures/rollup.webp',
    imageAlt: 'StudyQuest roll-up banner: logo, “Turn review time into a quest.”, the fox mascot, features, courses and a QR code.',
    tall: true,
  },
  brochure: {
    id: 'brochure',
    kicker: 'Brochure',
    title: 'StudyQuest brochure',
    summary: 'A tri-fold brochure that visitors can take home. It walks through how to play in four steps and links to the app and the feedback page.',
    steps: [
      { title: 'Pick a subject', body: 'BSIT, BSED, BEED, BSBA and Basic Ed quizzes, new every day.' },
      { title: 'Answer quizzes', body: 'Every question gives you 20 seconds. Think fast, answer smart.' },
      { title: 'Earn XP & badges', body: 'Level up, collect coins and unlock achievements.' },
      { title: 'Climb the leaderboard', body: 'The top 5 in your league move up every week.' },
    ],
    specs: [
      { label: 'Format', text: 'Tri-fold, letter size, landscape' },
      { label: 'Contact', text: 'escubidojeremiah@smcbi.edu.ph' },
    ],
    image: 'assets/textures/brochure.webp',
    imageAlt: 'Outside of the StudyQuest tri-fold brochure: how to play in four steps, a QR code to start your quest, and the cover with the fox mascot.',
  },
  devices: {
    id: 'devices',
    kicker: 'Device demo area',
    title: 'Phones & tablet',
    summary:
      'Two phones and a tablet on stands run StudyQuest so visitors can play right away. The team guides first-time players through a quiz.',
    specs: [
      { label: 'Demo devices', text: '2 phones + 1 tablet' },
      { label: 'Try it', text: 'Daily challenge or one subject quiz' },
    ],
  },
  qr: {
    id: 'qr',
    kicker: 'QR stands',
    title: 'QR code stands',
    summary: 'Two table stands and a floor sign open StudyQuest on the visitor’s own phone. It plays in the browser, or they can tap Install to add it to their device.',
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
      { title: 'Discover', body: 'Students spot the backdrop and roll-up from the aisle, and someone from the team invites them over.' },
      { title: 'Scan', body: 'They scan the QR code to open StudyQuest in the browser, or tap Install to add it to their phone.' },
      { title: 'Play', body: 'They try the daily challenge or a 20-second-per-question quiz and watch their XP go up.' },
      { title: 'Compete', body: 'They join the weekly league and come back for daily quests and the boss of the week.' },
    ],
    specs: [{ label: 'Team at the booth', text: '4 — demos, scanning help and sign-ups' }],
  },
}

export const objectOrder: ObjectId[] = ['table', 'backdrop', 'banner', 'brochure', 'devices', 'qr', 'students']

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

/** "About StudyQuest" panel content (from the app, the brochure and the roll-up). */
export const appInfo = {
  tagline: 'Turn review time into a quest.',
  slogan: ['Study.', 'Compete.', 'Level Up.'],
  intro:
    'StudyQuest is a gamified quiz app for SMCBI students. Pick a subject, answer timed questions, earn XP and coins, and climb the weekly league with your classmates.',
  courses: ['BSIT', 'BSED', 'BEED', 'BSBA', 'Basic Ed'],
  groups: [
    {
      title: 'Play and learn',
      icon: 'book',
      items: [
        'Quizzes for BSIT, BSED, BEED, BSBA and Basic Ed, new every day',
        '20-second rounds: think fast, answer smart',
        'Quiz of the day: a Mystery quiz in sudden-death mode',
        'Survival mode (3 lives) and mastery stars for perfect runs',
        'Flashcard review and your own decks',
      ],
    },
    {
      title: 'Daily motivation',
      icon: 'flame',
      items: ['A daily challenge with bonus XP', 'Daily quests that pay coins, plus a mystery chest', 'Levels, XP, coins and daily streaks', 'A shop and a study planner'],
    },
    {
      title: 'Compete together',
      icon: 'trophy',
      items: [
        'Weekly leagues from Bronze to Diamond: the top 5 move up',
        'Leaderboards: Overall, Subjects, Friends and Versus',
        'Versus matches and a rival of the week',
        'Boss battles, with a new boss every week',
      ],
    },
    {
      title: 'Grow and get recognized',
      icon: 'award',
      items: ['30 achievements with bonus XP', 'Badges and weekly subject titles'],
    },
    {
      title: 'Built for classes',
      icon: 'users',
      items: ['My section: questionnaires from your teachers', 'Teacher mode for sections and questionnaires', 'Write a question: add your own to the app'],
    },
  ],
  access: [
    'Play in your browser, or tap Install to add it to your device',
    'Available in English & Tagalog',
  ],
  feedbackUrl: 'https://itsmeeremiyaaaa.github.io/StudyQuestTesting/',
  email: 'escubidojeremiah@smcbi.edu.ph',
  builtWith: 'A capstone project by BSIT students of St. Mary’s College of Bansalan, Inc., Bansalan, Davao del Sur. Built with React Native (Expo) and Firebase.',
} as const
