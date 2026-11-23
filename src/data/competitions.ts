import type { GradeLevel } from "./curriculum";

/** What the learner sees. Never contains answers or marking schemes. */
export interface PublicCompetitionQuestion {
  id: string;
  number: string;
  subject: string;
  marks: number;
  type: "mcq" | "structured";
  prompt: string;
  options?: string[];
}

export interface NationwideCompetition {
  id: string;
  title: string;
  termLabel: string;
  grade: GradeLevel;
  subjectsSummary: string;
  durationMinutes: number;
  totalMarks: number;
  description: string;
  questions: PublicCompetitionQuestion[];
}

/** Server-only shapes (answers included). Types are erased at build time. */
export interface CompetitionQuestion extends PublicCompetitionQuestion {
  correctIndex?: number;
  markingScheme: string[];
}

export interface ServerCompetition extends Omit<NationwideCompetition, "questions"> {
  questions: CompetitionQuestion[];
}

export interface CompetitionPrize {
  rankLabel: string;
  title: string;
  reward: string;
  motivationNote: string;
  tier: "gold" | "silver" | "bronze" | "school";
}

export interface QuestionMarkResult {
  questionId: string;
  number: string;
  subject: string;
  type: "mcq" | "structured";
  marksAwarded: number;
  maxMarks: number;
  feedback: string;
  matchedPoints: string[];
  officialScheme: string[];
}

export interface CompetitionMarkResponse {
  competitionId: string;
  competitionTitle: string;
  grade: GradeLevel;
  totalScore: number;
  maxScore: number;
  percentage: number;
  questionsCorrect: number;
  questionsTotal: number;
  gradeBand: string;
  summaryFeedback: string;
  questionResults: QuestionMarkResult[];
  /** Signed proof of this result, issued by the server. Needed to record a verified score. */
  receipt?: string;
  receiptSignature?: string;
}

export interface CompetitionLeaderboardEntry {
  id: string;
  uid: string;
  learnerName: string;
  schoolName: string;
  province: string;
  grade: GradeLevel;
  competitionId: string;
  competitionTitle: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  timeTakenSeconds: number;
  questionsCorrect: number;
  questionsTotal: number;
  markedSummary: string;
  status: "official";
  submittedAtMillis: number;
}

export const COMPETITION_PRIZES: CompetitionPrize[] = [
  {
    rankLabel: "1st Nationwide",
    title: "National ECZ Scholar Trophy & Study Tablet",
    reward: "Android Study Tablet + 1-Year Kasukulu Pioneer Pass + Gold Certificate",
    motivationNote: "Top overall percentage across Zambia (tie-breaker: fastest completion time).",
    tier: "gold",
  },
  {
    rankLabel: "2nd Nationwide",
    title: "Silver Merit Scholar Package",
    reward: "50 GB Study Data Bundle + 6-Month Pioneer Pass + Silver Certificate",
    motivationNote: "Awarded to the second-highest verified learner nationwide.",
    tier: "silver",
  },
  {
    rankLabel: "3rd Nationwide",
    title: "Bronze Exam Excellence Pack",
    reward: "ECZ Past-Paper Revision Pack + 3-Month Pioneer Pass + Bronze Certificate",
    motivationNote: "Awarded to the third-highest verified learner nationwide.",
    tier: "bronze",
  },
  {
    rankLabel: "Top School Award",
    title: "Best Performing Zambian School",
    reward: "School Recognition Plaque + 10 Free Pioneer Passes for Exam Candidates",
    motivationNote: "School with the highest average percentage (minimum 2 recorded learners).",
    tier: "school",
  },
];
