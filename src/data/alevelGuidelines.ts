export interface ALevelRequirementItem {
  id: string;
  category: string;
  title: string;
  detail: string;
}

export interface ALevelPathway {
  id: string;
  title: string;
  targetDegrees: string;
  coreSubjects: string[];
  recommendedFourth: string;
  minimumEntry: string;
  tutorIds: string[];
}

export interface ALevelSubjectGuideline {
  id: string;
  subject: string;
  syllabusCode: string;
  tutorId: string;
  guidedHours: string;
  papers: Array<{
    paper: string;
    focus: string;
    duration: string;
    weighting: string;
  }>;
  examinerRules: string[];
  practicalRequirement: string;
}

export interface ALevelChecklistItem {
  id: string;
  title: string;
  requirement: string;
}

export const A_LEVEL_ENTRY_REQUIREMENTS: ALevelRequirementItem[] = [
  {
    id: "req-school-cert",
    category: "Academic Entry",
    title: "Grade 12 School Certificate / IGCSE Foundation",
    detail:
      "Minimum 5 Credits or better (Grades 1–6 ECZ or A*–C IGCSE) including English Language and Mathematics before commencing Advanced Subsidiary (AS) study.",
  },
  {
    id: "req-subject-prereq",
    category: "Subject Readiness",
    title: "Distinction / Merit in Chosen A-Level Track",
    detail:
      "At least Grade 1–3 (or Additional Mathematics) is strongly advised for Pure Mathematics & Physics; Grade 1–4 in Chemistry and Biology for Pre-Medical tracks.",
  },
  {
    id: "req-study-hours",
    category: "Guided Study Load",
    title: "360 Guided Learning Hours per Full A-Level",
    detail:
      "Each full A-Level subject requires 180 hours at AS Level (Year 1 / Lower Sixth) and 180 hours at A2 Level (Year 2 / Upper Sixth), plus 6–8 hours/week of independent past-paper practice.",
  },
  {
    id: "req-exam-conduct",
    category: "Assessment Tools",
    title: "Approved Scientific Tools & Formula Sheets",
    detail:
      "Candidates must practice with a non-programmable scientific calculator, official MF19 Mathematical Formulae & Statistical Tables, and the Chemistry Data Booklet.",
  },
];

export const A_LEVEL_PATHWAYS: ALevelPathway[] = [
  {
    id: "pathway-engineering",
    title: "Engineering, Mining & Physical Sciences",
    targetDegrees:
      "Civil, Electrical, Mechanical Engineering, Mining, Computer Science (CBU, UNZA & Global)",
    coreSubjects: ["Pure Mathematics & Mechanics", "Physics", "Chemistry"],
    recommendedFourth: "Further Mathematics (or Computer Science)",
    minimumEntry:
      "Target BBB–AAA across 3 principal A-Level subjects for competitive scholarships.",
    tutorIds: ["kaluba", "sibanda", "tembo"],
  },
  {
    id: "pathway-medicine",
    title: "Medicine, Pharmacy & Life Sciences",
    targetDegrees:
      "MBChB Medicine & Surgery, Pharmacy, Biomedical Sciences, Veterinary Medicine",
    coreSubjects: ["Biology", "Chemistry", "Pure Mathematics (or Physics)"],
    recommendedFourth: "AS General Paper / English Academic Writing",
    minimumEntry:
      "Chemistry and Biology at Grade A/B are mandatory for clinical & medical admissions.",
    tutorIds: ["kangwa", "tembo", "kaluba"],
  },
  {
    id: "pathway-quant",
    title: "Mathematics, Actuarial Science & Data",
    targetDegrees:
      "Actuarial Science, Quantitative Economics, Data Science, Pure & Applied Mathematics",
    coreSubjects: [
      "Pure Mathematics & Statistics",
      "Further Mathematics",
      "Physics (or Economics)",
    ],
    recommendedFourth: "AS Probability & Statistical Inference",
    minimumEntry:
      "Strong algebraic proof fluency and hypothesis-testing accuracy (Grade A target in Math).",
    tutorIds: ["kaluba", "sibanda"],
  },
];

export const A_LEVEL_SUBJECT_GUIDELINES: ALevelSubjectGuideline[] = [
  {
    id: "guideline-math",
    subject: "Mathematics (Pure, Mechanics & Statistics)",
    syllabusCode: "9709 / ECZ A-Level",
    tutorId: "kaluba",
    guidedHours: "360 hrs (AS 180h + A2 180h)",
    papers: [
      {
        paper: "Paper 1 (AS Pure 1)",
        focus: "Quadratics, Functions, Differentiation, Integration, Series",
        duration: "1h 50m",
        weighting: "30% of A-Level",
      },
      {
        paper: "Paper 3 (A2 Pure 3)",
        focus: "Integration by Parts, Differential Equations, Complex Numbers, 3D Vectors",
        duration: "1h 50m",
        weighting: "30% of A-Level",
      },
      {
        paper: "Paper 4 (Mechanics)",
        focus: "Kinematics, Newton's Laws, Friction F ≤ μR, Work, Energy & Momentum",
        duration: "1h 15m",
        weighting: "20% of A-Level",
      },
      {
        paper: "Paper 5 (Probability & Statistics 1)",
        focus: "Permutations, Binomial/Geometric/Normal Distributions, Hypothesis Testing",
        duration: "1h 15m",
        weighting: "20% of A-Level",
      },
    ],
    examinerRules: [
      "Give non-exact numerical answers correct to 3 significant figures (1 d.p. for angles in degrees) unless the question specifies exact form (π, e, surds).",
      "Always show intermediate algebraic substitution and integration constants (+ C) to secure M1 method marks.",
      "In Mechanics, draw a labelled force diagram with resolved components (mg sin θ, mg cos θ) and take g = 10 m/s² or 9.8 m/s² strictly per paper front-cover instruction.",
      "For proofs ('Show that...'), never skip steps or assume the target result while manipulating an identity.",
    ],
    practicalRequirement:
      "Master MF19 Formulae Booklet navigation and graphing curve sketches with stationary points & asymptotes.",
  },
  {
    id: "guideline-chem",
    subject: "Chemistry & Molecular Biochemistry",
    syllabusCode: "9701 / ECZ A-Level",
    tutorId: "tembo",
    guidedHours: "360 hrs (AS 180h + A2 180h)",
    papers: [
      {
        paper: "Paper 1 (AS Multiple Choice)",
        focus: "Atomic structure, Bonding, Energetics, Kinetics, AS Organic",
        duration: "1h 15m",
        weighting: "15.5% of A-Level",
      },
      {
        paper: "Paper 2 (AS Structured)",
        focus: "Stoichiometry, Equilibria, Periodicity, Mechanisms",
        duration: "1h 15m",
        weighting: "23% of A-Level",
      },
      {
        paper: "Paper 3 (Advanced Practical Skills)",
        focus: "Titration, Gravimetric/Thermal Analysis, Qualitative Ion Identification",
        duration: "2h 00m",
        weighting: "11.5% of A-Level",
      },
      {
        paper: "Paper 4 & 5 (A2 Structured + Planning)",
        focus: "Born-Haber, ΔG = ΔH - TΔS, Electrochemistry, Transition Elements, Experimental Planning",
        duration: "2h 00m + 1h 15m",
        weighting: "50% of A-Level",
      },
    ],
    examinerRules: [
      "Curly arrows in organic mechanisms (SN1, SN2, Electrophilic Addition) must start precisely at a lone pair or covalent bond and point to an atom or forming bond.",
      "Always state full reaction conditions: reagent, solvent (e.g. ethanolic vs aqueous NaOH), temperature, and catalyst.",
      "Include state symbols and sign conventions (+ or -) with kJ mol⁻¹ units in all Born-Haber cycles, Hess's Law, and Gibbs Free Energy calculations.",
      "Titration readings in Paper 3 must be recorded to 2 decimal places ending in .00 or .05, with concordant titres within 0.10 cm³.",
    ],
    practicalRequirement:
      "Competency in volumetric titration, enthalpy calorimetry, qualitative cation/anion tests, and Paper 5 error-evaluation planning.",
  },
  {
    id: "guideline-phys",
    subject: "Physics (Fields, Quantum & Mechanics)",
    syllabusCode: "9702 / ECZ A-Level",
    tutorId: "sibanda",
    guidedHours: "360 hrs (AS 180h + A2 180h)",
    papers: [
      {
        paper: "Paper 1 (AS Multiple Choice)",
        focus: "Physical Quantities, Kinematics, Waves, Superposition, DC Circuits",
        duration: "1h 15m",
        weighting: "15.5% of A-Level",
      },
      {
        paper: "Paper 2 (AS Structured)",
        focus: "Forces, Work & Power, Deformation of Solids, Particle Physics",
        duration: "1h 15m",
        weighting: "23% of A-Level",
      },
      {
        paper: "Paper 3 (Advanced Practical Skills)",
        focus: "Oscillations, Electrical Resistance, Optics, Uncertainty & Error Bars",
        duration: "2h 00m",
        weighting: "11.5% of A-Level",
      },
      {
        paper: "Paper 4 & 5 (A2 Structured + Planning)",
        focus: "Gravitational/Electric/Magnetic Fields, Capacitance, Quantum, Nuclear, Medical Imaging",
        duration: "2h 00m + 1h 15m",
        weighting: "50% of A-Level",
      },
    ],
    examinerRules: [
      "State the defining equation before substituting numbers; distinguish clearly between field strength (E = -dV/dr) and potential (V).",
      "Express final answers to the same number of significant figures as the least precise raw data (typically 2 or 3 s.f.) with correct SI units.",
      "In Paper 3 & 5 graphs, choose scales so plotted points span more than half the grid in both x and y axes, and use a large triangle (>50% of line) for gradient.",
      "Combine percentage uncertainties linearly when multiplying/dividing quantities (e.g. Δy/y = Δa/a + 2Δb/b for y = ab²).",
    ],
    practicalRequirement:
      "Mastery of micrometer screw gauge, vernier calipers, oscilloscope trace reading, and linearizing power-law equations (ln y vs ln x).",
  },
  {
    id: "guideline-bio",
    subject: "Biology & Genetics",
    syllabusCode: "9700 / ECZ A-Level",
    tutorId: "kangwa",
    guidedHours: "360 hrs (AS 180h + A2 180h)",
    papers: [
      {
        paper: "Paper 1 (AS Multiple Choice)",
        focus: "Cell Structure, Biological Molecules, Enzymes, Mitosis, Transport",
        duration: "1h 15m",
        weighting: "15.5% of A-Level",
      },
      {
        paper: "Paper 2 (AS Structured)",
        focus: "Membranes, Nucleic Acids, Immunity, Gas Exchange, Mass Transport",
        duration: "1h 15m",
        weighting: "23% of A-Level",
      },
      {
        paper: "Paper 3 (Advanced Practical Skills)",
        focus: "Serial Dilutions, Microscopy Plan & High-Power Drawings, Enzyme Rates",
        duration: "2h 00m",
        weighting: "11.5% of A-Level",
      },
      {
        paper: "Paper 4 & 5 (A2 Structured + Planning)",
        focus: "Respiration, Photosynthesis, Homeostasis, Nervous Coordination, Gene Technology",
        duration: "2h 00m + 1h 15m",
        weighting: "50% of A-Level",
      },
    ],
    examinerRules: [
      "Use exact marking-scheme keywords: e.g., 'complementary shape to active site', 'proton electrochemical gradient', 'chemiosmosis through ATP synthase'.",
      "For 'Compare' or 'Describe' data questions, quote specific paired data figures with units from the graph/table before explaining biological cause.",
      "Biological drawings in Paper 3 must use sharp continuous lines without shading or sketching, covering >50% of the space with ruled uncrossed label lines.",
      "In Paper 5 experimental design, specify independent, dependent, and at least 3 standardized control variables plus statistical test choice (t-test, χ², Spearman's).",
    ],
    practicalRequirement:
      "Serial dilution accuracy, eyepiece graticule calibration, immobilized enzyme assays, and statistical hypothesis testing.",
  },
];

export const A_LEVEL_READINESS_CHECKLIST: ALevelChecklistItem[] = [
  {
    id: "chk-prereq",
    title: "Grade 12 Prerequisites Verified",
    requirement:
      "Confirmed 5+ Credits/Distinctions including English, Mathematics, and target sciences.",
  },
  {
    id: "chk-combo",
    title: "3-Subject A-Level Combination Locked",
    requirement:
      "Selected a coherent university pathway (Engineering, Medicine, or Quantitative Sciences).",
  },
  {
    id: "chk-syllabus",
    title: "AS & A2 Syllabus Map Reviewed",
    requirement:
      "Reviewed every AS (Paper 1–3) and A2 (Paper 4–5) topic weights and guided hours.",
  },
  {
    id: "chk-precision",
    title: "Examiner Marking Discipline Practiced",
    requirement:
      "Practiced 3 s.f. precision, curly arrows, state symbols, SI units, and biochemical keywords.",
  },
  {
    id: "chk-practical",
    title: "Practical & Paper 5 Planning Ready",
    requirement:
      "Reviewed uncertainty calculations, serial dilutions, titration precision, and controlled variables.",
  },
  {
    id: "chk-papers",
    title: "Timed Past-Paper Benchmark (80%+ Target)",
    requirement:
      "Completed timed A-Level structured questions and checked against official M1/A1/B1 schemes.",
  },
];
