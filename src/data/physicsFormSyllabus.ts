import { SyllabusTopic } from './curriculum';

export type PhysicsOLevelForm = 'Form 1' | 'Form 2' | 'Form 3' | 'Form 4';

export interface PhysicsFormTopic extends Partial<SyllabusTopic> {
  id: string;
  form: PhysicsOLevelForm;
  unit: string;
  title: string;
  summary: string;
  keyPoints?: string[];
}

export const PHYSICS_FORM_1_TO_4_TOPICS: PhysicsFormTopic[] = [
  // ==================== FORM 1 ====================
  {
    id: 'phy-f1-1-1-1',
    form: 'Form 1',
    unit: '1.1 Introduction to Physics',
    title: '1.1.1 Safety Rules (Laboratory Safety)',
    summary: 'Practising lab safety rules, spotting hazards, using PPE, and basic emergency/first-aid care.',
    keyPoints: [
      'Follow safety rules and wear suitable protective gear in the lab',
      'Spot hazards early and know basic first-aid steps',
    ],
  },
  {
    id: 'phy-f1-1-1-2',
    form: 'Form 1',
    unit: '1.1 Introduction to Physics',
    title: '1.1.2 Waste Management',
    summary: 'Identifying and sorting Physics lab waste safely by state, properties, source, and material type.',
    keyPoints: [
      'Sort lab waste carefully into appropriate containers',
      'Apply safe disposal practices in school and at home',
    ],
  },
  {
    id: 'phy-f1-1-1-3',
    form: 'Form 1',
    unit: '1.1 Introduction to Physics',
    title: '1.1.3 Apparatus in Physics',
    summary: 'Identifying, handling, and improvising common Physics apparatus accurately.',
    keyPoints: [
      'Choose the right apparatus for the measurement or task',
      'Handle instruments carefully to get reliable readings',
    ],
  },
  {
    id: 'phy-f1-1-1-4',
    form: 'Form 1',
    unit: '1.1 Introduction to Physics',
    title: '1.1.4 Fundamental Concepts of Physics',
    summary: 'Exploring motion, forces, energy, momentum, work/efficiency, waves, and electricity/magnetism across branches of Physics.',
    keyPoints: [
      'Recognise main areas of Physics such as mechanics, thermodynamics, electricity & magnetism, optics/waves, and atomic/electronics',
      'Use scientific steps (observation, testing, data, conclusion) clearly',
    ],
  },
  {
    id: 'phy-f1-1-1-5',
    form: 'Form 1',
    unit: '1.1 Introduction to Physics',
    title: '1.1.5 Application of Physics',
    summary: 'Connecting Physics ideas to everyday life, engineering, medicine, agriculture, and technology.',
    keyPoints: [
      'Give real examples of Physics in everyday tasks and local industries',
      'Explain how physical principles solve practical problems',
    ],
  },
  {
    id: 'phy-f1-1-2-1',
    form: 'Form 1',
    unit: '1.2 General Physics',
    title: '1.2.1 Basic Principles of Scientific Investigations',
    summary: 'Designing experiments with careful observation, measurement, data analysis, and clear reporting.',
    keyPoints: [
      'Record readings objectively and check for obvious mistakes',
      'Write clear experimental steps, results, and conclusions',
    ],
  },
  {
    id: 'phy-f1-1-2-2',
    form: 'Form 1',
    unit: '1.2 General Physics',
    title: '1.2.2 Physical Quantities',
    summary: 'Distinguishing basic (fundamental) physical quantities from derived quantities and using SI units.',
    keyPoints: [
      'Know base quantities and SI units (length in m, mass in kg, time in s, current in A, temperature in K)',
      'Recognise derived quantities and include correct SI units in every final answer',
    ],
  },
  {
    id: 'phy-f1-1-2-3',
    form: 'Form 1',
    unit: '1.2 General Physics',
    title: '1.2.3 Precision and Accuracy',
    summary: 'SI prefixes, scientific notation, significant figures, unit conversion, length/area/volume/mass/density/time/weight measurements, and measurement errors.',
    keyPoints: [
      'Convert units and write answers to appropriate significant figures with units',
      'Use metre rules, vernier callipers, micrometer screw gauges, measuring cylinders, balances, and stopwatches properly',
    ],
  },
  {
    id: 'phy-f1-1-2-4',
    form: 'Form 1',
    unit: '1.2 General Physics',
    title: '1.2.4 Equilibrium',
    summary: 'Centre of mass, stable, unstable, and neutral equilibrium, and balance in bridges, vehicles, and everyday objects.',
    keyPoints: [
      'Lower centre of mass and widen the base to improve stability',
      'Distinguish stable, unstable, and neutral equilibrium clearly',
    ],
  },
  {
    id: 'phy-f1-1-3-1',
    form: 'Form 1',
    unit: '1.3 Elementary Astronomy',
    title: '1.3.1 The Universe',
    summary: 'Planets, solar system models/diagrams, eclipses, planetary motion, and telescopes/satellites/space tools.',
    keyPoints: [
      'Compare relative positions and sizes of bodies in the solar system',
      'Explain simple astronomical events and observation tools clearly',
    ],
  },
  {
    id: 'phy-f1-1-4-1',
    form: 'Form 1',
    unit: '1.4 Geophysics',
    title: '1.4.1 Structure and Composition of the Earth',
    summary: 'Layers of the Earth (crust, mantle, outer core, inner core), rocks, density, gravity, seismic waves, and magnetic/thermal features.',
    keyPoints: [
      'Name and order the Earth’s main layers from surface to centre',
      'Relate crust/mantle/core properties to rocks, density, and Earth’s magnetism',
    ],
  },
  {
    id: 'phy-f1-1-4-2',
    form: 'Form 1',
    unit: '1.4 Geophysics',
    title: '1.4.2 Structure and Composition of the Earth’s Atmosphere',
    summary: 'Atmospheric layers (troposphere, stratosphere, mesosphere, thermosphere, exosphere), humidity, and temperature/altitude changes.',
    keyPoints: [
      'Order the atmospheric layers and note key features of each',
      'Explain how temperature, humidity, and altitude relate in the atmosphere',
    ],
  },
  {
    id: 'phy-f1-1-5-1',
    form: 'Form 1',
    unit: '1.5 Mechanics 1',
    title: '1.5.1 Scalar and Vector Quantities',
    summary: 'Scalars (magnitude only) vs. vectors (magnitude and direction), vector diagrams, and finding resultant vectors.',
    keyPoints: [
      'Separate scalars (e.g., mass, speed, time, distance) from vectors (e.g., force, velocity, displacement, weight)',
      'Find resultants for collinear or perpendicular vectors clearly with direction',
    ],
  },
  {
    id: 'phy-f1-1-5-2',
    form: 'Form 1',
    unit: '1.5 Mechanics 1',
    title: '1.5.2 Linear Motion & Falling Bodies',
    summary: 'Distance, displacement, speed, velocity, acceleration, motion graphs, equations of uniform acceleration, stopping distance, and free fall.',
    keyPoints: [
      'Distinguish speed (scalar) from velocity (vector) and read gradient/area on motion graphs',
      'State given values, pick the right motion/free-fall formula, substitute carefully, and give units',
    ],
  },
  {
    id: 'phy-f1-1-5-3',
    form: 'Form 1',
    unit: '1.5 Mechanics 1',
    title: '1.5.3 Forces',
    summary: 'Effects of force, inertia, friction, F = ma, and Hooke’s law (extension proportional to stretching force within elastic limit).',
    keyPoints: [
      'Apply F = ma with mass in kg and acceleration in m/s^2',
      'State Hooke’s law accurately and note the limit of proportionality',
    ],
  },
  {
    id: 'phy-f1-1-5-4',
    form: 'Form 1',
    unit: '1.5 Mechanics 1',
    title: '1.5.4 Circular Motion',
    summary: 'Motion in a circle, centripetal force and acceleration (F = mv^2 / r), and real examples like orbits and banked roads.',
    keyPoints: [
      'Identify centripetal force as the inward force keeping an object moving in a circle',
      'Calculate centripetal force or acceleration using consistent SI units',
    ],
  },
  {
    id: 'phy-f1-1-5-5',
    form: 'Form 1',
    unit: '1.5 Mechanics 1',
    title: '1.5.5 Moment of a Force & 1.5.6 Equilibrium',
    summary: 'Turning effect of a force (M = Fd), principle of moments (clockwise moments = anticlockwise moments for equilibrium), levers, and balanced systems.',
    keyPoints: [
      'Use perpendicular distance d from the pivot when calculating moments',
      'Apply sum of clockwise moments = sum of anticlockwise moments in balance problems',
    ],
  },

  // ==================== FORM 2 ====================
  {
    id: 'phy-f2-2-1-1',
    form: 'Form 2',
    unit: '2.1 Mechanics 2',
    title: '2.1.1 Work, Energy, and Power',
    summary: 'Work done (W = Fs), gravitational potential energy (Ep = mgh), kinetic energy (Ek = 1/2 mv^2), conservation of energy, power, and efficiency.',
    keyPoints: [
      'Work done equals force times distance moved in the direction of the force (measured in joules, J)',
      'Calculate energy, power (W = J/s), and percentage efficiency cleanly',
    ],
  },
  {
    id: 'phy-f2-2-1-2',
    form: 'Form 2',
    unit: '2.1 Mechanics 2',
    title: '2.1.2 Linear Momentum',
    summary: 'Momentum (p = mv), conservation of momentum (m1u1 + m2u2 = m1v1 + m2v2), collisions, and road/vehicle safety.',
    keyPoints: [
      'Keep track of direction signs (+ and -) when adding momenta before and after a collision',
      'Explain how crumple zones, seatbelts, or airbags reduce impact force by increasing stopping time',
    ],
  },
  {
    id: 'phy-f2-2-1-3',
    form: 'Form 2',
    unit: '2.1 Mechanics 2',
    title: '2.1.3 Simple Machines',
    summary: 'Levers, pulleys, inclined planes/wedges, screws, wheel and axle, gears, Mechanical Advantage (MA), Velocity Ratio (VR), and efficiency.',
    keyPoints: [
      'Define MA = Load / Effort and VR = Effort distance / Load distance',
      'Calculate efficiency = (MA / VR) x 100% and explain why real machines are under 100% efficient',
    ],
  },
  {
    id: 'phy-f2-2-1-4',
    form: 'Form 2',
    unit: '2.1 Mechanics 2',
    title: '2.1.4 Pressure',
    summary: 'Solid pressure (P = F/A), fluid/liquid pressure (P = rho g h), Pascal’s principle, manometers/barometers, hydraulic systems, and upthrust/floatation.',
    keyPoints: [
      'Convert area to m^2 and depth to m before calculating pressure in pascals (Pa or N/m^2)',
      'Explain how hydraulic brakes/presses transmit pressure and how upthrust relates to floating/sinking',
    ],
  },
  {
    id: 'phy-f2-2-2-1',
    form: 'Form 2',
    unit: '2.2 Thermal Physics',
    title: '2.2.1 Simple Kinetic Theory of Matter',
    summary: 'Particle model of solids, liquids, and gases, Brownian motion, diffusion, evaporation, cooling by evaporation, and practical uses.',
    keyPoints: [
      'Explain Brownian motion and evaporation using particle movement and kinetic energy',
      'Explain why evaporation causes cooling when faster particles escape from a liquid surface',
    ],
  },
  {
    id: 'phy-f2-2-2-2',
    form: 'Form 2',
    unit: '2.2 Thermal Physics',
    title: '2.2.2 Measurement of Temperature',
    summary: 'Liquid-in-glass thermometers, thermocouples, infrared scanners, fixed/melting/boiling points, calibration, and Celsius/Kelvin conversion.',
    keyPoints: [
      'Convert temperatures accurately between degrees Celsius and kelvin (T(K) = theta(°C) + 273)',
      'Compare mercury, alcohol, thermocouple, and infrared thermometers for different uses',
    ],
  },
  {
    id: 'phy-f2-2-2-3',
    form: 'Form 2',
    unit: '2.2 Thermal Physics',
    title: '2.2.3 Expansion of Solids, Liquids and Gases & Gas Laws',
    summary: 'Thermal expansion of solids, liquids (including anomalous expansion of water near 0°C–4°C), and gases, plus Boyle’s, Charles’s, pressure, and ideal gas laws.',
    keyPoints: [
      'Use absolute temperature in kelvin (K) whenever applying gas law equations',
      'Explain everyday expansion gaps/strips and why water’s unusual expansion helps aquatic life in cold weather',
    ],
  },
  {
    id: 'phy-f2-2-2-4',
    form: 'Form 2',
    unit: '2.2 Thermal Physics',
    title: '2.2.4 The Internal Combustion Engine',
    summary: 'How a four-stroke engine works (intake, compression, power, exhaust), spark vs. compression ignition, petrol vs. diesel efficiency, and newer engine types.',
    keyPoints: [
      'State what happens to valves and piston in each of the four strokes',
      'Compare spark-ignition (petrol) and compression-ignition (diesel) engines clearly',
    ],
  },
  {
    id: 'phy-f2-2-2-5',
    form: 'Form 2',
    unit: '2.2 Thermal Physics',
    title: '2.2.5 Heat Transfer',
    summary: 'Conduction, convection, and radiation, good vs. bad conductors and absorbers/emitters, vacuum flasks, sea/land breezes, and greenhouse effects.',
    keyPoints: [
      'Explain conduction in solids, convection currents in fluids, and radiation (which needs no medium)',
      'Relate heat transfer to flasks, radiators, cooking pots, and insulation',
    ],
  },
  {
    id: 'phy-f2-2-2-6',
    form: 'Form 2',
    unit: '2.2 Thermal Physics',
    title: '2.2.6 Measurement of Heat',
    summary: 'Temperature vs. heat, heat capacity (c = H / delta T), specific heat capacity (c = H / (m delta T)), and latent heat of fusion and vaporisation.',
    keyPoints: [
      'No temperature rise happens during a change of state (melting or boiling) while latent heat is absorbed/released',
      'Calculate heat energy carefully using consistent mass, temperature change, and specific/latent heat values',
    ],
  },
  {
    id: 'phy-f2-2-3-1',
    form: 'Form 2',
    unit: '2.3 Wave Motion',
    title: '2.3.1 Longitudinal and Transverse Waves',
    summary: 'Amplitude, wavelength, period, frequency, wavefronts, wave speed (v = f lambda), and differences between transverse and longitudinal waves.',
    keyPoints: [
      'Transverse vibrations are perpendicular to wave travel; longitudinal compressions/rarefactions are parallel',
      'Use v = f lambda and T = 1/f with frequency in Hz, wavelength in m, and speed in m/s',
    ],
  },
  {
    id: 'phy-f2-2-3-2',
    form: 'Form 2',
    unit: '2.3 Wave Motion',
    title: '2.3.2 Electromagnetic Spectrum',
    summary: 'Order, shared properties, sources, detectors, uses, hazards, and safety precautions of electromagnetic waves.',
    keyPoints: [
      'All electromagnetic waves travel at the speed of light in a vacuum (about 3.0 x 10^8 m/s) and are transverse',
      'Match radio, microwave, infrared, visible, ultraviolet, X-rays, and gamma rays to uses and safety rules',
    ],
  },
  {
    id: 'phy-f2-2-4-1',
    form: 'Form 2',
    unit: '2.4 Sound',
    title: '2.4.1 Properties and Application of Sound',
    summary: 'Sound from vibrations, transmission in solids/liquids/gases, speed of sound and echo experiments, pitch/loudness/timbre, reflection/refraction/diffraction, ultrasound/sonar, and noise.',
    keyPoints: [
      'Sound needs a medium to travel (cannot travel in a vacuum) and usually travels fastest in solids and slowest in gases',
      'Remember to halve total echo time (d = v t / 2) when finding distance to a reflecting surface',
    ],
  },

  // ==================== FORM 3 ====================
  {
    id: 'phy-f3-3-1-1',
    form: 'Form 3',
    unit: '3.1 Light',
    title: '3.1.1 Rectilinear Propagation of Light',
    summary: 'Light travelling in straight lines, shadows, eclipses, pinhole cameras, and optical/laser applications.',
    keyPoints: [
      'Draw clear straight-line ray diagrams to explain shadows, eclipses, and pinhole camera images',
      'Describe how image size and brightness change with object distance and pinhole size',
    ],
  },
  {
    id: 'phy-f3-3-1-2',
    form: 'Form 3',
    unit: '3.1 Light',
    title: '3.1.2 Reflection of Light',
    summary: 'Laws of reflection (i = r), plane/concave/convex mirrors, mirror formula, magnification, angled mirrors, periscopes, and kaleidoscopes.',
    keyPoints: [
      'Measure angles of incidence and reflection from the normal to the mirror surface',
      'State image nature (real/virtual, upright/inverted, magnified/diminished) clearly in mirror problems',
    ],
  },
  {
    id: 'phy-f3-3-1-3',
    form: 'Form 3',
    unit: '3.1 Light',
    title: '3.1.3 Refraction of Light',
    summary: 'Bending of light between media, Snell’s law (n = sin i / sin r), real/apparent depth, prisms and dispersion, critical angle (sin C = 1/n), total internal reflection, and optical fibres.',
    keyPoints: [
      'Light bends toward the normal when slowing down in a denser medium and away from the normal when speeding up',
      'Total internal reflection occurs above the critical angle when light travels from a denser to a less dense medium',
    ],
  },
  {
    id: 'phy-f3-3-1-4',
    form: 'Form 3',
    unit: '3.1 Light',
    title: '3.1.4 Lenses',
    summary: 'Converging and diverging thin lenses, ray diagrams, lens formula, lens power (P = 1/f), magnification, vision correction, cameras, and optical instruments.',
    keyPoints: [
      'Use principal rays (parallel through focus, through optical centre, through focus out parallel) neatly in ray diagrams',
      'Keep consistent sign conventions when using the lens formula and magnification',
    ],
  },
  {
    id: 'phy-f3-3-2-1',
    form: 'Form 3',
    unit: '3.2 Static Electricity',
    title: '3.2.1 Introduction to Static Electricity & Lightning Protection',
    summary: 'Like charges repel and unlike charges attract, charging by friction/induction/conduction, electric field lines, lightning, earthing, and lightning arresters.',
    keyPoints: [
      'Explain charging by induction clearly without touching the charged rod to the conductor',
      'Explain why earthing and lightning arresters protect buildings and people from charge build-up',
    ],
  },
  {
    id: 'phy-f3-3-3-1',
    form: 'Form 3',
    unit: '3.3 Current Electricity',
    title: '3.3.1 Electric Charge, Current and Potential Difference',
    summary: 'Charge (Q = It), current, potential difference, electron flow vs. conventional current, series/parallel circuits, wire resistance factors, and resistivity.',
    keyPoints: [
      'Conventional current goes from positive to negative while electrons move from negative to positive',
      'Calculate total resistance accurately for series and parallel resistor networks',
    ],
  },
  {
    id: 'phy-f3-3-3-2',
    form: 'Form 3',
    unit: '3.3 Current Electricity',
    title: '3.3.2 Electric Cells',
    summary: 'Cells, batteries, capacitors, electromotive force (EMF), internal resistance (E = IR + Ir = V + Ir), charging/discharging, and safe battery disposal.',
    keyPoints: [
      'Distinguish EMF (total energy per unit charge supplied by the cell) from terminal potential difference',
      'Use E = I(R + r) step by step when solving internal resistance questions',
    ],
  },
  {
    id: 'phy-f3-3-3-3',
    form: 'Form 3',
    unit: '3.3 Current Electricity',
    title: '3.3.3 Ohm’s Law',
    summary: 'Relationship between voltage and current (V = IR), ohmic vs. non-ohmic conductors, and circuit applications.',
    keyPoints: [
      'State Ohm’s law condition (current is directly proportional to potential difference at constant temperature)',
      'Interpret V-I graphs for ohmic resistors and non-ohmic components like filament lamps',
    ],
  },
  {
    id: 'phy-f3-3-3-4',
    form: 'Form 3',
    unit: '3.3 Current Electricity',
    title: '3.3.4 Electric Energy and Power',
    summary: 'Electrical power (P = VI), electrical energy (E = VIt), energy-efficient appliances, and costing electricity in kilowatt-hours (kWh).',
    keyPoints: [
      'Convert power to kW and time to hours when calculating electrical units in kWh',
      'Show every step when finding current, power, energy (J or kWh), and cost',
    ],
  },
  {
    id: 'phy-f3-3-3-5',
    form: 'Form 3',
    unit: '3.3 Current Electricity',
    title: '3.3.5 Electric Safety',
    summary: 'Safe domestic wiring, fuses and circuit breakers, insulation and double insulation, earthing metal cases, and surge protectors.',
    keyPoints: [
      'Connect fuses and switches on the live wire so the appliance is isolated when tripped or switched off',
      'Explain how earthing plus a fuse protects against electric shock from a live fault on a metal casing',
    ],
  },
  {
    id: 'phy-f3-3-4-1',
    form: 'Form 3',
    unit: '3.4 Magnetism',
    title: '3.4.1 Phenomenon of Magnetism',
    summary: 'Magnetic poles and field lines, domain theory, induced magnetism in iron vs. steel, magnetising/demagnetising, magnetic keepers, and screening.',
    keyPoints: [
      'Steel stays magnetised longer (hard magnetic material); soft iron magnetises and demagnetises easily',
      'Draw magnetic field lines from north to south outside a magnet without crossing',
    ],
  },
  {
    id: 'phy-f3-3-5-1',
    form: 'Form 3',
    unit: '3.5 Electromagnetism',
    title: '3.5.1 Magnetic Effect of Electric Current',
    summary: 'Magnetic fields around wires, coils, and solenoids, right-hand grip/corkscrew rules, force on current in a magnetic field (Fleming’s left-hand rule), relays, bells, and DC motors.',
    keyPoints: [
      'Use Fleming’s left-hand rule (Thumb = Motion/Force, First finger = Field, seCond finger = Current) for motor effect',
      'Explain how a split-ring commutator keeps a simple DC motor rotating in one direction',
    ],
  },
  {
    id: 'phy-f3-3-6-1',
    form: 'Form 3',
    unit: '3.6 Electromagnetic Induction',
    title: '3.6.1 Introduction to Electromagnetic Induction',
    summary: 'Inducing EMF/current with changing magnetic fields, Faraday’s law, factors affecting induced current, and Lenz’s and Fleming’s right-hand rules.',
    keyPoints: [
      'Current is induced when a conductor cuts magnetic field lines or magnetic flux changes',
      'State how faster motion, stronger magnet, or more coil turns increases induced EMF',
    ],
  },
  {
    id: 'phy-f3-3-6-2',
    form: 'Form 3',
    unit: '3.6 Electromagnetic Induction',
    title: '3.6.2 The Simple AC and DC Generators',
    summary: 'How simple AC (slip rings) and DC (commutator) generators work, output graphs, and electromagnetic induction in electric vehicles.',
    keyPoints: [
      'Slip rings give alternating current (AC); a split-ring commutator gives unidirectional/DC output',
      'Sketch and label basic AC voltage/time output clearly',
    ],
  },
  {
    id: 'phy-f3-3-6-3',
    form: 'Form 3',
    unit: '3.6 Electromagnetic Induction',
    title: '3.6.3 Transformers',
    summary: 'Mutual induction, laminated soft-iron core transformers, turns/voltage relation (Vp/Vs = Np/Ns), ideal power (VpIp = VsIs), and transformer efficiency.',
    keyPoints: [
      'Transformers need changing (AC) current in the primary coil to induce voltage in the secondary coil',
      'Distinguish step-up (Ns > Np, Vs > Vp) from step-down (Ns < Np, Vs < Vp) and check efficiency',
    ],
  },
  {
    id: 'phy-f3-3-6-4',
    form: 'Form 3',
    unit: '3.6 Electromagnetic Induction',
    title: '3.6.4 Electrical Energy Transmission',
    summary: 'Transmitting electrical power over distances, role of high voltage and low current in cutting heat loss (P = I^2 R), and transmission line types.',
    keyPoints: [
      'Stepping up voltage lowers current for the same power, sharply reducing I^2 R heating losses in cables',
      'Explain why step-up and step-down transformers are used along power grids',
    ],
  },

  // ==================== FORM 4 ====================
  {
    id: 'phy-f4-4-1-1',
    form: 'Form 4',
    unit: '4.1 Basic Electronics',
    title: '4.1.1 Introduction to Basic Electronics',
    summary: 'Thermionic emission, cathode rays, electron beams in CRTs and X-rays, and cathode ray oscilloscope (CRO) voltage, period, and frequency.',
    keyPoints: [
      'Thermionic emission is the release of electrons from a heated cathode',
      'Read CRO time-base and voltage settings carefully to find period (T), frequency (f = 1/T), and peak voltage',
    ],
  },
  {
    id: 'phy-f4-4-1-2',
    form: 'Form 4',
    unit: '4.1 Basic Electronics',
    title: '4.1.2 Circuit Components',
    summary: 'Resistors, capacitors, thermistors, LDRs, diodes, transistors, relays/reed switches, inductors, ICs, resistor colour codes, potential dividers, and rectification.',
    keyPoints: [
      'A diode allows current easily in forward bias and blocks it in reverse bias (used in rectification)',
      'Explain how LDRs or thermistors change resistance with light or temperature in sensor circuits',
    ],
  },
  {
    id: 'phy-f4-4-1-3',
    form: 'Form 4',
    unit: '4.1 Basic Electronics',
    title: '4.1.3 Digital Electronic System',
    summary: 'Logic gates (AND, OR, NOT, NOR, NAND), truth tables, bipolar transistors as switches, and bistable/astable circuits on breadboards or PCBs.',
    keyPoints: [
      'Complete truth tables accurately for AND, OR, NOT, NAND, and NOR gates',
      'Explain how a small base current can switch a larger collector-emitter current in a transistor switch',
    ],
  },
  {
    id: 'phy-f4-4-1-4',
    form: 'Form 4',
    unit: '4.1 Basic Electronics',
    title: '4.1.4 Electronic Waste Management',
    summary: 'Environmental effects of e-waste and sustainable management through prevention, reduction, reuse, recycling, recovery, and safe disposal.',
    keyPoints: [
      'Identify toxic materials and environmental risks from dumping e-waste carelessly',
      'Apply reduce, reuse, recycle, and safe collection practices',
    ],
  },
  {
    id: 'phy-f4-4-2-1',
    form: 'Form 4',
    unit: '4.2 Communication System',
    title: '4.2.1 Communication System',
    summary: 'Analogue, digital, optical, and wireless systems, communication stages, modulation/demodulation, signal interference/attenuation, and real-world uses.',
    keyPoints: [
      'Trace signal flow from source/encoder through transmitter, channel, and receiver/decoder',
      'Compare analogue and digital signals and note factors that weaken or disturb signals',
    ],
  },
  {
    id: 'phy-f4-4-3-1',
    form: 'Form 4',
    unit: '4.3 Atomic Physics',
    title: '4.3.1 Nuclear Atom',
    summary: 'Protons, neutrons, and orbiting electrons, atomic number (Z) and mass number (A), nuclear forces, and nuclear stability.',
    keyPoints: [
      'Mass number (nucleon number) = protons + neutrons; atomic number (proton number) = protons',
      'Relate proton/neutron balance to why some nuclei are stable and others are unstable',
    ],
  },
  {
    id: 'phy-f4-4-3-2',
    form: 'Form 4',
    unit: '4.3 Atomic Physics',
    title: '4.3.2 Radioactivity, Applications & Nuclear Waste Management',
    summary: 'Alpha, beta, and gamma radiations, detectors (GM tube, etc.), background radiation, decay equations and half-life, fission/fusion, uses, hazards, and ZEMA/RPA/IAEA safety.',
    keyPoints: [
      'Compare alpha, beta, and gamma by nature, ionising power, penetrating power, and deflection in electric/magnetic fields',
      'Find remaining activity or half-life clearly and follow radiation safety and waste regulations',
    ],
  },
  {
    id: 'phy-f4-4-4-1',
    form: 'Form 4',
    unit: '4.4 Renewable Energy System',
    title: '4.4.1 Renewable Energy Systems',
    summary: 'Solar, wind, hydro, biomass, and geothermal energy, building/industry efficiency, sustainable development, and climate change mitigation.',
    keyPoints: [
      'Explain energy conversions in solar, hydro, wind, and biomass systems',
      'Evaluate advantages, limitations, and climate benefits of renewable energy in Zambia',
    ],
  },
];

export function normalizePhysicsForm(gradeOrForm?: string): PhysicsOLevelForm {
  const value = (gradeOrForm || '').trim().toLowerCase();
  if (value.includes('1') || value.includes('grade 8')) return 'Form 1';
  if (value.includes('2') || value.includes('grade 9')) return 'Form 2';
  if (value.includes('3') || value.includes('grade 10') || value.includes('grade 11')) {
    return 'Form 3';
  }
  return 'Form 4';
}

export function getPhysicsTopicsForLearner(gradeOrForm?: string): PhysicsFormTopic[] {
  const targetForm = normalizePhysicsForm(gradeOrForm);
  return PHYSICS_FORM_1_TO_4_TOPICS.filter((topic) => topic.form === targetForm);
}
