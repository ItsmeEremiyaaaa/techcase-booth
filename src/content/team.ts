/**
 * The StudyQuest team shown at the booth.
 * The bios and highlights are MOCK copy written for the showcase — edit them freely.
 */

export type MemberId = 'jeremiah' | 'peter' | 'sharwin' | 'joemar'

export interface Member {
  id: MemberId
  name: string
  firstName: string
  initials: string
  role: string
  year: string
  /** avatar colour */
  color: string
  lead?: boolean
  bio: string
  highlights: string[]
  quote: string
}

export const team: Member[] = [
  {
    id: 'jeremiah',
    name: 'Jeremiah F. Escubido',
    firstName: 'Jeremiah',
    initials: 'JE',
    role: 'Developer & Project Leader',
    year: 'BSIT · 4th Year',
    color: '#E8935C',
    lead: true,
    bio: 'As the team’s lead developer, Jeremiah is the core of StudyQuest. He built the app from the ground up, from the quiz engine and XP system to the weekly leagues and the Firebase backend, and keeps the whole team moving toward every deadline.',
    highlights: [
      'Built the React Native (Expo) + Firebase app',
      'Designed the quiz, XP, streak, league and boss battle systems',
      'Leads planning, code reviews and releases',
      'Ships the web app and the Android builds',
    ],
    quote: 'If studying feels like a game, students keep coming back.',
  },
  {
    id: 'peter',
    name: 'Peter Paul Parcon',
    firstName: 'Peter',
    initials: 'PP',
    role: 'App Designer & QA Lead',
    year: 'BSIT · 4th Year',
    color: '#5B3FC0',
    bio: 'Peter shapes how StudyQuest looks and feels. He designs the screens, keeps the warm orange theme consistent across the app, and leads testing so every quiz, badge and leaderboard works before it reaches students.',
    highlights: [
      'Designs app screens, icons and the visual theme',
      'Writes test cases and runs beta testing sessions',
      'Collects tester feedback and tracks bugs to the finish',
    ],
    quote: 'A good design is one you don’t have to explain.',
  },
  {
    id: 'sharwin',
    name: 'Sharwin Terambulo',
    firstName: 'Sharwin',
    initials: 'ST',
    role: '3D Designer & Organizer',
    year: 'BSIT · 4th Year',
    color: '#2E8B57',
    bio: 'Sharwin brings StudyQuest to life beyond the screen. He creates the 3D and visual assets for the project, including this TechCase showcase, and organizes the team’s schedules, meetings and event preparations.',
    highlights: [
      'Creates 3D models and scenes for the showcase',
      'Plans the booth layout and event day',
      'Coordinates team meetings and timelines',
    ],
    quote: 'Plan the details, and the big day takes care of itself.',
  },
  {
    id: 'joemar',
    name: 'Joemar Dubria',
    firstName: 'Joemar',
    initials: 'JD',
    role: 'Financial Manager',
    year: 'BSIT · 4th Year',
    color: '#1BA2C4',
    bio: 'Joemar keeps the project on budget. He plans and tracks the costs of printing, booth materials and devices, and makes sure the team gets the most out of every peso.',
    highlights: [
      'Plans the project budget and tracks expenses',
      'Canvasses print shops and suppliers',
      'Manages booth materials and supplies',
    ],
    quote: 'Every peso saved is a peso for a better booth.',
  },
]

export const teamById = Object.fromEntries(team.map((m) => [m.id, m])) as Record<MemberId, Member>
