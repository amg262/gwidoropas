/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  THE MASTER TAPE. Everything about Gwido lives in this one file.
 *  The home page, the printable résumé (/resume), the link previews and the
 *  structured data are all pressed from it, so they can never drift apart.
 *
 *  Case studies ("releases") live in src/content/work/*.md.
 *
 *  Ground rules (from the launch plan):
 *   • Every line must be something Gwido has done or can do in front of an
 *     interviewer. If it isn't true yet, it belongs in `studio`, not here.
 *   • Peyton Pours wording is "co-designed" and "supported."
 *   • Gwido owns every word. Rewrite anything here in your own voice, then set
 *     `advanceCopy` to false.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import { tenure, capitalize } from '@/lib/dates';
import portraitPhoto from '@/assets/portrait/gwido-ropas.jpg';

/* ── Types ─────────────────────────────────────────────────────────────────── */

/** Record formats used as a light metaphor for the kind of role. */
export type Format = 'LP' | 'EP' | 'Single' | 'Box set';

export interface Disc {
  role: string;
  start: string;
  end: string | null;
  bullets: string[];
}

export interface Release {
  id: string;
  format: Format;
  role: string;
  org: string;
  /** Short descriptor shown after the company name, e.g. "AI software". */
  orgNote?: string;
  url?: string;
  location: string;
  /** 'YYYY-MM' or 'YYYY'. */
  start: string;
  /** null = present. */
  end: string | null;
  /** One line of context about the company. */
  about?: string;
  /** Full bullets: shown on the home page. */
  bullets: string[];
  /** The "radio edit": shorter bullets for the one-page printable résumé. Falls back to `bullets`. */
  resumeBullets?: string[];
  /** A credit line, e.g. who led the brand. */
  credit?: string;
  /** Show in the "Now playing" ticker. */
  nowPlaying?: boolean;
  /** For box sets: one disc per role at the same company. */
  discs?: Disc[];
  /** Sleeve art for the discography thumbnail. */
  sleeve: { bg: string; fg: string; pattern: 'mesh' | 'dots' | 'rings' | 'bars' | 'stack'; mark: string };
}

export interface Credential {
  credential: string;
  school: string;
  /** Shown on the plaque, e.g. 'Dec 2023'. Leave null if there is no single date. */
  date: string | null;
  /** 'certified' = earned. 'pressing' = in progress. */
  status: 'certified' | 'pressing';
}

export interface Recommendation {
  /** Their name, as it appears on LinkedIn. */
  name: string;
  /** Their role in the capacity they worked with Gwido, e.g. 'Founder, Amarna'. */
  role: string;
  /** How they know Gwido, in plain words. Keep it consistent with the relationship they chose on LinkedIn. */
  relationship: string;
  /**
   * Their words, word for word as published on LinkedIn, one string per
   * paragraph. Never edit these on the site alone: if a quote here doesn't
   * match LinkedIn, it reads as made up. The first paragraph is set as the lede.
   */
  paragraphs: string[];
  /**
   * A short excerpt for the hype sticker on the hero sleeve. Must appear word
   * for word in `paragraphs` (case aside); the build fails if it doesn't.
   */
  sticker?: string;
  /** 'YYYY-MM', matching the date LinkedIn shows. */
  date: string;
  /** Link to it on LinkedIn once it's published there; null hides the link. */
  url: string | null;
  /** Colours for their monogram. */
  mark: { bg: string; fg: string };
}

export interface StudioItem {
  title: string;
  detail: string;
  /** 1 Writing (planned) · 2 Tracking (in progress) · 3 Mixing (finishing up) · 4 Mastered (done). */
  stage: 1 | 2 | 3 | 4;
  eta?: string;
}

/* ── Computed, so the copy stays true as time passes ───────────────────────── */

/** Banker Wire start date. "almost six years" today; "six years" in Feb 2027. */
export const PLANT_START = '2021-02';
const plant = tenure(PLANT_START);

/* ── The record ────────────────────────────────────────────────────────────── */

export const site = {
  /**
   * ADVANCE COPY: shows the "advance promo copy" strip across the top of every
   * page. Flip to false once Gwido has read, rewritten and approved every word
   * on the site.
   */
  advanceCopy: true,

  /**
   * WHO CAN FIND THE SITE (see src/lib/visibility.ts for how it works).
   *  'unlisted': live for anyone with the link, and link previews work, but
   *              kept out of search results, AI datasets and web archives.
   *  'public':   open to search engines, with the sitemap advertised.
   * Going public takes two edits: this line, and removing the X-Robots-Tag
   * header from vercel.json. The build fails if the two disagree, or if this
   * says 'public' while advanceCopy is still true.
   */
  visibility: 'unlisted' as 'unlisted' | 'public',

  /** The imaginary label the whole design hangs on. */
  label: {
    name: 'Ropas Records',
    /** Catalogue prefix: RR-001 is the debut LP (this site); releases count up from there. */
    prefix: 'RR',
    city: 'Waukesha, Wis.',
  },

  name: 'Gwido Ropas',
  /** Browser tab and link previews. */
  title: 'Gwido Ropas · AI-forward marketer',
  /** ~155 characters. The Google snippet. */
  description:
    'Gwido Ropas is an AI-forward marketer in Greater Milwaukee, working where marketing, technology and design meet. Experience, case studies and résumé.',
  locale: 'en-US',

  /** The plain-English job line under the name. */
  headline: 'AI-forward marketer',

  /**
   * The back-cover photo, shown with the liner notes (About) and used as the
   * image in the structured data. Optimised to AVIF/WebP at build time.
   * Replace the file with a larger original (1000px+ square) for sharper
   * retina screens; set to null to hide it.
   * Deliberately kept off the printable résumé: US hiring norms advise against
   * photos on résumés.
   */
  portrait: {
    src: portraitPhoto,
    alt: 'Gwido Ropas smiling, in a black polo shirt, in front of an orange and black mural.',
  } as { src: ImageMetadata; alt: string } | null,

  hero: {
    /** Words wrapped in *asterisks* are set in the serif italic. */
    tagline: 'Working where *marketing*, *technology* and *design* meet.',
    intro: `Marketing intern at Amarna, a Milwaukee AI software company. Events and design for Peyton Pours. ${capitalize(plant)} inside a B2B manufacturer. BAS in Digital Marketing in progress.`,
  },

  /** Status line in the booking section and the ticker. Set to null to hide. */
  availability: 'Open to coordinator roles in marketing technology, marketing operations, CRM and creative · Greater Milwaukee',
  /** The same thing, short enough for the ticker. */
  availabilityShort: 'Coordinator roles · Greater Milwaukee',

  location: {
    city: 'Waukesha',
    region: 'WI',
    display: 'Waukesha, WI · Greater Milwaukee',
  },

  /** A1 · Liner notes (about). */
  about: {
    paragraphs: [
      'As the marketing intern at Amarna, a Milwaukee AI software company, I support campaigns, social media and product messaging for two AI products: Amarna Studio and Amarna Video. I design in Figma and Claude Design, use Claude in my everyday marketing work, collaborate with engineering on UI/UX and work in Agile sprints with the engineering team.',
      'I also support events and design for Peyton Pours, a private bartending business in Lake Country, and I completed a marketing internship at Banker Wire under the VP of Marketing & Sales.',
      `Before marketing, there was the plant floor. ${capitalize(plant)} inside a B2B manufacturer gave me a process-and-quality mindset: how products are made, how errors are prevented and how to train others.`,
      'I hold an AAS in Marketing and three more marketing credentials from Waukesha County Technical College, and I’m completing a BAS in Digital Marketing at Lakeland University, with college coursework in HTML, CSS, JavaScript, SQL and Python.',
    ],
    pullQuote: 'I spent years watching how our products get made and why customers choose them. Marketing is where that knowledge turns into sales.',
    /** Three proof points. Short, specific, repeatable in an interview. */
    hooks: [
      {
        title: 'The plant floor',
        body: `${capitalize(plant)} inside a B2B manufacturer. I understand quality, process and what customers are actually buying.`,
      },
      {
        title: 'AI software',
        body: 'Design, campaigns, social and messaging for two AI products, working in sprints alongside engineers.',
      },
      {
        title: 'Live events',
        body: 'Three private events for Peyton Pours, from setup to guest experience, plus drink menus co-designed in Figma.',
      },
    ],
  },

  /** A2 · Discography (experience). Newest first. */
  experience: [
    {
      id: 'amarna',
      format: 'LP',
      role: 'Marketing Intern, Amarna Studio and Amarna Video',
      org: 'Amarna LLC',
      orgNote: 'AI software',
      url: 'https://amarna.dev',
      location: 'Milwaukee, WI',
      start: '2026-07',
      end: null,
      nowPlaying: true,
      about:
        'Early-stage AI software company. Amarna Studio is an AI-assisted authoring tool for interactive e-learning; Amarna Video turns a text premise into an editable animated episode.',
      bullets: [
        'Support campaigns, social media and product messaging for two AI products, turning technical capabilities into clear, audience-ready messages.',
        'Design graphics for the Amarna website and the Amarna Video product in Figma and Claude Design.',
        'Collaborate with engineering on UI/UX for Amarna Studio and Amarna Video, bringing working knowledge of HTML and CSS.',
        'Work in Agile sprints with the engineering team, joining sprint planning, stand-ups, reviews and retrospectives.',
        'Track marketing and product tasks in Jira and Notion from design through release.',
        'Use Claude to draft copy, research audiences and generate campaign ideas, and Claude Design for AI-assisted design.',
      ],
      resumeBullets: [
        'Support campaigns, social media and product messaging for two AI products: Amarna Studio (AI e-learning authoring) and Amarna Video (AI animation).',
        'Design website and product graphics in Figma and Claude Design; use Claude to draft copy, research audiences and generate campaign ideas.',
        'Collaborate with engineering on UI/UX for both products, bringing working knowledge of HTML and CSS.',
        'Work in Agile sprints (planning, stand-ups, reviews, retrospectives), tracking tasks in Jira and Notion from design through release.',
      ],
      sleeve: { bg: '#2a47c0', fg: '#f2ead9', pattern: 'rings', mark: 'Am' },
    },
    {
      id: 'peyton-pours',
      format: 'EP',
      role: 'Marketing & Events Assistant',
      org: 'Peyton Pours',
      orgNote: 'Private bartending',
      url: 'https://peytonpours.com',
      location: 'Lake Country, WI',
      start: '2026-08',
      end: null,
      nowPlaying: true,
      about: 'Private bartending business serving showers, dinners and private events in the Lake Country area.',
      bullets: [
        'Supported 3 private events end to end: setup, bar service and guest experience.',
        'Co-designed event drink menus in Figma and supported brand development for a new business.',
        'Contributed marketing ideas and handled marketing tasks during the brand’s launch.',
      ],
      resumeBullets: [
        'Supported 3 private events end to end: setup, bar service and guest experience.',
        'Co-designed event drink menus in Figma and supported brand development for a new private bartending business.',
      ],
      credit: 'Brand by Peyton Ropas',
      sleeve: { bg: '#e8a597', fg: '#1a1714', pattern: 'dots', mark: 'PP' },
    },
    {
      id: 'banker-wire-marketing',
      format: 'Single',
      role: 'Marketing Intern, reporting to the VP of Marketing & Sales',
      org: 'Banker Wire',
      orgNote: 'Architectural wire mesh',
      url: 'https://www.bankerwire.com',
      location: 'Mukwonago, WI',
      start: '2024',
      end: '2024',
      bullets: [
        'Supported search engine optimization for bankerwire.com, working directly with the VP of Marketing & Sales.',
        'Researched target customers to support new-business outreach.',
        'Assembled and shipped product sample kits so existing and prospective clients could see and feel product quality before buying.',
        'Studied the company’s history and differentiators to understand its brand story and what sets it apart in the market.',
      ],
      resumeBullets: [
        'Supported search engine optimization for bankerwire.com, working directly with the VP of Marketing & Sales.',
        'Researched target customers to support new-business outreach for an architectural wire mesh brand.',
        'Assembled and shipped product sample kits so existing and prospective clients could see and feel product quality before buying.',
      ],
      sleeve: { bg: '#e2a935', fg: '#1a1714', pattern: 'mesh', mark: 'BW' },
    },
    {
      id: 'banker-wire-operations',
      format: 'Box set',
      role: 'Operations & manufacturing',
      org: 'Banker Wire',
      orgNote: 'Architectural wire mesh',
      url: 'https://www.bankerwire.com',
      location: 'Mukwonago, WI',
      start: PLANT_START,
      end: null,
      bullets: [],
      resumeBullets: [
        'Verify material size, type, weight and first-in-first-out rotation on every order, keeping defective material out of production and cutting waste.',
        'Operated, maintained and troubleshot a custom welding machine; built new parts that made it run faster and more reliably.',
        'Trained new operators on safe, efficient welder operation and maintenance.',
      ],
      discs: [
        {
          role: 'Material Handler',
          start: '2025-01',
          end: null,
          bullets: [
            'Confirm material size, type and quality against each order so no faulty product enters production.',
            'Take exact material weights so no excess material is wasted.',
            'Rotate material first-in, first-out so nothing is misplaced and waste stays low.',
          ],
        },
        {
          role: 'Machine Operator',
          start: '2024-03',
          end: '2024-12',
          bullets: [
            'Operated, maintained and cleaned a custom welding machine to make quality parts that shipped on time.',
            'Troubleshot recurring problems and built new parts that helped the machine run more effectively and efficiently.',
          ],
        },
        {
          role: 'Manufacturing Associate',
          start: '2021-02',
          end: '2024-03',
          bullets: [
            'Solved problems on the fly, fixing machines and analyzing processes to make them more time-efficient.',
            'Trained workers to safely and efficiently operate, maintain and run a welder.',
            'Adapted quickly in a fast-paced environment where speed and learning directly affect profitability.',
          ],
        },
      ],
      sleeve: { bg: '#1a1714', fg: '#e2a935', pattern: 'stack', mark: 'BW' },
    },
  ] satisfies Release[] as Release[],

  /** B-sides & rarities: earlier jobs. One line each on the résumé. */
  earlier: [
    {
      role: 'Dietary Aide',
      org: 'Kensington Care and Rehab Facility',
      location: 'Waukesha, WI',
      when: '2020 – 2021',
      note: 'Prepared and served meals tailored to residents’ preferences and built relationships with people from many cultures and communities.',
    },
    {
      role: 'Shift Lead (previously Store Associate)',
      org: 'Papa Murphy’s',
      location: 'Mukwonago, WI',
      when: '2019 – 2020',
      note: 'Trained and led a team through 8-hour shifts, balancing in-store service with pickup orders, cash and inventory.',
    },
    {
      role: 'Kitchen Team',
      org: 'Knuckleheads, Wisconsin State Fair',
      location: 'West Allis, WI',
      when: 'Seasonal',
      note: 'Promoted new products in costume to draw in customers, and tracked inventory in a high-stress, fast-changing environment.',
    },
  ],

  /** B2 · Certified (education & credentials). */
  education: {
    credentials: [
      { credential: 'BAS in Digital Marketing', school: 'Lakeland University (online)', date: 'Expected Dec 2027', status: 'pressing' },
      { credential: 'AAS in Marketing', school: 'Waukesha County Technical College', date: 'Dec 2023', status: 'certified' },
      { credential: 'Digital Marketing Promotions Technical Diploma', school: 'Waukesha County Technical College', date: null, status: 'certified' },
      { credential: 'Social Media Marketing Technical Certificate', school: 'Waukesha County Technical College', date: null, status: 'certified' },
      { credential: 'Sports & Entertainment Marketing Certificate', school: 'Waukesha County Technical College', date: 'Mar 2025', status: 'certified' },
    ] satisfies Credential[] as Credential[],
    /** For the résumé's education line. */
    schools: [
      { school: 'Lakeland University (online)', place: null, detail: 'BAS in Digital Marketing', when: 'Expected Dec 2027' },
      {
        school: 'Waukesha County Technical College',
        place: 'Pewaukee, WI',
        detail: 'AAS in Marketing (Dec 2023) · Digital Marketing Promotions Technical Diploma · Social Media Marketing Technical Certificate · Sports & Entertainment Marketing Certificate (Mar 2025)',
        when: 'Aug 2021 – Mar 2025',
      },
    ],
    coursework: [
      'Marketing Principles',
      'Marketing Research',
      'Sales Principles',
      'Marketing Management',
      'Digital Marketing',
      'Global Marketing',
      'Marketing Public Relations',
      'Experiential Marketing',
      'Social Media Promotion',
    ],
    coding: ['HTML', 'CSS', 'JavaScript', 'SQL', 'Python'],
  },

  /**
   * B1 · Personnel & instrumentation (skills), set like the credits on an LP
   * sleeve: the tool, then what it's used for. Keep the "part" factual.
   */
  skills: [
    {
      group: 'AI & marketing technology',
      credits: [
        { name: 'Claude', part: 'copy, research & ideation' },
        { name: 'HubSpot', part: 'CRM' },
        { name: 'Google Analytics', part: 'web analytics' },
        { name: 'Jira', part: 'sprint & task tracking' },
        { name: 'Notion', part: 'docs & plans' },
        { name: 'VS Code', part: 'code editor' },
        { name: 'MCP', part: 'working knowledge' },
      ],
      note: 'MCP (Model Context Protocol) is the open standard that connects AI assistants to tools like Notion, Jira and HubSpot.',
    },
    {
      group: 'Creative',
      credits: [
        { name: 'Figma', part: 'web & product graphics, menus' },
        { name: 'Claude Design', part: 'AI-assisted design' },
        { name: 'Adobe Photoshop', part: 'image editing' },
        { name: 'Canva', part: 'design' },
        { name: 'UI/UX', part: 'collaboration with engineering' },
      ],
    },
    {
      group: 'Project management',
      credits: [
        { name: 'Agile / Scrum', part: 'sprint ceremonies' },
        { name: 'Planning', part: 'stand-ups, reviews, retros' },
        { name: 'SDLC', part: 'software development life cycle' },
      ],
    },
    {
      group: 'Coding (college coursework)',
      credits: [
        { name: 'HTML & CSS', part: 'markup & styling' },
        { name: 'JavaScript', part: 'scripting' },
        { name: 'SQL', part: 'querying data' },
        { name: 'Python', part: 'scripting' },
      ],
    },
  ],

  /** The marketing repertoire, listed as a run of "standards". */
  repertoire: [
    'Campaigns',
    'Social media content & promotion',
    'Product messaging',
    'SEO',
    'Web analytics',
    'Experiential & event marketing',
    'Partnerships & sponsorships',
    'Public relations (media kits, pitches)',
    'Market research',
    'Budgeting',
    'Sales presentations',
    'Customer service & reputation management',
  ],

  strengths: ['Training & leadership', 'Process improvement', 'Quality control', 'Attention to detail', 'Cross-cultural communication'],

  /** One-line skills for the printable résumé (the 1-page "send version"). */
  resumeSkills: [
    { group: 'Marketing technology and AI', items: 'HubSpot (CRM), Google Analytics, Claude, Jira, Notion, VS Code; working knowledge of MCP (Model Context Protocol) servers that connect AI assistants to business tools' },
    { group: 'Creative', items: 'Figma, Claude Design, Adobe Photoshop, Canva, AI-assisted copywriting and design' },
    { group: 'Project management', items: 'Agile/Scrum, sprint ceremonies (planning, stand-ups, reviews, retrospectives), software development life cycle (SDLC)' },
    { group: 'Coding (college coursework)', items: 'HTML, CSS, JavaScript, SQL, Python' },
    { group: 'Marketing', items: 'campaigns, social content, product messaging, SEO, event marketing, UI/UX collaboration, market research, PR' },
  ],

  /** The 1-page résumé summary. */
  resumeSummary: `AI-forward marketer working where marketing, technology, and design meet. Marketing intern at Amarna, an AI software company: designs in Figma and Claude Design, uses Claude in everyday marketing work, works in Agile sprints with engineering, and supports campaigns, social, and messaging for two AI products. Coursework in HTML, CSS, JavaScript, SQL, and Python. ${capitalize(plant)} in manufacturing built a process-and-quality mindset. AAS in Marketing; BAS in Digital Marketing in progress.`,

  /** The projects line on the printable résumé. */
  resumeProjects: [
    'Molson Coors sponsorship plan ($1.0M, Wisconsin State Fair and Milwaukee Milkmen)',
    'Tabal Chocolate PR campaign (team of 3)',
    'Pop’s Popcorn sales pitch',
  ],

  /** Smaller class projects that don't have their own case study page. */
  otherProjects: [
    { title: 'Experiential marketing event', note: 'Team project (Molson Coors case study): designed and ran an event to engage consumers and build brand awareness.' },
    { title: 'Pop’s Popcorn sales pitch', note: 'Created and presented a pitch showing customers why they’d succeed with our product over competitors.' },
  ],

  /**
   * A4 · On the record (recommendations). Unlike the rest of this file, these
   * are other people's words, so Gwido doesn't rewrite them: they're quoted
   * exactly as published on LinkedIn. Newest first. An empty list hides the
   * section and the hero sticker.
   */
  recommendations: [
    {
      name: 'Andrew Gunn',
      role: 'Founder, Amarna',
      relationship: 'Mentor · worked with Gwido on Amarna Studio, Amarna Video and consulting work',
      paragraphs: [
        'Gwido has the kind of marketing instincts you can’t teach, and he pairs them with real curiosity about technology. That combination is rare this early in a marketing career.',
        'I’ve known Gwido for years and have worked with him in different capacities while he’s been in school. Most recently, he helped me shape the UI and UX for Amarna Studio and Amarna Video, the AI products I’m building at Amarna. He’s creative, he has a sharp eye for detail and he knows what people like. His feedback always comes back to the people who will actually use the product.',
        'He’s also my go-to second set of eyes in my consulting work. When I need a fresh perspective on something, I send it to Gwido, and what comes back is honest, thoughtful and useful.',
        'Gwido has the intangibles of a good marketer, and he’s tech savvy to match. He’s finding inventive ways to put AI to work, and he isn’t content just using the tools. He wants to understand how they work.',
        'If you’re building a team where marketing, design and technology meet, Gwido belongs on your shortlist. I recommend him without hesitation.',
      ],
      sticker: 'Marketing instincts you can’t teach',
      date: '2026-11',
      /** Paste the link once it's live: linkedin.com/in/gwido-ropas-263596235/details/recommendations/ */
      url: null,
      mark: { bg: '#2a47c0', fg: '#f2ead9' },
    },
  ] satisfies Recommendation[] as Recommendation[],

  /**
   * B3 · In the studio: what's being worked on right now. When something is
   * done, set stage 4 for a while, then move it into the record proper
   * (a credential, a case study, a skill) and delete it from here.
   */
  studio: [
    { title: 'HubSpot Academy certification', detail: 'CRM and marketing automation fundamentals.', stage: 2 },
    { title: 'Google Analytics certification', detail: 'GA4 measurement and reporting, through Google Skillshop.', stage: 2 },
    { title: 'HubSpot waitlist workflow', detail: 'A sign-up form that adds contacts to the CRM and sends an automatic welcome email.', stage: 1 },
    { title: 'Inquiry routing for Peyton Pours', detail: 'Every website inquiry lands in a tracker and gets an instant auto-reply.', stage: 1 },
    { title: 'Peyton Pours: the results', detail: 'Before-and-after numbers for the launch work, added to the case study.', stage: 2, eta: 'Jan 2027' },
  ] satisfies StudioItem[] as StudioItem[],

  /** B4 · Booking. */
  contact: {
    email: 'gwidoropas@gmail.com',
    /** Kept off the public site on purpose (spam). Add it to show it on the printable résumé only. */
    phone: null as string | null,
    blurb: 'For interviews, introductions and good conversations about marketing, AI and how things get made.',
  },

  social: [{ label: 'LinkedIn', href: 'https://www.linkedin.com/in/gwido-ropas-263596235' }],

  resume: {
    /** '/resume' is the printable résumé pressed from this file. Swap for a PDF in public/ if you prefer. */
    href: '/resume',
  },

  analytics: {
    /** Vercel Web Analytics: cookieless. Also enable it in the Vercel dashboard → Analytics. */
    vercel: true,
    /** Optional GA4 measurement ID, e.g. 'G-XXXXXXXXXX'. */
    ga4: null as string | null,
  },

  /**
   * Ownership tokens for Google Search Console and Bing Webmaster Tools: the
   * content="…" value from their "HTML tag" verification method. Safe to add
   * while unlisted. URL Inspection should then report "Excluded by 'noindex'
   * tag", which proves the hiding works, and on launch day you can submit the
   * sitemap from the same place.
   */
  verification: {
    google: null as string | null,
    bing: null as string | null,
  },
};

export type Site = typeof site;

export const linkedin = site.social.find((s) => s.label === 'LinkedIn');

/** Initials for the monogram and favicon. */
export const initials = site.name
  .split(/\s+/)
  .map((part) => part[0])
  .join('')
  .slice(0, 2)
  .toUpperCase();

/** RR-001, RR-002 … */
export const catalog = (n: number) => `${site.label.prefix}-${String(n).padStart(3, '0')}`;
