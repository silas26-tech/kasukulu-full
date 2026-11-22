// SERVER-ONLY: contains correct answers and marking schemes.
// Never import this file from anything under src/ that ships to the browser.
import type { ServerCompetition } from "./competitions.ts";

export const NATIONWIDE_COMPETITIONS: ServerCompetition[] = [
  {
    id: "comp-g7-national-t1",
    title: "2026 Grade 7 National ECZ Challenge",
    termLabel: "Term 1 Nationwide",
    grade: "Grade 7",
    subjectsSummary: "Mathematics · Integrated Science · English",
    durationMinutes: 20,
    totalMarks: 20,
    description:
      "Official-style national primary test checking Kwacha ratios, plant biology, English grammar, and electrical safety.",
    questions: [
      {
        id: "g7-q1",
        number: "Q1",
        subject: "Mathematics",
        marks: 2,
        type: "mcq",
        prompt:
          "Mwamba and Chileshe share K360 in the ratio 4 : 5. How much money does Chileshe receive?",
        options: ["K160", "K180", "K200", "K225"],
        correctIndex: 2,
        markingScheme: [
          "B1: Total parts = 4 + 5 = 9",
          "B1: Chileshe's share = (5/9) × K360 = K200",
        ],
      },
      {
        id: "g7-q2",
        number: "Q2",
        subject: "Integrated Science",
        marks: 2,
        type: "mcq",
        prompt:
          "During photosynthesis, which gas enters a green maize leaf through the stomata to help make glucose?",
        options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Water vapour"],
        correctIndex: 2,
        markingScheme: [
          "B2: Plants absorb carbon dioxide through stomata as a raw material for photosynthesis.",
        ],
      },
      {
        id: "g7-q3",
        number: "Q3",
        subject: "English Language",
        marks: 2,
        type: "mcq",
        prompt:
          "Choose the correct passive voice form of: 'The headteacher praised the hard-working pupils.'",
        options: [
          "The hard-working pupils are praising the headteacher.",
          "The hard-working pupils were praised by the headteacher.",
          "The headteacher was praised by the hard-working pupils.",
          "The hard-working pupils had praise the headteacher.",
        ],
        correctIndex: 1,
        markingScheme: [
          "B2: Simple past active becomes 'were + past participle (praised) + by ...'.",
        ],
      },
      {
        id: "g7-q4",
        number: "Q4",
        subject: "Integrated Science",
        marks: 2,
        type: "mcq",
        prompt:
          "Why are household electric plugs coated with hard plastic on the outside while the pins inside are made of brass or copper?",
        options: [
          "Plastic is a good conductor and metal is an insulator.",
          "Plastic is an insulator for safety and metal is a good conductor of electricity.",
          "Plastic melts easily while copper absorbs electricity.",
          "Brass is cheaper than plastic in Zambia.",
        ],
        correctIndex: 1,
        markingScheme: [
          "B2: Metal conducts current into the appliance; plastic insulates the user against electric shock.",
        ],
      },
      {
        id: "g7-q5",
        number: "Q5",
        subject: "Mathematics",
        marks: 6,
        type: "structured",
        prompt:
          "A trader at Soweto Market buys a bag of beans for K400 and sells it for K480. Show all your working to calculate: (a) the profit in Kwacha, and (b) the percentage profit.",
        markingScheme: [
          "M1 (1 mark): Profit formula = Selling Price - Cost Price",
          "A1 (2 marks): Profit = K480 - K400 = K80",
          "M1 (1 mark): Percentage profit = (Profit / Cost Price) × 100%",
          "A2 (2 marks): (80 / 400) × 100% = 20%",
        ],
      },
      {
        id: "g7-q6",
        number: "Q6",
        subject: "Integrated Science & English",
        marks: 6,
        type: "structured",
        prompt:
          "Explain THREE practical ways learners can save electricity and stay safe when using electrical appliances at home or school.",
        markingScheme: [
          "B2 (2 marks): Switch off lights, stoves, or irons when not in use / unplug idle chargers.",
          "B2 (2 marks): Never touch switches or plugs with wet hands to prevent electric shock.",
          "B2 (2 marks): Do not overload wall sockets or use frayed/damaged wires.",
        ],
      },
    ],
  },
  {
    id: "comp-g9-national-t1",
    title: "2026 Grade 9 National ECZ Challenge",
    termLabel: "Term 1 Nationwide",
    grade: "Grade 9",
    subjectsSummary: "Mathematics · Integrated Science · Social Studies",
    durationMinutes: 25,
    totalMarks: 20,
    description:
      "Nationwide junior secondary competition testing simultaneous equations, density, human biology, and Zambian governance.",
    questions: [
      {
        id: "g9-q1",
        number: "Q1",
        subject: "Mathematics",
        marks: 2,
        type: "mcq",
        prompt:
          "Solve the simultaneous equations: 2x + y = 11 and x - y = 1. What is the value of (x, y)?",
        options: ["(3, 5)", "(4, 3)", "(5, 1)", "(2, 7)"],
        correctIndex: 1,
        markingScheme: [
          "B1: Adding equations gives 3x = 12, so x = 4",
          "B1: Substituting x = 4 gives 4 - y = 1, so y = 3 -> (4, 3)",
        ],
      },
      {
        id: "g9-q2",
        number: "Q2",
        subject: "Integrated Science",
        marks: 2,
        type: "mcq",
        prompt:
          "A piece of Copperbelt ore has a mass of 178 g. When lowered into a measuring cylinder, the water level rises from 30 cm³ to 50 cm³. What is its density?",
        options: ["3.56 g/cm³", "5.93 g/cm³", "8.90 g/cm³", "17.8 g/cm³"],
        correctIndex: 2,
        markingScheme: [
          "B1: Volume = 50 - 30 = 20 cm³",
          "B1: Density = 178 / 20 = 8.90 g/cm³",
        ],
      },
      {
        id: "g9-q3",
        number: "Q3",
        subject: "Integrated Science",
        marks: 2,
        type: "mcq",
        prompt:
          "Which blood vessel carries oxygenated blood from the left ventricle of the heart to the rest of the body?",
        options: ["Pulmonary artery", "Vena cava", "Aorta", "Pulmonary vein"],
        correctIndex: 2,
        markingScheme: [
          "B2: The aorta is the main artery carrying oxygenated blood out of the left ventricle.",
        ],
      },
      {
        id: "g9-q4",
        number: "Q4",
        subject: "Social Studies",
        marks: 2,
        type: "mcq",
        prompt:
          "Under Zambia's Constitution, which arm of government is responsible for making laws in Parliament?",
        options: ["The Judiciary", "The Legislature", "The Executive", "The Cabinet"],
        correctIndex: 1,
        markingScheme: [
          "B2: The Legislature (National Assembly) debates and passes laws; Executive enforces; Judiciary interprets.",
        ],
      },
      {
        id: "g9-q5",
        number: "Q5",
        subject: "Mathematics",
        marks: 6,
        type: "structured",
        prompt:
          "A bus ticket from Lusaka to Kabwe costs K85 per adult and K45 per learner. A group pays K480 in total for 3 adults and some learners. Set up an equation and show all working to find the number of learners in the group.",
        markingScheme: [
          "M1 (1 mark): Let n be the number of learners",
          "M2 (2 marks): Equation 3(85) + 45n = 480 => 255 + 45n = 480",
          "M1 (1 mark): Subtract 255: 45n = 225",
          "A2 (2 marks): Divide by 45: n = 225 / 45 = 5 learners",
        ],
      },
      {
        id: "g9-q6",
        number: "Q6",
        subject: "Integrated Science",
        marks: 6,
        type: "structured",
        prompt:
          "State THREE structural adaptations of the alveoli in the human lungs and explain how each adaptation speeds up gas exchange.",
        markingScheme: [
          "B2 (2 marks): Very thin walls (one cell thick) for a short diffusion distance.",
          "B2 (2 marks): Large total surface area (millions of tiny air sacs) to maximize diffusion rate.",
          "B2 (2 marks): Moist lining & rich capillary blood supply to dissolve gases and maintain a steep concentration gradient.",
        ],
      },
    ],
  },
  {
    id: "comp-g12-national-t1",
    title: "2026 Grade 12 National ECZ Challenge",
    termLabel: "Term 1 Nationwide",
    grade: "Grade 12",
    subjectsSummary: "Mathematics · Physics · Chemistry · Biology · Civic Ed",
    durationMinutes: 30,
    totalMarks: 20,
    description:
      "Senior secondary nationwide test modeled on ECZ School Certificate papers with step-by-step rubric marking.",
    questions: [
      {
        id: "g12-q1",
        number: "Q1",
        subject: "Mathematics",
        marks: 2,
        type: "mcq",
        prompt: "What are the roots of the quadratic equation 2x² - 5x - 3 = 0?",
        options: [
          "x = -3 or x = 1/2",
          "x = 3 or x = -1/2",
          "x = 3 or x = 1/2",
          "x = -3 or x = -1/2",
        ],
        correctIndex: 1,
        markingScheme: [
          "B1: Factorizing gives (2x + 1)(x - 3) = 0",
          "B1: Roots are x = -1/2 or x = 3",
        ],
      },
      {
        id: "g12-q2",
        number: "Q2",
        subject: "Chemistry",
        marks: 2,
        type: "mcq",
        prompt:
          "How many moles are present in 10 g of Calcium Carbonate (CaCO₃)? [Relative atomic masses: Ca = 40, C = 12, O = 16]",
        options: ["0.01 mol", "0.10 mol", "1.00 mol", "10.0 mol"],
        correctIndex: 1,
        markingScheme: [
          "B1: Molar mass Mr(CaCO₃) = 40 + 12 + 3(16) = 100 g/mol",
          "B1: Moles = 10 / 100 = 0.10 mol",
        ],
      },
      {
        id: "g12-q3",
        number: "Q3",
        subject: "Physics",
        marks: 2,
        type: "mcq",
        prompt:
          "A 4 Ω resistor and a 6 Ω resistor are connected in parallel in a circuit. What is their combined resistance?",
        options: ["10.0 Ω", "5.0 Ω", "2.4 Ω", "1.5 Ω"],
        correctIndex: 2,
        markingScheme: [
          "B1: 1/R = 1/4 + 1/6 = 5/12",
          "B1: R = 12/5 = 2.4 Ω",
        ],
      },
      {
        id: "g12-q4",
        number: "Q4",
        subject: "Civic Education",
        marks: 2,
        type: "mcq",
        prompt:
          "Why is the independence of the Judiciary essential to protecting the Bill of Rights in Zambia?",
        options: [
          "It allows judges to write national budgets directly.",
          "It ensures courts decide rights cases fairly without political pressure.",
          "It replaces Parliament when passing new statutes.",
          "It cancels general elections every five years.",
        ],
        correctIndex: 1,
        markingScheme: [
          "B2: Independent judges can uphold constitutional rights impartially even against executive overreach.",
        ],
      },
      {
        id: "g12-q5",
        number: "Q5",
        subject: "Mathematics (Earth Geometry)",
        marks: 6,
        type: "structured",
        prompt:
          "Town L is at (15°S, 28°E) and Town C is at (30°N, 28°E). Taking π = 3.142 and the radius of the Earth R = 6370 km, show all working to calculate the shortest distance between L and C along the meridian in: (a) nautical miles, and (b) kilometres.",
        markingScheme: [
          "M1 (1 mark): Difference in latitude θ = 15° + 30° = 45° (opposite sides of Equator)",
          "A1 (1 mark): Distance in nautical miles = 45 × 60 = 2700 nm",
          "M2 (2 marks): Distance in km = (θ / 360) × 2πR = (45 / 360) × 2 × 3.142 × 6370",
          "A2 (2 marks): (1/8) × 40029.08 = 5003.6 km (accept 5004 km)",
        ],
      },
      {
        id: "g12-q6",
        number: "Q6",
        subject: "Biology (Genetics)",
        marks: 6,
        type: "structured",
        prompt:
          "In maize plants, tall stem (T) is dominant over dwarf stem (t). Two heterozygous tall plants (Tt × Tt) are crossed. Show the genetic cross clearly and state: (a) the expected F1 genotype ratio, (b) the expected F1 phenotype ratio, and (c) the percentage chance of getting a dwarf plant.",
        markingScheme: [
          "M2 (2 marks): Gametes T, t from each parent correctly crossed (TT, Tt, Tt, tt)",
          "A1 (1 mark): Genotype ratio = 1 TT : 2 Tt : 1 tt",
          "A1 (1 mark): Phenotype ratio = 3 tall : 1 dwarf",
          "A2 (2 marks): Probability of dwarf (tt) = 1/4 = 25%",
        ],
      },
    ],
  },
];
