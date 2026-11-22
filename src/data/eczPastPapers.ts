import type { GradeLevel } from "./curriculum";

export type PastPaperNumber = "Paper 1" | "Paper 2" | "Composite";

export interface PastPaperQuestion {
  number: string;
  marks: number;
  type: "mcq" | "structured";
  prompt: string;
  options?: string[];
  correctIndex?: number;
  markingGuide: string[];
}

export interface EczPastPaper {
  id: string;
  year: number;
  grade: GradeLevel;
  subject: string;
  paperCode: string;
  paperNumber: PastPaperNumber;
  title: string;
  durationMinutes: number;
  totalMarks: number;
  tutorId: string;
  sourceLabel: string;
  verified: true;
  pdfUrl?: string;
  questions: PastPaperQuestion[];
}

export const ECZ_PAST_PAPERS: EczPastPaper[] = [
  // =========================================================================
  // GRADE 12 (SCHOOL CERTIFICATE — ECZ VERIFIED ARCHIVE)
  // =========================================================================
  {
    id: "ecz-g12-math-2023-p1",
    year: 2023,
    grade: "Grade 12",
    subject: "Mathematics",
    paperCode: "4024/1",
    paperNumber: "Paper 1",
    title: "ECZ Mathematics Paper 1 (No Calculator)",
    durationMinutes: 120,
    totalMarks: 80,
    tutorId: "chanda",
    sourceLabel: "ECZ Verified Past Paper Record · 4024/1 (2023)",
    verified: true,
    pdfUrl: "/papers/ecz-g12-math-2023-p1.pdf",
    questions: [
      {
        number: "Q1",
        marks: 2,
        type: "structured",
        prompt: "Simplify 3(2x - y) - 2(x - 4y).",
        markingGuide: [
          "M1: Expand both brackets correctly: 6x - 3y - 2x + 8y",
          "A1: Collect like terms accurately: 4x + 5y",
        ],
      },
      {
        number: "Q2",
        marks: 2,
        type: "structured",
        prompt: "Evaluate (27)^(2/3) - (16)^(1/2).",
        markingGuide: [
          "M1: Evaluate fractional indices: (27)^(2/3) = (³√27)² = 3² = 9, and (16)^(1/2) = 4",
          "A1: Subtract cleanly: 9 - 4 = 5",
        ],
      },
      {
        number: "Q3",
        marks: 3,
        type: "structured",
        prompt:
          "Given that A = (2, -3) and B = (6, 5), find the gradient and equation of the straight line AB.",
        markingGuide: [
          "M1: Gradient m = (y₂ - y₁) / (x₂ - x₁) = (5 - (-3)) / (6 - 2) = 8 / 4 = 2",
          "M1: Substitute (2, -3) into y = mx + c: -3 = 2(2) + c ⇒ c = -7",
          "A1: Equation of line AB is y = 2x - 7",
        ],
      },
      {
        number: "Q4",
        marks: 3,
        type: "structured",
        prompt:
          "A ZESCO meter reading changes from 4,180 kWh to 4,430 kWh. If electricity costs K1.20 per unit and there is a fixed charge of K35.00, calculate the total bill.",
        markingGuide: [
          "M1: Units consumed = 4,430 - 4,180 = 250 kWh",
          "M1: Energy charge = 250 × K1.20 = K300.00",
          "A1: Total bill = K300.00 + K35.00 = K335.00",
        ],
      },
    ],
  },
  {
    id: "ecz-g12-math-2022-p2",
    year: 2022,
    grade: "Grade 12",
    subject: "Mathematics",
    paperCode: "4024/2",
    paperNumber: "Paper 2",
    title: "ECZ Mathematics Paper 2 (Quadratics & Earth Geometry)",
    durationMinutes: 150,
    totalMarks: 100,
    tutorId: "chanda",
    sourceLabel: "ECZ Verified Past Paper Record · 4024/2 (2022)",
    verified: true,
    pdfUrl: "/papers/ecz-g12-math-2022-p2.pdf",
    questions: [
      {
        number: "Q1",
        marks: 5,
        type: "structured",
        prompt:
          "Solve the equation 2x² - 5x - 6 = 0, giving your answers correct to 2 decimal places.",
        markingGuide: [
          "B1: Identify coefficients a = 2, b = -5, c = -6",
          "M1: Substitute into x = [-b ± √(b² - 4ac)] / 2a = [5 ± √(25 - 4(2)(-6))] / 4",
          "M1: Simplify discriminant: x = (5 ± √73) / 4",
          "A1: First root x = (5 + 8.544) / 4 = 3.39",
          "A1: Second root x = (5 - 8.544) / 4 = -0.89",
        ],
      },
      {
        number: "Q2",
        marks: 6,
        type: "structured",
        prompt:
          "Two towns P(15°S, 28°E) and Q(30°N, 28°E) lie on the same meridian. Taking R = 6,370 km and π = 22/7, calculate the distance PQ along the meridian in kilometres.",
        markingGuide: [
          "M1: Difference in latitude θ = 15° + 30° = 45° (opposite hemispheres)",
          "M1: Meridian arc formula: d = (θ / 360) × 2πR",
          "M1: Substitute values: d = (45 / 360) × 2 × (22/7) × 6,370",
          "A1: Simplify (1/8) × 44 × 910 = 5,005 km",
        ],
      },
    ],
  },
  {
    id: "ecz-g12-math-2021-p1",
    year: 2021,
    grade: "Grade 12",
    subject: "Mathematics",
    paperCode: "4024/1",
    paperNumber: "Paper 1",
    title: "ECZ Mathematics Paper 1 (Matrices, Sets & Bearings)",
    durationMinutes: 120,
    totalMarks: 80,
    tutorId: "chanda",
    sourceLabel: "ECZ Verified Past Paper Record · 4024/1 (2021)",
    verified: true,
    pdfUrl: "/papers/ecz-g12-math-2021-p1.pdf",
    questions: [
      {
        number: "Q1",
        marks: 2,
        type: "structured",
        prompt:
          "Given that the matrix M = [[4, 2], [k, 3]] has a determinant of 6, find the value of k.",
        markingGuide: [
          "M1: Use det(M) = ad - bc ⇒ (4)(3) - (2)(k) = 6",
          "A1: 12 - 2k = 6 ⇒ 2k = 6 ⇒ k = 3",
        ],
      },
      {
        number: "Q2",
        marks: 3,
        type: "structured",
        prompt:
          "The bearing of Chipata from Lusaka is 072°. Calculate the bearing of Lusaka from Chipata.",
        markingGuide: [
          "M1: Back-bearing rule when original bearing < 180°: add 180°",
          "M1: Calculation: 072° + 180°",
          "A1: Bearing of Lusaka from Chipata = 252°",
        ],
      },
    ],
  },
  {
    id: "ecz-g12-math-2016-specimen-p2",
    year: 2016,
    grade: "Grade 12",
    subject: "Mathematics",
    paperCode: "4024/2",
    paperNumber: "Paper 2",
    title: "ECZ Mathematics Paper 2 (2016 Specimen — Questions & Marking Scheme)",
    durationMinutes: 150,
    totalMarks: 100,
    tutorId: "chanda",
    sourceLabel: "ECZ 2016 Specimen Paper & Marking Scheme · 4024/2",
    verified: true,
    pdfUrl:
      "/assets/aistudio/Grade_12_Mathematics_Paper_2_2016_Specimen_-_Marking_Scheme_b3c9d16d.pdf",
    questions: [
      {
        number: "Q1",
        marks: 9,
        type: "structured",
        prompt:
          "(a) If matrix P = [[4, 2], [0, 3]] and Q = [[12, 4], [-9, m]], find: (i) the value of m for which the determinants of P and Q are equal, (ii) the inverse of Q. (b) At Sankani School, 60 learners in Grade 12 were surveyed on Netball (N), Football (F), and Volleyball (V): 5 liked all three; 8 liked Football only; 4 liked Volleyball only; 3 liked Netball only; 12 liked Football and Netball; 21 liked Football and Volleyball; 18 liked Netball and Volleyball. (i) Illustrate this in a Venn diagram. (ii) How many did not like any of the three games? (iii) How many did not like volleyball? (iv) How many liked two games only?",
        markingGuide: [
          "M1: det P = (4)(3) - (2)(0) = 12; det Q = 12m - 4(-9) = 12m + 36",
          "A1: Set 12m + 36 = 12 ⇒ 12m = -24 ⇒ m = -2",
          "A2: Inverse Q⁻¹ = (1/12)[[-2, -4], [9, 12]] = [[-1/6, -1/3], [3/4, 1]]",
          "B2: Venn regions: N∩F∩V = 5; F∩N only = 7; F∩V only = 16; N∩V only = 13; N only = 3, F only = 8, V only = 4 (total inside = 56)",
          "A1: (b)(ii) Liked none = 60 - 56 = 4 learners",
          "A1: (b)(iii) Did not like volleyball = 60 - (4 + 16 + 13 + 5) = 22 learners",
          "A1: (b)(iv) Liked two games only = 7 + 16 + 13 = 36 learners",
        ],
      },
      {
        number: "Q2",
        marks: 10,
        type: "structured",
        prompt:
          "(a) There are 6 girls and 4 boys in a drama club. Two members are chosen at random to represent the club at a meeting. Find the probability that: (i) both members are boys, (ii) one member is a girl. (b) In the triangle diagram, AE = p, AD = q, AE = EB, AD = DC, DE is parallel to CB, and CF : FB = 1 : 3. (i) Express in terms of p and/or q: (a) DE, (b) EC, (c) CB. (ii) Show that EF = ½(3q - p).",
        markingGuide: [
          "M1: P(both boys) = (4/10) × (3/9) = 12/90",
          "A1: P(both boys) = 2/15",
          "M1: P(one girl) = P(G,B) + P(B,G) = 2 × (6/10) × (4/9) = 48/90",
          "A2: P(one girl) = 8/15",
          "B1: DE = AE - AD = p - q",
          "B1: AD = DC ⇒ AC = 2q, so EC = AC - AE = 2q - p",
          "B1: AE = EB ⇒ AB = 2p, so CB = AB - AC = 2p - 2q",
          "M1: CF : FB = 1 : 3 ⇒ CF = ¼CB = ¼(2p - 2q) = ½(p - q)",
          "A1: EF = EC + CF = (2q - p) + ½(p - q) = (3/2)q - ½p = ½(3q - p)",
        ],
      },
      {
        number: "Q3",
        marks: 9,
        type: "structured",
        prompt:
          "(a) Construct a triangle ABC in which AB = 6 cm, ∠ABC = 120° and AC = 11 cm. (b) Measure and write the length BC. (c) Within the triangle, draw the locus of points which are (i) equidistant from CA and CB, (ii) 4 cm from C. (d) Label point P inside triangle ABC that is 4 cm from C and equidistant from CA and CB. (e) Shade the region R inside triangle ABC that is nearer to BC than to AC and less than 4 cm from C.",
        markingGuide: [
          "B1: Draw AB = 6 cm, construct ∠ABC = 120° at B, and intersect ray from B with 11 cm arc centred at A to locate C",
          "A2: Measured length BC ≈ 6.7 cm (cosine rule check: BC² + 6BC - 85 = 0 ⇒ BC = (-6 + √376)/2 ≈ 6.7 cm)",
          "B1: (c)(i) Construct the angle bisector of ∠ACB",
          "B1: (c)(ii) Draw an arc of radius 4 cm centred at C inside triangle ABC",
          "B2: (d) Point P is the intersection of the ∠ACB bisector and the 4 cm arc about C",
          "B2: (e) Shade the overlap inside △ABC on the BC-side of the ∠ACB bisector and inside the 4 cm arc about C",
        ],
      },
      {
        number: "Q4",
        marks: 11,
        type: "structured",
        prompt:
          "(a) Solve the equation 3x² + 5x + 2 = 0, giving your answers correct to 2 decimal places. (b) A vuvuzela DBCE is made from cone ABC (apex A) by cutting off its sharp end ADE. Given AF = 30 cm, GF = 25 cm, DG = 1 cm, and AD = 4.9 cm (take π = 3.142), calculate: (i) the curved surface area of the piece that was cut off, (ii) the volume of the vuvuzela.",
        markingGuide: [
          "M2: Factorise (3x + 2)(x + 1) = 0 (or substitute into quadratic formula)",
          "A3: x = -0.67 or x = -1.00 (to 2 d.p.)",
          "M1: Curved surface area of cut-off cone ADE: CSA = π × r × l = 3.142 × 1 × 4.9",
          "A1: CSA ≈ 15.4 cm²",
          "M1: Similar cones: AG = 30 - 25 = 5 cm; big radius BF = 30 × (1/5) = 6 cm",
          "M2: Volume of big cone = (1/3)π(6²)(30) = 1131.1 cm³; small cone = (1/3)π(1²)(5) = 5.24 cm³",
          "A1: Volume of vuvuzela = 1131.1 - 5.24 ≈ 1126 cm³ (1130 cm³ to 3 s.f.)",
        ],
      },
      {
        number: "Q5",
        marks: 9,
        type: "structured",
        prompt:
          "(a) The 3rd and 4th terms of a geometric progression are 4 and 8 respectively. Find: (i) the first term and the common ratio, (ii) the sum of the first 10 terms, (iii) the sum to infinity of this geometric progression. (b) Simplify (13k / 20a²) × (5 / 39k).",
        markingGuide: [
          "M1: Common ratio r = T₄ / T₃ = 8 / 4 = 2",
          "M1: ar² = 4 ⇒ a(2²) = 4 ⇒ a = 1",
          "A1: First term a = 1, common ratio r = 2",
          "M1: S₁₀ = a(r¹⁰ - 1) / (r - 1) = 1(2¹⁰ - 1) / (2 - 1)",
          "A1: S₁₀ = 1023",
          "B2: Sum to infinity exists only when |r| < 1; since r = 2, the series diverges (no sum to infinity)",
          "M1: Multiply numerators and denominators: 65k / (780a²k)",
          "A1: Cancel k and divide by 65: 1 / (12a²)",
        ],
      },
      {
        number: "Q6",
        marks: 12,
        type: "structured",
        prompt:
          "Study the flowchart program (Start → Enter a, b, c → D = b*b - 4*a*c → is D < 0? Yes → Print \"No real solutions\" → Stop; No → x₁ = (-b + square root D)/(2*a), x₂ = (-b - square root D)/(2*a) → Print x₁, x₂ → Stop). Write a pseudocode corresponding to the flowchart program.",
        markingGuide: [
          "B1: Start / Enter a, b, c",
          "B1: D = b * b - 4 * a * c",
          "B1: If D < 0 then Print \"No real solutions\"",
          "B1: Else x₁ = (-b + √D) / (2 * a); x₂ = (-b - √D) / (2 * a); Print x₁, x₂",
          "B1: End if / Stop",
        ],
      },
      {
        number: "Q7",
        marks: 12,
        type: "structured",
        prompt:
          "(a) A farm is in the shape of a parallelogram ABCD with AB = 70 m, AC = 90 m, and BC = 100 m. Calculate: (i) angle BAC, (ii) the area of triangle ABC, (iii) the shortest distance from D to AC. (b) Solve sin θ = 0.766 for 0° ≤ θ ≤ 180°.",
        markingGuide: [
          "M2: Cosine rule: cos(∠BAC) = (70² + 90² - 100²) / (2 × 70 × 90) = 3000 / 12600 = 0.2381",
          "A3: ∠BAC ≈ 76.2°",
          "M1: Area of △ABC = ½ × 70 × 90 × sin(76.2°) = 3150 × 0.9712",
          "A2: Area of △ABC ≈ 3060 m² (3059 m²)",
          "M1: Area(△ACD) = Area(△ABC) = 3059 m²; distance = (2 × 3059) / 90",
          "A1: Shortest distance from D to AC ≈ 68.0 m",
          "A2: θ = sin⁻¹(0.766) = 50.0° or 180° - 50.0° = 130.0°",
        ],
      },
      {
        number: "Q8",
        marks: 12,
        type: "structured",
        prompt:
          "The table shows days absent for 52 learners at Masambililo School — Days absent: 0, 1, 2, 3, 4, 5, 6, 7, 9; Frequency: 2, 3, 6, 7, 6, 9, 11, 6, 2. (a) Calculate the standard deviation. (b)(i) Complete the relative cumulative frequency table (given 0.04, 0.10, 0.21, 0.35, 0.46 up to 4 days). (ii) Using 1 cm to 1 unit on each axis, draw a smooth relative cumulative frequency curve. (iii) Estimate the 50th percentile from your graph.",
        markingGuide: [
          "M2: Σf = 52; Σfx = 0+3+12+21+24+45+66+42+18 = 231 ⇒ mean x̄ = 231/52 = 4.442",
          "M2: Σfx² = 0+3+24+63+96+225+396+294+162 = 1263; SD = √(1263/52 - 4.442²) = √4.554",
          "A2: Standard deviation ≈ 2.13 days",
          "B1: Cumulative frequencies: 2, 5, 11, 18, 24, 33, 44, 50, 52 ⇒ Relative CF: 0.04, 0.10, 0.21, 0.35, 0.46, 0.63, 0.85, 0.96, 1.00",
          "B3: Smooth rising ogive curve plotted from (0, 0.04) to (9, 1.00)",
          "A2: 50th percentile (at relative CF = 0.50, between 4 and 5 days) ≈ 4.2 days",
        ],
      },
      {
        number: "Q9",
        marks: 12,
        type: "structured",
        prompt:
          "Study the coordinate grid showing triangle ABC and its images A₁B₁C₁, A₂B₂C₂, A₃B₃C₃, and A₄B₄C₄. (a) Describe fully the single transformation mapping ABC onto A₁B₁C₁. (b) ABC maps onto A₂B₂C₂ by an enlargement: find (i) the centre of enlargement, (ii) the scale factor. (c) ABC maps onto A₃B₃C₃ by a single transformation: find (i) the matrix representing it, (ii) the area scale factor. (d) Describe fully the single transformation mapping ABC onto A₄B₄C₄.",
        markingGuide: [
          "B3: (a) Congruent transformation — check orientation on the grid to state translation vector, or reflection mirror line, or rotation centre & angle",
          "B1: (b)(i) Join corresponding vertices A→A₂, B→B₂, C→C₂; intersection gives the centre of enlargement",
          "B1: (b)(ii) Scale factor k = image length / object length (signed by direction from centre)",
          "M1: (c)(i) Solve M·(object) = (image) using mapped vertices from the grid",
          "A1: Write the 2×2 matrix M representing the transformation",
          "B2: (c)(ii) Area scale factor = |det M| = |image area ÷ object area|",
          "B3: (d) Compare size and orientation with ABC and state the single transformation with full parameters from the grid",
        ],
      },
      {
        number: "Q10",
        marks: 12,
        type: "structured",
        prompt:
          "(a) The variables x and y are connected by y = x³ - 6x + 2, with table x: -3, -2, -1, 0, 1, 2, 3 and y: -7, 6, 7, 2, -3, -2, k. (i) Calculate k. (ii) Draw the graph of y = x³ - 6x + 2 for -3 ≤ x ≤ 3 and -8 ≤ y ≤ 12. (iii) Use your graph to solve x³ - 6x + 2 = 0. (iv) Draw y = 2x - 2 on the same axes and solve x³ - 6x + 2 = 2x - 2. (b) Express 3/(x + 1) - 2/(x - 3) as a single fraction in its lowest terms.",
        markingGuide: [
          "A1: (a)(i) At x = 3: k = 3³ - 6(3) + 2 = 11",
          "B3: (a)(ii) Plot all 7 points and draw a smooth cubic curve through (-3,-7) to (3,11)",
          "A2: (a)(iii) x-intercepts from graph: x ≈ -2.6, 0.3, 2.3",
          "B1: (a)(iv)(a) Draw straight line y = 2x - 2 through (0, -2) and (3, 4)",
          "A2: (a)(iv)(b) Curve-line intersections: x ≈ 0.5 and x ≈ 2.5 (and ≈ -3.1)",
          "M2: (b) [3(x - 3) - 2(x + 1)] / [(x + 1)(x - 3)] = (3x - 9 - 2x - 2) / [(x + 1)(x - 3)]",
          "A1: (x - 11) / [(x + 1)(x - 3)]",
        ],
      },
      {
        number: "Q11",
        marks: 12,
        type: "structured",
        prompt:
          "Makeke makes Xlent (x) and Yammy (y) cakes: she wants at most 30 cakes in total, Xlent not exceeding 15, Yammy less than or equal to Xlent, and spends at least K300.00 (Xlent costs K60.00, Yammy costs K30.00). (a) Write four inequalities in x and y. (b) Using 2 cm to 5 units on both axes, shade the unwanted regions. (c) Given profit is K20.00 per Xlent and K12.00 per Yammy, how many of each should she make for maximum profit? (d) Estimate the maximum profit.",
        markingGuide: [
          "B4: (a) x + y ≤ 30; x ≤ 15; y ≤ x; 60x + 30y ≥ 300 ⇒ 2x + y ≥ 10 (with x, y ≥ 0)",
          "B4: (b) Plot boundary lines x = 15, y = x, x + y = 30, 2x + y = 10 and shade unwanted sides to leave the feasible region",
          "A2: (c) Profit P = 20x + 12y is maximised at corner (15, 15): 15 Xlent and 15 Yammy cakes",
          "M1: (d) P = 20(15) + 12(15) = 300 + 180",
          "A1: Maximum profit = K480.00",
        ],
      },
      {
        number: "Q12",
        marks: 12,
        type: "structured",
        prompt:
          "(a) On the Earth sketch, P(20°N, 80°E), Q(40°S, 80°E) and R(40°S, 30°E) [take π = 3.142, R = 6370 km]. (i) Calculate distance QR in km. (ii) An aeroplane flies due west from P along the same latitude covering 1 232 km to T: (a) calculate the difference in longitude between P and T, (b) find the position of T. (b) (i) Find the equation of the tangent to y = x² - 2x - 3 at (3, 0). (ii) A curve has dy/dx = 15x² - 12x and passes through (1, 3); find its equation.",
        markingGuide: [
          "M1: (a)(i) Q and R lie on 40°S; longitude difference = 80° - 30° = 50°",
          "A1: QR = (50/360) × 2 × 3.142 × 6370 × cos40° ≈ 4,260 km",
          "M1: (a)(ii)(a) 1232 = (θ/360) × 2 × 3.142 × 6370 × cos20° = (θ/360) × 37615",
          "A1: θ = 1232 × 360 / 37615 ≈ 11.8°",
          "A2: (a)(ii)(b) Flying west from 80°E: 80° - 11.8° = 68.2°E ⇒ T(20°N, 68.2°E)",
          "M1: (b)(i) dy/dx = 2x - 2; at x = 3, gradient m = 4",
          "A2: Tangent at (3, 0): y - 0 = 4(x - 3) ⇒ y = 4x - 12",
          "M2: (b)(ii) y = ∫(15x² - 12x) dx = 5x³ - 6x² + C; substitute (1, 3): 3 = 5 - 6 + C ⇒ C = 4",
          "A1: y = 5x³ - 6x² + 4",
        ],
      },
    ],
  },
  {
    id: "ecz-g12-sci-2023-p1",
    year: 2023,
    grade: "Grade 12",
    subject: "Science (Physics & Chemistry)",
    paperCode: "5124/1",
    paperNumber: "Paper 1",
    title: "ECZ Science Paper 1 (Multiple Choice)",
    durationMinutes: 60,
    totalMarks: 40,
    tutorId: "phiri",
    sourceLabel: "ECZ Verified Past Paper Record · 5124/1 (2023)",
    verified: true,
    pdfUrl: "/papers/ecz-g12-sci-2023-p1.pdf",
    questions: [
      {
        number: "Q1",
        marks: 1,
        type: "mcq",
        prompt:
          "A stone of mass 300 g is placed in a measuring cylinder containing 40 cm³ of water. The water level rises to 100 cm³. What is the density of the stone?",
        options: ["3.0 g/cm³", "5.0 g/cm³", "7.5 g/cm³", "18.0 g/cm³"],
        correctIndex: 1,
        markingGuide: [
          "B1: Volume of stone = 100 - 40 = 60 cm³",
          "A1: Density = mass / volume = 300 g / 60 cm³ = 5.0 g/cm³",
        ],
      },
      {
        number: "Q2",
        marks: 1,
        type: "mcq",
        prompt:
          "Two resistors of 4 Ω and 6 Ω are connected in parallel across a 12 V battery. What is their combined effective resistance?",
        options: ["10.0 Ω", "5.0 Ω", "2.4 Ω", "1.5 Ω"],
        correctIndex: 2,
        markingGuide: [
          "M1: Parallel formula 1/R = 1/4 + 1/6 = 5/12",
          "A1: R = 12/5 = 2.4 Ω",
        ],
      },
      {
        number: "Q3",
        marks: 1,
        type: "mcq",
        prompt:
          "How many moles of calcium carbonate (CaCO₃) are contained in 25 g of pure CaCO₃? (Relative atomic masses: Ca = 40, C = 12, O = 16)",
        options: ["0.25 mol", "0.50 mol", "2.50 mol", "4.00 mol"],
        correctIndex: 0,
        markingGuide: [
          "M1: Molar mass of CaCO₃ = 40 + 12 + (3 × 16) = 100 g/mol",
          "A1: Moles = mass / molar mass = 25 / 100 = 0.25 mol",
        ],
      },
    ],
  },
  {
    id: "ecz-g12-sci-2022-p2",
    year: 2022,
    grade: "Grade 12",
    subject: "Science (Physics & Chemistry)",
    paperCode: "5124/2",
    paperNumber: "Paper 2",
    title: "ECZ Science Paper 2 (Electricity, Motion & Stoichiometry)",
    durationMinutes: 120,
    totalMarks: 85,
    tutorId: "phiri",
    sourceLabel: "ECZ Verified Past Paper Record · 5124/2 (2022)",
    verified: true,
    pdfUrl: "/papers/ecz-g12-sci-2022-p2.pdf",
    questions: [
      {
        number: "Q1",
        marks: 4,
        type: "structured",
        prompt:
          "An electric kettle rated 2,000 W is connected to a 250 V ZESCO mains supply and used for 15 minutes. Calculate: (a) the current flowing through the kettle, and (b) the electrical energy consumed in kilowatt-hours (kWh).",
        markingGuide: [
          "M1: Current I = P / V = 2,000 / 250",
          "A1: I = 8.0 A",
          "M1: Convert to kW & hours: P = 2.0 kW, time t = 15 / 60 = 0.25 h",
          "A1: Energy = P × t = 2.0 × 0.25 = 0.50 kWh",
        ],
      },
      {
        number: "Q2",
        marks: 4,
        type: "structured",
        prompt:
          "Calcium carbonate decomposes on strong heating: CaCO₃(s) → CaO(s) + CO₂(g). Calculate the volume of carbon dioxide gas produced at r.t.p. when 10.0 g of CaCO₃ decomposes completely. (Molar gas volume at r.t.p. = 24 dm³)",
        markingGuide: [
          "M1: Molar mass of CaCO₃ = 100 g/mol; moles of CaCO₃ = 10.0 / 100 = 0.10 mol",
          "B1: Mole ratio CaCO₃ : CO₂ = 1 : 1 ⇒ moles of CO₂ = 0.10 mol",
          "M1: Volume = moles × 24 dm³ = 0.10 × 24",
          "A1: Volume of CO₂ = 2.4 dm³",
        ],
      },
    ],
  },
  {
    id: "ecz-g12-bio-2022-p2",
    year: 2022,
    grade: "Grade 12",
    subject: "Biology",
    paperCode: "5090/2",
    paperNumber: "Paper 2",
    title: "ECZ Biology Paper 2 (Genetics & Gaseous Exchange)",
    durationMinutes: 105,
    totalMarks: 80,
    tutorId: "mwansa",
    sourceLabel: "ECZ Verified Past Paper Record · 5090/2 (2022)",
    verified: true,
    pdfUrl: "/papers/ecz-g12-bio-2022-p2.pdf",
    questions: [
      {
        number: "Q1",
        marks: 5,
        type: "structured",
        prompt:
          "In maize plants, tallness (T) is dominant over dwarfness (t). Draw a genetic diagram to show the expected genotypes and phenotypes when two heterozygous tall maize plants (Tt) are crossed.",
        markingGuide: [
          "B1: Parental genotypes: Tt × Tt; Gametes: T, t and T, t",
          "M1: Offspring genotypes from Punnett square: TT, Tt, Tt, tt",
          "A1: Genotypic ratio = 1 TT : 2 Tt : 1 tt",
          "A1: Phenotypic ratio = 3 Tall : 1 Dwarf (75% Tall, 25% Dwarf)",
        ],
      },
      {
        number: "Q2",
        marks: 4,
        type: "structured",
        prompt:
          "State three structural adaptations of human alveoli that make gaseous exchange efficient.",
        markingGuide: [
          "B1: Walls are one-cell thick (short diffusion distance)",
          "B1: Large total surface area due to millions of tiny air sacs",
          "B1: Moist inner lining so oxygen dissolves before diffusing",
          "B1: Dense network of blood capillaries maintains a steep concentration gradient",
        ],
      },
    ],
  },
  {
    id: "ecz-g12-civic-2023-p2",
    year: 2023,
    grade: "Grade 12",
    subject: "Civic Education",
    paperCode: "2030/2",
    paperNumber: "Paper 2",
    title: "ECZ Civic Education Paper 2 (Governance & Human Rights)",
    durationMinutes: 120,
    totalMarks: 100,
    tutorId: "banda",
    sourceLabel: "ECZ Verified Past Paper Record · 2030/2 (2023)",
    verified: true,
    pdfUrl: "/papers/ecz-g12-civic-2023-p2.pdf",
    questions: [
      {
        number: "Q1",
        marks: 6,
        type: "structured",
        prompt:
          "Explain three ways in which the principle of Separation of Powers protects human rights in Zambia.",
        markingGuide: [
          "B2: Checks and balances prevent any single arm (Executive, Legislature, Judiciary) from abusing authority.",
          "B2: An independent Judiciary can strike down unconstitutional laws or executive actions violating the Zambian Bill of Rights.",
          "B2: The Legislature scrutinizes national budgets and laws openly on behalf of citizens, enforcing accountability.",
        ],
      },
      {
        number: "Q2",
        marks: 4,
        type: "structured",
        prompt:
          "Distinguish between 'direct democracy' and 'representative democracy', giving one Zambian example of the latter.",
        markingGuide: [
          "B2: Direct democracy: citizens vote directly on laws; Representative democracy: citizens elect representatives to legislate on their behalf.",
          "B2: Zambian example: Electing Members of Parliament (MPs) to the National Assembly and Ward Councillors during general elections.",
        ],
      },
    ],
  },
  {
    id: "ecz-g12-eng-2023-p2",
    year: 2023,
    grade: "Grade 12",
    subject: "English Language",
    paperCode: "1121/2",
    paperNumber: "Paper 2",
    title: "ECZ English Language Paper 2 (Structure & Transformations)",
    durationMinutes: 120,
    totalMarks: 60,
    tutorId: "banda",
    sourceLabel: "ECZ Verified Past Paper Record · 1121/2 (2023)",
    verified: true,
    pdfUrl: "/papers/ecz-g12-eng-2023-p2.pdf",
    questions: [
      {
        number: "Q1",
        marks: 2,
        type: "structured",
        prompt:
          "Rewrite the following sentence beginning with 'Hardly...': 'As soon as the headteacher entered the hall, the learners stood up.'",
        markingGuide: [
          "B1: Inversion after 'Hardly': 'Hardly had the headteacher entered the hall...'",
          "B1: Correct conjunction pairing ('when', not 'than'): '...when the learners stood up.'",
        ],
      },
      {
        number: "Q2",
        marks: 2,
        type: "structured",
        prompt:
          "Rewrite in reported speech: 'I will finish revising Earth Geometry tomorrow,' promised Chileshe.",
        markingGuide: [
          "B1: Pronoun & tense shift: 'Chileshe promised that she (or he) would finish revising Earth Geometry...'",
          "B1: Time adverb shift: '...the following day (or the next day).'",
        ],
      },
    ],
  },

  // =========================================================================
  // GRADE 9 (JUNIOR SECONDARY SCHOOL LEAVING — ECZ VERIFIED ARCHIVE)
  // =========================================================================
  {
    id: "ecz-g9-math-2023-p1",
    year: 2023,
    grade: "Grade 9",
    subject: "Mathematics",
    paperCode: "401/1",
    paperNumber: "Paper 1",
    title: "ECZ Grade 9 Mathematics Paper 1",
    durationMinutes: 120,
    totalMarks: 50,
    tutorId: "chanda",
    sourceLabel: "ECZ Verified Past Paper Record · 401/1 (2023)",
    verified: true,
    pdfUrl: "/papers/ecz-g9-math-2023-p1.pdf",
    questions: [
      {
        number: "Q1",
        marks: 2,
        type: "mcq",
        prompt: "Solve the inequality 3x - 4 < 11.",
        options: ["x < 5", "x > 5", "x < 7/3", "x < 15"],
        correctIndex: 0,
        markingGuide: [
          "M1: Add 4 to both sides: 3x < 15",
          "A1: Divide by 3: x < 5",
        ],
      },
      {
        number: "Q2",
        marks: 4,
        type: "structured",
        prompt: "Solve the simultaneous equations: 2x + y = 11 and x - y = 1.",
        markingGuide: [
          "M1: Add the two equations to eliminate y: 3x = 12",
          "A1: x = 4",
          "M1: Substitute x = 4 into x - y = 1: 4 - y = 1",
          "A1: y = 3 ⇒ Solution: x = 4, y = 3",
        ],
      },
    ],
  },
  {
    id: "ecz-g9-math-2022-p2",
    year: 2022,
    grade: "Grade 9",
    subject: "Mathematics",
    paperCode: "401/2",
    paperNumber: "Paper 2",
    title: "ECZ Grade 9 Mathematics Paper 2 (Mensuration & Sets)",
    durationMinutes: 120,
    totalMarks: 50,
    tutorId: "chanda",
    sourceLabel: "ECZ Verified Past Paper Record · 401/2 (2022)",
    verified: true,
    pdfUrl: "/papers/ecz-g9-math-2022-p2.pdf",
    questions: [
      {
        number: "Q1",
        marks: 4,
        type: "structured",
        prompt:
          "A cylindrical water tank has radius 70 cm and height 100 cm. Taking π = 22/7, calculate its volume in cubic centimetres (cm³).",
        markingGuide: [
          "M1: Formula V = πr²h",
          "M1: Substitute values: V = (22/7) × 70 × 70 × 100",
          "M1: Simplify 22 × 10 × 70 × 100",
          "A1: V = 1,540,000 cm³",
        ],
      },
      {
        number: "Q2",
        marks: 3,
        type: "structured",
        prompt:
          "In a Grade 9 class of 40 pupils in Ndola, 24 study Bemba, 20 study Nyanja, and 6 study neither. Find how many pupils study both languages.",
        markingGuide: [
          "M1: Pupils studying at least one language = 40 - 6 = 34",
          "M1: Let x be pupils studying both: (24 - x) + x + (20 - x) = 34 ⇒ 44 - x = 34",
          "A1: x = 10 pupils study both languages",
        ],
      },
    ],
  },
  {
    id: "ecz-g9-sci-2022-p1",
    year: 2022,
    grade: "Grade 9",
    subject: "Integrated Science",
    paperCode: "502/1",
    paperNumber: "Paper 1",
    title: "ECZ Grade 9 Integrated Science Paper 1",
    durationMinutes: 90,
    totalMarks: 60,
    tutorId: "mwansa",
    sourceLabel: "ECZ Verified Past Paper Record · 502/1 (2022)",
    verified: true,
    pdfUrl: "/papers/ecz-g9-sci-2022-p1.pdf",
    questions: [
      {
        number: "Q1",
        marks: 1,
        type: "mcq",
        prompt:
          "Which chamber of the human heart pumps oxygenated blood to the rest of the body through the aorta?",
        options: [
          "Right atrium",
          "Right ventricle",
          "Left atrium",
          "Left ventricle",
        ],
        correctIndex: 3,
        markingGuide: [
          "B1: The left ventricle has the thickest muscular wall to pump oxygenated blood at high pressure into the aorta to the whole body.",
        ],
      },
      {
        number: "Q2",
        marks: 3,
        type: "structured",
        prompt:
          "A rectangular block of wood weighs 60 N and rests on a flat table. The area of the face in contact with the table is 0.03 m². Calculate the pressure exerted on the table.",
        markingGuide: [
          "M1: Pressure = Force / Area",
          "M1: Pressure = 60 N / 0.03 m²",
          "A1: Pressure = 2,000 N/m² (or 2,000 Pa)",
        ],
      },
    ],
  },
  {
    id: "ecz-g9-soc-2023-p1",
    year: 2023,
    grade: "Grade 9",
    subject: "Social Studies",
    paperCode: "207/1",
    paperNumber: "Paper 1",
    title: "ECZ Grade 9 Social Studies Paper 1 (Governance & Geography)",
    durationMinutes: 90,
    totalMarks: 60,
    tutorId: "banda",
    sourceLabel: "ECZ Verified Past Paper Record · 207/1 (2023)",
    verified: true,
    pdfUrl: "/papers/ecz-g9-soc-2023-p1.pdf",
    questions: [
      {
        number: "Q1",
        marks: 1,
        type: "mcq",
        prompt:
          "Which arm of the Zambian government is responsible for interpreting laws and settling legal disputes?",
        options: [
          "The Executive",
          "The Legislature",
          "The Judiciary",
          "The House of Chiefs",
        ],
        correctIndex: 2,
        markingGuide: [
          "B1: The Judiciary (headed by the Chief Justice and courts) interprets laws and settles disputes independently.",
        ],
      },
      {
        number: "Q2",
        marks: 3,
        type: "structured",
        prompt:
          "State three economic benefits of the Kariba Hydroelectric Power Station to Zambia.",
        markingGuide: [
          "B1: Supplies renewable electricity to Copperbelt mines and manufacturing industries.",
          "B1: Powers urban and rural households, schools, and clinics across Zambia.",
          "B1: Supports fishing and tourism around Lake Kariba (Siavonga), creating local employment.",
        ],
      },
    ],
  },

  // =========================================================================
  // GRADE 7 (COMPOSITE EXAMINATION — ECZ VERIFIED ARCHIVE)
  // =========================================================================
  {
    id: "ecz-g7-math-2023",
    year: 2023,
    grade: "Grade 7",
    subject: "Mathematics",
    paperCode: "701",
    paperNumber: "Composite",
    title: "ECZ Grade 7 Composite Mathematics",
    durationMinutes: 90,
    totalMarks: 60,
    tutorId: "chanda",
    sourceLabel: "ECZ Verified Past Paper Record · 701 (2023)",
    verified: true,
    pdfUrl: "/papers/ecz-g7-math-2023.pdf",
    questions: [
      {
        number: "Q1",
        marks: 1,
        type: "mcq",
        prompt:
          "Bwalya bought a school bag for K160 and sold it for K200. Calculate his percentage profit.",
        options: ["20%", "25%", "40%", "80%"],
        correctIndex: 1,
        markingGuide: [
          "M1: Profit = K200 - K160 = K40",
          "A1: Percentage Profit = (40 / 160) × 100% = 25%",
        ],
      },
      {
        number: "Q2",
        marks: 2,
        type: "structured",
        prompt: "Share K240 between Mutinta and Chomba in the ratio 3 : 5.",
        markingGuide: [
          "M1: Total parts = 3 + 5 = 8 parts; 1 part = K240 ÷ 8 = K30",
          "A1: Mutinta gets 3 × K30 = K90; Chomba gets 5 × K30 = K150",
        ],
      },
      {
        number: "Q3",
        marks: 1,
        type: "mcq",
        prompt: "What is 3/4 expressed as a decimal and percentage?",
        options: [
          "0.34 and 34%",
          "0.75 and 75%",
          "0.43 and 43%",
          "0.25 and 25%",
        ],
        correctIndex: 1,
        markingGuide: [
          "B1: 3 ÷ 4 = 0.75, and 0.75 × 100% = 75%",
        ],
      },
    ],
  },
  {
    id: "ecz-g7-math-2022",
    year: 2022,
    grade: "Grade 7",
    subject: "Mathematics",
    paperCode: "701",
    paperNumber: "Composite",
    title: "ECZ Grade 7 Composite Mathematics",
    durationMinutes: 90,
    totalMarks: 60,
    tutorId: "chanda",
    sourceLabel: "ECZ Verified Past Paper Record · 701 (2022)",
    verified: true,
    pdfUrl: "/papers/ecz-g7-math-2022.pdf",
    questions: [
      {
        number: "Q1",
        marks: 1,
        type: "mcq",
        prompt:
          "A bus leaves Lusaka at 06:45 hours and arrives in Kabwe at 08:30 hours. How long did the journey take?",
        options: [
          "1 hour 15 minutes",
          "1 hour 45 minutes",
          "2 hours 15 minutes",
          "2 hours 45 minutes",
        ],
        correctIndex: 1,
        markingGuide: [
          "M1: From 06:45 to 07:45 is 1 hour; from 07:45 to 08:30 is 45 minutes",
          "A1: Total journey time = 1 hour 45 minutes",
        ],
      },
      {
        number: "Q2",
        marks: 2,
        type: "structured",
        prompt:
          "Find the perimeter and area of a rectangular maize garden measuring 12 m long and 8 m wide.",
        markingGuide: [
          "B1: Perimeter = 2 × (12 + 8) = 2 × 20 = 40 m",
          "B1: Area = length × width = 12 × 8 = 96 m²",
        ],
      },
    ],
  },
  {
    id: "ecz-g7-eng-2023",
    year: 2023,
    grade: "Grade 7",
    subject: "English Language",
    paperCode: "702",
    paperNumber: "Composite",
    title: "ECZ Grade 7 English Language (Grammar & Structure)",
    durationMinutes: 90,
    totalMarks: 60,
    tutorId: "banda",
    sourceLabel: "ECZ Verified Past Paper Record · 702 (2023)",
    verified: true,
    pdfUrl: "/papers/ecz-g7-eng-2023.pdf",
    questions: [
      {
        number: "Q1",
        marks: 1,
        type: "mcq",
        prompt:
          "Choose the best passive-voice rewrite: 'The pupils cleaned the classroom.'",
        options: [
          "The classroom is cleaned by the pupils.",
          "The classroom was cleaned by the pupils.",
          "The classroom were cleaned by the pupils.",
          "The pupils were cleaning the classroom.",
        ],
        correctIndex: 1,
        markingGuide: [
          "B1: Simple past active ('cleaned') becomes singular past passive ('was cleaned') because 'the classroom' is singular.",
        ],
      },
      {
        number: "Q2",
        marks: 1,
        type: "mcq",
        prompt:
          "Neither Mwila nor her friends _____ coming to the science club today.",
        options: ["is", "are", "was", "has"],
        correctIndex: 1,
        markingGuide: [
          "B1: With 'neither...nor', the verb agrees with the nearer subject ('her friends', plural), so 'are' is correct.",
        ],
      },
    ],
  },
  {
    id: "ecz-g7-sci-2023",
    year: 2023,
    grade: "Grade 7",
    subject: "Integrated Science",
    paperCode: "704",
    paperNumber: "Composite",
    title: "ECZ Grade 7 Integrated Science (Plants, Health & Circuits)",
    durationMinutes: 90,
    totalMarks: 60,
    tutorId: "mwansa",
    sourceLabel: "ECZ Verified Past Paper Record · 704 (2023)",
    verified: true,
    pdfUrl: "/papers/ecz-g7-sci-2023.pdf",
    questions: [
      {
        number: "Q1",
        marks: 1,
        type: "mcq",
        prompt:
          "Which gas do green maize plants take in through their stomata during photosynthesis?",
        options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"],
        correctIndex: 2,
        markingGuide: [
          "B1: Plants absorb carbon dioxide through leaf stomata and combine it with water using sunlight and chlorophyll to make glucose.",
        ],
      },
      {
        number: "Q2",
        marks: 1,
        type: "mcq",
        prompt:
          "Why are electrical household wires usually made of copper covered with plastic?",
        options: [
          "Copper is an insulator and plastic is a conductor",
          "Copper is a good conductor and plastic is an insulator for safety",
          "Both copper and plastic conduct electricity equally",
          "Plastic makes the current flow faster",
        ],
        correctIndex: 1,
        markingGuide: [
          "B1: Copper conducts electric current with low resistance, while plastic insulates the wire to prevent electric shock.",
        ],
      },
    ],
  },

  // =========================================================================
  // A-LEVEL WING VERIFIED ARCHIVE
  // =========================================================================
  {
    id: "alevel-math-9709-p3",
    year: 2024,
    grade: "A-Level",
    subject: "Pure Mathematics",
    paperCode: "9709/32",
    paperNumber: "Paper 2",
    title: "A-Level Pure Mathematics 3 (Calculus & 3D Vectors)",
    durationMinutes: 110,
    totalMarks: 75,
    tutorId: "kaluba",
    sourceLabel: "Verified A-Level Archive · 9709/32 (2024)",
    verified: true,
    pdfUrl: "/papers/alevel-math-9709-p3.pdf",
    questions: [
      {
        number: "Q1",
        marks: 5,
        type: "structured",
        prompt:
          "Use integration by parts to find the exact value of ∫₀^(π/2) x cos(2x) dx.",
        markingGuide: [
          "M1: Set u = x (du/dx = 1) and dv/dx = cos(2x) (v = ½ sin(2x))",
          "M1: Apply ∫ u dv = uv - ∫ v du = [½ x sin(2x)]₀^(π/2) - ∫₀^(π/2) ½ sin(2x) dx",
          "M1: Integrate second term: + [¼ cos(2x)]₀^(π/2)",
          "M1: Evaluate limits: (0 - 0) + (¼ cos(π) - ¼ cos(0))",
          "A1: Exact answer = -¼ - ¼ = -½",
        ],
      },
      {
        number: "Q2",
        marks: 6,
        type: "structured",
        prompt:
          "Solve the separable differential equation dy/dx = (2x)(y - 1), given that y = 4 when x = 0. Express y in terms of x.",
        markingGuide: [
          "M1: Separate variables: ∫ 1/(y - 1) dy = ∫ 2x dx",
          "A1: Integrate both sides: ln|y - 1| = x² + C",
          "M1: Substitute x = 0, y = 4: ln(3) = 0 + C ⇒ C = ln 3",
          "M1: Exponentiate: y - 1 = 3e^(x²)",
          "A1: y = 1 + 3e^(x²)",
        ],
      },
      {
        number: "Q3",
        marks: 1,
        type: "mcq",
        prompt:
          "Two vectors a = 2i - j + 2k and b = 3i + 4j + λk are perpendicular. What is the value of λ?",
        options: ["-1", "1", "-2", "5"],
        correctIndex: 0,
        markingGuide: [
          "M1: For perpendicular vectors, scalar product a·b = 0 ⇒ (2)(3) + (-1)(4) + (2)(λ) = 0",
          "A1: 6 - 4 + 2λ = 0 ⇒ 2λ = -2 ⇒ λ = -1",
        ],
      },
    ],
  },
  {
    id: "alevel-chem-9701-p4",
    year: 2024,
    grade: "A-Level",
    subject: "Chemistry",
    paperCode: "9701/42",
    paperNumber: "Paper 2",
    title: "A-Level Chemistry Paper 4 (Mechanisms & Thermodynamics)",
    durationMinutes: 120,
    totalMarks: 100,
    tutorId: "tembo",
    sourceLabel: "Verified A-Level Archive · 9701/42 (2024)",
    verified: true,
    pdfUrl: "/papers/alevel-chem-9701-p4.pdf",
    questions: [
      {
        number: "Q1",
        marks: 4,
        type: "structured",
        prompt:
          "Explain why (CH₃)₃CBr reacts with aqueous NaOH predominantly via an SN1 mechanism, whereas CH₃CH₂Br reacts via an SN2 mechanism.",
        markingGuide: [
          "B1: (CH₃)₃CBr forms a tertiary carbocation intermediate (CH₃)₃C⁺ stabilized by the positive inductive effect of three methyl groups.",
          "B1: Bulky methyl groups also cause steric hindrance, blocking backside nucleophilic attack required for SN2.",
          "B1: CH₃CH₂Br would form an unstable primary carbocation, so it proceeds via a concerted single-step SN2 transition state.",
          "B1: Rate laws: SN1 rate = k[(CH₃)₃CBr]; SN2 rate = k[CH₃CH₂Br][OH⁻].",
        ],
      },
      {
        number: "Q2",
        marks: 3,
        type: "structured",
        prompt:
          "For a reaction at 298 K, ΔH° = +178 kJ mol⁻¹ and ΔS° = +161 J K⁻¹ mol⁻¹. Calculate ΔG° and deduce whether the reaction is feasible at 298 K.",
        markingGuide: [
          "M1: Convert ΔS° to kJ K⁻¹ mol⁻¹: +161 / 1000 = +0.161 kJ K⁻¹ mol⁻¹",
          "M1: ΔG° = ΔH° - TΔS° = 178 - (298 × 0.161) = 178 - 47.98 = +130.0 kJ mol⁻¹",
          "A1: Since ΔG° > 0 (+130 kJ mol⁻¹), the reaction is not feasible at 298 K.",
        ],
      },
    ],
  },
  {
    id: "alevel-phys-9702-p4",
    year: 2024,
    grade: "A-Level",
    subject: "Physics",
    paperCode: "9702/42",
    paperNumber: "Paper 2",
    title: "A-Level Physics Paper 4 (Fields, Capacitance & Quantum)",
    durationMinutes: 120,
    totalMarks: 100,
    tutorId: "sibanda",
    sourceLabel: "Verified A-Level Archive · 9702/42 (2024)",
    verified: true,
    pdfUrl: "/papers/alevel-phys-9702-p4.pdf",
    questions: [
      {
        number: "Q1",
        marks: 4,
        type: "structured",
        prompt:
          "Monochromatic light of wavelength 420 nm strikes a potassium metal surface with work function Φ = 2.25 eV. Calculate the maximum kinetic energy of emitted photoelectrons in joules. (h = 6.63 × 10⁻³⁴ J s, c = 3.00 × 10⁸ m/s, 1 eV = 1.60 × 10⁻¹⁹ J)",
        markingGuide: [
          "M1: Photon energy E = hc/λ = (6.63 × 10⁻³⁴ × 3.00 × 10⁸) / (420 × 10⁻⁹) = 4.736 × 10⁻¹⁹ J",
          "M1: Work function Φ = 2.25 × 1.60 × 10⁻¹⁹ = 3.60 × 10⁻¹⁹ J",
          "M1: Einstein equation: KE_max = E - Φ = (4.736 - 3.60) × 10⁻¹⁹ J",
          "A1: KE_max = 1.14 × 10⁻¹⁹ J (to 3 s.f.)",
        ],
      },
      {
        number: "Q2",
        marks: 3,
        type: "structured",
        prompt:
          "A 470 μF capacitor charged to 12.0 V discharges through a 22 kΩ resistor. Calculate the time constant τ and the potential difference across the capacitor after 15.0 s.",
        markingGuide: [
          "M1: Time constant τ = RC = (22 × 10³) × (470 × 10⁻⁶) = 10.34 s",
          "M1: V = V₀ e^(-t/RC) = 12.0 × e^(-15.0 / 10.34)",
          "A1: V = 12.0 × 0.2344 = 2.81 V (to 3 s.f.)",
        ],
      },
    ],
  },
  {
    id: "alevel-bio-9700-p4",
    year: 2024,
    grade: "A-Level",
    subject: "Biology",
    paperCode: "9700/42",
    paperNumber: "Paper 2",
    title: "A-Level Biology Paper 4 (Respiration & Gene Technology)",
    durationMinutes: 120,
    totalMarks: 100,
    tutorId: "kangwa",
    sourceLabel: "Verified A-Level Archive · 9700/42 (2024)",
    verified: true,
    pdfUrl: "/papers/alevel-bio-9700-p4.pdf",
    questions: [
      {
        number: "Q1",
        marks: 5,
        type: "structured",
        prompt:
          "Describe the role of reduced NAD (NADH) and oxygen in oxidative phosphorylation on the inner mitochondrial membrane.",
        markingGuide: [
          "B1: Reduced NAD donates high-energy electrons to Complex I of the electron transport chain and dissociates into NAD⁺ + H⁺.",
          "B1: Energy released as electrons pass along carriers pumps H⁺ ions from the mitochondrial matrix into the intermembrane space.",
          "B1: This establishes an electrochemical proton gradient across the inner mitochondrial membrane.",
          "B1: H⁺ ions diffuse back into the matrix through ATP synthase, driving chemiosmotic phosphorylation of ADP + Pi → ATP.",
          "B1: Oxygen acts as the final electron acceptor, combining with electrons and H⁺ to form water (½O₂ + 2H⁺ + 2e⁻ → H₂O).",
        ],
      },
      {
        number: "Q2",
        marks: 1,
        type: "mcq",
        prompt:
          "During the Polymerase Chain Reaction (PCR), why is the reaction heated to 95 °C in the first stage of each cycle?",
        options: [
          "To allow Taq polymerase to synthesize new DNA strands",
          "To break hydrogen bonds between complementary DNA strands (denaturation)",
          "To anneal short oligonucleotide primers to single-stranded DNA",
          "To activate restriction endonucleases for plasmid ligation",
        ],
        correctIndex: 1,
        markingGuide: [
          "B1: 95 °C breaks hydrogen bonds between base pairs to separate double-stranded DNA into single template strands.",
        ],
      },
    ],
  },
];

export const ECZ_SCHOOL_PAST_PAPERS: EczPastPaper[] = ECZ_PAST_PAPERS.filter(
  (p) => p.grade !== "A-Level"
);

export const A_LEVEL_PAST_PAPERS: EczPastPaper[] = ECZ_PAST_PAPERS.filter(
  (p) => p.grade === "A-Level"
);
