// Questions of the real past papers, WITHOUT answers or worked solutions.
// The hidden worked solutions live on the server (paper-data/paper-solutions.json) and are
// only used by the tutor to check the learner's thinking. Never import them in client code.
export interface PaperQuestionPart {
  label: string;
  question: string;
  marks: number;
}

export interface PaperQuestion {
  number: string;
  stem: string;
  /** Words describing a diagram or graph, because the picture itself is not in the app. */
  diagram: string;
  parts: PaperQuestionPart[];
  /** true when part of this question was hard to read in our copy of the paper. */
  caution: boolean;
}

export const REAL_PAPER_QUESTIONS: Record<string, PaperQuestion[]> = {
 "real-g12-math-2020-p1-gce": [
  {
   "number": "1",
   "stem": "",
   "diagram": "",
   "parts": [
    {
     "label": "",
     "question": "Simplify 2a + (b − a) − 2b",
     "marks": 2
    }
   ],
   "caution": false
  },
  {
   "number": "2",
   "stem": "",
   "diagram": "",
   "parts": [
    {
     "label": "",
     "question": "Evaluate (64/125)^(−1/3).",
     "marks": 2
    }
   ],
   "caution": true
  },
  {
   "number": "3",
   "stem": "",
   "diagram": "",
   "parts": [
    {
     "label": "",
     "question": "Given that the lines 3y = x + 6 and y = kx + 12 are perpendicular, find the value of k.",
     "marks": 2
    }
   ],
   "caution": false
  },
  {
   "number": "4",
   "stem": "",
   "diagram": "",
   "parts": [
    {
     "label": "",
     "question": "Factorise completely 6ax − 4ay − 3bx + 2by.",
     "marks": 0
    }
   ],
   "caution": false
  },
  {
   "number": "5",
   "stem": "",
   "diagram": "",
   "parts": [
    {
     "label": "",
     "question": "Given that A is the point (−2, ) and B is the point (1, 5), find |AB→|.",
     "marks": 2
    }
   ],
   "caution": true
  },
  {
   "number": "6",
   "stem": "",
   "diagram": "Venn-type diagram in a rectangle with three overlapping circles: P (top left), Q (top right) and a third circle R (labelled at lower right, below and overlapping both P and Q). The shaded (hatched) region is the lens where the lower circle R overlaps circle Q, lying outside circle P.",
   "parts": [
    {
     "label": "",
     "question": "Use set notation to describe the shaded region in the diagram below.",
     "marks": 2
    }
   ],
   "caution": true
  },
  {
   "number": "7",
   "stem": "Given that A = [[2,3],[1,0]], B = [[−1,0],[x,2]] and C = [[7,6],[−1,0]], find:",
   "diagram": "",
   "parts": [
    {
     "label": "(a)",
     "question": "Cᵀ",
     "marks": 1
    },
    {
     "label": "(b)",
     "question": "the value of x for which AB = C",
     "marks": 0
    }
   ],
   "caution": true
  },
  {
   "number": "8",
   "stem": "Given that the 11th term of an arithmetic progression is 43 and that the first term is 3, find the",
   "diagram": "",
   "parts": [
    {
     "label": "(a)",
     "question": "common difference,",
     "marks": 2
    },
    {
     "label": "(b)",
     "question": "4th term.",
     "marks": 1
    }
   ],
   "caution": false
  },
  {
   "number": "9",
   "stem": "",
   "diagram": "",
   "parts": [
    {
     "label": "(a)",
     "question": "A plane flying at a speed of 900 knots takes 5 hours to fly from town A to town B. Calculate the distance between the two towns.",
     "marks": 1
    },
    {
     "label": "(b)",
     "question": "Point Q on longitude 85°E lies on the equator and is due east of P. The time difference between P and Q is 5 hours. Calculate the longitude on which P lies.",
     "marks": 2
    }
   ],
   "caution": false
  },
  {
   "number": "10",
   "stem": "",
   "diagram": "",
   "parts": [
    {
     "label": "(a)",
     "question": "The probability of a girl not wearing a neck tie is 0.55. What is the probability that the same girl will wear a neck tie?",
     "marks": 1
    },
    {
     "label": "(b)",
     "question": "Given that 8^(x−1) = 16, find the value of x.",
     "marks": 2
    }
   ],
   "caution": true
  },
  {
   "number": "11",
   "stem": "",
   "diagram": "Part (b): a right square pyramid ABCDE drawn in perspective, apex E, square base ABCD with base length 6 cm; F is the midpoint of a base edge and EF (the slant height of a triangular face) = 5 cm.",
   "parts": [
    {
     "label": "(a)",
     "question": "Given that S = {x : 1 < x ≤ 15, x is a prime number}, list the elements of set S.",
     "marks": 1
    },
    {
     "label": "(b)",
     "question": "The diagram below shows a square pyramid ABCDE of base 6 cm and EF = 5 cm. Calculate the total surface area of the triangular faces of the pyramid.",
     "marks": 2
    }
   ],
   "caution": true
  },
  {
   "number": "12",
   "stem": "A function f is defined by f(x) = 2x − 5. Find",
   "diagram": "",
   "parts": [
    {
     "label": "(a)",
     "question": "f⁻¹(x),",
     "marks": 1
    },
    {
     "label": "(b)",
     "question": "ff⁻¹(2),",
     "marks": 1
    },
    {
     "label": "(c)",
     "question": "the value of x if ff(x) = x.",
     "marks": 2
    }
   ],
   "caution": false
  },
  {
   "number": "13",
   "stem": "",
   "diagram": "Part (a): x-y axes with two figures. Figure P is an arrow/kite-like pentagon above the x-axis, spanning roughly x = 1 to 5 and y from about 2.5 to 4.5, with a notch on its left side. Figure Q is the same shape and orientation lower down, sitting on and around the x-axis, spanning roughly x = 1 to 5 and y from about -1 to 1, with the same notch on its left. Axis numbers are very faint. Figure Q is labelled Q and P is labelled P.",
   "parts": [
    {
     "label": "(a)",
     "question": "The diagram below shows two figures P and Q on the XOY plane. Describe fully the single transformation that maps P onto Q.",
     "marks": 0
    },
    {
     "label": "(b)",
     "question": "Given that y = 2x³ , find dy/dx.",
     "marks": 0
    }
   ],
   "caution": true
  },
  {
   "number": "14",
   "stem": "The diagram below shows three points O, A and B in which OB = AB. Given that the bearing of A from O is 030° and angle ABO = 40°, calculate the bearing of",
   "diagram": "A vertical north line through O at the bottom left. Point A is above and to the right of O (bearing 030° marked at O against the north line). Point B is to the lower right of O and A, with OB = AB. Triangle OAB drawn with sides OA, AB, OB; angle ABO = 40° at B.",
   "parts": [
    {
     "label": "(a)",
     "question": "B from A,",
     "marks": 2
    },
    {
     "label": "(b)",
     "question": "O from B.",
     "marks": 1
    }
   ],
   "caution": false
  },
  {
   "number": "15",
   "stem": "The values of x and y are given to 1 decimal place as x = 4.2 and y = 7.3. Find the",
   "diagram": "",
   "parts": [
    {
     "label": "(a)",
     "question": "maximum value of x + y,",
     "marks": 2
    },
    {
     "label": "(b)",
     "question": "minimum value of x − y.",
     "marks": 2
    }
   ],
   "caution": false
  },
  {
   "number": "16",
   "stem": "It is given that y varies inversely as the square of x. The table below shows some values of x and corresponding values of y. Find the",
   "diagram": "Table with two rows: x = 2, b, 6 and y = 9, 4, a.",
   "parts": [
    {
     "label": "(a)",
     "question": "value of k, the constant of variation,",
     "marks": 1
    },
    {
     "label": "(b)",
     "question": "value of a,",
     "marks": 1
    },
    {
     "label": "(c)",
     "question": "values of b.",
     "marks": 2
    }
   ],
   "caution": false
  },
  {
   "number": "17",
   "stem": "In the diagram below, A, B, C and D lie on the circumference of the circle, centre O. Given that ∠BAD = 47° and ∠DBC = 28°, calculate",
   "diagram": "Circle with centre O. A is at the top, D at the left, C at the bottom, B at the bottom right, all on the circumference. Chords AD, AB, DB (through/near O region), DC, CB are drawn; angle at A (between AD and AB) is marked 47°, and angle DBC at B is marked 28°. ABCD is a cyclic quadrilateral.",
   "parts": [
    {
     "label": "(a)",
     "question": "∠BOD,",
     "marks": 1
    },
    {
     "label": "(b)",
     "question": "∠OBD,",
     "marks": 1
    },
    {
     "label": "(c)",
     "question": "∠BDC.",
     "marks": 2
    }
   ],
   "caution": true
  },
  {
   "number": "18",
   "stem": "",
   "diagram": "Part (a): right-angled triangle PQR with the right angle at R (bottom left), P directly above R, Q at the bottom right; hypotenuse PQ = 15 cm; angle at Q is marked x.",
   "parts": [
    {
     "label": "(a)",
     "question": "The diagram below shows a right angled triangle PQR. Given that PQ = 15 cm and cos x° = 2/3, calculate the length of QR.",
     "marks": 2
    },
    {
     "label": "(b)",
     "question": "A straight line L has equation 3y = 5x − 6 . Find the y-co-ordinate of the point where L cuts the y-axis.",
     "marks": 2
    }
   ],
   "caution": true
  },
  {
   "number": "19",
   "stem": "",
   "diagram": "Part (a): rectangle ABCD with A top left, B top right, C bottom right, D bottom left. AB = 10 cm along the top, AD = 4 cm on the left side. A vertical line EF divides it, with E on AB and F on DC, creating the smaller rectangle DAEF on the left (geometrically similar to ABCD).",
   "parts": [
    {
     "label": "(a)",
     "question": "Rectangle ABCD and DAEF are geometrically similar. Given that AB = 10 cm and AD = 4 cm, calculate the area of rectangle DAEF.",
     "marks": 2
    },
    {
     "label": "(b)",
     "question": "Mrs Kalomba bought 120 shares at a nominal value of K40.00 each which she later sold at K42.50 each. Find her profit.",
     "marks": 2
    }
   ],
   "caution": false
  },
  {
   "number": "20",
   "stem": "",
   "diagram": "Part (a): a hexagonal grid made of small equilateral triangles; a rhombus-like group of shaded triangles near the top centre and one shaded triangle just below to the right (given shaded triangles), to be completed with three more. Part (b): a flow chart with Start (rounded box), then an empty parallelogram, then an empty rectangle, then a parallelogram labelled Print I, then an arrow continuing downward (to Stop).",
   "parts": [
    {
     "label": "(a)",
     "question": "On the diagram in the answer space, shade three more triangles to make a pattern with rotational symmetry of order 3.",
     "marks": 2
    },
    {
     "label": "(b)",
     "question": "Simple interest is given by the formula I = PTR/100. Complete the flow chart in the answer space below for calculating simple interest.",
     "marks": 2
    }
   ],
   "caution": false
  },
  {
   "number": "21",
   "stem": "In the diagram below, point A is (1, 1), B is (0, 7), C is (14, 0), D is (7, 0) and E is (7, 1).",
   "diagram": "x-y axes with origin O. Points A(1,1), B(0,7) on the y-axis, C(14,0) on the x-axis, D(7,0) on the x-axis, E(7,1). Boundary lines drawn (with hatching on the excluded side): a horizontal line through A and E (y = 1); a vertical line through D and E (x = 7); a line from B to C sloping down to the right; and a line through B and A extended (sloping down to the right through (0,7) and (1,1), steeply). The unshaded region R is the enclosed region in the middle labelled R.",
   "parts": [
    {
     "label": "",
     "question": "Write down the four inequalities that define the unshaded region R.",
     "marks": 5
    }
   ],
   "caution": false
  },
  {
   "number": "22",
   "stem": "",
   "diagram": "Part (b): graph of a downward-opening parabola on x-y axes. It crosses the x-axis at A (left of the origin O) and B (right of O) and cuts/touches the y-axis above O; its maximum point (turning point) is labelled C, just to the right of the y-axis at the top.",
   "parts": [
    {
     "label": "(a)",
     "question": "Solve the equation x² − 7x = 8.",
     "marks": 2
    },
    {
     "label": "(b)(i)",
     "question": "The diagram below is the graph of y = −4(x − 1/2)² + 9 . Find the x-coordinates of A and B.",
     "marks": 2
    },
    {
     "label": "(b)(ii)",
     "question": "Find the coordinates of C.",
     "marks": 0
    }
   ],
   "caution": true
  },
  {
   "number": "23",
   "stem": "A sprinter runs a race of 200 m. Her total time for running the race is 25 seconds ending at U m/s. Below is a sketch of the motion of the sprinter.",
   "diagram": "Speed-time graph. Vertical axis: speed (m/s) with marked values 9 and U; horizontal axis: time (s) with marked values 0, 4, 20 and 25. The graph rises in a straight line from (0, 0) to (4, 9), stays level at 9 m/s from t = 4 to t = 20, then slopes down in a straight line from (20, 9) to (25, U). Dotted guide lines mark the values 9, U, 4, 20 and 25.",
   "parts": [
    {
     "label": "(a)",
     "question": "acceleration in the first 4 seconds,",
     "marks": 1
    },
    {
     "label": "(b)",
     "question": "distance covered in the first 20 seconds,",
     "marks": 2
    },
    {
     "label": "(c)",
     "question": "value of U.",
     "marks": 3
    }
   ],
   "caution": false
  }
 ],
 "real-g12-math-2020-p2": [
  {
   "number": "1",
   "stem": "",
   "diagram": "",
   "parts": [
    {
     "label": "(a)(i)",
     "question": "Given that matrix A = [[5,2],[2,x]], find the value of x for which A has no inverse.",
     "marks": 2
    },
    {
     "label": "(a)(ii)",
     "question": "Find the inverse of A if x = 1.",
     "marks": 2
    },
    {
     "label": "(b)(i)",
     "question": "A bag contains 7 red and 3 white identical balls. Two balls are taken from the bag at random one after the other without replacement. Draw a tree diagram to show all the possible outcomes.",
     "marks": 2
    },
    {
     "label": "(b)(ii)",
     "question": "Find the probability of taking at least one white ball.",
     "marks": 3
    }
   ],
   "caution": false
  },
  {
   "number": "2",
   "stem": "",
   "diagram": "Part (b): a triangle ABC with AVC a straight line (V lies on AC). M is on AB, the midpoint of AB (AM = MB, tick marks show equal halves), and AB is labelled 8p along the base. AC is labelled 4p + 9q. BV is drawn from B to V on AC and labelled −6p + kq. Segment AB is the base running left to right with A at left, M in the middle, B at right; C is at the top right above and between M and B; V lies on AC about one-third of the way up from A.",
   "parts": [
    {
     "label": "(a)(i)",
     "question": "Of the 115 students who attended an end of year party, 74 took fanta, 93 took sprite, 87 took coke, 61 took fanta and sprite, 71 took sprite and coke, 60 took fanta and coke and 50 took all the three drinks. Illustrate this information on a Venn diagram.",
     "marks": 2
    },
    {
     "label": "(a)(ii)(a)",
     "question": "How many students took none of the drinks?",
     "marks": 1
    },
    {
     "label": "(a)(ii)(b)",
     "question": "How many students took fanta and sprite but not coke?",
     "marks": 1
    },
    {
     "label": "(a)(ii)(c)",
     "question": "How many students took at least two different drinks?",
     "marks": 1
    },
    {
     "label": "(b)(i)(a)",
     "question": "In the diagram, AVC is a straight line, AB→ = 8p, AC→ = 4p + 9q, BV→ = −6p + kq and AM = MB. Express AM→ in terms of p, q and/or k.",
     "marks": 1
    },
    {
     "label": "(b)(i)(b)",
     "question": "Express AV→ in terms of p, q and/or k.",
     "marks": 1
    },
    {
     "label": "(b)(ii)",
     "question": "Given that AV→ = hAC→, by forming an equation involving p, q, h and k or otherwise, find the numerical values of h and k.",
     "marks": 3
    }
   ],
   "caution": false
  },
  {
   "number": "3",
   "stem": "",
   "diagram": "Part (b) is a flow chart (top to bottom): Start -> Enter ℓ (input box) -> decision 'Is ℓ < 0?'. If Yes -> output box 'Error: ℓ must be positive' which joins the line to Stop. If No -> Enter h (input box) -> decision 'Is h < 0?'. If Yes -> output box 'Error: h must be positive' which joins the line to Stop. If No -> process box 'Volume = 1/3 * ℓ^2 * h' -> output box 'Display volume' -> Stop. (The variable symbol in the scan looks like ℓ; it may be a lowercase l or r, flag (not clear in our copy).)",
   "parts": [
    {
     "label": "(a)",
     "question": "Solve the equation x² − x − 19 = 0, giving your answers correct to 2 decimal places.",
     "marks": 5
    },
    {
     "label": "(b)",
     "question": "Study the flow chart. Write a pseudo code corresponding to the flow chart programme above.",
     "marks": 5
    }
   ],
   "caution": true
  },
  {
   "number": "4",
   "stem": "",
   "diagram": "",
   "parts": [
    {
     "label": "(a)",
     "question": "Construct a quadrilateral PQRS in which PQ = 8cm, angle QPS = angle PQR = 120°, PS = 6cm and QR = 5cm.",
     "marks": 1
    },
    {
     "label": "(b)",
     "question": "Measure and write the length of RS.",
     "marks": 1
    },
    {
     "label": "(c)(i)",
     "question": "Within the quadrilateral PQRS, draw the locus of points which are 4.5cm from Q.",
     "marks": 1
    },
    {
     "label": "(c)(ii)",
     "question": "Within the quadrilateral PQRS, draw the locus of points which are equidistant from P and Q.",
     "marks": 1
    },
    {
     "label": "(c)(iii)",
     "question": "Within the quadrilateral PQRS, draw the locus of points which are equidistant from QR and RS.",
     "marks": 2
    },
    {
     "label": "(d)",
     "question": "A point T, within the quadrilateral PQRS, is such that it is less than or equal to 4.5cm from Q, nearer to Q than P and nearer to RS than QR. Indicate, by shading, the region in which T must lie.",
     "marks": 2
    }
   ],
   "caution": false
  },
  {
   "number": "5",
   "stem": "",
   "diagram": "",
   "parts": [
    {
     "label": "(a)",
     "question": "Simplify (2 − 18p²)/(3p + 1).",
     "marks": 2
    },
    {
     "label": "(b)(i)",
     "question": "The first three terms of a geometric progression are: m − 2, m + 1 and m + 7. Find the value of m.",
     "marks": 3
    },
    {
     "label": "(b)(ii)",
     "question": "Find the common ratio.",
     "marks": 2
    },
    {
     "label": "(b)(iii)",
     "question": "Find the sum of the first 6 terms.",
     "marks": 2
    }
   ],
   "caution": false
  },
  {
   "number": "6",
   "stem": "The figure below is a frustum of a cone. The base radius and top radius are 10cm and 5cm respectively, while the height is 12cm. (Take π as 3.142)",
   "diagram": "A frustum of a cone (a cone with its top cut off): wider circular base at the bottom with radius 10 cm, smaller circular top with radius 5 cm (both radii marked with dots/lines), and a vertical height of 12 cm marked on the left with arrows.",
   "parts": [
    {
     "label": "",
     "question": "Calculate its volume.",
     "marks": 6
    }
   ],
   "caution": false
  },
  {
   "number": "7",
   "stem": "The values of x and y are connected by the equation y = x³ + 4x² + x − 5 as shown in the table below. x: −4, −3, −2, −1, 0, 1, 2. y: −9, 1, 1, −3, −5, 1, p.",
   "diagram": "A table (not a graph): x values −4, −3, −2, −1, 0, 1, 2 with corresponding y values −9, 1, 1, −3, −5, 1, p. (The printed table shows y(−4) = −9, y(−3) = 1, y(−2) = 1, y(−1) = −3, y(0) = −5, y(1) = 1, y(2) = p.) Note: the solution's own plot list gives (2,21) for p.",
   "parts": [
    {
     "label": "(a)(i)",
     "question": "Calculate the value of p.",
     "marks": 1
    },
    {
     "label": "(a)(ii)",
     "question": "Using a scale of 2cm to represent 1 unit on the x-axis and 2cm to represent 5 units on the y-axis for −4 ≤ x ≤ 2 and −10 ≤ y ≤ 25, draw the graph of y = x³ + 4x² + x − 5.",
     "marks": 3
    },
    {
     "label": "(a)(iii)(a)",
     "question": "Use your graph to find the solutions of the equation x³ + 4x² + x − 5 = 0.",
     "marks": 2
    },
    {
     "label": "(a)(iii)(b)",
     "question": "Use your graph to find the solutions of the equation x³ + 4x² + x − 5 = 2x + 4.",
     "marks": 3
    },
    {
     "label": "(b)",
     "question": "Express 4/(2x − 1) − 1/(3x + 2) as a single fraction in its lowest terms.",
     "marks": 3
    }
   ],
   "caution": false
  },
  {
   "number": "8",
   "stem": "P, Q, R and T are points on the surface of the earth as shown in the diagram. (Take π as 3.142 and R = 3437nm)",
   "diagram": "A globe with N at the top and S at the bottom. P is on latitude 80°N on the meridian 41°E (right side). Q is on latitude 60°S on the meridian 41°E. R is on latitude 60°S on the meridian 21°W. T is on latitude 60°S on the meridian 71°W. Labels: 21°W and 71°W with arrows pointing to the left-hand meridians, 41°E with an arrow on the right, 80°N near P, 60°S near the lower points. R, T and Q are near the bottom of the globe, with T and R on the left side and Q to the right.",
   "parts": [
    {
     "label": "(a)(i)",
     "question": "Find the difference in longitude between points Q and R.",
     "marks": 2
    },
    {
     "label": "(a)(ii)(a)",
     "question": "Calculate the distance, in nautical miles, of PQ.",
     "marks": 2
    },
    {
     "label": "(a)(ii)(b)",
     "question": "Calculate the distance, in nautical miles, of RT.",
     "marks": 2
    },
    {
     "label": "(b)",
     "question": "A curve has gradient x² − 4x + 3. Find the equation of this curve if it passes through the point (3, −1).",
     "marks": 3
    },
    {
     "label": "(c)",
     "question": "Find the equation of the normal to the curve y = x³ − 2x² − 4x + 1 at the point (−1, 2).",
     "marks": 3
    }
   ],
   "caution": false
  },
  {
   "number": "9",
   "stem": "The table below shows the distribution of lengths of plots in a certain locality. Length of plot (m): 1≤x≤5, 6≤x≤10, 11≤x≤15, 16≤x≤20, 21≤x≤25, 26≤x≤30, 31≤x≤35. Frequency: 0, 2, 11, 44, 31, 8, 4.",
   "diagram": "",
   "parts": [
    {
     "label": "(a)",
     "question": "Calculate the standard deviation.",
     "marks": 6
    },
    {
     "label": "(b)(i)",
     "question": "Using the table above, copy and complete the cumulative frequency table below. Length of plot (m): ≤5, ≤10, ≤15, ≤20, ≤25, ≤30, ≤35. Frequency: 0, 2, 13, (blank), (blank), (blank), 100.",
     "marks": 1
    },
    {
     "label": "(b)(ii)",
     "question": "Using a scale of 2cm to represent 5 units on the horizontal axis and 2cm to represent 10 units on the vertical axis, draw a smooth cumulative frequency curve.",
     "marks": 3
    },
    {
     "label": "(b)(iii)",
     "question": "Showing your method clearly, use your graph to estimate the interquartile range.",
     "marks": 2
    }
   ],
   "caution": false
  },
  {
   "number": "10",
   "stem": "",
   "diagram": "Triangle ABC of three villages joined by straight roads: A at top left, B at top right, C at the bottom left (below A). AB = 10.2 km (top side), AC = 9.4 km (left side, from A down to C), BC = 15.6 km (long side from C up to B).",
   "parts": [
    {
     "label": "(a)(i)",
     "question": "Given that AB = 10.2km, BC = 15.6km and AC = 9.4km, calculate angle BAC to the nearest whole number.",
     "marks": 5
    },
    {
     "label": "(a)(ii)",
     "question": "Calculate the area of triangle ABC.",
     "marks": 2
    },
    {
     "label": "(a)(iii)",
     "question": "Calculate the shortest distance from A to BC.",
     "marks": 2
    },
    {
     "label": "(b)",
     "question": "Solve the equation 2cosθ = 1 for 0° ≤ θ ≤ 180°.",
     "marks": 1
    },
    {
     "label": "(c)",
     "question": "Simplify (3x²y)/(8xy³) ÷ (9x³)/(4y⁴).",
     "marks": 2
    }
   ],
   "caution": false
  },
  {
   "number": "11",
   "stem": "Study the diagram below to answer the questions that follow.",
   "diagram": "A grid (graph paper) with x and y axes showing four triangles. Object triangle ABC is in the upper part of the grid (A at the left top, B to its right at the same height, C below B, a right-angled triangle with the right angle at B). Triangle A₁B₁C₁ is a larger image to the left/below (A₁ at the far left near x ≈ −4, B₁ and C₁ further right/down on the left side of the grid), connected by lines to ABC for the enlargement. Triangle A₂B₂C₂ is a lower-right triangle (C₂ near (3,−4)? approx, with vertical side from C₂ down to B₂ around x ≈ 3) and A₂ lower left of it, near (2,−8). Another triangle A₃B₃C₃ lies in the middle of the grid, close to the x-axis between x ≈ 6 and x ≈ 9 (C₃ at left on the axis, B₃ on the axis, A₃ above). The solution reads the object as A(2,4), B(3,4), C(3,2). (not clear in our copy) exact grid coordinates of the image triangles from the scan; the printed solution's coordinates for A₁B₁C₁ do not match the plotted position. Triangle A₄B₄C₄ is not on the diagram.",
   "parts": [
    {
     "label": "(a)",
     "question": "Triangle ABC is mapped onto triangle A₁B₁C₁ by an enlargement. Find its centre and scale factor.",
     "marks": 2
    },
    {
     "label": "(b)(i)",
     "question": "Triangle ABC is mapped onto triangle A₂B₂C₂ by a single transformation. Find the matrix representing this transformation.",
     "marks": 2
    },
    {
     "label": "(b)(ii)",
     "question": "Find the area scale factor of the transformation.",
     "marks": 2
    },
    {
     "label": "(c)",
     "question": "Triangle ABC is mapped onto triangle A₃B₃C₃ by a single transformation. Describe fully this transformation.",
     "marks": 3
    },
    {
     "label": "(d)",
     "question": "The matrix [[1,3],[0,1]] maps triangle ABC onto triangle A₄B₄C₄ (not on the diagram). Find the coordinates of A₄, B₄ and C₄.",
     "marks": 3
    }
   ],
   "caution": true
  },
  {
   "number": "12",
   "stem": "Answer the whole of this question on a sheet of graph paper. A carpenter intends to manufacture at least 10 tables and at least 20 chairs. Each table requires 4 hours of assembling and 2 hours of varnishing. Each chair requires 3 hours of assembling and 1 hour of varnishing. There are 240 hours available for assembling and 100 hours for varnishing.",
   "diagram": "",
   "parts": [
    {
     "label": "(a)",
     "question": "Given that x represents the number of tables and y the number of chairs, write four inequalities which represent these conditions.",
     "marks": 4
    },
    {
     "label": "(b)",
     "question": "Using a scale of 2cm to represent 10 pieces of furniture on each axis, draw the x and y axes for 0 ≤ x ≤ 70 and 0 ≤ y ≤ 100 respectively and shade the unwanted region to show clearly the region where the solution of the inequalities lies.",
     "marks": 4
    },
    {
     "label": "(c)",
     "question": "Each table sold yields a profit of K300.00 while each chair sold yields a profit of K250.00. Find the best combination of the number of tables and chairs to gain the maximum profit.",
     "marks": 2
    },
    {
     "label": "(d)",
     "question": "Calculate this estimate of the maximum profit.",
     "marks": 2
    }
   ],
   "caution": false
  }
 ],
 "real-g12-math-2021-p2-internal": [
  {
   "number": "1",
   "stem": "",
   "diagram": "",
   "parts": [
    {
     "label": "(a)",
     "question": "Simplify (a − 12)/(a² − 144).",
     "marks": 2
    },
    {
     "label": "(b)(i)",
     "question": "A box contains 3 black and 2 white marbles of the same size. A marble is taken out at random from the box and not replaced. A second marble is then drawn. Calculate the probability that both marbles are white.",
     "marks": 2
    },
    {
     "label": "(b)(ii)",
     "question": "A box contains 3 black and 2 white marbles of the same size. A marble is taken out at random from the box and not replaced. A second marble is then drawn. Calculate the probability that both marbles are of different colours.",
     "marks": 3
    }
   ],
   "caution": false
  },
  {
   "number": "2",
   "stem": "(b) At a certain secondary school, all the learners in Grade twelve take at least one of the following optional subjects: French (F), Home Economics (HE) and Geography (G). 20 learners take French only, 25 learners take Home Economics only and 22 learners take Geography only. Furthermore, 9 learners take French and Geography, 12 learners take French and Home Economics, 15 learners take Geography and Home Economics and 4 learners take all the three subjects.",
   "diagram": "",
   "parts": [
    {
     "label": "(a)",
     "question": "Evaluate ∫ from −1 to 1 of (1 − 4x + 3x²) dx.",
     "marks": 3
    },
    {
     "label": "(b)(i)",
     "question": "Illustrate this information in a Venn diagram.",
     "marks": 2
    },
    {
     "label": "(b)(ii)(a)",
     "question": "How many Grade twelve learners are at this school?",
     "marks": 1
    },
    {
     "label": "(b)(ii)(b)",
     "question": "How many Grade twelve learners take Home Economics and Geography but not French?",
     "marks": 1
    },
    {
     "label": "(b)(ii)(c)",
     "question": "How many Grade twelve learners take two optional subjects only?",
     "marks": 1
    }
   ],
   "caution": false
  },
  {
   "number": "3",
   "stem": "",
   "diagram": "",
   "parts": [
    {
     "label": "(a)(i)",
     "question": "The second and the fifth terms of a geometric progression are 16 and 2 respectively. Find the common ratio and first term.",
     "marks": 3
    },
    {
     "label": "(a)(ii)",
     "question": "The second and the fifth terms of a geometric progression are 16 and 2 respectively. Find the 12th term.",
     "marks": 2
    },
    {
     "label": "(a)(iii)",
     "question": "The second and the fifth terms of a geometric progression are 16 and 2 respectively. Find the sum of the first 10 terms.",
     "marks": 2
    },
    {
     "label": "(b)",
     "question": "Express 5/(1 − x) − 3/(x − 2) as a single fraction in its lowest terms.",
     "marks": 3
    }
   ],
   "caution": false
  },
  {
   "number": "4",
   "stem": "",
   "diagram": "Triangle-like figure with vectors. O is at the left. A horizontal line from O to A is labelled 4a (OA→ = 4a). A line from O sloping down to the right passes through B (labelled 3b, i.e. OB→ = 3b) and continues on to D, so O, B, D are collinear. A is joined to B and to D. M is the midpoint of AB (marked with tick marks on AB). The text gives OB = 3BD.",
   "parts": [
    {
     "label": "(a)",
     "question": "Solve the equation 2x² − 13x + 14 = 0, giving your answers correct to 2 decimal places.",
     "marks": 5
    },
    {
     "label": "(b)(i)",
     "question": "In the diagram, OA→ = 4a, OB→ = 3b, M is the midpoint of AB and OB = 3BD. Express in terms of a and/or b: AB→.",
     "marks": 1
    },
    {
     "label": "(b)(ii)",
     "question": "Express in terms of a and/or b: OM→.",
     "marks": 1
    },
    {
     "label": "(b)(iii)",
     "question": "Express in terms of a and/or b: AD→.",
     "marks": 1
    },
    {
     "label": "(b)(iv)",
     "question": "Express in terms of a and/or b: MD→.",
     "marks": 2
    }
   ],
   "caution": false
  },
  {
   "number": "5",
   "stem": "",
   "diagram": "Flowchart for part (b), top to bottom: Start (oval) -> Enter x (parallelogram) -> decision diamond 'Is x < 0?'. From the diamond, 'Yes' goes right to a parallelogram 'Print error \"x must be positive\"', which then goes down to Stop. 'No' goes down to a rectangle 'r = R*cos x' -> parallelogram 'Display r' -> Stop (oval).",
   "parts": [
    {
     "label": "(a)(i)",
     "question": "Given that matrix P = [[1, 2],[2, −x]], find the value of x for which the determinant of P is −3.",
     "marks": 2
    },
    {
     "label": "(a)(ii)",
     "question": "Hence, find the inverse of P.",
     "marks": 2
    },
    {
     "label": "(b)",
     "question": "Study the flowchart below. Write a pseudocode corresponding to the flowchart programme.",
     "marks": 5
    }
   ],
   "caution": false
  },
  {
   "number": "6",
   "stem": "Answer the whole of this question on a sheet of plain paper.",
   "diagram": "",
   "parts": [
    {
     "label": "(a)(i)",
     "question": "Construct triangle ABC in which AB = 6cm, BC = 9cm and AC = 5cm.",
     "marks": 1
    },
    {
     "label": "(a)(ii)",
     "question": "Measure and write the size of angle ABC.",
     "marks": 1
    },
    {
     "label": "(b)(i)",
     "question": "Within the triangle ABC, draw the locus of points which are equidistant from A and C.",
     "marks": 1
    },
    {
     "label": "(b)(ii)",
     "question": "Within the triangle ABC, draw the locus of points which are 3cm from A.",
     "marks": 1
    },
    {
     "label": "(b)(iii)",
     "question": "Within the triangle ABC, draw the locus of points which are equidistant from AC and BC.",
     "marks": 2
    },
    {
     "label": "(c)",
     "question": "A point P, within triangle ABC, is such that it is less than or equal to 3cm from A, nearer to BC than AC and closer to A than to C. Indicate clearly by shading, the region in which P must lie.",
     "marks": 2
    }
   ],
   "caution": false
  },
  {
   "number": "7",
   "stem": "Section B (48 marks): answer any four questions, each carries 12 marks. Take π = 3.142 and R = 3 437 nm.",
   "diagram": "Part (a): sphere (earth) with N pole at top and S pole at bottom. Points P and Q lie on the circle of latitude 70°N (P on the left, Q on the right). Points T and R lie on the circle of latitude 40°S (T on the left, R on the right). The left meridian (through P and T) is labelled 60°W with an arrow; the right meridian (through Q and R) is labelled 55°E (the solution text refers to meridians 55°E and 60°W). Part (b): a cone drawn with its apex at the top; the shaded hatched part is the thickness of the cone (a shell). Inside, a dashed vertical line is the internal height h from apex to the base centre, with a right angle at the base centre, and r is the internal base radius. The internal volume is 34 650 cm³ and the internal base area is 3 850 cm².",
   "parts": [
    {
     "label": "(a)(i)",
     "question": "Determine the difference in longitudes between points Q and R.",
     "marks": 2
    },
    {
     "label": "(a)(ii)",
     "question": "Find the length of the circle of latitude 40°S in nautical miles.",
     "marks": 2
    },
    {
     "label": "(a)(iii)",
     "question": "Calculate the distance TR in nautical miles.",
     "marks": 2
    },
    {
     "label": "(b)(i)",
     "question": "The diagram shows a cone. The shaded part is the thickness of the cone. The internal volume is 34 650 cm³. The internal base area is 3 850 cm². [Take π = 3.142]. Calculate the internal height (h) and radius (r).",
     "marks": 4
    },
    {
     "label": "(b)(ii)",
     "question": "Given that the cone is 0.7cm thick, calculate the external volume of the cone.",
     "marks": 2
    }
   ],
   "caution": false
  },
  {
   "number": "8",
   "stem": "",
   "diagram": "",
   "parts": [
    {
     "label": "(a)(i)",
     "question": "A point C is mapped onto a point C′(−2, 3) by a single transformation whose matrix is [[1, −2],[0, 1]]. Find the coordinates of the point C.",
     "marks": 2
    },
    {
     "label": "(a)(ii)",
     "question": "Describe fully the transformation represented by the matrix [[1, −2],[0, 1]].",
     "marks": 3
    },
    {
     "label": "(b)(i)",
     "question": "Triangle PQR with vertices P(2, 2), Q(2, 0) and R(0, 1) is mapped onto triangle P′Q′R′ whose vertices are P′(−4, 2), Q′(−4, 0) and R′(0, 1). Find the matrix which represents this transformation.",
     "marks": 3
    },
    {
     "label": "(b)(ii)",
     "question": "Hence, describe fully the transformation.",
     "marks": 3
    },
    {
     "label": "(c)",
     "question": "F is a transformation represented by the matrix [[k, 0],[0, k]]. The images of A(2, 2) and B(−2, 4) under F are A′(5, 5) and B′(−5, 10) respectively. Find the value of k.",
     "marks": 1
    }
   ],
   "caution": false
  },
  {
   "number": "9",
   "stem": "Answer the whole of this question on a sheet of graph paper. A traditional drinks dealer stocks two brands of drinks, brand A and brand B, both of which are produced in bottles of the same size. He wishes to order fresh supplies and finds that he has room for up to 900 bottles. He knows that brand A is more popular and so decides to order at least twice as many bottles of brand A as brand B. He wishes, however, to have at least 100 bottles of brand B and not more than 700 bottles of brand A.",
   "diagram": "",
   "parts": [
    {
     "label": "(a)",
     "question": "Let x be the number of bottles of brand A and y the number of bottles of brand B. Write four inequalities to represent the information above.",
     "marks": 4
    },
    {
     "label": "(b)",
     "question": "Using a scale of 2cm to represent 100 bottles on each axis, draw x and y axes for 0 ≤ x ≤ 900 and 0 ≤ y ≤ 900 respectively and shade the unwanted region to indicate clearly the region where the solution of the inequalities lies.",
     "marks": 4
    },
    {
     "label": "(c)(i)",
     "question": "Given that the profit on a bottle of brand A is K3.00 and on a bottle of brand B is K2.00, find the number of bottles of each brand that gives maximum profit.",
     "marks": 2
    },
    {
     "label": "(c)(ii)",
     "question": "Given that the profit on a bottle of brand A is K3.00 and on a bottle of brand B is K2.00, find the maximum profit.",
     "marks": 2
    }
   ],
   "caution": false
  },
  {
   "number": "10",
   "stem": "The table below shows the heights of trees in a plantation. Height (cm) classes and frequencies: 0<x≤10: 30; 10<x≤20: 70; 20<x≤30: 200; 30<x≤40: 200; 40<x≤50: 160; 50<x≤60: 30; 60<x≤70: 10.",
   "diagram": "Part (b)(i) has a table to copy and complete. Header row Height (cm): ≤0, ≤10, ≤20, ≤30, ≤40, ≤50, ≤60, ≤70. Cumulative frequency row printed: 0, 30, 100, 300, 500, 660, 690, 700. Relative cumulative frequency row, partly filled in the question: 0.00, 0.04, 0.14, 0.43, then blanks, ending 1.00. Part (b)(ii) needs a graph with x-axis 0 to 70 (2cm per 10 units) and y-axis 0.00 to 1.00 (2cm per 0.1 units).",
   "parts": [
    {
     "label": "(a)",
     "question": "Calculate the standard deviation.",
     "marks": 6
    },
    {
     "label": "(b)(i)",
     "question": "Using the table above, copy and complete the relative cumulative frequency table below.",
     "marks": 1
    },
    {
     "label": "(b)(ii)",
     "question": "Using a scale of 2cm to represent 10 units on the x-axis for 0 ≤ x ≤ 70 and 2cm to represent 0.1 units on the y-axis for 0.00 ≤ y ≤ 1.00, draw a smooth relative cumulative frequency curve.",
     "marks": 3
    },
    {
     "label": "(b)(iii)",
     "question": "Showing your method clearly, use your graph to estimate the 80th percentile.",
     "marks": 2
    }
   ],
   "caution": false
  },
  {
   "number": "11",
   "stem": "",
   "diagram": "Part (a) is answered on graph paper. Table of values for y = x(x² − 4): x = −3, −2, −1, 0, 1, 2, 3 and y = −15, r, 3, 0, −3, 0, 15. Graph scale: 2cm to 1 unit on the x-axis for −3 ≤ x ≤ 3 and 2cm to 10 units on the y-axis for −20 ≤ y ≤ 20.",
   "parts": [
    {
     "label": "(a)(i)",
     "question": "The values of x and y are connected by the equation y = x(x² − 4). Some corresponding values are given in the table (x = −3, −2, −1, 0, 1, 2, 3; y = −15, r, 3, 0, −3, 0, 15). Calculate the value of r.",
     "marks": 1
    },
    {
     "label": "(a)(ii)",
     "question": "Using a scale of 2cm to represent 1 unit on the x-axis for −3 ≤ x ≤ 3 and 2cm to represent 10 units on the y-axis for −20 ≤ y ≤ 20, draw the graph of y = x(x² − 4).",
     "marks": 3
    },
    {
     "label": "(a)(iii)(a)",
     "question": "Use your graph to solve the equation x(x² − 4) = 0.",
     "marks": 2
    },
    {
     "label": "(a)(iii)(b)",
     "question": "Use your graph to solve the equation x(x² − 4) = 2.",
     "marks": 3
    },
    {
     "label": "(b)",
     "question": "Find the equation of the normal to the curve y = x² − x + 4 at the point (−1, 6).",
     "marks": 3
    }
   ],
   "caution": false
  },
  {
   "number": "12",
   "stem": "",
   "diagram": "Triangle ABC: A at bottom left, C at bottom right, B at the top (closer to the right). AB = 11.5 m (left slanted side), BC = 7.2 m (short right side), AC = 15.1 m (base).",
   "parts": [
    {
     "label": "(a)(i)",
     "question": "The diagram shows triangle ABC in which AB = 11.5m, BC = 7.2m and AC = 15.1m. Calculate angle ABC.",
     "marks": 5
    },
    {
     "label": "(a)(ii)",
     "question": "Calculate the area of triangle ABC.",
     "marks": 2
    },
    {
     "label": "(a)(iii)",
     "question": "Calculate the shortest distance from B to AC.",
     "marks": 2
    },
    {
     "label": "(b)",
     "question": "Solve the equation 15tanθ = 14 for 180° ≤ θ ≤ 270°.",
     "marks": 1
    },
    {
     "label": "(c)",
     "question": "Simplify (39x³)/(28y⁴) ÷ (65x⁵)/(56y⁵).",
     "marks": 2
    }
   ],
   "caution": false
  }
 ],
 "real-g12-math-2021-p2-gce": [
  {
   "number": "1",
   "stem": "",
   "diagram": "",
   "parts": [
    {
     "label": "(a)",
     "question": "Simplify (a²x² − b²y²)/(ax + by).",
     "marks": 2
    },
    {
     "label": "(b)(i)",
     "question": "Given the geometric progression 4, 2, 1, …, find the 7th term.",
     "marks": 2
    },
    {
     "label": "(b)(ii)",
     "question": "Given the geometric progression 4, 2, 1, …, find the sum of the first 9 terms.",
     "marks": 3
    },
    {
     "label": "(c)",
     "question": "Find the geometric mean of 196 and 15 625.",
     "marks": 2
    }
   ],
   "caution": false
  },
  {
   "number": "2",
   "stem": "",
   "diagram": "",
   "parts": [
    {
     "label": "(a)",
     "question": "Solve the equation 3x + 5/x = 12, giving your answers correct to 2 decimal places.",
     "marks": 5
    },
    {
     "label": "(b)(i)",
     "question": "A boy has a bag containing 5 green balls, 1 red ball and 4 blue balls. A ball is selected at random from the bag and not replaced. A second ball is then selected. Draw a tree diagram to show all the possible outcomes.",
     "marks": 2
    },
    {
     "label": "(b)(ii)",
     "question": "Find the probability that the two balls are of the same colour.",
     "marks": 3
    }
   ],
   "caution": false
  },
  {
   "number": "3",
   "stem": "Answer the whole of this question on a sheet of plain paper.",
   "diagram": "No picture is given; this is a construction question. Triangle EFG has sides EF = 11 cm, EG = 6.5 cm, GF = 10 cm. Loci are constructed inside the triangle.",
   "parts": [
    {
     "label": "(a)",
     "question": "Construct triangle EFG in which EF = 11 cm, EG = 6.5 cm and GF = 10 cm.",
     "marks": 1
    },
    {
     "label": "(b)",
     "question": "Measure and write the size of angle EGF.",
     "marks": 1
    },
    {
     "label": "(c)(i)",
     "question": "Within triangle EFG, construct the locus of points which are equidistant from EG and EF.",
     "marks": 2
    },
    {
     "label": "(c)(ii)",
     "question": "Within triangle EFG, construct the locus of points which are 2.5 cm from EF.",
     "marks": 1
    },
    {
     "label": "(c)(iii)",
     "question": "Within triangle EFG, construct the locus of points which are equidistant from E and F.",
     "marks": 1
    },
    {
     "label": "(d)",
     "question": "A point P, within triangle EFG is such that it is nearer to EF than to EG, nearer to E than to F and is greater than or equal to 2.5 cm away from EF. Indicate clearly by shading, the region in which P must lie.",
     "marks": 2
    }
   ],
   "caution": false
  },
  {
   "number": "4",
   "stem": "(a) In a group of 60 football fans, 37 support Team A, 28 support Team B and 29 support Team C. 2 support Team A and Team C only, 5 support Team B and Team C only, 7 support Team A and Team B only, 18 support Team A only and 10 support all the three teams.",
   "diagram": "",
   "parts": [
    {
     "label": "(a)(i)",
     "question": "Illustrate this information in a Venn diagram.",
     "marks": 2
    },
    {
     "label": "(a)(ii)(a)",
     "question": "Find n(B′).",
     "marks": 1
    },
    {
     "label": "(a)(ii)(b)",
     "question": "Find n(A∩B)′.",
     "marks": 1
    },
    {
     "label": "(a)(ii)(c)",
     "question": "Find n(A∪B)′.",
     "marks": 1
    },
    {
     "label": "(b)(i)",
     "question": "Given that the determinant of the matrix A = [[2x − 1, 1],[4, −2]] is −10, find the value of x.",
     "marks": 2
    },
    {
     "label": "(b)(ii)",
     "question": "Find the inverse of matrix A.",
     "marks": 2
    }
   ],
   "caution": false
  },
  {
   "number": "5",
   "stem": "",
   "diagram": "For part (b): a triangle diagram with vertices C (left), O (right) and B (top); A is on the line from B... specifically A lies on line CO between C and O near O, and B is above A. Lines drawn: OA = a (arrow pointing from O towards A, leftwards along CO), OB = b (arrow from O up-left to B). AB is a line from A up to B, with X marked as its midpoint (tick marks show equal halves). A line from C through X to O? The figure shows Y on CB with line YO passing through X. (not clear in our copy) exact lines through X and Y.",
   "parts": [
    {
     "label": "(a)",
     "question": "Find the equation of a tangent to the curve y = 5x³ − 7x² + 3x + 2 at the point (1, 3).",
     "marks": 3
    },
    {
     "label": "(b)(i)(a)",
     "question": "In the diagram, OA→ = a, OB→ = b and X is the midpoint of AB. Express BA→ in terms of a and/or b.",
     "marks": 1
    },
    {
     "label": "(b)(i)(b)",
     "question": "Express AX→ in terms of a and/or b.",
     "marks": 1
    },
    {
     "label": "(b)(i)(c)",
     "question": "Express OX→ in terms of a and/or b.",
     "marks": 2
    },
    {
     "label": "(b)(ii)",
     "question": "Given that OC→ = 3a, express BC→ in terms of a and b.",
     "marks": 1
    }
   ],
   "caution": true
  },
  {
   "number": "6",
   "stem": "",
   "diagram": "",
   "parts": [
    {
     "label": "(a)",
     "question": "Express 2/(2x − 1) − 3/(3x − 1) as a single fraction in its simplest form.",
     "marks": 3
    },
    {
     "label": "(b)",
     "question": "The programme below is given in form of a pseudocode. Start; Enter length; If length < 0 THEN Display error message 'length must be positive'; Else enter height; If height < 0 THEN Display error message 'height must be positive'; Else volume = 1/3 * length ^ 3 * height; End if; Display volume; Stop. Draw a corresponding flowchart for this pseudocode.",
     "marks": 5
    }
   ],
   "caution": false
  },
  {
   "number": "7",
   "stem": "",
   "diagram": "Triangle ABC with A at the top left, C at the bottom left and B at the far right. AB = 275 m (long upper side from A to B), AC = 45 m (short left side from A down to C), BC = 300 m (long bottom side from C to B).",
   "parts": [
    {
     "label": "(a)(i)",
     "question": "In triangle ABC, AB = 275 m, AC = 45 m and BC = 300 m. Calculate angle BAC.",
     "marks": 5
    },
    {
     "label": "(a)(ii)",
     "question": "Calculate the area of triangle ABC.",
     "marks": 2
    },
    {
     "label": "(a)(iii)",
     "question": "Calculate the shortest distance from A to BC.",
     "marks": 2
    },
    {
     "label": "(b)",
     "question": "Solve the equation cos θ = −0.5 for which 180° ≤ θ ≤ 360°.",
     "marks": 1
    },
    {
     "label": "(c)",
     "question": "Simplify (18a²b)/(16c³d²) ÷ (24a)/(15cb³) × (8c²d³)/(30a³b).",
     "marks": 2
    }
   ],
   "caution": false
  },
  {
   "number": "8",
   "stem": "",
   "diagram": "Part (a): graph of y = −(1/5)x(12 − x²) (a cubic) drawn on a squared grid, labelled with its equation. x-axis marked from about −4 to 4, y-axis marked at −2, 2, 4. The curve passes through the origin, rises to a maximum of about y = 3 near x = −2 (passing through roughly (−3, 1.8) and crossing the x-axis near x = −3.5), falls through the origin to a minimum of about y = −3 near x = 2, and rises again passing through about (3, −1.8) (a point is marked near x = 3, y = −1.8) and crossing the x-axis near x = 3.5. Parts of the lower graph and some grid values are partly obscured by a watermark: (not clear in our copy).",
   "parts": [
    {
     "label": "(a)(i)(a)",
     "question": "The following diagram shows the graph of y = −(1/5)x(12 − x²). Use the graph to solve the equation −(1/5)x(12 − x²) = 1.",
     "marks": 2
    },
    {
     "label": "(a)(i)(b)",
     "question": "Use the graph to solve the equation −(1/5)x(12 − x²) = −2.",
     "marks": 2
    },
    {
     "label": "(a)(ii)(a)",
     "question": "Calculate an estimate of the area bounded by the curve and the lines y = 0, x = −3 and x = −1.",
     "marks": 3
    },
    {
     "label": "(a)(ii)(b)",
     "question": "Calculate an estimate of the gradient of the curve at the point (3, −1.8).",
     "marks": 2
    },
    {
     "label": "(b)",
     "question": "Find the equation of the curve for which dy/dx = 2x − 3 where x = y = 3.",
     "marks": 3
    }
   ],
   "caution": true
  },
  {
   "number": "9",
   "stem": "The following table shows the results obtained by 60 learners in a mathematics test. Marks scored (class) / number of learners: 0<x≤10: 2; 10<x≤20: 6; 20<x≤30: 10; 30<x≤40: 15; 40<x≤50: 12; 50<x≤60: 8; 60<x≤70: 4; 70<x≤80: 3.",
   "diagram": "Part (b)(i) gives a cumulative frequency table to complete: Marks scored ≤0, ≤10, ≤20, ≤30, ≤40, ≤50, ≤60, ≤70, ≤80 with number of learners 0, 2, 8, 18, 33, 45 and blanks for ≤60, ≤70, ≤80. Part (b) is to be answered on graph paper.",
   "parts": [
    {
     "label": "(a)",
     "question": "Calculate the standard deviation.",
     "marks": 6
    },
    {
     "label": "(b)(i)",
     "question": "Using the table above, copy and complete the cumulative frequency table below.",
     "marks": 1
    },
    {
     "label": "(b)(ii)",
     "question": "Using a scale of 2cm to represent 10 units on both axes for 0 ≤ x ≤ 80 and 0 ≤ y ≤ 60, draw a smooth cumulative frequency curve.",
     "marks": 3
    },
    {
     "label": "(b)(iii)",
     "question": "Showing your method clearly, use your graph to estimate the interquartile range.",
     "marks": 2
    }
   ],
   "caution": false
  },
  {
   "number": "10",
   "stem": "Answer the whole of this question on a sheet of graph paper. A businessman orders two types of vehicles namely; sedans and vans for sale. He orders at least 60 sedans and at least 20 vans. He orders not more than 180 vehicles altogether. He makes sure that the number of vans ordered are not more than the number of sedans ordered.",
   "diagram": "",
   "parts": [
    {
     "label": "(a)",
     "question": "Given that x represents the number of sedans and y represents the number of vans, write four inequalities which satisfy the above conditions.",
     "marks": 4
    },
    {
     "label": "(b)",
     "question": "Using a scale of 2cm to represent 20 vehicles on each axis, draw x and y axes from 0 to 180 and shade the unwanted region to show clearly the region where the solution of the inequalities lies.",
     "marks": 4
    },
    {
     "label": "(c)",
     "question": "If the profit on the sale of a sedan is K10 000.00 and that on each van is K12 000.00, how many of each type should he order to make maximum profit?",
     "marks": 2
    },
    {
     "label": "(d)",
     "question": "Find this maximum profit.",
     "marks": 2
    }
   ],
   "caution": false
  },
  {
   "number": "11",
   "stem": "Answer the whole of this question on a sheet of graph paper. The vertices of triangle ABC are A(40, 30), B(40, 70) and C(70, 70) while that of triangle A₁B₁C₁ are A₁(20, 15), B₁(20, 35) and C₁(35, 35).",
   "diagram": "Graph-paper plotting question: scale 2 cm to 10 units on each axis for x and y from 0 to 70. Triangle ABC has vertices A(40,30), B(40,70), C(70,70) (right-angled at B); triangle A₁B₁C₁ has vertices A₁(20,15), B₁(20,35), C₁(35,35). No picture is supplied.",
   "parts": [
    {
     "label": "(a)",
     "question": "Using a scale of 2cm to represent 10 units on each axis for values of x and y from 0 to 70, draw and label triangles ABC and A₁B₁C₁.",
     "marks": 2
    },
    {
     "label": "(b)",
     "question": "Describe fully a single transformation that maps triangle ABC onto triangle A₁B₁C₁.",
     "marks": 3
    },
    {
     "label": "(c)",
     "question": "A rotation of 180° about (20, 40) maps triangle A₁B₁C₁ onto triangle A₂B₂C₂. Determine the coordinates of A₂, B₂ and C₂.",
     "marks": 3
    },
    {
     "label": "(d)(i)",
     "question": "Triangle A₁B₁C₁ is mapped onto triangle A₃B₃C₃ by a single transformation with vertices A₃(40, 15), B₃(40, 35) and C₃(70, 35). Draw and label triangle A₃B₃C₃.",
     "marks": 1
    },
    {
     "label": "(d)(ii)",
     "question": "Describe fully this transformation.",
     "marks": 3
    }
   ],
   "caution": false
  },
  {
   "number": "12",
   "stem": "",
   "diagram": "Part (a): a sphere (the earth) with N at the top and S at the bottom. Two circles of latitude are drawn: the upper one (52°N) passes through A (left) and B (right); the lower one is the equator passing through C (left) and D (right). The meridian circles pass through A and C (left) and through B and D (right). The Greenwich Meridian is labelled with an arrow and the 0° mark is on the right of the equator. At the centre, an angle of 52° is marked between the equator and the radius to B, and an angle of 85° is marked at the centre between the radii to C and D along the equator. Part (b): a frustum of a cone: top circle radius 1.5 cm, bottom circle radius 5 cm, vertical height 7 cm.",
   "parts": [
    {
     "label": "(a)(i)",
     "question": "The points A, B, C and D are on the surface of the earth as shown in the diagram. (Take π as 3.142, R = 6 370 km or 3 437 nm.) Determine the difference in longitude between points A and B.",
     "marks": 1
    },
    {
     "label": "(a)(ii)(a)",
     "question": "Calculate the distance between points C and D along the equator in nautical miles.",
     "marks": 2
    },
    {
     "label": "(a)(ii)(b)",
     "question": "Calculate the distance between points B and D along longitude NBDS in kilometres.",
     "marks": 3
    },
    {
     "label": "(b)",
     "question": "The following diagram shows a frustum of a cone. The radii of the circles at the top and bottom are 1.5cm and 5cm respectively. Its height is 7cm. Calculate the volume of the frustum. (Take π as 3.142)",
     "marks": 6
    }
   ],
   "caution": false
  }
 ]
};
