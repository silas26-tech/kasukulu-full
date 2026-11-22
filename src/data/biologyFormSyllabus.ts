import { SyllabusTopic } from './curriculum';

export type BiologyOLevelForm = 'Form 1' | 'Form 2' | 'Form 3' | 'Form 4';

export interface BiologyFormTopic extends Partial<SyllabusTopic> {
  id: string;
  form: BiologyOLevelForm;
  unit: string;
  title: string;
  summary: string;
  keyPoints?: string[];
}

export const BIOLOGY_FORM_1_TO_4_TOPICS: BiologyFormTopic[] = [
  // ==================== FORM 1 ====================
  {
    id: 'bio-f1-1-1-1',
    form: 'Form 1',
    unit: '1.1.0 Concepts and Methods in Biology',
    title: '1.1.1 Nature of Science Inquiry in Biology',
    summary: 'Using scientific inquiry steps (observation, problem, hypothesis, experiment, data, conclusion) to solve real problems.',
    keyPoints: [
      'Follow the stages of scientific inquiry clearly in order',
      'Test ideas through experiments and share clear conclusions',
    ],
  },
  {
    id: 'bio-f1-1-1-2',
    form: 'Form 1',
    unit: '1.1.0 Concepts and Methods in Biology',
    title: '1.1.2 Nature of Biology',
    summary: 'Exploring what Biology is and identifying branches like botany, zoology, entomology, genetics, and mycology.',
    keyPoints: [
      'Explain what the study of Biology covers',
      'Match branches of Biology to what they study (plants, animals, insects, heredity, fungi)',
    ],
  },
  {
    id: 'bio-f1-1-1-3',
    form: 'Form 1',
    unit: '1.1.0 Concepts and Methods in Biology',
    title: '1.1.3 Levels of Biological Organisation',
    summary: 'Arranging levels of life from simple to complex (atom, molecule, cell, tissue, organ, system, organism, population, community, ecosystem, biosphere).',
    keyPoints: [
      'Order levels from smallest/simplest (atom/molecule) up to largest (biosphere)',
      'Give clear examples of cell, tissue, organ, system, and organism',
    ],
  },
  {
    id: 'bio-f1-1-1-4',
    form: 'Form 1',
    unit: '1.1.0 Concepts and Methods in Biology',
    title: '1.1.4 Characteristics of Living Things & Life Processes',
    summary: 'Identifying characteristics of living things (feeding/nutrition, respiration, excretion, reproduction, sensitivity/irritability, movement/locomotion, growth) and catabolism vs. anabolism.',
    keyPoints: [
      'Distinguish living things from non-living things using life processes',
      'Separate building-up processes (anabolism) from breaking-down processes (catabolism)',
    ],
  },
  {
    id: 'bio-f1-1-2-1',
    form: 'Form 1',
    unit: '1.2.0 Principles of Cellular Life',
    title: '1.2.1 Microscopes',
    summary: 'Using simple and compound microscopes, knowing parts and functions, preparing slides, and calculating magnification.',
    keyPoints: [
      'Identify parts of a compound microscope (eyepiece, objective lenses, coarse/fine knobs, stage, diaphragm, light source)',
      'Calculate total magnification clearly (eyepiece magnification x objective magnification)',
    ],
  },
  {
    id: 'bio-f1-1-2-2',
    form: 'Form 1',
    unit: '1.2.0 Principles of Cellular Life',
    title: '1.2.2 Basic Cell Structure',
    summary: 'Examining basic cell structures, organelle functions, and differences between plant and animal cells.',
    keyPoints: [
      'State functions of key cell parts (nucleus, cytoplasm, cell membrane, cell wall, chloroplast, vacuole)',
      'Compare plant and animal cells clearly for exam marks',
    ],
  },
  {
    id: 'bio-f1-1-2-3',
    form: 'Form 1',
    unit: '1.2.0 Principles of Cellular Life',
    title: '1.2.3 Types of Cells (Eukaryotic and Prokaryotic)',
    summary: 'Distinguishing eukaryotic cells (plant, animal, fungi, amoeba) from prokaryotic cells (bacteria).',
    keyPoints: [
      'Compare cell features in eukaryotes and prokaryotes',
      'Give clear examples of each cell type',
    ],
  },
  {
    id: 'bio-f1-1-2-4',
    form: 'Form 1',
    unit: '1.2.0 Principles of Cellular Life',
    title: '1.2.4 Cell Specialisation',
    summary: 'Relating special shapes and features of specialised cells (nerve, blood, ciliated, muscle, sperm, root hair, palisade, guard, xylem, phloem) to their work.',
    keyPoints: [
      'Link each adaptive feature directly to its function',
      'Give clear plant and animal examples',
    ],
  },
  {
    id: 'bio-f1-1-3-1',
    form: 'Form 1',
    unit: '1.3.0 Maintenance of the Organism',
    title: '1.3.1 Nutrition in Man (Types of Food Nutrients)',
    summary: 'Classifying food nutrients (carbohydrates, proteins, lipids, vitamins, minerals, roughage, water), sources, and roles in the body.',
    keyPoints: [
      'Name local Zambian food sources for each nutrient group',
      'State roles in energy supply, growth, body repair, and protection',
    ],
  },
  {
    id: 'bio-f1-1-3-2',
    form: 'Form 1',
    unit: '1.3.0 Maintenance of the Organism',
    title: '1.3.2 Dietary Needs of Different Persons',
    summary: 'Planning healthy diets for infants, adolescents, manual workers, pregnant/lactating women, the sick, and the elderly.',
    keyPoints: [
      'Match nutrient needs to age, activity, pregnancy/lactation, or recovery',
      'Give a clear reason why a diet fits that person',
    ],
  },
  {
    id: 'bio-f1-1-3-3',
    form: 'Form 1',
    unit: '1.3.0 Maintenance of the Organism',
    title: '1.3.3 Plant Nutrients',
    summary: 'Grouping plant nutrients into macro-nutrients (N, P, K) and micro-nutrients and seeing how NPK supports plant growth.',
    keyPoints: [
      'Distinguish macro-nutrients from micro-nutrients',
      'Explain how nitrogen, phosphorus, and potassium help plants grow',
    ],
  },
  {
    id: 'bio-f1-1-3-4',
    form: 'Form 1',
    unit: '1.3.0 Maintenance of the Organism',
    title: '1.3.4 Nutritional Deficiency Diseases and Disorders',
    summary: 'Spotting and preventing deficiency diseases in humans (kwashiorkor, marasmus, rickets, beriberi, scurvy, pellagra, goitre, anaemia, obesity) and plants (chlorosis, poor roots, stunted growth).',
    keyPoints: [
      'Match each deficiency disease or sign to the missing nutrient',
      'Suggest foods or plant nutrients that help correct it',
    ],
  },
  {
    id: 'bio-f1-1-4-1',
    form: 'Form 1',
    unit: '1.4.0 Continuity of Life',
    title: '1.4.1 Reproduction in Living Organisms',
    summary: 'Exploring asexual and sexual reproduction using seeds, spores, and vegetative parts, and comparing the two.',
    keyPoints: [
      'Compare asexual reproduction (one parent, no fusion of gametes) with sexual reproduction',
      'Give examples from plants and other living organisms',
    ],
  },
  {
    id: 'bio-f1-1-4-2',
    form: 'Form 1',
    unit: '1.4.0 Continuity of Life',
    title: '1.4.2 Reproduction and Development in Human Beings',
    summary: 'Parts and functions of male and female reproductive systems, secondary sexual traits, and personal hygiene.',
    keyPoints: [
      'Identify main reproductive organs and their functions clearly',
      'Outline secondary sexual changes and good hygiene habits',
    ],
  },
  {
    id: 'bio-f1-1-4-3',
    form: 'Form 1',
    unit: '1.4.0 Continuity of Life',
    title: '1.4.3 Reproduction in Viruses, Protozoa, Bacteria and Fungi',
    summary: 'How viruses replicate in a host, protozoa and bacteria divide by binary fission, and fungi form spores (such as Rhizopus and Mucor).',
    keyPoints: [
      'Match each group to its reproduction method (host replication, binary fission, spores)',
      'Explain why understanding these microbes matters in everyday life',
    ],
  },
  {
    id: 'bio-f1-1-5-1',
    form: 'Form 1',
    unit: '1.5.0 Coordination and Response',
    title: '1.5.1 Coordination and Response in Plants (Tropisms)',
    summary: 'Exploring tropisms in plants (phototropism, geotropism, hydrotropism, chemotropism) and why they help plants survive.',
    keyPoints: [
      'Identify growth responses to light, gravity, water, and chemicals',
      'Explain how roots and shoots respond to help the plant',
    ],
  },
  {
    id: 'bio-f1-1-5-2',
    form: 'Form 1',
    unit: '1.5.0 Coordination and Response',
    title: '1.5.2 Coordination and Response in Animals (Taxic Responses)',
    summary: 'Investigating taxic responses in invertebrates (phototaxis, geotaxis, chemotaxis) and comparing tropisms with taxes.',
    keyPoints: [
      'Distinguish whole-organism movement (taxis) from plant growth movement (tropism)',
      'Give examples like insects, earthworms, or pests',
    ],
  },
  {
    id: 'bio-f1-1-6-1',
    form: 'Form 1',
    unit: '1.6.0 Ecological Relationships and Evolution',
    title: '1.6.1 Ecosystem',
    summary: 'Observing local terrestrial and aquatic ecosystems, recording features, and protecting local habitats.',
    keyPoints: [
      'Describe what makes up an ecosystem in local Zambian settings',
      'Suggest practical ways to protect and restore habitats',
    ],
  },
  {
    id: 'bio-f1-1-6-2',
    form: 'Form 1',
    unit: '1.6.0 Ecological Relationships and Evolution',
    title: '1.6.2 Biotic and Abiotic Interactions',
    summary: 'Distinguishing living (biotic) and non-living (abiotic) factors and how they interact in an ecosystem.',
    keyPoints: [
      'Separate biotic factors (organisms) from abiotic factors (water, light, soil, temperature)',
      'Explain how organisms and their physical surroundings affect each other',
    ],
  },
  {
    id: 'bio-f1-1-6-3',
    form: 'Form 1',
    unit: '1.6.0 Ecological Relationships and Evolution',
    title: '1.6.3 Waste Management',
    summary: 'Managing wet and dry waste in schools and communities using the 3Rs, safe disposal, and clean-zone projects.',
    keyPoints: [
      'Sort wet and dry waste and identify common sources',
      'Apply reduce, reuse, recycle (3Rs) and proper waste disposal',
    ],
  },
  {
    id: 'bio-f1-1-6-4',
    form: 'Form 1',
    unit: '1.6.0 Ecological Relationships and Evolution',
    title: '1.6.4 The Soil – Composition and Fertility',
    summary: 'Soil components, clay vs. sandy vs. loamy soil properties, causes of fertility loss, and improving soil fertility.',
    keyPoints: [
      'Compare sandy, clay, and loam soils on drainage, air, and water holding',
      'State ways to keep or restore soil fertility for crops',
    ],
  },

  // ==================== FORM 2 ====================
  {
    id: 'bio-f2-2-1-1',
    form: 'Form 2',
    unit: '2.1.0 Concepts and Methods in Biology',
    title: '2.1.1 Experimental Design',
    summary: 'Planning fair investigations with sampling methods and independent, dependent, and control variables.',
    keyPoints: [
      'Identify independent (changed), dependent (measured), and control (kept same) variables',
      'Explain why a control group or fair test is needed',
    ],
  },
  {
    id: 'bio-f2-2-1-2',
    form: 'Form 2',
    unit: '2.1.0 Concepts and Methods in Biology',
    title: '2.1.2 Limits of Science',
    summary: 'Understanding what science can and cannot answer (laws, tools, language, changing/complex systems).',
    keyPoints: [
      'Recognise practical limits of tools, measurements, and scientific laws',
      'Explain why science tests evidence rather than settling every belief',
    ],
  },
  {
    id: 'bio-f2-2-1-3',
    form: 'Form 2',
    unit: '2.1.0 Concepts and Methods in Biology',
    title: '2.1.3 Scientific Ethics',
    summary: 'Applying honesty, consent, confidentiality, and fairness in scientific investigations.',
    keyPoints: [
      'Record data honestly without changing results',
      'Respect consent, privacy, safety, and no unfair treatment',
    ],
  },
  {
    id: 'bio-f2-2-2-1',
    form: 'Form 2',
    unit: '2.2.0 Principles of Cellular Life',
    title: '2.2.1 Micrographs',
    summary: 'Reading and interpreting micrographs of plant (palisade, spongy, epidermal) and animal (blood, muscle, nerve) tissues.',
    keyPoints: [
      'Spot key cell shapes and tissue features in micrographs',
      'Link visible structures to their roles clearly',
    ],
  },
  {
    id: 'bio-f2-2-2-2',
    form: 'Form 2',
    unit: '2.2.0 Principles of Cellular Life',
    title: '2.2.2 Staining Specimen and Preparation of Permanent Slides',
    summary: 'Using stains to make cell parts clear and preparing plant tissue slides safely.',
    keyPoints: [
      'Explain why stains help show cell structures under a microscope',
      'Follow clean slide-making steps without trapping air bubbles',
    ],
  },
  {
    id: 'bio-f2-2-2-3',
    form: 'Form 2',
    unit: '2.2.0 Principles of Cellular Life',
    title: '2.2.3 Detailed Cell Structure',
    summary: 'Drawing detailed cells and linking cell organelles to how a cell works.',
    keyPoints: [
      'Use neat, clear lines (no sketchy shading) when drawing biological diagrams',
      'Relate organelle structure to its job in the cell',
    ],
  },
  {
    id: 'bio-f2-2-2-4',
    form: 'Form 2',
    unit: '2.2.0 Principles of Cellular Life',
    title: '2.2.4 Properties of Water',
    summary: 'How water’s properties (solvent action, neutral pH, temperature stability, density changes, surface tension) support life.',
    keyPoints: [
      'Explain why water is vital as a solvent and medium for life reactions',
      'Link physical properties of water to survival in cells and habitats',
    ],
  },
  {
    id: 'bio-f2-2-3-1',
    form: 'Form 2',
    unit: '2.3.0 Maintenance of the Organism',
    title: '2.3.1 Nutrition – Types of Nutrition',
    summary: 'Distinguishing autotrophic nutrition from heterotrophic nutrition (parasitism, saprophytic, holozoic).',
    keyPoints: [
      'Autotrophs make their own food; heterotrophs get food from other organisms',
      'Give clear examples of parasitic, saprophytic, and holozoic feeders',
    ],
  },
  {
    id: 'bio-f2-2-3-2',
    form: 'Form 2',
    unit: '2.3.0 Maintenance of the Organism',
    title: '2.3.2 Autotrophic Nutrition (Photosynthesis)',
    summary: 'Leaf structure, photosynthesis, starch/sugar/protein/lipid storage, limiting factors, crop yield, and ecological importance.',
    keyPoints: [
      'State word and chemical equations for photosynthesis clearly',
      'Explain how light, carbon dioxide, and chlorophyll affect photosynthesis and crop yield',
    ],
  },
  {
    id: 'bio-f2-2-3-3',
    form: 'Form 2',
    unit: '2.3.0 Maintenance of the Organism',
    title: '2.3.3 Heterotrophic Nutrition',
    summary: 'Parasitic, saprophytic, and holozoic nutrition and why decomposers/microbes matter in nature and industry.',
    keyPoints: [
      'Give clear examples such as ticks (parasitic), bread mould (saprophytic), and humans (holozoic)',
      'Explain roles in recycling nutrients, food/brewing, and disease control',
    ],
  },
  {
    id: 'bio-f2-2-3-4',
    form: 'Form 2',
    unit: '2.3.0 Maintenance of the Organism',
    title: '2.3.4 Transport in Plants & Transpiration',
    summary: 'Monocot vs. dicot roots/stems, xylem and phloem transport, transpiration, factors affecting water loss, and leaf adaptations.',
    keyPoints: [
      'Xylem moves water and mineral salts up; phloem translocates food',
      'Explain how temperature, wind, light, and humidity affect transpiration and water-saving adaptations',
    ],
  },
  {
    id: 'bio-f2-2-4-1',
    form: 'Form 2',
    unit: '2.4.0 Continuity of Life',
    title: '2.4.1 Reproduction in Plants, Pollination & Seed Dispersal',
    summary: 'Asexual plant propagation, flower parts, self vs. cross pollination, wind vs. insect pollination, fertilisation, and seed/fruit dispersal.',
    keyPoints: [
      'Compare asexual propagation pros and cons clearly',
      'Match flower features to wind or insect pollination and fruit/seed traits to dispersal methods',
    ],
  },
  {
    id: 'bio-f2-2-4-2',
    form: 'Form 2',
    unit: '2.4.0 Continuity of Life',
    title: '2.4.2 Germination, Growth and Development in Plants',
    summary: 'Conditions needed for germination (water, oxygen, suitable warmth), epigeal vs. hypogeal germination, and growth regions.',
    keyPoints: [
      'State the three conditions needed for seed germination',
      'Distinguish epigeal vs. hypogeal germination and growth zones',
    ],
  },
  {
    id: 'bio-f2-2-5-1',
    form: 'Form 2',
    unit: '2.5.0 Coordination and Response',
    title: '2.5.1 Role of Plant Hormones on Response',
    summary: 'How auxins control shoot and root responses to light (phototropism) and gravity (geotropism).',
    keyPoints: [
      'Explain how uneven auxin distribution causes bending in shoots and roots',
      'Note that high auxin helps shoot cell elongation but can slow root cell elongation',
    ],
  },
  {
    id: 'bio-f2-2-5-2',
    form: 'Form 2',
    unit: '2.5.0 Coordination and Response',
    title: '2.5.2 Health and Disease (Infectious & Non-Infectious)',
    summary: 'Infectious diseases (TB, cholera, COVID-19, influenza, HIV/AIDS, STIs), non-infectious/parasitic conditions (malaria, bilharzia, sickle cell, diabetes, hypertension), and mosquito/housefly control.',
    keyPoints: [
      'Know pathogen/cause, spread, symptoms, and prevention clearly',
      'Link mosquito and housefly life cycles to disease control in homes and communities',
    ],
  },
  {
    id: 'bio-f2-2-6-1',
    form: 'Form 2',
    unit: '2.6.0 Ecological Relationships and Evolution',
    title: '2.6.1 Classification of Organisms',
    summary: 'Grouping living organisms into kingdoms and understanding why classification is useful.',
    keyPoints: [
      'Identify major kingdoms and key traits of each group',
      'Explain how classification helps scientists and learners study organisms',
    ],
  },
  {
    id: 'bio-f2-2-6-2',
    form: 'Form 2',
    unit: '2.6.0 Ecological Relationships and Evolution',
    title: '2.6.2 Feeding Relationships and Energy Flow',
    summary: 'Food chains, food webs, energy flow from the sun, and what happens when populations change.',
    keyPoints: [
      'Show energy flow direction with arrows in food chains and food webs',
      'Predict how removing or changing one organism affects others in the web',
    ],
  },
  {
    id: 'bio-f2-2-6-3',
    form: 'Form 2',
    unit: '2.6.0 Ecological Relationships and Evolution',
    title: '2.6.3 Pollution',
    summary: 'Air, water, and land pollution, effects like global warming, acid rain, and eutrophication, and ways to reduce pollution.',
    keyPoints: [
      'Link specific pollutants to their harm on health, water, soil, and climate',
      'Give practical steps to reduce pollution',
    ],
  },

  // ==================== FORM 3 ====================
  {
    id: 'bio-f3-3-1-1',
    form: 'Form 3',
    unit: '3.1.0 Concepts and Methods in Biology',
    title: '3.1.1 Chemicals of Life & Reagent Preparation',
    summary: 'Carbohydrates, proteins, lipids, and nucleic acids, monomers/hydrolysis/dehydration, and preparing Benedict’s, iodine, and Biuret reagents.',
    keyPoints: [
      'Identify building blocks and main roles of carbohydrates, lipids, and proteins',
      'Know the reagents used in food testing accurately',
    ],
  },
  {
    id: 'bio-f3-3-1-2',
    form: 'Form 3',
    unit: '3.1.0 Concepts and Methods in Biology',
    title: '3.1.2 Food Confirmatory Tests',
    summary: 'Testing food samples for reducing sugars, non-reducing sugars, starch, proteins, and lipids.',
    keyPoints: [
      'State reagent/test, heating or procedure, and positive colour/result for each nutrient',
      'Watch safety steps when heating food test solutions',
    ],
  },
  {
    id: 'bio-f3-3-1-3',
    form: 'Form 3',
    unit: '3.1.0 Concepts and Methods in Biology',
    title: '3.1.3 Research Proposal',
    summary: 'Planning a clear biology research proposal (title, background, problem, aim, objectives, questions/hypothesis, method, budget, timeline).',
    keyPoints: [
      'State a clear, testable problem, aim, and method',
      'Organise proposal sections logically',
    ],
  },
  {
    id: 'bio-f3-3-2-1',
    form: 'Form 3',
    unit: '3.2.0 Principles of Cellular Life',
    title: '3.2.1 Movement of Substances Across the Cell Membrane',
    summary: 'Diffusion, osmosis, and active transport, factors affecting them, and effects on plant/animal cells (turgidity, plasmolysis, crenation, lysis).',
    keyPoints: [
      'Compare diffusion and osmosis (passive) with active transport (uses energy against concentration gradient)',
      'Explain what happens to plant and red blood cells in dilute vs. concentrated solutions',
    ],
  },
  {
    id: 'bio-f3-3-2-2',
    form: 'Form 3',
    unit: '3.2.0 Principles of Cellular Life',
    title: '3.2.2 Energy and Metabolism',
    summary: 'Anabolic (building up) and catabolic (breaking down) reactions in living cells.',
    keyPoints: [
      'Distinguish anabolism (e.g., photosynthesis, protein synthesis) from catabolism (e.g., respiration)',
      'Explain how cells use and transfer energy',
    ],
  },
  {
    id: 'bio-f3-3-2-3',
    form: 'Form 3',
    unit: '3.2.0 Principles of Cellular Life',
    title: '3.2.3 Enzymes and Their Actions',
    summary: 'Enzyme properties, substrate specificity, temperature/pH effects, and everyday uses (baking, brewing, detergents, etc.).',
    keyPoints: [
      'Explain how high heat or extreme pH changes enzyme shape/activity (denaturation)',
      'Use clear scientific wording for enzyme action and practical uses',
    ],
  },
  {
    id: 'bio-f3-3-3-1',
    form: 'Form 3',
    unit: '3.3.0 Maintenance of the Organism',
    title: '3.3.1 Nutrition: Dentition in Mammals',
    summary: 'Types and functions of teeth, tooth structure, carnivore/herbivore/omnivore dentition and dental formulae, and dental care.',
    keyPoints: [
      'Relate tooth shapes (incisors, canines, premolars, molars) to diet',
      'Explain causes and prevention of tooth decay and gum disease',
    ],
  },
  {
    id: 'bio-f3-3-3-2',
    form: 'Form 3',
    unit: '3.3.0 Maintenance of the Organism',
    title: '3.3.2 Holozoic Nutrition',
    summary: 'Ingestion, digestion, absorption, assimilation, and egestion in humans, alimentary canal, small intestine adaptations, liver roles, and digestive/liver disorders.',
    keyPoints: [
      'Follow digestion and absorption of carbohydrates, proteins, and lipids clearly',
      'State key functions of the liver (bile, blood sugar control, deamination, detoxification, glycogen storage)',
    ],
  },
  {
    id: 'bio-f3-3-3-3',
    form: 'Form 3',
    unit: '3.3.0 Maintenance of the Organism',
    title: '3.3.3 Transport in Animals (Blood, ABO Groups, Heart, Circulation & Lymph)',
    summary: 'Blood components and clotting, ABO and Rhesus blood groups/transfusion, heart structure and cardiac cycle, double vs. single circulation, blood vessels, and lymphatic system.',
    keyPoints: [
      'Distinguish arteries, veins, and capillaries by wall thickness, lumen, valves, and blood flow',
      'Trace double circulation and explain blood group compatibility and clotting',
    ],
  },
  {
    id: 'bio-f3-3-3-4',
    form: 'Form 3',
    unit: '3.3.0 Maintenance of the Organism',
    title: '3.3.4 Gaseous Exchange and Respiration',
    summary: 'Breathing/gas exchange in insects, fish, and humans, inspired vs. expired air, air pollutants, plant gas exchange, and aerobic vs. anaerobic respiration.',
    keyPoints: [
      'Compare aerobic and anaerobic respiration (oxygen use, products, and energy yield)',
      'Explain how respiratory surfaces allow fast diffusion of gases',
    ],
  },
  {
    id: 'bio-f3-3-4-1',
    form: 'Form 3',
    unit: '3.4.0 Continuity of Life',
    title: '3.4.1 Reproduction in Amphibians',
    summary: 'Reproduction in frogs, external fertilisation, stages of development, and advantages/disadvantages.',
    keyPoints: [
      'Describe egg laying, fertilisation, and development stages in frogs',
      'Weigh strengths and risks of amphibian reproduction',
    ],
  },
  {
    id: 'bio-f3-3-4-2',
    form: 'Form 3',
    unit: '3.4.0 Continuity of Life',
    title: '3.4.2 Fertilisation and Development in Human Beings',
    summary: 'Menstrual cycle and hormones (FSH, LH, oestrogen, progesterone), fertilisation, implantation, placenta/umbilical cord/amnion, prenatal care, and pregnancy risks.',
    keyPoints: [
      'Trace hormone roles across the menstrual cycle clearly',
      'State functions of placenta, umbilical cord, and amniotic fluid and healthy pregnancy habits',
    ],
  },
  {
    id: 'bio-f3-3-4-3',
    form: 'Form 3',
    unit: '3.4.0 Continuity of Life',
    title: '3.4.3 Infertility and Birth Control in Humans',
    summary: 'Causes and support for infertility in males and females, and mechanical, hormonal, surgical, and natural birth control methods.',
    keyPoints: [
      'Group birth control methods accurately and note benefits and risks',
      'Address infertility facts clearly and respectfully',
    ],
  },
  {
    id: 'bio-f3-3-5-1',
    form: 'Form 3',
    unit: '3.5.0 Coordination and Response',
    title: '3.5.1 Immunity',
    summary: 'Natural and artificial active/passive immunity, factors lowering or boosting immunity, and vaccines/immunisation.',
    keyPoints: [
      'Distinguish active immunity (body makes antibodies) from passive immunity (antibodies received)',
      'Explain how immunisation protects individuals and communities',
    ],
  },
  {
    id: 'bio-f3-3-5-2',
    form: 'Form 3',
    unit: '3.5.0 Coordination and Response',
    title: '3.5.2 The Endocrine System',
    summary: 'Endocrine glands and hormones (insulin, glucagon, adrenaline, thyroxine, ADH, growth/reproductive hormones) and effects of too much or too little.',
    keyPoints: [
      'Match each gland and hormone to its target and effect',
      'Explain blood glucose or metabolic effects clearly',
    ],
  },
  {
    id: 'bio-f3-3-5-3',
    form: 'Form 3',
    unit: '3.5.0 Coordination and Response',
    title: '3.5.3 The Nervous System',
    summary: 'CNS and PNS, sensory/motor/relay neurones, reflex arc and reflex actions, brain parts and functions, drug effects, tetanus, and nervous vs. endocrine control.',
    keyPoints: [
      'Trace a reflex arc step by step from receptor to effector',
      'Compare nervous impulses (fast electrical/chemical) with hormones (slower via blood)',
    ],
  },
  {
    id: 'bio-f3-3-6-1',
    form: 'Form 3',
    unit: '3.6.0 Ecological Relationships and Evolution',
    title: '3.6.1 Nutrient Cycles in the Ecosystem (Carbon, Nitrogen & Water)',
    summary: 'How carbon, nitrogen, and water cycle through living things and the environment, including roles of microbes and human impacts.',
    keyPoints: [
      'Trace key steps and organism roles in carbon, nitrogen, and water cycles',
      'Explain how deforestation, pollution, or fires disrupt cycles',
    ],
  },
  {
    id: 'bio-f3-3-6-2',
    form: 'Form 3',
    unit: '3.6.0 Ecological Relationships and Evolution',
    title: '3.6.2 Levels of Classification & Dichotomous Keys',
    summary: 'Plant and animal groups, building dichotomous keys, and identifying common organisms to species.',
    keyPoints: [
      'Make paired, clear, observable choices when building or using a dichotomous key',
      'Identify key features of major plant and animal groups',
    ],
  },

  // ==================== FORM 4 ====================
  {
    id: 'bio-f4-4-1-1',
    form: 'Form 4',
    unit: '4.1.0 Concepts and Method in Biology',
    title: '4.1.1 Research Project in Biology',
    summary: 'Carrying out a biology research investigation, analysing data, writing a report, presenting findings, and creating a practical solution.',
    keyPoints: [
      'Collect and interpret data carefully before drawing conclusions',
      'Present findings clearly and propose a practical biological innovation',
    ],
  },
  {
    id: 'bio-f4-4-2-1',
    form: 'Form 4',
    unit: '4.2.0 Principles of Cellular Life',
    title: '4.2.1 Cell Division (Mitosis and Meiosis)',
    summary: 'Stages of mitosis and meiosis, chromosome changes, and importance in growth, repair, reproduction, and variation.',
    keyPoints: [
      'Compare mitosis (two identical diploid cells for growth/repair) with meiosis (four haploid gametes with variation)',
      'Recognise main phases (interphase, prophase, metaphase, anaphase, telophase)',
    ],
  },
  {
    id: 'bio-f4-4-3-1',
    form: 'Form 4',
    unit: '4.3.0 Maintenance of the Organism',
    title: '4.3.1 Excretion in Plants and Animals',
    summary: 'Plant excretory products, excretory organs in animals (kidneys, lungs, skin), urinary system and nephron (ultrafiltration, selective reabsorption, osmoregulation), and kidney care.',
    keyPoints: [
      'Trace how the kidney filters blood and reabsorbs useful substances like glucose, water, and salts',
      'State excretory products and organs accurately for ECZ marks',
    ],
  },
  {
    id: 'bio-f4-4-3-2',
    form: 'Form 4',
    unit: '4.3.0 Maintenance of the Organism',
    title: '4.3.2 Homeostasis in Human Beings',
    summary: 'Keeping internal balance via kidney water/salt control (ADH), skin temperature control (sweating, vasodilation, vasoconstriction, shivering), and liver blood sugar/heat control.',
    keyPoints: [
      'Explain what happens when the body gets too hot or too cold using exact terms',
      'Explain how insulin, glucagon, and ADH help keep internal conditions steady',
    ],
  },
  {
    id: 'bio-f4-4-4-1',
    form: 'Form 4',
    unit: '4.4.0 Continuity of Life',
    title: '4.4.1 Heredity (Genetics, Monohybrid Crosses, Sex & Blood Groups, Mutation)',
    summary: 'Genetics terms, monohybrid crosses and Punnett squares, X/Y sex determination, sex-linked traits (colour blindness, haemophilia), ABO inheritance, and mutations.',
    keyPoints: [
      'Set out parental genotypes, gametes, offspring genotypes/phenotypes, and ratios clearly',
      'Distinguish gene/chromosome mutations, causes, and examples like sickle cell or albinism',
    ],
  },
  {
    id: 'bio-f4-4-4-2',
    form: 'Form 4',
    unit: '4.4.0 Continuity of Life',
    title: '4.4.2 Variation in Plants and Animals',
    summary: 'Continuous vs. discontinuous variation in plants and animals, genetic and environmental causes, and selective breeding.',
    keyPoints: [
      'Distinguish continuous variation (range, e.g., height) from discontinuous variation (clear groups, e.g., blood group)',
      'Explain how genes and environment cause variation',
    ],
  },
  {
    id: 'bio-f4-4-5-1',
    form: 'Form 4',
    unit: '4.5.0 Coordination and Response',
    title: '4.5.1 Sense Organs in Human Beings',
    summary: 'Eye structure, accommodation, short/long sight and correction, blindness causes/prevention, ear structure/hearing/balance, deafness prevention, and skin, tongue, and nose.',
    keyPoints: [
      'Explain how the lens changes shape to focus near and far objects (accommodation)',
      'Relate parts of the eye and ear to their exact functions clearly',
    ],
  },
  {
    id: 'bio-f4-4-5-2',
    form: 'Form 4',
    unit: '4.5.0 Coordination and Response',
    title: '4.5.2 The Skeletal System & Locomotion',
    summary: 'Hydrostatic, exo-, and endoskeletons, axial and appendicular bones, antagonistic muscles (biceps/triceps), synovial/hinge/ball-and-socket joints, bone/joint disorders, and first aid.',
    keyPoints: [
      'Explain how antagonistic muscle pairs work together (one contracts while the other relaxes)',
      'Distinguish hinge joints (e.g., elbow/knee) from ball-and-socket joints (e.g., shoulder/hip)',
    ],
  },
  {
    id: 'bio-f4-4-6-1',
    form: 'Form 4',
    unit: '4.6.0 Ecological Relationship and Evolution',
    title: '4.6.1 Biodiversity & 4.6.2 Conservation of Natural Resources',
    summary: 'Measuring local biodiversity, threats like poaching, deforestation, charcoal burning, and mining/pollution, conservation laws in Zambia, and sustainable use (3Rs).',
    keyPoints: [
      'Explain why biodiversity and habitats matter economically and ecologically in Zambia',
      'Give practical conservation and sustainable resource actions',
    ],
  },
  {
    id: 'bio-f4-4-6-2',
    form: 'Form 4',
    unit: '4.6.0 Ecological Relationship and Evolution',
    title: '4.6.3 Natural Selection & 4.6.4 Evolution',
    summary: 'Variation, survival of the fittest, inheritance, mutation, organism adaptations, and causes of evolution (natural selection, mutation, genetic drift, gene flow).',
    keyPoints: [
      'Explain natural selection step by step (variation -> struggle/selection -> survival & passing on traits)',
      'Give clear adaptation examples from plants and animals',
    ],
  },
];

export function normalizeBiologyForm(gradeOrForm?: string): BiologyOLevelForm {
  const value = (gradeOrForm || '').trim().toLowerCase();
  if (value.includes('1') || value.includes('grade 8')) return 'Form 1';
  if (value.includes('2') || value.includes('grade 9')) return 'Form 2';
  if (value.includes('3') || value.includes('grade 10') || value.includes('grade 11')) {
    return 'Form 3';
  }
  return 'Form 4';
}

export function getBiologyTopicsForLearner(gradeOrForm?: string): BiologyFormTopic[] {
  const targetForm = normalizeBiologyForm(gradeOrForm);
  return BIOLOGY_FORM_1_TO_4_TOPICS.filter((topic) => topic.form === targetForm);
}
