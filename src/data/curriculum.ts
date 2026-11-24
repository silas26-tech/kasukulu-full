export type GradeLevel =
  | "Grade 7"
  | "Grade 8"
  | "Grade 9"
  | "Grade 10"
  | "Grade 11"
  | "Grade 12"
  | "A-Level";

export type LanguageAid =
  | "English Only"
  | "English + Bemba"
  | "English + Nyanja"
  | "English + Tonga"
  | "English + Lozi"
  | "English + Kaonde"
  | "English + Luvale"
  | "English + Lunda"
  | "English + French"
  | "English + Swahili";

export type LearningPace = "Step-by-step" | "Exam Revision" | "Challenge Me";

export type VoiceName = "Kore" | "Charon" | "Zephyr" | "Puck";

export interface LearnerProfile {
  name: string;
  school?: string;
  grade: GradeLevel;
  languageAid: LanguageAid;
  pace: LearningPace;
  province: string;
}

export interface TutorPersona {
  id: string;
  name: string;
  subjectFocus: string;
  voiceName: VoiceName;
  voiceStyle: string;
  teachingStyle: string;
  zambianContext: string;
  sampleGreeting: string;
  levelBadge?: string;
  isALevelSpecialist?: boolean;
}
export interface SyllabusTopic {
  id: string;
  tutorId: string;
  grade: GradeLevel;
  subject: string;
  title: string;
  summary: string;
  keyTerms: string[];
  starterPrompt: string;
}

export interface BlackboardNote {
  id: string;
  title: string;
  subject: string;
  grade: GradeLevel;
  keyRule: string;
  workedSteps: string[];
  checkQuestion: string;
  updatedAt?: string;
}


export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TranscriptEntry {
  id: string;
  role: "learner" | "tutor";
  text: string;
  timestamp: string;
  source: "live" | "chat";
  imageUrl?: string;
}

export interface DailyActivity {
  date: string; // YYYY-MM-DD (local date)
  sessions: number;
  quizAnswered: number;
  quizCorrect: number;
}

export interface WeaknessItem {
  id: string;
  title: string;
  subject: string;
  grade: GradeLevel;
  prompt: string;
  explanation: string;
  addedAt: string;
}

export interface StudyProgress {
  sessionsCompleted: number;
  quizAnswered: number;
  quizCorrect: number;
  topicsStudied: string[];
  savedNotes: BlackboardNote[];
  weaknesses: WeaknessItem[];
  dailyActivity: Record<string, DailyActivity>;
}

export function getLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export interface WeeklyChartPoint {
  dateKey: string;
  dayLabel: string;
  fullDate: string;
  sessions: number;
  quizPerformance: number | null;
  quizAnswered: number;
  quizCorrect: number;
}

export function buildWeeklyChartData(
  progress: StudyProgress,
  now: Date = new Date()
): WeeklyChartPoint[] {
  const points: WeeklyChartPoint[] = [];
  for (let offset = 6; offset >= 0; offset--) {
    const d = new Date(now);
    d.setDate(now.getDate() - offset);
    const key = getLocalDateKey(d);
    const entry = progress.dailyActivity?.[key];
    const sessions = entry?.sessions ?? 0;
    const quizAnswered = entry?.quizAnswered ?? 0;
    const quizCorrect = entry?.quizCorrect ?? 0;
    const quizPerformance =
      quizAnswered > 0 ? Math.round((quizCorrect / quizAnswered) * 100) : null;

    points.push({
      dateKey: key,
      dayLabel:
        offset === 0
          ? "Today"
          : d.toLocaleDateString(undefined, { weekday: "short" }),
      fullDate: d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      sessions,
      quizPerformance,
      quizAnswered,
      quizCorrect,
    });
  }
  return points;
}

export function calculateStudyStreak(
  dailyActivity: Record<string, DailyActivity> | undefined,
  now: Date = new Date()
): number {
  if (!dailyActivity) return 0;

  const todayKey = getLocalDateKey(now);
  const todayEntry = dailyActivity[todayKey];
  const hasStudiedToday = todayEntry && todayEntry.sessions > 0;

  let streak = 0;
  let cursor = new Date(now);

  if (hasStudiedToday) {
    streak = 1;
    cursor.setDate(cursor.getDate() - 1);
  } else {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = getLocalDateKey(yesterday);
    const yesterdayEntry = dailyActivity[yesterdayKey];
    if (yesterdayEntry && yesterdayEntry.sessions > 0) {
      cursor = yesterday;
    } else {
      return 0;
    }
  }

  while (true) {
    const key = getLocalDateKey(cursor);
    const entry = dailyActivity[key];
    if (entry && entry.sessions > 0) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export const ZAMBIAN_PROVINCES = [
  "Lusaka",
  "Copperbelt",
  "Southern",
  "Eastern",
  "Central",
  "Northern",
  "Luapula",
  "North-Western",
  "Western",
  "Muchinga",
];

export const TUTORS: TutorPersona[] = [
  {
    id: "kaluba",
    name: "Dr. Kaluba",
    subjectFocus: "A-Level Pure Mathematics, Further Math & Mechanics",
    voiceName: "Charon",
    voiceStyle:
      "Warm, unhurried, deeply personal educated UK-Zambian English accent—crisp British-Commonwealth vowels and refined consonants blended with gentle Lusaka warmth, thoughtful conversational pauses, and encouraging professorial care",
    teachingStyle:
      "Breaks down complex integration by parts, 3D vectors, differential equations, and mechanics proofs with rigorous step-by-step clarity.",
    zambianContext:
      "Connects advanced mathematical modeling to Kariba Dam structural engineering, mining survey triangulation, and Zambian statistical data.",
    sampleGreeting:
      "Ah, wonderful to have you here, my friend! I'm Dr. Kaluba. Grab your pen and keep your eye on the board — pure maths and mechanics feel tough at first, rather like climbing a steep kopje, but step by step you'll master every proof. What shall we tackle first?",
    levelBadge: "A-Level Specialist",
    isALevelSpecialist: true,
  },
  {
    id: "tembo",
    name: "Dr. Mutale Tembo",
    subjectFocus: "A-Level Chemistry & Molecular Biochemistry",
    voiceName: "Kore",
    voiceStyle:
      "Warm, expressive, personal educated UK-Zambian female voice—polished British-Commonwealth pronunciation and broad vowels with natural Lusaka melody, gentle conversational breathing, and supportive energy",
    teachingStyle:
      "Visualizes curved-arrow organic mechanisms, transition metal complexes, entropy, and Born-Haber thermochemical cycles clearly before writing equations.",
    zambianContext:
      "References Copperbelt hydrometallurgical extraction, water quality chemistry of the Zambezi basin, and pharmaceutical biochemistry.",
    sampleGreeting:
      "Good to see you today! I'm Dr. Mutale Tembo. Don't worry if organic mechanisms or thermodynamics look tangled right now — I'll put the steps right on your board while you test them out on your work pad. Shall we dive straight in?",
    levelBadge: "A-Level Specialist",
    isALevelSpecialist: true,
  },
  {
    id: "sibanda",
    name: "Prof. Sibanda",
    subjectFocus: "A-Level Physics (Fields, Quantum & Thermodynamics)",
    voiceName: "Zephyr",
    voiceStyle:
      "Engaging, bright, conversational UK-Zambian educator voice—refined British diction and clear enunciation paired with warm Southern African cadence, lively curiosity, and human mentor presence",
    teachingStyle:
      "Focuses on fundamental conservation laws, dimensional analysis, electric & gravitational field equations, and wave-particle duality.",
    zambianContext:
      "Brings in ZESCO high-voltage grid transmission, African synchrotron research, and solar photovoltaic physics.",
    sampleGreeting:
      "Lovely to catch up with you! I'm Prof. Sibanda. Physics makes complete sense once you picture what's actually happening — so watch the board and sketch with me on your work pad. Ready to put our heads together?",
    levelBadge: "A-Level Specialist",
    isALevelSpecialist: true,
  },
  {
    id: "kangwa",
    name: "Madam Kangwa",
    subjectFocus: "A-Level Biology & Genetics",
    voiceName: "Puck",
    voiceStyle:
      "Kind, vivid, personable UK-Zambian voice—articulate British-Commonwealth English softened with warm Copperbelt melody, genuine emotional warmth, and natural unhurried rhythm",
    teachingStyle:
      "Deep-dives into cellular respiration biochemistry, gene technology (PCR, gel electrophoresis), synaptic transmission, and evolutionary ecology.",
    zambianContext:
      "Highlights endemic Zambian biodiversity, tropical disease molecular epidemiology, and agriculture biotechnology.",
    sampleGreeting:
      "Mwapoleni! It's so good to sit down with you — I'm Madam Kangwa. Whether we're tracing respiration or cracking genetics, we'll go at your exact pace on the board and your work pad. What would you like to explore first?",
    levelBadge: "A-Level Specialist",
    isALevelSpecialist: true,
  },
  {
    id: "chisanga",
    name: "Dr. Chisanga",
    subjectFocus: "Computer Science, ICT & Applied Statistics",
    voiceName: "Charon",
    voiceStyle:
      "Clear, analytical, welcoming UK-Zambian tech mentor voice—crisp British diction paired with warm Lusaka encouragement and structured logical clarity",
    teachingStyle:
      "Demystifies programming logic, algorithms, databases, normalization, and statistical analysis step by step.",
    zambianContext:
      "Applies data structures and software logic to Zambian digital census platforms, mobile money banking APIs, and tech hubs.",
    sampleGreeting:
      "Mwapoleni! I'm Dr. Chisanga. Whether we're writing Python code, structuring databases, or tackling statistics, we'll build every algorithm cleanly on the board. What shall we code today?",
    levelBadge: "A-Level & Senior Specialist",
    isALevelSpecialist: true,
  },
  {
    id: "chanda",
    name: "Madam Chanda",
    subjectFocus: "Mathematics & Additional Math",
    voiceName: "Kore",
    voiceStyle:
      "Warm, affectionate, natural UK-Zambian female teacher voice—clear British-Commonwealth vowel precision with gentle Lusaka cadence, friendly conversational contractions, soft chuckles, and encouraging patience",
    teachingStyle:
      "Breaks algebraic and geometric problems into calm, numbered steps and checks your reasoning after every step.",
    zambianContext:
      "Uses everyday examples like ZESCO electricity units, Lusaka–Ndola bus travel, and Kwacha market budgets.",
    sampleGreeting:
      "Mwapoleni, my friend! I'm Madam Chanda, and I'm really glad we're studying together today. Keep an eye on the board and have your work pad handy — ehe, we'll take it one tidy step at a time. What topic shall we start with?",
    levelBadge: "ECZ Secondary Tutor",
  },
  {
    id: "mwansa",
    name: "Mr. Mwansa",
    subjectFocus: "Biology, Chemistry & Integrated Science",
    voiceName: "Charon",
    voiceStyle:
      "Calm, grounded, personal UK-Zambian male science mentor voice—refined British-Zambian diction, steady warm tone, unhurried conversational phrasing, and genuine care for the learner's confidence",
    teachingStyle:
      "Builds intuition from everyday observation before introducing formal ECZ scientific definitions and chemical equations.",
    zambianContext:
      "Connects concepts to Kafue Flats ecology, maize farming, local soils, and human health.",
    sampleGreeting:
      "Bwanji, my friend! I'm Mr. Mwansa. Good to have you at the study table today. Whenever I explain a rule, it'll pop straight onto your board so you can try it out on your work pad. Which science question is on your mind?",
    levelBadge: "ECZ Secondary Tutor",
  },
  {
    id: "phiri",
    name: "Miss Phiri",
    subjectFocus: "Physics & Environmental Science",
    voiceName: "Zephyr",
    voiceStyle:
      "Crisp, friendly, genuine UK-Zambian young physics mentor voice—clear British-Commonwealth pronunciation with warm Lusaka rhythm, natural conversational energy, and reassuring clarity",
    teachingStyle:
      "Focuses on unit consistency, clear diagrams, and connecting formulas directly to physical motion and circuits.",
    zambianContext:
      "Explains energy and electricity through Kariba Dam hydro turbines, solar panels, and Copperbelt industry.",
    sampleGreeting:
      "Hello there, lovely to meet you! I'm Miss Phiri. Let's take the mystery out of forces and circuits today — I'll write each formula on the board while you sketch on your work pad. Shall we jump into our first problem?",
    levelBadge: "ECZ Secondary Tutor",
  },
  {
    id: "banda",
    name: "Mr. Banda",
    subjectFocus: "English, Civic Education & Zambian Languages",
    voiceName: "Puck",
    voiceStyle:
      "Articulate, gentlemanly, deeply personal UK-Zambian humanities tutor voice—polished British-Commonwealth diction and warm Lusaka intonation, thoughtful conversational rhythm, and rich human expression",
    teachingStyle:
      "Coaches essay structure, grammar precision, comprehension skills, and constitutional literacy with spoken practice.",
    zambianContext:
      "References Zambian civic institutions, local literature, and respectful multilingual bridges.",
    sampleGreeting:
      "Muli bwanji! I'm Mr. Banda, and it's a real pleasure working with you today. Look over at the board for our structure, and feel free to draft right on your work pad. What essay or topic shall we polish together?",
    levelBadge: "ECZ Secondary Tutor",
  },
  {
    id: "mulenga",
    name: "Madam Mulenga",
    subjectFocus: "Principles of Accounts, Commerce & Entrepreneurship",
    voiceName: "Kore",
    voiceStyle:
      "Professional, encouraging, structured UK-Zambian financial mentor voice—clear enunciation and reassuring warmth",
    teachingStyle:
      "Simplifies double-entry bookkeeping, ledger accounts, trial balances, income statements, and balance sheets.",
    zambianContext:
      "Teaches accounting through Lusaka wholesale businesses, ZRA tax compliance, and Zambian commercial enterprise.",
    sampleGreeting:
      "Mwapoleni! I'm Madam Mulenga. Accounts and commerce become wonderfully clear once we balance our debits and credits. Have your work pad ready — let's master the balance sheet together!",
    levelBadge: "ECZ Secondary Tutor",
  },
  {
    id: "ngandu",
    name: "Mr. Ng'andu",
    subjectFocus: "Geography & Agricultural Science",
    voiceName: "Puck",
    voiceStyle:
      "Enthusiastic, outdoorsy, knowledgeable UK-Zambian science and geography mentor voice",
    teachingStyle:
      "Explains topographical map reading, weather systems, soil profiles, crop rotation, and livestock husbandry.",
    zambianContext:
      "Connects geography and agriculture to the Zambezi river basin, agro-ecological regions of Zambia, and farming cooperatives.",
    sampleGreeting:
      "Bwanji! I'm Mr. Ng'andu. From contour lines on topographical maps to crop rotation in Zambia's Agro-Ecological Region III, we'll map it all out clearly on your board.",
    levelBadge: "ECZ Secondary Tutor",
  },
  {
    id: "mumba",
    name: "Madam Mumba",
    subjectFocus: "Literature in English & Zambian Languages",
    voiceName: "Zephyr",
    voiceStyle:
      "Expressive, eloquent, deeply engaging UK-Zambian literary arts and languages tutor voice",
    teachingStyle:
      "Guides character analysis, poetry appreciation, thematic essay writing, and Zambian indigenous language grammar.",
    zambianContext:
      "Celebrates Zambian authors, folktales, proverbs, and prescribed ECZ literature texts.",
    sampleGreeting:
      "Mwapoleni, my friend! I'm Madam Mumba. Let's unlock the beauty of literature and Zambian languages together. What story or poem shall we explore today?",
    levelBadge: "ECZ Secondary Tutor",
  },
];

export const ECZ_SCHOOL_TUTORS: TutorPersona[] = TUTORS.filter(
  (t) => !t.isALevelSpecialist
);

export const A_LEVEL_TUTORS: TutorPersona[] = TUTORS.filter(
  (t) => Boolean(t.isALevelSpecialist)
);

export const ECZ_TOPICS: SyllabusTopic[] = [
  // Grade 7
  {
    id: "g7-math-ratios",
    tutorId: "chanda",
    grade: "Grade 7",
    subject: "Mathematics",
    title: "Ratio, Proportion & Percentages",
    summary:
      "Sharing quantities in given ratios, calculating profit/loss percentages in Kwacha, and unitary method.",
    keyTerms: ["Ratio", "Proportion", "Percentage Profit", "Unitary Method"],
    starterPrompt:
      "Can you explain how to share K240 between two friends in the ratio 3:5, step by step?",
  },
  {
    id: "g7-math-fractions",
    tutorId: "chanda",
    grade: "Grade 7",
    subject: "Mathematics",
    title: "Fractions, Decimals & Number Bases",
    summary:
      "Converting between fractions, decimals, and percentages, and adding or subtracting numbers in base 2 and base 5.",
    keyTerms: ["LCM", "Decimal Place", "Base 2", "Base 5"],
    starterPrompt:
      "Walk me through converting 3/8 to a decimal and percentage, and adding two base 5 numbers.",
  },
  {
    id: "g7-sci-photosynthesis",
    tutorId: "mwansa",
    grade: "Grade 7",
    subject: "Integrated Science",
    title: "Plant Growth & Photosynthesis",
    summary:
      "How maize and green plants make food using sunlight, water, and carbon dioxide, and the role of chlorophyll.",
    keyTerms: ["Chlorophyll", "Stomata", "Carbon Dioxide", "Glucose"],
    starterPrompt:
      "Explain photosynthesis to me like I am seeing a maize plant growing in our garden.",
  },
  {
    id: "g7-eng-comprehension",
    tutorId: "banda",
    grade: "Grade 7",
    subject: "English Language",
    title: "Active & Passive Voice + Summary",
    summary:
      "Transforming active sentences into passive voice cleanly and picking main ideas in ECZ comprehension passages.",
    keyTerms: ["Subject", "Object", "Past Participle", "Topic Sentence"],
    starterPrompt:
      "Help me practice changing active sentences into passive voice for Grade 7 English.",
  },
  {
    id: "g7-sci-circuits",
    tutorId: "phiri",
    grade: "Grade 7",
    subject: "Integrated Science",
    title: "Simple Electric Circuits & Safety",
    summary:
      "Conductors vs insulators, series bulbs, switches, and electrical safety at home.",
    keyTerms: ["Conductor", "Insulator", "Cell", "Closed Circuit"],
    starterPrompt:
      "What happens when you add a second bulb in a simple circuit, and why do we use copper wires?",
  },
  {
    id: "g7-soc-map",
    tutorId: "banda",
    grade: "Grade 7",
    subject: "Social Studies",
    title: "Provinces of Zambia, Rivers & Transport",
    summary:
      "Locating Zambia's 10 provinces, major rivers and lakes (Zambezi, Kafue, Bangweulu), and road/rail transport routes.",
    keyTerms: ["Ten Provinces", "Zambezi Basin", "TAZARA", "Natural Resources"],
    starterPrompt:
      "Help me revise Zambia's 10 provinces, provincial capitals, and major rivers.",
  },
  {
    id: "g7-cts-design",
    tutorId: "chisanga",
    grade: "Grade 7",
    subject: "Creative & Technology Studies",
    title: "Technical Drawing, Tools & Craft Safety",
    summary:
      "Isometric and orthographic sketches, measuring instruments, woodwork/metalwork hand tools, and workshop safety.",
    keyTerms: ["Orthographic View", "Measuring Tape", "Workshop Safety", "Materials"],
    starterPrompt:
      "Explain the basic drawing tools and workshop safety rules in Grade 7 Creative & Technology Studies.",
  },

  // Grade 8
  {
    id: "g8-math-integers",
    tutorId: "chanda",
    grade: "Grade 8",
    subject: "Mathematics",
    title: "Directed Numbers & Algebraic Expressions",
    summary:
      "Operations with negative and positive integers, simplifying algebraic expressions, and solving simple linear equations.",
    keyTerms: ["Integer", "Like Terms", "Brackets", "Expansion"],
    starterPrompt:
      "Help me understand how to multiply negative numbers correctly in Grade 8 mathematics.",
  },
  {
    id: "g8-sci-matter",
    tutorId: "mwansa",
    grade: "Grade 8",
    subject: "Integrated Science",
    title: "States of Matter & Separation Techniques",
    summary:
      "Particle theory of solids, liquids, and gases, evaporation, filtration, distillation, and chromatography.",
    keyTerms: ["Particle Theory", "Evaporation", "Distillation", "Chromatography"],
    starterPrompt:
      "How do we use fractional distillation to separate mixtures in science?",
  },
  {
    id: "g8-agric-soil",
    tutorId: "ngandu",
    grade: "Grade 8",
    subject: "Agricultural Science",
    title: "Soil Composition & Textures",
    summary:
      "Sand, silt, clay particles, soil water, air, humus, and simple soil testing experiments.",
    keyTerms: ["Humus", "Clay", "Loam", "Capillarity"],
    starterPrompt:
      "How do I determine whether a soil sample is sandy or clayey using a water sedimentation test?",
  },
  {
    id: "g8-bus-office",
    tutorId: "mulenga",
    grade: "Grade 8",
    subject: "Business Studies",
    title: "The Office, Entrepreneurship & Business Documents",
    summary:
      "Functions of an office, qualities of a good entrepreneur, and filling in quotations, invoices, receipts, and cash books.",
    keyTerms: ["Invoice", "Receipt", "Entrepreneurship", "Petty Cash"],
    starterPrompt:
      "Explain the difference between a quotation, an invoice, and a receipt in Business Studies.",
  },

  // Grade 9
  {
    id: "g9-math-linear",
    tutorId: "chanda",
    grade: "Grade 9",
    subject: "Mathematics",
    title: "Linear Equations & Inequalities",
    summary:
      "Solving simultaneous linear equations by substitution and elimination, and representing inequalities on a number line.",
    keyTerms: ["Coefficient", "Substitution", "Elimination", "Inequality"],
    starterPrompt:
      "Walk me through solving simultaneous equations using the elimination method.",
  },
  {
    id: "g9-math-sets-pythagoras",
    tutorId: "chanda",
    grade: "Grade 9",
    subject: "Mathematics",
    title: "Sets, Venn Diagrams & Pythagoras' Theorem",
    summary:
      "Set notation (union, intersection, complement), two-set Venn diagrams, and finding missing sides of right-angled triangles.",
    keyTerms: ["Union", "Intersection", "Complement", "Hypotenuse"],
    starterPrompt:
      "Help me solve a Grade 9 Venn diagram problem and apply Pythagoras' theorem.",
  },
  {
    id: "g9-sci-circulatory",
    tutorId: "mwansa",
    grade: "Grade 9",
    subject: "Integrated Science",
    title: "Human Circulatory & Respiratory Systems",
    summary:
      "Double circulation through the heart, arteries vs veins, red blood cells, and gas exchange in alveoli.",
    keyTerms: ["Alveoli", "Aorta", "Hemoglobin", "Capillaries"],
    starterPrompt:
      "How does blood travel from the heart to the lungs and back to the body?",
  },
  {
    id: "g9-phys-density",
    tutorId: "phiri",
    grade: "Grade 9",
    subject: "Integrated Science",
    title: "Density, Pressure & Moments",
    summary:
      "Calculating density of regular and irregular solids, liquid pressure with depth, and turning effect of forces.",
    keyTerms: ["Density = m/V", "Pascal", "Pivot", "Principle of Moments"],
    starterPrompt:
      "How do I calculate the density of an irregular stone using a measuring cylinder?",
  },
  {
    id: "g9-eng-composition",
    tutorId: "banda",
    grade: "Grade 9",
    subject: "English Language",
    title: "Formal Letters, Reports & Sentence Transformation",
    summary:
      "Structure of formal application letters and school reports, reported speech, question tags, and conditional clauses.",
    keyTerms: ["Formal Register", "Reported Speech", "Conditionals", "Question Tags"],
    starterPrompt:
      "Show me the exact layout and tone required for an ECZ Grade 9 formal letter.",
  },
  {
    id: "g9-civic-constitution",
    tutorId: "banda",
    grade: "Grade 9",
    subject: "Social Studies",
    title: "Zambian Governance & Citizenship",
    summary:
      "The three arms of government (Executive, Legislature, Judiciary), rights and duties of a Zambian citizen.",
    keyTerms: ["Legislature", "Judiciary", "Constitution", "Separation of Powers"],
    starterPrompt:
      "Explain the difference between the Legislature and the Judiciary in Zambia.",
  },
  {
    id: "g9-bus-ledger",
    tutorId: "mulenga",
    grade: "Grade 9",
    subject: "Business Studies",
    title: "Double Entry, Cash Book & Banking",
    summary:
      "Two-column cash book, contra entries, bank reconciliation basics, and personal budgeting.",
    keyTerms: ["Cash Book", "Contra Entry", "Debit", "Credit"],
    starterPrompt:
      "How do we record a contra entry in a two-column cash book for Grade 9 Business Studies?",
  },
  {
    id: "g9-agric-crops",
    tutorId: "ngandu",
    grade: "Grade 9",
    subject: "Agricultural Science",
    title: "Maize Production, Crop Rotation & Fertilizers",
    summary:
      "Land preparation, basal vs top-dressing fertilizers (D-Compound and Urea), weeding, and pest control in Zambia.",
    keyTerms: ["Crop Rotation", "D-Compound", "Urea", "Nitrogen Fixation"],
    starterPrompt:
      "Explain why crop rotation with groundnuts improves yields for the following maize crop.",
  },

  // Grade 10
  {
    id: "g10-math-indices",
    tutorId: "chanda",
    grade: "Grade 10",
    subject: "Mathematics",
    title: "Indices, Standard Form & Linear Graphs",
    summary:
      "Laws of indices (positive, negative, fractional), scientific notation, and gradients/equations of straight lines.",
    keyTerms: ["Laws of Indices", "Standard Form", "Gradient", "y = mx + c"],
    starterPrompt:
      "Help me simplify fractional and negative indices step by step.",
  },
  {
    id: "g10-addmath-quadratics",
    tutorId: "chanda",
    grade: "Grade 10",
    subject: "Additional Mathematics",
    title: "Surds, Logarithms & Remainder Theorem",
    summary:
      "Rationalising denominators with surds, laws of logarithms, factor & remainder theorems for cubics, and simultaneous quadratic systems.",
    keyTerms: ["Surds", "Logarithms", "Remainder Theorem", "Factor Theorem"],
    starterPrompt:
      "Show me how to rationalise a denominator with surds and apply the remainder theorem.",
  },
  {
    id: "g10-phys-kinematics",
    tutorId: "phiri",
    grade: "Grade 10",
    subject: "Physics",
    title: "Kinematics, Speed-Time Graphs & Newton's Laws",
    summary:
      "Distance, displacement, velocity, acceleration, interpreting gradient and area under velocity-time graphs, and F = ma.",
    keyTerms: ["Velocity-Time Graph", "Acceleration", "Inertia", "F = ma"],
    starterPrompt:
      "How do I calculate acceleration and total distance from a speed-time graph?",
  },
  {
    id: "g10-chem-atomic",
    tutorId: "mwansa",
    grade: "Grade 10",
    subject: "Chemistry",
    title: "Atomic Structure, Bonding & Periodic Table",
    summary:
      "Protons, neutrons, electrons, isotopes, ionic vs covalent dot-and-cross diagrams, and periodic trends across Groups I, VII, and VIII.",
    keyTerms: ["Isotope", "Ionic Bond", "Covalent Bond", "Valency"],
    starterPrompt:
      "Compare ionic and covalent bonding with dot-and-cross examples for NaCl and CH₄.",
  },
  {
    id: "g10-bio-cells",
    tutorId: "mwansa",
    grade: "Grade 10",
    subject: "Biology",
    title: "Cell Structure, Diffusion, Osmosis & Enzymes",
    summary:
      "Plant vs animal cells, active transport, turgidity vs plasmolysis in potato strips, and enzyme lock-and-key specificity.",
    keyTerms: ["Osmosis", "Plasmolysis", "Active Transport", "Denaturation"],
    starterPrompt:
      "Explain why a potato strip becomes firm in pure water but soft in concentrated salt solution.",
  },
  {
    id: "g10-accounts-books",
    tutorId: "mulenga",
    grade: "Grade 10",
    subject: "Principles of Accounts",
    title: "Double-Entry Bookkeeping & Ledger Accounts",
    summary:
      "The accounting equation (Assets = Capital + Liabilities), debit and credit rules, and posting transactions to general ledgers.",
    keyTerms: ["Accounting Equation", "Debit", "Credit", "General Ledger"],
    starterPrompt:
      "Madam Mulenga, please explain the golden rules of double-entry bookkeeping with an example.",
  },
  {
    id: "g10-ict-hardware",
    tutorId: "chisanga",
    grade: "Grade 10",
    subject: "Computer Studies / ICT",
    title: "Computer Hardware, Software & Data Representation",
    summary:
      "CPU architecture, input/output devices, primary vs secondary storage, binary number systems, and ASCII.",
    keyTerms: ["CPU", "ALU", "Binary", "RAM vs ROM"],
    starterPrompt:
      "Dr. Chisanga, how do I convert decimal number 45 into 8-bit binary?",
  },
  {
    id: "g10-geo-relief",
    tutorId: "ngandu",
    grade: "Grade 10",
    subject: "Geography",
    title: "Topographical Map Reading & Relief Features",
    summary:
      "Contour lines, grid references, scale calculation, calculating gradient, and identifying relief features like spurs and valleys.",
    keyTerms: ["Contour Interval", "Grid Reference", "Gradient", "Spur"],
    starterPrompt:
      "How do I calculate the gradient between two spot heights on an ECZ topographical map?",
  },
  {
    id: "g10-hist-zambia",
    tutorId: "banda",
    grade: "Grade 10",
    subject: "History",
    title: "Bantu Migrations & Pre-Colonial Kingdoms of Zambia",
    summary:
      "Luba-Lunda migrations into Zambia, the Lozi (Aluyi), Bemba, Kazembe-Lunda, and Chewa kingdoms, and trade networks.",
    keyTerms: ["Luba-Lunda Migration", "Mwata Kazembe", "Litunga", "Chitimukulu"],
    starterPrompt:
      "Summarize the causes and routes of the Luba-Lunda migrations into Zambia.",
  },

  // Grade 11
  {
    id: "g11-math-trig-bearings",
    tutorId: "chanda",
    grade: "Grade 11",
    subject: "Mathematics",
    title: "Trigonometry, Sine/Cosine Rules & Bearings",
    summary:
      "SOHCAHTOA, angles of elevation and depression, three-figure bearings, sine rule, cosine rule, and area ½ab sin C.",
    keyTerms: ["Bearing", "Sine Rule", "Cosine Rule", "Angle of Elevation"],
    starterPrompt:
      "Walk me through when to use the Sine Rule versus the Cosine Rule in Paper 2 trigonometry.",
  },
  {
    id: "g11-addmath-calculus",
    tutorId: "chanda",
    grade: "Grade 11",
    subject: "Additional Mathematics",
    title: "Coordinate Geometry, Circular Measure & Differentiation",
    summary:
      "Arc length s = rθ, sector area ½r²θ, differentiating polynomials, stationary points (maxima/minima), and rates of change.",
    keyTerms: ["Radian", "Stationary Point", "Gradient Function", "Tangent & Normal"],
    starterPrompt:
      "How do I find and classify stationary points of a cubic curve using differentiation?",
  },
  {
    id: "g11-chem-acids",
    tutorId: "mwansa",
    grade: "Grade 11",
    subject: "Chemistry",
    title: "Acids, Bases, Salts & Qualitative Analysis",
    summary:
      "Strong vs weak acids, pH scale, salt preparation methods (titration, precipitation, excess metal/oxide), and cation/anion tests.",
    keyTerms: ["Titration", "Precipitation", "Amphoteric Oxide", "Cation Test"],
    starterPrompt:
      "How do I choose the correct laboratory method to prepare a soluble salt versus an insoluble salt?",
  },
  {
    id: "g11-phys-waves",
    tutorId: "phiri",
    grade: "Grade 11",
    subject: "Physics",
    title: "Waves, Light Reflection/Refraction & Sound",
    summary:
      "Wave equation v = fλ, Snell's law n = sin i / sin r, total internal reflection, converging lenses, and echoes.",
    keyTerms: ["Wavelength", "Refractive Index", "Critical Angle", "Focal Length"],
    starterPrompt:
      "Explain total internal reflection and how optical fibres work using Snell's law.",
  },
  {
    id: "g11-bio-transport",
    tutorId: "mwansa",
    grade: "Grade 11",
    subject: "Biology",
    title: "Transport in Plants, Excretion & Homeostasis",
    summary:
      "Xylem transpiration stream, phloem translocation, kidney ultrafiltration & selective reabsorption, and blood glucose regulation.",
    keyTerms: ["Transpiration", "Nephron", "Ultrafiltration", "Insulin"],
    starterPrompt:
      "Trace how the human kidney nephron filters blood and reabsorbs useful glucose and water.",
  },
  {
    id: "g11-accounts-trial",
    tutorId: "mulenga",
    grade: "Grade 11",
    subject: "Principles of Accounts",
    title: "Trial Balance & Financial Statements",
    summary:
      "Extracting a trial balance, identifying and correcting errors, and preparing trading and profit & loss accounts.",
    keyTerms: ["Trial Balance", "Suspense Account", "Gross Profit", "Net Profit"],
    starterPrompt:
      "How do I prepare a basic Income Statement from a trial balance?",
  },
  {
    id: "g11-comm-trade",
    tutorId: "mulenga",
    grade: "Grade 11",
    subject: "Commerce",
    title: "Home Trade, Wholesale, Retail & Foreign Trade",
    summary:
      "Channels of distribution, functions of wholesalers and retailers, documents in home and international trade, and balance of trade.",
    keyTerms: ["Wholesaler", "Bill of Lading", "Letter of Credit", "Balance of Trade"],
    starterPrompt:
      "Explain the functions of a wholesaler and the difference between a Bill of Lading and an Airway Bill.",
  },
  {
    id: "g11-ict-spreadsheets",
    tutorId: "chisanga",
    grade: "Grade 11",
    subject: "Computer Studies / ICT",
    title: "Advanced Spreadsheets & Database Management",
    summary:
      "Excel/Calc functions (VLOOKUP, IF, SUMIF), relational databases, primary keys, foreign keys, and SQL queries.",
    keyTerms: ["VLOOKUP", "Primary Key", "Foreign Key", "SQL SELECT"],
    starterPrompt:
      "How do I write a VLOOKUP formula in Excel to search student scores?",
  },
  {
    id: "g11-geo-climate",
    tutorId: "ngandu",
    grade: "Grade 11",
    subject: "Geography",
    title: "Weathering, River Landforms & Zambian Climate",
    summary:
      "Physical and chemical weathering, meanders, oxbow lakes, deltas, ITCZ seasonal rainfall in Zambia, and tropical savannahs.",
    keyTerms: ["ITCZ", "Oxbow Lake", "Weathering", "Savannah"],
    starterPrompt:
      "How does the Inter-Tropical Convergence Zone (ITCZ) control Zambia's three seasons?",
  },
  {
    id: "g11-lit-poetry",
    tutorId: "mumba",
    grade: "Grade 11",
    subject: "Literature in English",
    title: "Poetry Analysis & Literary Devices",
    summary:
      "Analyzing tone, mood, metaphor, simile, rhyme scheme, and imagery in prescribed ECZ poetry anthologies.",
    keyTerms: ["Metaphor", "Enjambment", "Tone", "Persona"],
    starterPrompt:
      "Madam Mumba, how do I analyze the persona and tone of a prescribed ECZ poem?",
  },
  {
    id: "g11-re-parables",
    tutorId: "banda",
    grade: "Grade 11",
    subject: "Religious Education",
    title: "Christian Witness, Parables & Zambian Values",
    summary:
      "Analyzing biblical parables, leadership and service, forgiveness, and Christian responses to justice and community life in Zambia.",
    keyTerms: ["Parable", "Stewardship", "Reconciliation", "Vocation"],
    starterPrompt:
      "Help me structure a high-scoring ECZ Religious Education essay comparing two parables.",
  },

  // Grade 12
  {
    id: "g12-math-quadratics",
    tutorId: "chanda",
    grade: "Grade 12",
    subject: "Mathematics",
    title: "Quadratic Equations & Circle Theorems",
    summary:
      "Completing the square, the quadratic formula, discriminant analysis, and ECZ Paper 2 circle angle properties.",
    keyTerms: ["Discriminant", "Cyclic Quadrilateral", "Tangent", "Subtended Angle"],
    starterPrompt:
      "Coach me on solving 2x² - 5x - 3 = 0 and checking the roots.",
  },
  {
    id: "g12-math-earth",
    tutorId: "chanda",
    grade: "Grade 12",
    subject: "Mathematics",
    title: "Earth Geometry (Latitude & Longitude)",
    summary:
      "Calculating distances along meridians and parallels of latitude in nautical miles and kilometers, plus time differences.",
    keyTerms: ["Great Circle", "Parallel of Latitude", "Nautical Mile", "R = 6370 km"],
    starterPrompt:
      "How do I calculate the distance between Lusaka (15°S, 28°E) and Cairo (30°N, 31°E) along a meridian?",
  },
  {
    id: "g12-math-matrices-vectors",
    tutorId: "chanda",
    grade: "Grade 12",
    subject: "Mathematics",
    title: "Matrices, Transformations & Linear Programming",
    summary:
      "2×2 determinants and inverses, transformation matrices (reflection, rotation, enlargement, shear), and shading feasible regions.",
    keyTerms: ["Determinant", "Inverse Matrix", "Feasible Region", "Objective Function"],
    starterPrompt:
      "Walk me through finding the inverse of a 2×2 matrix and solving a linear programming profit problem.",
  },
  {
    id: "g12-addmath-integration",
    tutorId: "chanda",
    grade: "Grade 12",
    subject: "Additional Mathematics",
    title: "Integration, Area Under Curves & Kinematics",
    summary:
      "Definite integrals for area and volumes of revolution, displacement-velocity-acceleration calculus, and permutations & combinations.",
    keyTerms: ["Definite Integral", "Area Under Curve", "Permutation", "Combination"],
    starterPrompt:
      "Show me how to find the area enclosed between a curve and a straight line using integration.",
  },
  {
    id: "g12-chem-moles",
    tutorId: "mwansa",
    grade: "Grade 12",
    subject: "Chemistry",
    title: "Mole Concept & Stoichiometry",
    summary:
      "Molar mass, Avogadro's constant, reacting masses, molar gas volume at r.t.p., and titration calculations.",
    keyTerms: ["Molar Mass", "24 dm³ at r.t.p.", "Limiting Reactant", "Concentration"],
    starterPrompt:
      "Explain how to find the number of moles in 10g of Calcium Carbonate (CaCO₃).",
  },
  {
    id: "g12-chem-organic",
    tutorId: "mwansa",
    grade: "Grade 12",
    subject: "Chemistry",
    title: "Organic Chemistry (Alkanes, Alkenes, Alcohols & Polymers)",
    summary:
      "Homologous series, cracking, addition polymerisation, fermentation, esterification, and copper extraction on the Copperbelt.",
    keyTerms: ["Homologous Series", "Addition Polymer", "Esterification", "Electrolysis"],
    starterPrompt:
      "Compare the reactions of alkanes and alkenes, including the bromine water test.",
  },
  {
    id: "g12-bio-genetics",
    tutorId: "mwansa",
    grade: "Grade 12",
    subject: "Biology",
    title: "Mendelian Genetics & Variation",
    summary:
      "Dominant and recessive alleles, monohybrid Punnett squares, sex determination, and sickle-cell inheritance.",
    keyTerms: ["Allele", "Heterozygous", "Phenotype", "Punnett Square"],
    starterPrompt:
      "Walk me through a monohybrid cross between two heterozygous parents (Tt × Tt).",
  },
  {
    id: "g12-bio-ecology",
    tutorId: "mwansa",
    grade: "Grade 12",
    subject: "Biology",
    title: "Ecology, Carbon & Nitrogen Cycles & Conservation",
    summary:
      "Food chains, pyramids of biomass, nitrogen-fixing bacteria, eutrophication, and wildlife conservation in Zambia.",
    keyTerms: ["Trophic Level", "Nitrogen Fixation", "Nitrification", "Biodiversity"],
    starterPrompt:
      "Explain the roles of Rhizobium, nitrifying bacteria, and denitrifying bacteria in the nitrogen cycle.",
  },
  {
    id: "g12-phys-electricity",
    tutorId: "phiri",
    grade: "Grade 12",
    subject: "Physics",
    title: "Current Electricity, Ohm's Law & Power",
    summary:
      "Series and parallel resistor networks, V = IR, electrical energy in kWh, and Kariba hydroelectric generation.",
    keyTerms: ["Potential Difference", "Equivalent Resistance", "Kilowatt-hour", "Transformer"],
    starterPrompt:
      "How do I find the total resistance of a 4 Ω and 6 Ω resistor connected in parallel?",
  },
  {
    id: "g12-phys-nuclear",
    tutorId: "phiri",
    grade: "Grade 12",
    subject: "Physics",
    title: "Electromagnetism, Transformers & Nuclear Radioactivity",
    summary:
      "Electromagnetic induction, step-up/step-down transformers (Vp/Vs = Np/Ns), alpha/beta/gamma decay, and half-life.",
    keyTerms: ["Transformers", "Alpha/Beta/Gamma", "Half-Life", "Faraday's Law"],
    starterPrompt:
      "Walk me through solving an ECZ half-life decay curve question and a transformer turns-ratio problem.",
  },
  {
    id: "g12-combsci-energy",
    tutorId: "phiri",
    grade: "Grade 12",
    subject: "Combined Science",
    title: "Energy, Chemical Reactions & Human Nutrition",
    summary:
      "Integrated Science Paper 1 & 2 essentials: work & power, rates of reaction, metals & rusting, and balanced human diet.",
    keyTerms: ["Work = Fd", "Rate of Reaction", "Galvanising", "Balanced Diet"],
    starterPrompt:
      "Help me review the key formulas and tests tested in Grade 12 Combined Science.",
  },
  {
    id: "g12-eng-summary",
    tutorId: "banda",
    grade: "Grade 12",
    subject: "English Language",
    title: "ECZ Paper 1 & 2 Composition, Summary & Rewrites",
    summary:
      "Mastering 140-word prose summaries, structure rewrites (Inversion, Participles, Concession), and discursive essays.",
    keyTerms: ["Summary Writing", "Structure Rewrites", "Argumentative Essay", "Cloze Passage"],
    starterPrompt:
      "Coach me on ECZ Grade 12 Paper 2 sentence rewrites and how to hit every summary point.",
  },
  {
    id: "g12-lit-prose",
    tutorId: "mumba",
    grade: "Grade 12",
    subject: "Literature in English",
    title: "Characterisation, Themes & Context Essays",
    summary:
      "Writing textual-evidence essays on prescribed novels and plays, dramatic irony, conflict, and character development.",
    keyTerms: ["Dramatic Irony", "Protagonist", "Thematic Analysis", "Textual Evidence"],
    starterPrompt:
      "How do I weave short quotations into an ECZ Literature in English essay effectively?",
  },
  {
    id: "g12-civic-rights",
    tutorId: "banda",
    grade: "Grade 12",
    subject: "Civic Education",
    title: "Human Rights, Elections & Development",
    summary:
      "Zambian Bill of Rights, Electoral Commission of Zambia processes, anti-corruption, and sustainable development.",
    keyTerms: ["Bill of Rights", "Universal Suffrage", "Accountability", "Rule of Law"],
    starterPrompt:
      "Help me prepare a clear essay outline on why separation of powers protects human rights in Zambia.",
  },
  {
    id: "g12-hist-independence",
    tutorId: "banda",
    grade: "Grade 12",
    subject: "History",
    title: "Federation of Rhodesia & Nyasaland and Zambian Independence",
    summary:
      "Rise of African nationalism (ANC, ZANC, UNIP), Cha-Cha-Cha campaign, 1964 Independence, and post-colonial Southern Africa.",
    keyTerms: ["UNIP", "Cha-Cha-Cha", "1964 Independence", "Pan-Africanism"],
    starterPrompt:
      "Outline the key stages leading from the 1953 Federation to Zambia's independence in October 1964.",
  },
  {
    id: "g12-geo-mining",
    tutorId: "ngandu",
    grade: "Grade 12",
    subject: "Geography",
    title: "Copperbelt Mining, Hydropower & Population",
    summary:
      "Open-pit vs shaft copper mining, environmental conservation, Kafue Gorge & Kariba HEP, and rural-urban migration.",
    keyTerms: ["Copper Smelting", "HEP Generation", "Urbanisation", "Sustainable Forestry"],
    starterPrompt:
      "Discuss the economic benefits and environmental challenges of copper mining on the Copperbelt.",
  },
  {
    id: "g12-accounts-partnerships",
    tutorId: "mulenga",
    grade: "Grade 12",
    subject: "Principles of Accounts",
    title: "Partnership Accounts & Manufacturing Accounts",
    summary:
      "Appropriation accounts, partners' capital and current accounts, and manufacturing cost statements.",
    keyTerms: ["Partnership Agreement", "Interest on Capital", "Prime Cost", "Factory Overhead"],
    starterPrompt:
      "How do I calculate residual profit to be shared among partners in a partnership profit and loss appropriation account?",
  },
  {
    id: "g12-comm-banking",
    tutorId: "mulenga",
    grade: "Grade 12",
    subject: "Commerce",
    title: "Banking, Insurance, Advertising & Warehousing",
    summary:
      "Bank of Zambia functions, mobile money & cheques, principles of insurance (indemnity, utmost good faith), and bonded warehouses.",
    keyTerms: ["Central Bank", "Utmost Good Faith", "Indemnity", "Bonded Warehouse"],
    starterPrompt:
      "Explain the five core principles of insurance with everyday Zambian business examples.",
  },
  {
    id: "g12-ict-python",
    tutorId: "chisanga",
    grade: "Grade 12",
    subject: "Computer Studies / ICT",
    title: "Python Programming & Algorithms",
    summary:
      "Variables, conditional statements (if/elif/else), loops (for/while), functions, and arrays in Python.",
    keyTerms: ["Iteration", "Conditional", "Function", "Array/List"],
    starterPrompt:
      "Dr. Chisanga, how do I write a Python function to check if an ECZ exam score is a distinction or pass?",
  },
  {
    id: "g12-agric-livestock",
    tutorId: "ngandu",
    grade: "Grade 12",
    subject: "Agricultural Science",
    title: "Livestock Husbandry, Farm Economics & Irrigation",
    summary:
      "Dairy and beef cattle management, poultry nutrition, farm budgeting (gross margin), and drip vs furrow irrigation.",
    keyTerms: ["Gross Margin", "Ruminant Digestion", "Drip Irrigation", "Dipping"],
    starterPrompt:
      "Compare the digestive system of a cow (ruminant) with that of a pig or chicken (non-ruminant).",
  },
  {
    id: "g12-re-ethics",
    tutorId: "banda",
    grade: "Grade 12",
    subject: "Religious Education",
    title: "Moral Choices, Marriage, Work & Social Justice",
    summary:
      "Christian, Islamic, and Zambian traditional perspectives on family life, honesty at work, HIV/AIDS care, and peace-building.",
    keyTerms: ["Social Justice", "Integrity", "Reconciliation", "Tradition"],
    starterPrompt:
      "Compare Zambian traditional and Christian teachings on marriage, family responsibility, and community support.",
  },
  {
    id: "g12-zambian-lang-grammar",
    tutorId: "mumba",
    grade: "Grade 12",
    subject: "Zambian Languages",
    title: "Noun Classes, Concordial Agreement & Proverbs",
    summary:
      "Bantu noun class prefixes (mu-/ba-, ci-/fi-, etc.), verb extensions, formal translation, and interpreting Zambian proverbs.",
    keyTerms: ["Noun Classes", "Concordial Agreement", "Proverbs", "Translation"],
    starterPrompt:
      "Help me practice Bantu noun classes and concordial agreement with examples from Bemba or Nyanja.",
  },
  {
    id: "art-design-form4-4-1",
    tutorId: "mumba",
    grade: "Grade 12",
    subject: "Art and Design",
    title: "4.1 Introduction to Art Careers",
    summary:
      "Explore career opportunities in Art and Design, including art teaching, art administration, fashion design, makeup artistry, illustration, cartooning, photography, costume design, textile design, interior and exterior decoration, stage design, graphic design and mural painting. Understand the importance of visual arts in economic development, and learn how to develop an art portfolio containing work samples that demonstrate professional skills and creativity.",
    keyTerms: [
      "Art careers",
      "Visual arts",
      "Art portfolio",
      "Art administrator",
      "Fashion designer",
      "Illustrator",
      "Cartoonist",
      "Photographer",
      "Textile designer",
      "Graphic designer",
      "Muralist",
      "Creative director",
      "Art exhibition",
      "Career opportunities",
    ],
    starterPrompt:
      "POST-TOPIC EXERCISE – INTRODUCTION TO ART CAREERS. Write your answers to the following questions: (1) Define visual arts. (2) Identify and explain SIX careers available in Art and Design. (3) Explain FOUR ways visual arts contribute to Zambia's economy. (4) What is an art portfolio, and why is it important to an artist? (5) Describe FOUR items or examples of work that a professional artist could include in a portfolio. Number your answers clearly and use complete sentences.",
  },
  {
    id: "art-design-form4-4-2",
    tutorId: "mumba",
    grade: "Grade 12",
    subject: "Art and Design",
    title: "4.2 World Art History",
    summary:
      "Study important movements and developments in world art history, focusing on Gothic Art, Renaissance Art, Contemporary Art and Conceptual Art. Examine the characteristics, techniques, themes and contributions of famous artists associated with these movements. Explore artists such as Giotto, Botticelli, Michelangelo, Leonardo da Vinci, Raphael, Caravaggio, Vincent van Gogh, Wassily Kandinsky, Pablo Picasso, Marcel Duchamp and Yoko Ono. Understand how artistic ideas and styles have changed across different historical periods.",
    keyTerms: [
      "World art history",
      "Gothic Art",
      "Renaissance Art",
      "Contemporary Art",
      "Conceptual Art",
      "Giotto",
      "Botticelli",
      "Michelangelo",
      "Leonardo da Vinci",
      "Raphael",
      "Caravaggio",
      "Vincent van Gogh",
      "Wassily Kandinsky",
      "Pablo Picasso",
      "Marcel Duchamp",
      "Yoko Ono",
      "Art movement",
      "Perspective",
      "Humanism",
      "Artistic style",
    ],
    starterPrompt:
      "POST-TOPIC EXERCISE – WORLD ART HISTORY. Answer the following questions: (1) What is an art movement? (2) Describe FOUR characteristics of Gothic Art. (3) Explain FOUR important characteristics of Renaissance Art. (4) Name TWO famous artists associated with Gothic Art and THREE associated with Renaissance Art. (5) What is Contemporary Art? Give THREE examples of artists associated with it. (6) Define Conceptual Art and name TWO artists associated with it. (7) Explain TWO differences between Renaissance Art and Contemporary Art. Write your answers in numbered paragraphs.",
  },
  {
    id: "art-design-form4-4-3",
    tutorId: "mumba",
    grade: "Grade 12",
    subject: "Art and Design",
    title: "4.3 Drawing or Painting from Imagination",
    summary:
      "Develop the ability to create original pictures using imagination, memory, ideas and creative interpretation. Learn to compose imaginative pictures from written descriptions, narrated stories, abstract themes and contemporary issues. Explore how artists communicate social messages through visual compositions addressing issues such as gender-based violence, substance abuse, child trafficking and other community concerns. Apply elements and principles of art to produce meaningful and well-organised compositions.",
    keyTerms: [
      "Imagination",
      "Imaginative composition",
      "Creative interpretation",
      "Visual communication",
      "Composition",
      "Abstract themes",
      "Narrated stories",
      "Contemporary issues",
      "Gender-based violence",
      "Substance abuse",
      "Child trafficking",
      "Art elements",
      "Art principles",
      "Balance",
      "Proportion",
      "Contrast",
      "Colour harmony",
      "Visual storytelling",
    ],
    starterPrompt:
      "POST-TOPIC EXERCISE – DRAWING OR PAINTING FROM IMAGINATION. Answer the following questions: (1) Define imaginative composition. (2) Explain FOUR sources of inspiration for imaginative artwork. (3) Describe FIVE steps involved in developing an imaginative composition from a written story. (4) Explain how an artist can use colour, line, shape and texture to communicate a message. (5) Choose ONE contemporary social issue affecting Zambia and describe an imaginative artwork you would create to raise awareness about it. Include its subject, composition, colours and intended message.",
  },
  {
    id: "art-design-form4-4-4",
    tutorId: "mumba",
    grade: "Grade 12",
    subject: "Art and Design",
    title: "4.4 Drawing or Painting from Observation",
    summary:
      "Develop practical skills in drawing and painting by carefully studying real objects and environments. Explore the representation of natural objects such as flowers, snails, shells, animals, skulls, seed pods and roots. Study urban environments featuring buildings and flyover bridges, as well as rural environments featuring chicken runs, riversides and granaries. Practise accurate observation, proportion, perspective, texture, shading and composition when representing subjects.",
    keyTerms: [
      "Observation",
      "Observational drawing",
      "Observational painting",
      "Natural objects",
      "Urban settings",
      "Rural settings",
      "Proportion",
      "Perspective",
      "Contour drawing",
      "Texture",
      "Tonal variation",
      "Shading",
      "Composition",
      "Foreground",
      "Background",
      "Visual analysis",
      "Landscape",
    ],
    starterPrompt:
      "POST-TOPIC EXERCISE – DRAWING OR PAINTING FROM OBSERVATION. Answer the following questions: (1) Define drawing or painting from observation. (2) Give FIVE examples of natural objects that can be studied through observation. (3) State FOUR features commonly found in urban settings and FOUR found in rural settings. (4) Explain the importance of proportion, perspective, shading and texture in observational drawing. (5) Describe FIVE steps you would follow when drawing a rural scene from direct observation. (6) Explain THREE differences between drawing from observation and drawing from imagination.",
  },
  {
    id: "art-design-form4-4-5",
    tutorId: "mumba",
    grade: "Grade 12",
    subject: "Art and Design",
    title: "4.5 Drawing or Painting from Still Life",
    summary:
      "Study the arrangement and representation of stationary objects through drawing and painting. Explore three major categories of still-life subjects: natural objects such as vegetables, fruits, stones and wood; man-made objects such as utensils and clothing; and traditional objects such as smoking pipes, clay pots, winnowing baskets, stools, mortars and pestles. Develop skills in object arrangement, proportion, perspective, tonal shading, lighting, texture and composition.",
    keyTerms: [
      "Still life",
      "Still-life composition",
      "Natural objects",
      "Man-made objects",
      "Traditional objects",
      "Arrangement",
      "Proportion",
      "Perspective",
      "Light source",
      "Highlights",
      "Shadows",
      "Cast shadow",
      "Tonal value",
      "Texture",
      "Overlapping",
      "Composition",
      "Balance",
    ],
    starterPrompt:
      "POST-TOPIC EXERCISE – DRAWING OR PAINTING FROM STILL LIFE. Answer the following questions: (1) Define still-life drawing or painting. (2) Identify and explain the THREE main categories of still-life objects studied in Form 4. (3) Give FOUR examples of traditional Zambian objects suitable for a still-life composition. (4) Explain the importance of lighting, proportion, perspective and shading in still-life drawing. (5) Describe FIVE steps involved in arranging and drawing a still-life composition containing a clay pot, fruits and a piece of cloth. (6) Explain the difference between a highlight and a cast shadow.",
  },
  {
    id: "art-design-form4-4-6",
    tutorId: "mumba",
    grade: "Grade 12",
    subject: "Art and Design",
    title: "4.6 Figure Drawing or Painting",
    summary:
      "Learn to draw and paint human figures in action using different artistic techniques. Study human anatomy, body proportions, posture, movement, gesture and the relationship between body parts. Explore the representation of people participating in traditional ceremonies, contemporary activities and religious festivals. Develop the ability to communicate movement, expression and human activities through accurate figure compositions.",
    keyTerms: [
      "Figure drawing",
      "Figure painting",
      "Human anatomy",
      "Human proportions",
      "Gesture drawing",
      "Action drawing",
      "Posture",
      "Movement",
      "Body structure",
      "Foreshortening",
      "Contour",
      "Balance",
      "Perspective",
      "Traditional ceremonies",
      "Religious festivals",
      "Contemporary life",
      "Composition",
    ],
    starterPrompt:
      "POST-TOPIC EXERCISE – FIGURE DRAWING OR PAINTING. Answer the following questions: (1) Define figure drawing. (2) What is human anatomy, and why is it important in figure drawing? (3) Explain FOUR factors an artist must consider when drawing a human figure in action. (4) What is gesture drawing? (5) Explain the importance of proportion, posture, balance and movement when representing human figures. (6) Describe how you would compose a drawing showing people participating in a traditional Zambian ceremony. Include the activities, poses and arrangement of the figures.",
  },
  {
    id: "art-design-form4-4-7",
    tutorId: "mumba",
    grade: "Grade 12",
    subject: "Art and Design",
    title: "4.7 Crafts",
    summary:
      "Explore practical craft-making techniques, including printmaking, mask making, mobiles, stabiles and ceramics. Study printmaking methods such as relief printing, intaglio, lithography and serigraphy. Learn to create masks using materials such as wood, paper and plastics. Understand the construction and functions of mobiles and stabiles. Develop ceramic skills through coiling, slab construction, pinching and throwing, as well as the use of glazes, firing and decoration.",
    keyTerms: [
      "Crafts",
      "Printmaking",
      "Relief printing",
      "Intaglio",
      "Lithography",
      "Serigraphy",
      "Silkscreen printing",
      "Printing block",
      "Mask making",
      "Carving",
      "Mobiles",
      "Stabiles",
      "Ceramics",
      "Pottery",
      "Coiling",
      "Slab construction",
      "Pinching",
      "Throwing",
      "Glazing",
      "Firing",
      "Silica",
      "Alumina",
      "Metallic oxides",
      "Flux",
    ],
    starterPrompt:
      "POST-TOPIC EXERCISE – CRAFTS. Answer the following questions: (1) Define printmaking and explain its importance in craft production. (2) Describe FOUR printmaking techniques: relief printing, intaglio, lithography and serigraphy. (3) Identify THREE materials that can be used to make masks and explain TWO methods of decorating them. (4) Differentiate between mobiles and stabiles. (5) Explain FOUR techniques used in pottery and ceramics: coiling, slab construction, pinching and throwing. (6) Identify FOUR main ingredients or material components used in ceramic glazes and explain their functions. (7) Explain why firing and glazing are important in finishing ceramic products.",
  },
  {
    id: "art-design-form4-4-8",
    tutorId: "mumba",
    grade: "Grade 12",
    subject: "Art and Design",
    title: "4.8 Graphic Design (Computer Aided)",
    summary:
      "Develop graphic design skills using traditional and computer-aided techniques to communicate information and promote products, organisations and events. Explore calligraphy and the use of different fonts, logo design, emblems, badges, postcards, business cards and occasional cards. Study informative, educational and advertising posters. Understand visual identity, typography, layout, colour selection, visual hierarchy and the effective use of digital design tools.",
    keyTerms: [
      "Graphic design",
      "Computer-aided design",
      "Digital design",
      "Calligraphy",
      "Typography",
      "Font",
      "Logo",
      "Emblem",
      "Badge",
      "Visual identity",
      "Business card",
      "Postcard",
      "Occasional card",
      "Informative poster",
      "Educational poster",
      "Advertising poster",
      "Layout",
      "Colour scheme",
      "Visual hierarchy",
      "Alignment",
      "Design software",
    ],
    starterPrompt:
      "POST-TOPIC EXERCISE – GRAPHIC DESIGN (COMPUTER AIDED). Answer the following questions: (1) Define graphic design and computer-aided design. (2) What is calligraphy, and how does it differ from ordinary lettering? (3) Differentiate between a logo, an emblem and a badge. (4) State FOUR purposes of graphic design in business and communication. (5) Explain the THREE main types of posters: informative, educational and advertising posters. (6) Identify FIVE principles or considerations that make an effective graphic design. (7) Describe the steps you would follow when designing a logo for a Zambian company using computer software.",
  },
  {
    id: "art-design-form4-4-9",
    tutorId: "mumba",
    grade: "Grade 12",
    subject: "Art and Design",
    title: "4.9 Photography and Filming",
    summary:
      "Explore photography and filming as forms of visual communication, with a focus on the introduction to animation. Study traditional and computer-aided animation, including two-dimensional (2D) and three-dimensional (3D) animation. Understand how cameras and digital tools can be used to produce creative artworks based on themes such as scenery, portraits and nature. Explore the use of artificial intelligence as a creative image-making tool and understand the production of animated visual content.",
    keyTerms: [
      "Photography",
      "Filming",
      "Animation",
      "Traditional animation",
      "Computer-aided animation",
      "2D animation",
      "3D animation",
      "Frame",
      "Sequence",
      "Motion picture",
      "Storyboard",
      "Camera",
      "Digital photography",
      "Portrait photography",
      "Landscape photography",
      "Nature photography",
      "Artificial intelligence",
      "Visual storytelling",
      "Image composition",
    ],
    starterPrompt:
      "POST-TOPIC EXERCISE – PHOTOGRAPHY AND FILMING. Answer the following questions: (1) Define photography, filming and animation. (2) Differentiate between traditional animation and computer-aided animation. (3) Explain the differences between 2D and 3D animation. (4) What is a frame in animation, and how do frames create the illusion of movement? (5) Identify FIVE steps involved in producing a simple animated artwork. (6) Explain FOUR ways cameras can be used to produce creative artworks. (7) Give THREE examples of themes suitable for photography or animation and explain how each can communicate a message.",
  },
  {
    id: "art-design-form4-4-10",
    tutorId: "mumba",
    grade: "Grade 12",
    subject: "Art and Design",
    title: "4.10 Sculpture",
    summary:
      "Study three-dimensional art with emphasis on sculpture in the round, installation art and casting. Learn to create free-standing sculptures representing human figures and body parts using materials such as clay, cement, plaster of Paris and stone. Explore the collection and recycling of environmental materials for artistic production. Understand installation art, its presentation and mounting, as well as casting materials such as metal, fibreglass and plaster of Paris.",
    keyTerms: [
      "Sculpture",
      "Sculpture in the round",
      "Free-standing sculpture",
      "Three-dimensional art",
      "Installation art",
      "Casting",
      "Mould",
      "Additive technique",
      "Subtractive technique",
      "Modelling",
      "Carving",
      "Clay",
      "Cement",
      "Plaster of Paris",
      "Stone",
      "Fibreglass",
      "Metal casting",
      "Assemblage",
      "Recycling",
      "Curation",
      "Art installation",
    ],
    starterPrompt:
      "POST-TOPIC EXERCISE – SCULPTURE. Answer the following questions: (1) Define sculpture and sculpture in the round. (2) Explain FOUR characteristics of a free-standing sculpture. (3) Identify FIVE materials used in making sculptures. (4) Explain the differences between additive and subtractive sculpture techniques. (5) Define installation art and describe THREE factors to consider when mounting an installation artwork. (6) What is casting, and identify THREE materials that can be used in casting. (7) Explain THREE environmental benefits of collecting and recycling materials for sculpture production.",
  },
  {
    id: "art-design-form4-4-11",
    tutorId: "mumba",
    grade: "Grade 12",
    subject: "Art and Design",
    title: "4.11 Entrepreneurship",
    summary:
      "Develop entrepreneurial skills for turning artistic creativity into sustainable income-generating activities. Explore value addition to artworks, costing, pricing and marketing. Understand how to improve the quality, presentation and market appeal of artistic products. Study how artists can organise annual exhibitions in galleries, studios, schools and public spaces to showcase and sell their work. Develop practical knowledge of identifying customers, calculating production costs and promoting creative businesses.",
    keyTerms: [
      "Entrepreneurship",
      "Art entrepreneurship",
      "Value addition",
      "Art business",
      "Costing",
      "Pricing",
      "Production costs",
      "Profit",
      "Revenue",
      "Marketing",
      "Advertising",
      "Target market",
      "Customer",
      "Product development",
      "Packaging",
      "Branding",
      "Exhibition",
      "Gallery",
      "Studio",
      "Promotion",
      "Income generation",
      "Financial literacy",
    ],
    starterPrompt:
      "POST-TOPIC EXERCISE – ENTREPRENEURSHIP. Answer the following questions: (1) Define entrepreneurship and explain its importance to an artist. (2) What is value addition, and describe FOUR ways an artist can add value to an artwork. (3) Explain the difference between costing, pricing, revenue and profit. (4) An artist spends K200 on materials, K100 on labour and K50 on transport to produce a painting. Calculate the total production cost. If the artist sells the painting for K500, calculate the profit. (5) Explain FOUR marketing strategies an artist can use to promote artworks in Zambia. (6) Describe FIVE steps involved in organising an annual art exhibition. (7) Explain THREE benefits of exhibitions to artists and the community.",
  },

  // A-Level (Advanced Level / Cambridge & ECZ 2027 Pathway)
  {
    id: "alevel-math-calculus",
    tutorId: "kaluba",
    grade: "A-Level",
    subject: "Pure Mathematics",
    title: "Advanced Integration & Differential Equations",
    summary:
      "Integration by parts (∫ u dv/dx dx), substitution, partial fractions, and first-order separable differential equations.",
    keyTerms: ["Integration by Parts", "Separable Variables", "Integrating Factor", "General Solution"],
    starterPrompt:
      "Dr. Kaluba, please coach me through solving the differential equation dy/dx = (x² + 1)(y - 2) step-by-step.",
  },
  {
    id: "alevel-math-vectors",
    tutorId: "kaluba",
    grade: "A-Level",
    subject: "Pure Mathematics",
    title: "Vectors in 3D & Scalar Product",
    summary:
      "Vector equations of lines r = a + λb, scalar product a·b = |a||b|cosθ, perpendicular lines, and finding intersection points.",
    keyTerms: ["Direction Vector", "Scalar Product", "Position Vector", "Skew Lines"],
    starterPrompt:
      "How do I determine if two vector lines in 3-dimensional space intersect, are parallel, or are skew?",
  },
  {
    id: "alevel-math-mechanics",
    tutorId: "kaluba",
    grade: "A-Level",
    subject: "Mathematics (Mechanics)",
    title: "Kinematics with Variable Acceleration & Connected Particles",
    summary:
      "Using calculus (v = ds/dt, a = dv/dt), Newton's second law on rough inclined planes with friction F ≤ μR, and pulley systems.",
    keyTerms: ["Friction F = μR", "Variable Acceleration", "Connected Particles", "Tension"],
    starterPrompt:
      "Coach me on calculating the acceleration and tension of two masses connected by a light inextensible string over a smooth pulley on an inclined plane.",
  },
  {
    id: "alevel-furthermath-complex",
    tutorId: "kaluba",
    grade: "A-Level",
    subject: "Further Mathematics",
    title: "Complex Numbers, De Moivre's Theorem & Proof by Induction",
    summary:
      "Argand diagrams, modulus-argument form r(cosθ + i sinθ), roots of unity, and mathematical induction proofs for series and matrices.",
    keyTerms: ["Argand Diagram", "De Moivre's Theorem", "Induction", "Roots of Unity"],
    starterPrompt:
      "Walk me through finding all fourth roots of -16 using De Moivre's theorem.",
  },
  {
    id: "alevel-chem-mechanisms",
    tutorId: "tembo",
    grade: "A-Level",
    subject: "Chemistry",
    title: "Organic Reaction Mechanisms (SN1, SN2 & Carbonyls)",
    summary:
      "Curved arrow notation, nucleophilic substitution kinetics (SN1 vs SN2 in halogenoalkanes), electrophilic addition in alkenes, and optical isomerism.",
    keyTerms: ["Carbocation Intermediate", "SN1 vs SN2", "Nucleophilic Addition", "Chiral Centre"],
    starterPrompt:
      "Dr. Tembo, explain why tertiary halogenoalkanes undergo SN1 substitution while primary ones undergo SN2.",
  },
  {
    id: "alevel-chem-energetics",
    tutorId: "tembo",
    grade: "A-Level",
    subject: "Chemistry",
    title: "Chemical Energetics, Born-Haber Cycles & Gibbs Free Energy",
    summary:
      "Lattice energy, Born-Haber cycles, hydration enthalpy, entropy changes (ΔS), and Gibbs Free Energy (ΔG = ΔH - TΔS) predicting feasibility.",
    keyTerms: ["Lattice Energy", "Born-Haber Cycle", "Entropy ΔS", "Gibbs Free Energy ΔG"],
    starterPrompt:
      "Walk me through constructing a Born-Haber cycle for Magnesium Chloride (MgCl₂) to calculate its lattice energy.",
  },
  {
    id: "alevel-phys-fields",
    tutorId: "sibanda",
    grade: "A-Level",
    subject: "Physics",
    title: "Gravitational & Electric Fields and Potential",
    summary:
      "Newton's Law of Gravitation, Coulomb's Law, gravitational potential Vg = -GM/r, electric potential Ve = Q/(4πε₀r), and equipotential surfaces.",
    keyTerms: ["Gravitational Potential", "Coulomb's Law", "Permittivity ε₀", "Escape Velocity"],
    starterPrompt:
      "Prof. Sibanda, why is gravitational potential defined as zero at infinity and always negative closer to a mass?",
  },
  {
    id: "alevel-phys-quantum",
    tutorId: "sibanda",
    grade: "A-Level",
    subject: "Physics",
    title: "Quantum Physics, Photoelectric Effect & Wave-Particle Duality",
    summary:
      "Photon energy E = hf, Einstein's photoelectric equation hf = Φ + ½mv_max², de Broglie wavelength λ = h/p, and atomic line emission spectra.",
    keyTerms: ["Work Function Φ", "Threshold Frequency", "de Broglie Wavelength", "Stopping Potential"],
    starterPrompt:
      "Explain how the photoelectric effect proves that electromagnetic radiation behaves as discrete quanta (photons).",
  },
  {
    id: "alevel-bio-respiration",
    tutorId: "kangwa",
    grade: "A-Level",
    subject: "Biology",
    title: "Cellular Respiration & Chemiosmotic ATP Synthesis",
    summary:
      "Glycolysis in cytoplasm, link reaction & Krebs cycle in mitochondrial matrix, electron transport chain, and proton motive force driving ATP synthase.",
    keyTerms: ["Krebs Cycle", "Oxidative Phosphorylation", "ATP Synthase", "Proton Gradient"],
    starterPrompt:
      "Madam Kangwa, explain how the proton gradient across the inner mitochondrial membrane drives ATP synthesis via chemiosmosis.",
  },
  {
    id: "alevel-bio-genetech",
    tutorId: "kangwa",
    grade: "A-Level",
    subject: "Biology",
    title: "Recombinant DNA, PCR & Gene Technology",
    summary:
      "Restriction enzymes, DNA ligase, reverse transcriptase, Taq polymerase in PCR cycles, gel electrophoresis, and genetic engineering applications.",
    keyTerms: ["PCR Denaturation/Annealing/Extension", "Restriction Endonuclease", "Gel Electrophoresis", "Plasmid Vector"],
    starterPrompt:
      "Walk me through the three temperature stages of the Polymerase Chain Reaction (PCR) and why Taq polymerase is required.",
  },
  {
    id: "alevel-cs-algorithms",
    tutorId: "chisanga",
    grade: "A-Level",
    subject: "Computer Science",
    title: "Data Structures, Queues, Stacks & Big-O Notation",
    summary:
      "Linear and circular queues, stacks (LIFO), binary search trees, hash tables, Dijkstra's shortest path algorithm, and Big-O time complexity.",
    keyTerms: ["Stack LIFO", "Queue FIFO", "Binary Tree", "Big-O O(n log n)"],
    starterPrompt:
      "Dr. Chisanga, explain how a Stack operates using push and pop operations with a programming example.",
  },
  {
    id: "alevel-econ-macro",
    tutorId: "mulenga",
    grade: "A-Level",
    subject: "Economics",
    title: "Elasticity, Market Failure & Monetary Policy",
    summary:
      "Price & income elasticity of demand, externalities and merit/demerit goods, AD/AS analysis, inflation, and central bank interest rates.",
    keyTerms: ["PED & YED", "Externalities", "Aggregate Demand", "Monetary Policy"],
    starterPrompt:
      "Explain how positive and negative externalities cause market failure with diagrams.",
  },
  {
    id: "alevel-acc-ratios",
    tutorId: "mulenga",
    grade: "A-Level",
    subject: "Accounting",
    title: "Limited Company Statements, Cash Flows & Investment Ratios",
    summary:
      "IAS 7 cash flow statements, marginal vs absorption costing, break-even analysis, ROCE, gearing, and P/E investment ratios.",
    keyTerms: ["IAS 7 Cash Flow", "Absorption Costing", "ROCE", "Break-Even Point"],
    starterPrompt:
      "Walk me through calculating ROCE, current ratio, and operating cash flow for a limited company.",
  },
];

export const ECZ_SCHOOL_TOPICS: SyllabusTopic[] = ECZ_TOPICS.filter(
  (t) => t.grade !== "A-Level"
);

export const A_LEVEL_TOPICS: SyllabusTopic[] = ECZ_TOPICS.filter(
  (t) => t.grade === "A-Level"
);

/** Writing rules every AI answer must follow (kept in one place). */
export const WRITING_RULES = [
  "PLAIN ENGLISH (CRITICAL): Write for a Zambian school learner. Use very simple English at about a Grade 7 reading level: short sentences, everyday words, one idea at a time. Explain every hard or technical word the first time you use it. Never use long, fancy or textbook-style sentences.",
  "MATHS WRITING (CRITICAL): Write division with the ÷ sign (for example 12 ÷ 3 = 4), never with a slash. Only a real fraction may use a slash, like 3/4. Write powers raised like a textbook using superscript characters (x², 10³, 2⁵, 10⁻²), never ^ or the words 'to the power of' in written text. Write multiplication with × (for example 4 × 5).",
].join(" ");

/** ECZ standards every answer must meet (kept in one place). */
export const ECZ_STANDARDS = [
  "ECZ STANDARDS (CRITICAL): Teach and answer strictly within the current Zambian ECZ syllabus for the learner's grade, and at the level an ECZ examiner expects. Use the exact terms, definitions, formulas, units and methods that ECZ marking schemes reward. Show working the way ECZ awards method marks (formula, substitution, answer with correct units).",
  "Use ECZ command words correctly: state, name, list, define, describe, explain, calculate, show that, determine, compare, suggest, outline, discuss. When useful, tell the learner how many marks a question like this usually carries and how many points to write to earn them.",
  "Stay inside the syllabus. If a learner asks about something beyond the ECZ syllabus, say so first, then give only a short simple answer. Never invent facts, formulas, past paper questions, years or mark allocations. If you are not sure, say so and tell the learner to check their textbook or teacher. Never say a question is a real ECZ exam question unless the learner pasted it from a real paper.",
].join(" ");

export function buildTutorSystemInstruction(
  tutor: TutorPersona,
  profile: LearnerProfile,
  activeTopic?: SyllabusTopic | null
): string {
  const bembaGreetingGuide =
    profile.languageAid === "English + Bemba"
      ? ' When greeting or bidding good night in Bemba, use: "Mwashibukeni mukwai" (morning), "Mwaikala shani mukwai" (afternoon), "Cungulopo mukwai" (evening), and "Mulale bwino mukwai" (good night).'
      : "";

  const languageNote =
    profile.languageAid === "English Only"
      ? "Teach strictly in clear, accessible Zambian school English. NEVER change languages or shift to another language unless explicitly requested by the learner."
      : `Teach primarily in clear English and strictly adhere to ${profile.languageAid}. NEVER change languages, translate, or switch to a different language aid unless the learner explicitly asks you to.${bembaGreetingGuide}`;

  const paceNote =
    profile.pace === "Step-by-step"
      ? "Go slowly step-by-step. Give one idea at a time, pause to ask a short checking question, and wait until the student tells you to continue before moving on."
      : profile.pace === "Exam Revision"
      ? "Focus on ECZ (Examinations Council of Zambia) exam technique: highlight common marking-scheme pitfalls, exact units, and concise definitions."
      : "Keep the pace focused: ask the learner to predict the next step or solve a twist and wait for their response.";

  const topicNote = activeTopic
    ? `Current Study Topic: "${activeTopic.title}" (${activeTopic.grade} · ${activeTopic.subject}). Summary: ${activeTopic.summary}. Key terms: ${activeTopic.keyTerms.join(", ")}.`
    : `Help the learner with whatever ${profile.grade} topic they ask about.`;

  const alevelNote =
    profile.grade === "A-Level" || tutor.isALevelSpecialist
      ? "A-Level Academic Rigor & Requirements: The student is studying in the dedicated A-Level (AS & A2) Wing. Enforce Upper-Sixth/pre-university standards: 3 significant figures for non-exact answers (or exact surds/π/e when asked), full algebraic working for M1/A1/B1/C1 marks, curly-arrow mechanisms with full reagents & conditions in Chemistry, SI base units & vector diagrams in Physics, and exact biochemical marking-scheme keywords in Biology. Reference paper structures (Papers 1–5) and practical evaluation skills whenever relevant while staying warm and encouraging."
      : "";

  const learnerFirstName = (profile.name || "Learner").trim().split(/\s+/)[0] || "Learner";

  return [
    `You are ${tutor.name}, a real, deeply personal, warm, and encouraging private tutor for Zambian learners on Kasukulu.`,
    `Your subject specialty is ${tutor.subjectFocus}.`,
    `Teaching persona: ${tutor.teachingStyle} ${tutor.zambianContext}`,
    `Voice, UK-Zambian Accent & Human Presence (CRITICAL):`,
    `- Speak in an authentic, educated UK-Zambian English accent: refined British-Commonwealth vowel purity (broad 'a' in ask/class/half, crisp consonants, non-rhotic British phrasing) blended naturally with warm Lusaka/Copperbelt Southern African melody, gentle cadence, and natural conversational intonation.`,
    `- Sound 100% like a real human tutor sitting right beside ${learnerFirstName} at the study desk — NEVER stiff, robotic, or like someone reading a textbook.`,
    `- Use natural spoken contractions ("I'm", "let's", "we'll", "don't", "you've") and genuine warm personal reactions ("Ah, lovely thinking, ${learnerFirstName}!", "Spot on!", "Ehe, let's look closely at that line together", "Take your time, no rush at all").`,
    `- Address ${learnerFirstName} personally by first name naturally during conversation, celebrate small breakthroughs, and respond warmly if they sound hesitant or stuck.`,
    `Learner Profile: Full name is ${profile.name || "Learner"} (first name: ${learnerFirstName}), currently in ${profile.grade} in ${profile.province} Province, Zambia.`,
    languageNote,
    paceNote,
    topicNote,
    alevelNote,
    "Board & Work Pad Visual Workflow (CRITICAL):",
    `- ${learnerFirstName} is interacting with you directly via your Voice, the Live Blackboard, and their Interactive Work Pad side-by-side (there is no chat box distracting them).`,
    "- Whenever you explain a formula, definition, worked step, diagram outline, or practice question, ALWAYS call the `update_blackboard` tool immediately so it appears cleanly on the Blackboard while you talk.",
    `- Naturally reference the Board and Work Pad as you speak (for example: 'Have a look at the key rule I just put on the board', or 'Try writing that next line on your work pad and tap Show Pad to Tutor when you're ready').`,
    "- If the learner shares handwriting from their Work Pad or a photo snap, inspect their actual working carefully, praise what they got right by name, and gently guide any correction.",
    "Live Two-Way Turn-Taking & Patience Rules (ABSOLUTE):",
    "- Teach ONLY ONE clear idea or step per speaking turn (1 to 3 concise, natural spoken sentences), then STOP completely and wait.",
    "- UNDERSTANDING CHECK (ABSOLUTE): At the end of EVERY explanation, ask the learner a short check such as \"Did you understand that?\" or \"Does that make sense?\" (you may also ask one quick question to test it). Do NOT move to the next idea until the learner says yes or answers correctly. If they say no or answer wrongly, explain again in a different, simpler way with a new example, then ask again.",
    "- ABSOLUTE PATIENCE: You must wait patiently until the student explicitly tells you to continue (e.g. says 'continue', 'next', 'ready'), asks a question, or answers your check. NEVER advance to the next step, concept, or formula on your own initiative.",
    "- STRICT LANGUAGE FIDELITY: Never change the language or shift between Zambian languages unless the student explicitly instructs you to do so.",
    "- Never speak raw markdown symbols like asterisks, hashtags, or backticks aloud.",
    "- When speaking, say maths symbols as words: \"divided by\", \"times\", \"squared\", \"cubed\", \"to the power of\".",
    WRITING_RULES,
    ECZ_STANDARDS,
  ].join("\n");
}

export interface StudyQuote {
  quote: string;
  author: string;
  context: string;
}

export const DAILY_STUDY_QUOTES: StudyQuote[] = [
  {
    quote:
      "Education is the most powerful weapon which you can use to change Zambia and the world.",
    author: "Dr. Kenneth Kaunda",
    context: "First President of Zambia & National Statesman",
  },
  {
    quote:
      "Success in ECZ exams is not born from overnight miracles, but from consistent daily steps and patient revision.",
    author: "Madam Chanda",
    context: "Senior Mathematics Mentor",
  },
  {
    quote:
      "Every challenging equation or scientific concept becomes simple once you break it down into one manageable step at a time.",
    author: "Mr. Mwansa",
    context: "Science Educator",
  },
  {
    quote:
      "Believe in your ability to master any subject. With steady practice, a distinction is within your reach.",
    author: "Miss Phiri",
    context: "Physics & STEM Tutor",
  },
  {
    quote:
      "An investment in your knowledge pays the best interest for your future and for our nation.",
    author: "Mr. Banda",
    context: "Civic Education & Humanities Mentor",
  },
];

export function getDailyStudyQuote(): StudyQuote {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24)
  );
  return DAILY_STUDY_QUOTES[dayOfYear % DAILY_STUDY_QUOTES.length];
}

export const ZAMBIAN_SUBJECTS_ALL: string[] = [
  "Mathematics",
  "Additional Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Combined Science",
  "Integrated Science",
  "English Language",
  "Literature in English",
  "Civic Education",
  "Geography",
  "History",
  "Principles of Accounts",
  "Commerce",
  "Computer Studies / ICT",
  "Agricultural Science",
  "Religious Education",
  "Zambian Languages (Bemba, Nyanja, Tonga, Lozi, Lunda, Luvale, Kaonde)",
  "Creative & Technology Studies",
  "Art and Design",
  "Business Studies",
  "Social Studies",
  "A-Level Mathematics (9709)",
  "A-Level Further Mathematics (9231)",
  "A-Level Chemistry (9701)",
  "A-Level Physics (9702)",
  "A-Level Biology (9700)",
  "A-Level Economics (9708)",
  "A-Level Accounting (9706)",
  "A-Level Computer Science (9618)",
];

export const ZAMBIAN_SUBJECTS_BY_GRADE: Record<GradeLevel, string[]> = {
  "Grade 7": [
    "Mathematics",
    "Integrated Science",
    "English Language",
    "Social Studies",
    "Zambian Languages (Bemba, Nyanja, Tonga, Lozi)",
    "Creative & Technology Studies",
    "Business Studies",
  ],
  "Grade 8": [
    "Mathematics",
    "Integrated Science",
    "English Language",
    "Social Studies",
    "Business Studies",
    "Computer Studies / ICT",
    "Civic Education",
    "Zambian Languages",
    "Creative & Technology Studies",
    "Agricultural Science",
  ],
  "Grade 9": [
    "Mathematics",
    "Integrated Science",
    "English Language",
    "Social Studies",
    "Business Studies",
    "Computer Studies / ICT",
    "Civic Education",
    "Zambian Languages",
    "Creative & Technology Studies",
    "Agricultural Science",
  ],
  "Grade 10": [
    "Mathematics",
    "Additional Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Combined Science",
    "English Language",
    "Literature in English",
    "Civic Education",
    "Geography",
    "History",
    "Principles of Accounts",
    "Commerce",
    "Computer Studies / ICT",
    "Agricultural Science",
    "Religious Education",
    "Zambian Languages",
  ],
  "Grade 11": [
    "Mathematics",
    "Additional Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Combined Science",
    "English Language",
    "Literature in English",
    "Civic Education",
    "Geography",
    "History",
    "Principles of Accounts",
    "Commerce",
    "Computer Studies / ICT",
    "Agricultural Science",
    "Religious Education",
    "Zambian Languages",
  ],
  "Grade 12": [
    "Mathematics",
    "Additional Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Combined Science",
    "English Language",
    "Literature in English",
    "Civic Education",
    "Geography",
    "History",
    "Principles of Accounts",
    "Commerce",
    "Computer Studies / ICT",
    "Agricultural Science",
    "Religious Education",
    "Zambian Languages",
    "Art and Design",
  ],
  "A-Level": [
    "A-Level Mathematics (9709)",
    "A-Level Further Mathematics (9231)",
    "A-Level Chemistry (9701)",
    "A-Level Physics (9702)",
    "A-Level Biology (9700)",
    "A-Level Economics (9708)",
    "A-Level Accounting (9706)",
    "A-Level Computer Science (9618)",
  ],
};

export function subjectNeedsWrittenAnswer(subjectLabel: string): boolean {
  const s = subjectLabel.toLowerCase();
  if (!s.trim()) return false;

  if (
    s.includes("combined science") ||
    s.includes("integrated science")
  ) {
    return true;
  }

  if (
    s.includes("math") ||
    s.includes("physics") ||
    s.includes("creative & technology")
  ) {
    return false;
  }

  return (
    s.includes("english") ||
    s.includes("literature") ||
    s.includes("civic") ||
    s.includes("history") ||
    s.includes("geography") ||
    s.includes("commerce") ||
    s.includes("account") ||
    s.includes("business") ||
    s.includes("economics") ||
    s.includes("religious") ||
    s.includes("zambian") ||
    s.includes("social studies") ||
    s.includes("agric") ||
    s.includes("computer") ||
    s.includes("ict") ||
    s.includes("biology") ||
    s.includes("chemistry") ||
    s.includes("essay") ||
    s.includes("summary") ||
    s.includes("writing") ||
    s.includes("art and design")
  );
}

export interface StreakMilestone {
  days: number;
  label: string;
  reward: string;
  unlocked: boolean;
}

export interface MistakeItem {
  id: string;
  subject: string;
  topic: string;
  tutorName: string;
  question: string;
  yourAnswer: string;
  correctAnswer: string;
  markingNote?: string; // e.g., ECZ M1 / A1 step feedback
}

const MILESTONE_TIERS = [
  { days: 3, label: '3-Day Spark', reward: 'Streak Freeze Token' },
  { days: 7, label: 'Weekly Scholar', reward: 'Custom Study Avatar Frame' },
  { days: 14, label: 'Fortnight Focus', reward: 'Priority Mock Exam Pack' },
  { days: 30, label: 'Distinction Legend', reward: 'Pioneer Honor Badge' },
];

export function getStreakMilestones(streakDays: number): StreakMilestone[] {
  return MILESTONE_TIERS.map((tier) => ({
    ...tier,
    unlocked: streakDays >= tier.days,
  }));
}

export function getRecommendedTutorForSubject(subject: string): string {
  const normalized = subject.toLowerCase();
  if (normalized.includes('math')) return 'Madam Chanda';
  if (
    normalized.includes('biology') ||
    normalized.includes('chemistry') ||
    normalized.includes('science')
  ) {
    return 'Mr. Mwansa';
  }
  if (normalized.includes('physics') || normalized.includes('environmental')) {
    return 'Miss Phiri';
  }
  if (
    normalized.includes('accounts') ||
    normalized.includes('commerce') ||
    normalized.includes('entrepreneurship')
  ) {
    return 'Madam Mulenga';
  }
  if (normalized.includes('geography') || normalized.includes('agricultural')) {
    return "Mr. Ng'andu";
  }
  if (normalized.includes('literature')) return 'Madam Mumba';
  return 'Mr. Banda';
}

export interface TutorVoiceProfile {
  name: string;
  role: string;
  subjects: string[];
  voiceStyle: string;
  greetingPrefix: string;
}

export const TUTOR_VOICE_PROFILES: TutorVoiceProfile[] = [
  {
    name: 'Madam Chanda',
    role: 'Mathematics & Additional Math Tutor',
    subjects: ['Mathematics', 'Additional Mathematics'],
    voiceStyle: 'Calm, structured, step-by-step method (M1/A1) coaching',
    greetingPrefix: 'Moni! Let us break this calculation down one clear step at a time.',
  },
  {
    name: 'Mr. Mwansa',
    role: 'Biology, Chemistry & Integrated Science Tutor',
    subjects: ['Biology', 'Chemistry', 'Integrated Science'],
    voiceStyle: 'Clear, inquisitive, lab- and diagram-focused explanations',
    greetingPrefix: 'Mwapoleni! Let us trace how the process or reaction works.',
  },
  {
    name: 'Miss Phiri',
    role: 'Physics & Environmental Science Tutor',
    subjects: ['Physics', 'Environmental Science'],
    voiceStyle: 'Practical, formula-first with real-world Zambian examples',
    greetingPrefix: 'Hello! Let us identify the given values, formula, and units first.',
  },
  {
    name: 'Mr. Banda',
    role: 'English, Civic Education & Zambian Languages Mentor',
    subjects: ['English', 'Civic Education', 'Zambian Languages'],
    voiceStyle: 'Encouraging, articulate, exam-structure focused',
    greetingPrefix: 'Muli bwanji! Let us look closely at what the question is asking.',
  },
  {
    name: 'Madam Mulenga',
    role: 'Principles of Accounts, Commerce & Entrepreneurship Tutor',
    subjects: ['Principles of Accounts', 'Commerce', 'Entrepreneurship'],
    voiceStyle: 'Methodical, ledger- and balance-sheet-clear walkthroughs',
    greetingPrefix: 'Good day! Let us check the debit, credit, and business logic carefully.',
  },
  {
    name: "Mr. Ng'andu",
    role: 'Geography & Agricultural Science Tutor',
    subjects: ['Geography', 'Agricultural Science'],
    voiceStyle: 'Visual, map- and field-oriented explanations',
    greetingPrefix: 'Cungulopo! Let us examine the pattern, cause, and local context.',
  },
  {
    name: 'Madam Mumba',
    role: 'Literature in English & Zambian Languages Tutor',
    subjects: ['Literature in English', 'Zambian Languages'],
    voiceStyle: 'Analytical, theme- and character-depth coaching',
    greetingPrefix: 'Hello! Let us unpack the imagery, tone, and meaning together.',
  },
];

export function getTutorProfile(tutorNameOrSubject: string): TutorVoiceProfile {
  const target = tutorNameOrSubject.toLowerCase();
  const byName = TUTOR_VOICE_PROFILES.find(
    (t) => t.name.toLowerCase() === target
  );
  if (byName) return byName;

  const recommendedName = getRecommendedTutorForSubject(tutorNameOrSubject);
  return (
    TUTOR_VOICE_PROFILES.find((t) => t.name === recommendedName) ||
    TUTOR_VOICE_PROFILES[3]
  );
}

export function buildTutorVoicePrompt(params: {
  tutorName: string;
  subject: string;
  topic: string;
  mistake?: MistakeItem;
  streakDays?: number;
}): string {
  const profile = getTutorProfile(params.tutorName || params.subject);
  const base = [
    `You are ${profile.name} (${profile.role}) on Kasukulu.`,
    `Tone & style: ${profile.voiceStyle}.`,
    `Start with: "${profile.greetingPrefix}"`,
    `Teach ${params.subject} — Topic: "${params.topic}" for a Zambian learner.`,
    `Explain one step at a time, ask a quick check-for-understanding question at the end of each step, and highlight ECZ M1/A1 marking points.`,
  ];

  if (params.mistake) {
    base.push(
      `Focus specifically on fixing this missed question: "${params.mistake.question}".`,
      `The student answered "${params.mistake.yourAnswer}", while the expected answer is "${params.mistake.correctAnswer}".`,
      params.mistake.markingNote
        ? `Marking guidance: ${params.mistake.markingNote}.`
        : ''
    );
  }

  if (typeof params.streakDays === 'number' && params.streakDays > 0) {
    base.push(
      `Acknowledge their ${params.streakDays}-day study streak briefly to keep momentum high.`
    );
  }

  return base.filter(Boolean).join(' ');
}

export interface CachedLessonNote {
  cacheKey: string;
  subject: string;
  grade: string;
  topic: string;
  language?: string;
  content: string;
  generatedAt: number;
}

const LESSON_NOTES_CACHE_KEY = 'kasukulu_lesson_notes_cache_v1';
const memoryNoteCache = new Map<string, CachedLessonNote>();

export function buildLessonNoteCacheKey(params: {
  grade: string;
  subject: string;
  topic: string;
  language?: string;
}): string {
  return [
    params.grade.trim().toLowerCase(),
    params.subject.trim().toLowerCase(),
    params.topic.trim().toLowerCase(),
    (params.language || 'English').trim().toLowerCase(),
  ].join('::');
}

function readAllCachedNotes(): Record<string, CachedLessonNote> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(LESSON_NOTES_CACHE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, CachedLessonNote>) : {};
  } catch {
    return {};
  }
}

export function getCachedLessonNote(cacheKey: string): CachedLessonNote | null {
  if (memoryNoteCache.has(cacheKey)) {
    return memoryNoteCache.get(cacheKey) || null;
  }
  const all = readAllCachedNotes();
  const found = all[cacheKey] || null;
  if (found) {
    memoryNoteCache.set(cacheKey, found);
  }
  return found;
}

export function saveCachedLessonNote(note: CachedLessonNote): void {
  memoryNoteCache.set(note.cacheKey, note);
  if (typeof window === 'undefined') return;
  try {
    const all = readAllCachedNotes();
    all[note.cacheKey] = note;

    // Keep the 60 most recent notes so localStorage stays fast and lean
    const entries = Object.entries(all).sort(
      (a, b) => b[1].generatedAt - a[1].generatedAt
    );
    const trimmed = Object.fromEntries(entries.slice(0, 60));
    window.localStorage.setItem(LESSON_NOTES_CACHE_KEY, JSON.stringify(trimmed));
  } catch {
    // Ignore storage quota errors
  }
}

export function buildFastLessonNotePrompt(params: {
  grade: string;
  subject: string;
  topic: string;
  language?: string;
}): string {
  return [
    `Create a concise, high-clarity ECZ blackboard study note for ${params.grade} ${params.subject} on "${params.topic}".`,
    `Language style: ${params.language || 'English'} (clear and accessible for Zambian students).`,
    'Keep it under 260 words using short bullet points:',
    '1. Core Concept (2-3 lines max)',
    '2. Key Definitions / Formulas / Rules',
    '3. Zambian Practical Example',
    '4. ECZ Exam Tip (M1/A1 or key phrasing)',
    'Avoid long introductions or filler.',
  ].join('\n');
}

export interface EczMarkingGuidance {
  subject: string;
  topic: string;
  grade: string;
  markingFocus: string[];
}

export function getEczMarkingGuidance(subject: string): string[] {
  const normalized = subject.toLowerCase();

  if (normalized.includes('math')) {
    return [
      'Show every working step clearly so ECZ examiners can award M1 (method) marks even if a small arithmetic slip happens.',
      'Write the formula or rule first before substituting numbers.',
      'State the final A1 answer clearly with correct units or exact simplified form.',
    ];
  }

  if (
    normalized.includes('biology') ||
    normalized.includes('chemistry') ||
    normalized.includes('science') ||
    normalized.includes('physics')
  ) {
    return [
      'Use exact scientific terms, correct symbols, and proper SI units (e.g., m/s, N, V, mol/dm³).',
      'Link cause and effect directly (e.g., why a process happens or how a variable changes).',
      'Keep explanations direct and factual—avoid vague words like "it does things" or "stuff".',
    ];
  }

  if (normalized.includes('art') || normalized.includes('design')) {
    return [
      'Name the specific technique, medium, or tool clearly (for example: relief printing, woodblock, serigraphy/silkscreen).',
      'Explain how the process works step by step and give a clear visual or practical example.',
      'Connect the design choice to function, pattern, or visual effect.',
    ];
  }

  return [
    'Answer the exact question asked using clear, simple English.',
    'Include the key syllabus terms and explain the main point in 1 to 2 direct sentences.',
    'Give a clear example where helpful to earn full marking points.',
  ];
}

export function buildSimpleEczNoteAndAnswerPrompt(params: {
  grade: string;
  subject: string;
  topic: string;
  learnerQuestion?: string;
  learnerAnswer?: string;
}): string {
  const markingPoints = getEczMarkingGuidance(params.subject);

  return [
    `You are a supportive Zambian tutor for ${params.grade} ${params.subject} on Kasukulu.`,
    'Write ONLY in simple, clear English that a Zambian learner can understand easily. Use short sentences and everyday words. Avoid hard jargon unless you explain it simply right away.',
    `Topic: "${params.topic}".`,
    params.learnerQuestion ? `Question: "${params.learnerQuestion}".` : '',
    params.learnerAnswer
      ? `Learner's written answer: "${params.learnerAnswer}". Check it carefully against what ECZ markers need.`
      : '',
    'Structure the response clearly using simple headings:',
    '- Simple Explanation: Short, easy-to-follow points in plain English.',
    '- Zambian Everyday Example: One familiar example from daily life or school in Zambia.',
    '- What ECZ Markers Need (Marking Scheme): The exact points, steps, or terms an ECZ marker looks for to award marks.',
    params.learnerAnswer
      ? '- How Your Answer Scores: Point out what earned marks, what was missed, and give a model answer written the way ECZ markers award full marks.'
      : '- Model Exam Answer: Show a clear, complete sample answer written the way ECZ markers award full marks.',
    'ECZ marking rules to apply:',
    ...markingPoints.map((rule) => `* ${rule}`),
  ]
    .filter(Boolean)
    .join('\n');
}





