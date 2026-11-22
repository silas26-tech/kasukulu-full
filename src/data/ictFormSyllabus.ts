import { SyllabusTopic } from './curriculum';

export type IctOLevelForm = 'Form 1' | 'Form 2' | 'Form 3' | 'Form 4';

export interface IctFormTopic extends Partial<SyllabusTopic> {
  id: string;
  form: IctOLevelForm;
  unit: string;
  title: string;
  summary: string;
  keyPoints?: string[];
}

export const ICT_FORM_1_TO_4_TOPICS: IctFormTopic[] = [
  // ==================== FORM 1 ====================
  {
    id: 'ict-f1-1-1-1',
    form: 'Form 1',
    unit: '1.1 Introduction to ICT',
    title: '1.1.1 History of Computer',
    summary: 'Evolution of computers from early computational tools to modern computers and the impact of microprocessors.',
    keyPoints: [
      'Trace how computing tools and computers developed over time',
      'Explain how microprocessors made computers smaller, faster, and more affordable',
    ],
  },
  {
    id: 'ict-f1-1-1-2',
    form: 'Form 1',
    unit: '1.1 Introduction to ICT',
    title: '1.1.2 Basic Concepts of ICT',
    summary: 'Defining ICT, separating hardware and software tools, and applying ICT in everyday life, school, business, and industries.',
    keyPoints: [
      'Distinguish hardware (physical parts) from software (programs/instructions)',
      'Give clear everyday and educational examples of ICT tools and their purposes',
    ],
  },
  {
    id: 'ict-f1-1-2-1',
    form: 'Form 1',
    unit: '1.2 Components of Computer Systems',
    title: '1.2.1 Hardware',
    summary: 'Identifying computer hardware components (input, output, CPU, RAM, ROM, storage) and explaining how each works.',
    keyPoints: [
      'Separate input devices from output devices and explain what CPU, RAM, and ROM do',
      'Compare temporary/volatile memory (RAM) with non-volatile memory/storage',
    ],
  },
  {
    id: 'ict-f1-1-2-2',
    form: 'Form 1',
    unit: '1.2 Components of Computer Systems',
    title: '1.2.2 Software',
    summary: 'Classifying software into system, application, and utility software, and using word processors, spreadsheets, and presentations.',
    keyPoints: [
      'Distinguish system software (e.g., operating system), application software, and utility software',
      'Use basic formatting, tables, and spreadsheet functions like SUM and AVERAGE accurately',
    ],
  },
  {
    id: 'ict-f1-1-3-1',
    form: 'Form 1',
    unit: '1.3 File Management',
    title: '1.3.1 Basics of File Management',
    summary: 'Folder/subfolder structure, clear file naming conventions, safe copying/moving/deleting, sorting/searching, backups, and Recycle Bin recovery.',
    keyPoints: [
      'Use clear, descriptive file and folder names and group files into logical folders',
      'Back up important work to external storage or cloud storage and check the Recycle Bin before permanent deletion',
    ],
  },
  {
    id: 'ict-f1-1-4-1',
    form: 'Form 1',
    unit: '1.4 Basics of Internet and Online Tools',
    title: '1.4.1 Introduction to the Internet and Online Tools',
    summary: 'How the internet works, networking devices (modem, router, Wi-Fi), web browsers and search engines, online learning tools, and basic online safety.',
    keyPoints: [
      'Distinguish a web browser (program used to view websites) from a search engine (tool used to find web pages)',
      'Use strong passwords, avoid suspicious links, and browse safely',
    ],
  },
  {
    id: 'ict-f1-1-5-1',
    form: 'Form 1',
    unit: '1.5 Digital Literacy',
    title: '1.5.1 Introduction to Digital Literacy',
    summary: 'Using digital devices (computers, tablets, smartphones), digital portfolios, virtual communication tools, email practice, and ethical technology use.',
    keyPoints: [
      'Use digital devices responsibly for learning, communication, and productivity',
      'Practice ethical behaviour, online respect, and safe sharing of information',
    ],
  },
  {
    id: 'ict-f1-1-6-1',
    form: 'Form 1',
    unit: '1.6 ICT in Business',
    title: '1.6.1 Introduction to ICT in Business',
    summary: 'ICT tools in entrepreneurship and business operations, financial record-keeping/digital finance, and safeguarding business data.',
    keyPoints: [
      'Explain how ICT helps small businesses track finances, reach customers, and stay organised',
      'Identify simple ways businesses protect records and digital transactions',
    ],
  },

  // ==================== FORM 2 ====================
  {
    id: 'ict-f2-2-1-1',
    form: 'Form 2',
    unit: '2.1 File Management',
    title: '2.1.1 File Compression and Encryption',
    summary: 'Compressing and extracting files/folders (e.g., WinRAR, 7-Zip, PowerISO) and encrypting files/folders (e.g., BitLocker, 7-Zip) for safe sharing.',
    keyPoints: [
      'Compression reduces file size to save storage space or speed up sending/uploading; extraction restores original files',
      'Encryption scrambles data so unauthorised users cannot read it without the key/password',
    ],
  },
  {
    id: 'ict-f2-2-2-1',
    form: 'Form 2',
    unit: '2.2 Productivity Tools',
    title: '2.2.1 Word Processing',
    summary: 'Customising margins, columns, orientation, headers/footers, page numbers, tables, multimedia, hyperlinks, mail merge, and importing/exporting styles.',
    keyPoints: [
      'Format documents cleanly with page setup, headers/footers, tables, and visual elements',
      'Explain how mail merge creates personalised letters/documents from a data list',
    ],
  },
  {
    id: 'ict-f2-2-2-2',
    form: 'Form 2',
    unit: '2.2 Productivity Tools',
    title: '2.2.2 Spreadsheets',
    summary: 'Using MIN, MAX, COUNT, COUNTA, and SUMIF functions, building budgets, sorting data, formatting cells, and hiding/unhiding rows or columns.',
    keyPoints: [
      'Start spreadsheet formulas with "=" and pick the right function (MIN, MAX, COUNT, COUNTA, SUMIF)',
      'Organise and format budgets or data tables clearly without hiding key figures by mistake',
    ],
  },
  {
    id: 'ict-f2-2-2-3',
    form: 'Form 2',
    unit: '2.2 Productivity Tools',
    title: '2.2.3 Presentations',
    summary: 'Creating and organising slides, applying transitions and animations, and adding images, charts, audio, and video.',
    keyPoints: [
      'Keep slides clear, readable, and focused rather than crowded with text or distracting effects',
      'Combine text, charts, and media to support a clear presentation',
    ],
  },
  {
    id: 'ict-f2-2-2-4',
    form: 'Form 2',
    unit: '2.2 Productivity Tools',
    title: '2.2.4 Publishing',
    summary: 'Designing publications such as fliers, posters, calendars, business cards, and magazines with captions, images, text boxes, and shapes.',
    keyPoints: [
      'Arrange text boxes, shapes, captions, and images with clear alignment and contrast',
      'Match layout and tone to the purpose and audience of the publication',
    ],
  },
  {
    id: 'ict-f2-2-3-1',
    form: 'Form 2',
    unit: '2.3 Digital Literacy',
    title: '2.3.1 Email and Instant Messaging',
    summary: 'Email providers (Gmail, Yahoo, Outlook), email address parts (username, domain), inbox/drafts/sent/attachments, folders, instant messaging, and email etiquette.',
    keyPoints: [
      'Identify parts of an email address (e.g., user@domain.com) and use clear subjects and polite etiquette',
      'Avoid opening suspicious attachments or links and use instant messaging responsibly for study',
    ],
  },
  {
    id: 'ict-f2-2-4-1',
    form: 'Form 2',
    unit: '2.4 ICT in Business',
    title: '2.4.1 Electronic Business Tools',
    summary: 'Shifts from barter/cash to digital transactions, mobile money, online banking, checking ECZ results online, spreadsheets/Google Sheets, and digital budgeting.',
    keyPoints: [
      'Compare traditional cash/barter with digital payments and mobile money in Zambia',
      'Use digital tools safely for budgeting and financial tracking while guarding PINs and account details',
    ],
  },

  // ==================== FORM 3 ====================
  {
    id: 'ict-f3-3-1-1',
    form: 'Form 3',
    unit: '3.1 Website Design',
    title: '3.1.1 Website Design Using Templates',
    summary: 'Planning and building web pages using template tools (e.g., Google Sites, WordPress, Canva, Publisher), adding media, and publishing.',
    keyPoints: [
      'Organise pages, menus, and content logically before publishing a template site',
      'Optimise images/media and check layout and links before sharing or publishing',
    ],
  },
  {
    id: 'ict-f3-3-2-1',
    form: 'Form 3',
    unit: '3.2 Cloud Computing',
    title: '3.2.1 Introduction to Cloud Computing',
    summary: 'Cloud platforms (Google Drive, OneDrive, Dropbox, iCloud), uploading/organising files, real-time collaborative editing, and pros/cons vs. local storage.',
    keyPoints: [
      'Compare cloud storage with local/physical storage (access from anywhere vs. needing internet/storage limits/privacy)',
      'Set appropriate sharing permissions (view, comment, edit) when collaborating with peers',
    ],
  },
  {
    id: 'ict-f3-3-3-1',
    form: 'Form 3',
    unit: '3.3 Productivity Tools',
    title: '3.3.1 Intermediate Spreadsheets',
    summary: 'Using VLOOKUP, INDEX, MATCH, and CONCATENATE across sheets, pivot tables, charts/scatter/bubble plots, conditional formatting, trend analysis, locking/linking sheets, and transposing.',
    keyPoints: [
      'Use lookup functions (VLOOKUP or INDEX/MATCH) and CONCATENATE accurately across sheets',
      'Summarise large datasets with pivot tables, charts, and conditional formatting to spot trends',
    ],
  },
  {
    id: 'ict-f3-3-4-1',
    form: 'Form 3',
    unit: '3.4 Cybersecurity',
    title: '3.4.1 Introduction to Cybersecurity',
    summary: 'Cyber threats (phishing, pharming, identity theft, spamming), antivirus scanning, password managers/strong passwords, and spotting scams/suspicious links.',
    keyPoints: [
      'Distinguish common threats such as phishing (fake messages/links stealing info), pharming, identity theft, and spam',
      'Apply strong unique passwords, password managers, updated antivirus software, and link verification',
    ],
  },

  // ==================== FORM 4 ====================
  {
    id: 'ict-f4-4-1-1',
    form: 'Form 4',
    unit: '4.1 Computer Networking',
    title: '4.1.1 Introduction to Computer Networks',
    summary: 'Network types (PAN, LAN, WAN), wired/wireless/optical connections, network protocols, and hot-spotting, Bluetooth/USB tethering, and screen casting.',
    keyPoints: [
      'Compare PAN, LAN, and WAN by coverage area and typical use',
      'Explain wired, wireless, and optical links and connect devices safely via hotspot, tethering, or casting',
    ],
  },
  {
    id: 'ict-f4-4-2-1',
    form: 'Form 4',
    unit: '4.2 Cloud Computing',
    title: '4.2.1 Cloud Computing Services',
    summary: 'Comparing cloud services (such as Google Drive vs. OneDrive), account setup and file management, and weighing benefits and challenges of cloud systems.',
    keyPoints: [
      'Compare features, storage, and integration across cloud platforms such as Google Drive and OneDrive',
      'Weigh benefits (backup, syncing, teamwork) against challenges (connectivity, security, subscription/quota limits)',
    ],
  },
  {
    id: 'ict-f4-4-3-1',
    form: 'Form 4',
    unit: '4.3 Cybersecurity',
    title: '4.3.1 Malware Analysis',
    summary: 'Types of malware (viruses, worms, trojans, spyware), real-world malware lessons, and lab/device policies to prevent and handle malware attacks.',
    keyPoints: [
      'Distinguish malware types clearly (e.g., virus attaches to files/programs, worm self-replicates, trojan disguises itself, spyware secretly monitors)',
      'Follow preventive lab rules, regular updates, backups, and safe scanning steps',
    ],
  },
  {
    id: 'ict-f4-4-4-1',
    form: 'Form 4',
    unit: '4.4 Digital Citizenship',
    title: '4.4.1 Digital Ethics',
    summary: 'Digital citizenship and digital identity (IP address, location data), responsible online communication, spotting fact vs. opinion vs. bias, balanced screen time, and online inclusion.',
    keyPoints: [
      'Understand how digital footprints, IP addresses, and location data relate to digital identity and privacy',
      'Evaluate online information for fact, opinion, and bias while maintaining respectful conduct and healthy screen-time balance',
    ],
  },
];

export function normalizeIctForm(gradeOrForm?: string): IctOLevelForm {
  const value = (gradeOrForm || '').trim().toLowerCase();
  if (value.includes('1') || value.includes('grade 8')) return 'Form 1';
  if (value.includes('2') || value.includes('grade 9')) return 'Form 2';
  if (value.includes('3') || value.includes('grade 10') || value.includes('grade 11')) {
    return 'Form 3';
  }
  return 'Form 4';
}

export function getIctTopicsForLearner(gradeOrForm?: string): IctFormTopic[] {
  const targetForm = normalizeIctForm(gradeOrForm);
  return ICT_FORM_1_TO_4_TOPICS.filter((topic) => topic.form === targetForm);
}
