/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  EDIT ME. Everything about the person lives in this one file.
 *  Case studies live in src/content/work/*.md.
 *
 *  Everything below is TEMPLATE CONTENT: the name, school, jobs, metrics and
 *  links are invented. Replace every value with your own, then set
 *  `isTemplate` to false to remove the "template content" banner.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const site = {
  /** Shows a banner across the top of every page until you've made the site yours. */
  isTemplate: true,

  name: 'Alex Rivera',
  /** Shown in the browser tab and link previews. */
  title: 'Alex Rivera — Marketing Portfolio',
  /** ~155 characters. This is your Google search snippet. */
  description:
    'Marketing student at State University focused on brand strategy, social and data-driven campaigns. Case studies, résumé and contact.',
  /** Used for <html lang> and Open Graph locale. */
  locale: 'en-US',

  /** Status pill in the hero. Set to null to hide it. */
  availability: 'Open to summer 2027 internships',

  hero: {
    /** The words wrapped in *asterisks* render in the accent colour, in italics. */
    headline: 'I turn *audience insight* into campaigns people actually notice.',
    intro:
      'Marketing student at State University with a minor in data analytics. I like the whole arc: the research that finds the real problem, the idea that answers it, and the numbers that prove it worked.',
  },

  /** Big numbers under the hero. Keep to 3–4 and make them true. */
  highlights: [
    { value: '4', label: 'Campaigns shipped' },
    { value: '38k', label: 'People reached' },
    { value: '3', label: 'Certifications' },
    { value: '3.8', label: 'Major GPA' },
  ],

  about: {
    /** Optional headshot: put a square image in public/ and reference it, e.g. '/headshot.jpg'. */
    photo: null as string | null,
    paragraphs: [
      'I got into marketing by accident: I volunteered to run the Instagram for a campus food pantry, posted the same thing three different ways, and noticed one version tripled sign-ups. I wanted to know why. That question turned into a major.',
      'These days I split my time between coursework in consumer behavior and analytics, a part-time role on a nonprofit’s marketing team, and the student marketing association, where I lead the campaigns committee.',
      'I’m happiest at the intersection of creative and data: writing the brief, building the content calendar, and then sitting with the dashboard afterward to figure out what to do next time.',
    ],
    strengths: [
      { title: 'Strategy & research', body: 'Audience interviews, surveys, competitive audits, positioning and creative briefs.' },
      { title: 'Content & social', body: 'Platform-native content calendars, short-form video, copywriting and community management.' },
      { title: 'Analytics', body: 'GA4, UTM discipline, A/B tests and turning dashboards into a decision someone can act on.' },
    ],
  },

  experience: [
    {
      role: 'Marketing Intern',
      org: 'Riverside Literacy Project',
      orgType: 'Nonprofit',
      start: 'May 2026',
      end: 'Present',
      bullets: [
        'Rebuilt the donor email program in HubSpot: welcome series, segmentation and monthly impact newsletter.',
        'Own the organic social calendar across Instagram, LinkedIn and Facebook (3 posts / week).',
      ],
    },
    {
      role: 'Campaigns Committee Lead',
      org: 'Student Marketing Association',
      orgType: 'Student organization',
      start: 'Aug 2025',
      end: 'Present',
      bullets: [
        'Lead a team of 6 planning recruitment and event campaigns for a 250-member chapter.',
        'Introduced a shared content calendar and post-campaign reports; event attendance up 40% year over year.',
      ],
    },
    {
      role: 'Social Media Assistant',
      org: 'Campus Recreation',
      orgType: 'Part-time',
      start: 'Jan 2025',
      end: 'May 2025',
      bullets: [
        'Created short-form video and stories promoting intramurals and fitness classes.',
        'Grew Instagram following from 3.1k to 4.6k in one semester.',
      ],
    },
  ],

  education: {
    school: 'State University',
    degree: 'B.S. Marketing, minor in Data Analytics',
    graduation: 'May 2027',
    details: ['Major GPA 3.8 · Dean’s List (4 semesters)', 'Coursework: Consumer Behavior, Marketing Research, Digital Analytics, Brand Management'],
  },

  skills: [
    { group: 'Strategy', items: ['Brand positioning', 'Creative briefs', 'Market research', 'Customer journeys', 'Competitive analysis'] },
    { group: 'Content', items: ['Copywriting', 'Short-form video', 'Content calendars', 'Email marketing', 'Community management'] },
    { group: 'Analytics', items: ['Google Analytics 4', 'A/B testing', 'UTM tracking', 'Looker Studio', 'Excel / Sheets'] },
    { group: 'Tools', items: ['HubSpot', 'Meta Business Suite', 'Canva', 'Figma', 'CapCut', 'Semrush', 'Qualtrics'] },
  ],

  certifications: [
    { name: 'Google Analytics Certification', issuer: 'Google', year: '2026' },
    { name: 'Inbound Marketing', issuer: 'HubSpot Academy', year: '2025' },
    { name: 'Content Marketing', issuer: 'HubSpot Academy', year: '2025' },
  ],

  contact: {
    email: 'alex.rivera@example.com',
    location: 'Midwest · Open to relocation',
    /** Shown above the contact links. */
    blurb: 'I’m looking for a summer 2027 marketing internship, and I’m always happy to talk shop about campaigns, brands or a good brief.',
  },

  /** Any you don't use: delete the line. Order here is the order on the page. */
  social: [
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/your-profile' },
    { label: 'Instagram', href: 'https://www.instagram.com/your-handle' },
    { label: 'Behance', href: 'https://www.behance.net/your-profile' },
  ],

  resume: {
    /**
     * Where the "Résumé" buttons point.
     * - Leave as '/resume' to use the auto-generated résumé page (built from this file; visitors can print / save it as PDF).
     * - Or drop your own PDF in public/ (e.g. public/alex-rivera-resume.pdf) and set this to '/alex-rivera-resume.pdf'.
     */
    href: '/resume',
  },

  analytics: {
    /** Vercel Web Analytics: cookieless, free tier. Also enable it in the Vercel dashboard → Analytics. */
    vercel: true,
    /** Optional Google Analytics 4 measurement ID, e.g. 'G-XXXXXXXXXX'. Leave null to disable. */
    ga4: null as string | null,
  },
} as const;

export type Site = typeof site;

/** Initials for the monogram, favicon and placeholder avatar. */
export const initials = site.name
  .split(/\s+/)
  .map((part) => part[0])
  .join('')
  .slice(0, 2)
  .toUpperCase();
