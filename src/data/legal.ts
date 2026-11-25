// ─────────────────────────────────────────────────────────────────────────
// FILL THESE IN BEFORE LAUNCH. They appear in the Privacy Policy and Terms.
// ─────────────────────────────────────────────────────────────────────────
export const LEGAL = {
  /** The person or company that runs Kasukulu (e.g. "Kasukulu Learning Ltd"). */
  operatorName: "[Your name or company name]",
  /** An email address learners and parents can write to. */
  contactEmail: "[your-email@example.com]",
  /** Where the operator is based. */
  country: "Zambia",
  /** Shown at the top of both documents. Update when you change the text. */
  lastUpdated: "November 2026",
} as const;

export const ECZ_DISCLAIMER_SHORT =
  "Kasukulu is an independent learning app. It is not affiliated with, endorsed by, or associated with the Examinations Council of Zambia (ECZ) or the Ministry of Education.";

export const ECZ_DISCLAIMER_LONG =
  "Kasukulu is an independent learning app. It is not affiliated with, endorsed by, sponsored by, or associated with the Examinations Council of Zambia (ECZ), the Ministry of Education, or any other government body. “ECZ” is used only to describe the Zambian syllabus and exam style our lessons and practice are based on. Past papers and marking schemes shown in the app are published by ECZ and remain their property. “ECZ-style” questions, lessons and quizzes in Kasukulu are written by us or by AI and are not real exam questions. Passing or doing well in Kasukulu does not guarantee any result in a real exam.";

export interface LegalSection {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    heading: "The short version",
    bullets: [
      "You can use the tutors without making an account.",
      "Most of what Kasukulu remembers (your name, grade, progress, notes, streaks) stays on your own phone or computer.",
      "Your questions, photos and voice are sent to an AI service so the tutor can answer you. We do not sell your information or show ads.",
      "If you join the national competition, your first name, last initial, school, province and score are shown on a public leaderboard.",
      "You can delete your data any time from your Profile.",
    ],
  },
  {
    heading: "Who we are",
    paragraphs: [
      `Kasukulu is run by ${LEGAL.operatorName} in ${LEGAL.country}. You can contact us at ${LEGAL.contactEmail} with any question about your privacy.`,
    ],
  },
  {
    heading: "What is saved on your own device",
    paragraphs: [
      "These things are stored in your browser on your device. We do not receive a copy:",
    ],
    bullets: [
      "Your learner profile: first name, school (optional), grade, province, language preference and learning pace.",
      "Your progress: topics studied, quiz results, daily activity, streaks, points and badges.",
      "Your study tools: flashcards, mistake bank, study calendar, lesson notes, saved lessons and settings.",
      "If you add your parent's WhatsApp number to share your weekly report, it is kept only on this device.",
      "A random anonymous ID for this device. It contains no personal details and is sent with AI requests so each learner gets a fair daily allowance.",
    ],
  },
  {
    heading: "Sharing with friends and parents",
    paragraphs: [
      "You choose what to share. A friend challenge link contains five quiz questions, your first name and your score. A weekly report message contains your first name, grade and study numbers. These are sent through WhatsApp or wherever you choose to paste them, so please only send them to people you trust. We do not see them.",
    ],
  },
  {
    heading: "What is sent to our server and to Google's Gemini AI",
    paragraphs: [
      "When you talk to a tutor, take a lesson, mark an exercise or snap a question, the content you send is passed through our server to Google's Gemini AI service so it can reply. This can include:",
    ],
    bullets: [
      "Questions and answers you type.",
      "Photos you take or upload with “Snap a question”.",
      "Your voice during a live phone call or when you use voice input.",
      "Your grade, subject and topic so the answer fits your level.",
    ],
  },
  {
    heading: "What we do with it",
    paragraphs: [
      "We do not keep your questions, photos or voice recordings on our server. Google processes them to produce a reply, under Google's own terms and privacy policy. Please do not type or photograph private information such as phone numbers, home addresses or ID numbers.",
      "Our server may briefly keep your network address (IP address) in memory to stop abuse, such as too many requests. It is not stored permanently.",
    ],
  },
  {
    heading: "The national competition and leaderboard",
    paragraphs: [
      "Only if you choose to enter a competition and sign in with Google, we store an entry in our database (Google Firebase). It contains: your Google account ID, the first name and last initial you entered, your school, province and grade, which competition you entered, your score, time taken and a short marking summary, and the date.",
      "Entries on the leaderboard are visible to other signed-in learners. We use your Google sign-in only to confirm it is really you and to stop fake scores. We do not use your Google email for marketing.",
    ],
  },
  {
    heading: "Who can see your information",
    bullets: [
      "Only you, for everything stored on your device.",
      "Google, as our AI and hosting provider, for the content needed to answer you and to run sign-in and the leaderboard.",
      "Other learners, but only your first name, last initial, school, province, grade and score, and only if you entered a competition.",
      "Our administrators, who can see and remove competition entries.",
      "Anyone else only if the law requires us to share it.",
      "We never sell your information.",
    ],
  },
  {
    heading: "Children and young people",
    paragraphs: [
      "Kasukulu is made for school learners, many of whom are under 18. If you are under 18, please make sure a parent or guardian knows you are using Kasukulu and has agreed. Parents and guardians can write to us at any time to ask what we hold about their child or to have it deleted.",
      "We only ask for what the app needs. We do not ask for phone numbers, home addresses or photos of the learner.",
    ],
  },
  {
    heading: "Your choices and rights",
    bullets: [
      "Delete your data: open your Profile and choose “Delete my data”. This clears everything saved on this device and removes your competition entries.",
      "Clear it yourself: clearing your browser's site data also removes everything saved on your device.",
      "Ask us: email us to see, correct or delete anything we hold about you. Under the Data Protection Act of Zambia you have the right to access and correct your personal data and to ask us to delete it.",
    ],
  },
  {
    heading: "Keeping things safe",
    paragraphs: [
      "Data travels over secure (HTTPS) connections. Competition scores are checked by our server so they cannot be faked. No system is perfectly safe, so please keep your Google account secure.",
    ],
  },
  {
    heading: "Changes to this policy",
    paragraphs: [
      "If we change how we handle your information we will update this page and the date at the top. If a change matters a lot, we will tell you in the app.",
    ],
  },
];

export const TERMS_SECTIONS: LegalSection[] = [
  {
    heading: "Not connected to ECZ",
    paragraphs: [ECZ_DISCLAIMER_LONG],
  },
  {
    heading: "Using Kasukulu",
    bullets: [
      "Kasukulu is for learning. Use it kindly and honestly.",
      "If you are under 18, you should use it with your parent or guardian's permission.",
      "Do not try to break the app, cheat the leaderboard, copy competition answers or use automated tools against it.",
      "Do not send anything unlawful, hurtful or private about other people.",
    ],
  },
  {
    heading: "AI tutors can make mistakes",
    paragraphs: [
      "Our tutors, lessons, quizzes and marking are produced with the help of AI. They are meant to help you learn, but they can be wrong. Always check important facts with your teacher, your textbook and the official syllabus. Kasukulu is a study aid and not a replacement for school or teachers.",
    ],
  },
  {
    heading: "Competitions",
    paragraphs: [
      "Competitions run by Kasukulu are our own and are not ECZ exams. Scores must be earned honestly. We may remove any entry we believe is faked, copied or made in bad faith. Any prizes are described on the competition page and are decided by us.",
    ],
  },
  {
    heading: "Our content",
    paragraphs: [
      "The app, its design and the lessons we write belong to us or our licensors. You may use them for your own study. Please do not copy and resell them. Past papers belong to ECZ.",
    ],
  },
  {
    heading: "No guarantees",
    paragraphs: [
      "We work hard to keep Kasukulu running and accurate, but we provide it “as is”. It may sometimes be offline or contain errors. To the extent the law allows, we are not responsible for losses from using it, including exam results.",
    ],
  },
  {
    heading: "Changes and contact",
    paragraphs: [
      `We may update these terms and will change the date above when we do. Questions? Email ${LEGAL.contactEmail}. These terms are governed by the laws of ${LEGAL.country}.`,
    ],
  },
];
