export interface Video {
  id: string;
  sectionId: string;
  title: string;
  description: string;
  duration: string;
  youtubeId: string;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Section {
  id: string;
  title: string;
  fullTitle: string;
  description: string;
  color: string;
  iconName: string;
  videos: Video[];
  quiz: Question[];
}

export const SECTIONS: Section[] = [
  {
    id: "aaws",
    title: "AAWS",
    fullTitle: "Aerial Access & Working at Scaffold",
    description:
      "Learn safe practices for aerial access equipment and working at height on scaffold structures.",
    color: "#1D4ED8",
    iconName: "tool",
    videos: [
      {
        id: "aaws-v1",
        sectionId: "aaws",
        title: "Introduction to AAWS Safety",
        description:
          "Understand the fundamental safety principles and regulations governing aerial access and working at scaffold. Covers PPE requirements and risk assessments.",
        duration: "12:30",
        youtubeId: "YAlfNE7HTCM",
      },
      {
        id: "aaws-v2",
        sectionId: "aaws",
        title: "Equipment Inspection Procedures",
        description:
          "Step-by-step visual inspection of aerial access equipment before each use. Learn to identify defects and when to take equipment out of service.",
        duration: "9:15",
        youtubeId: "QH2-TGUlwu4",
      },
      {
        id: "aaws-v3",
        sectionId: "aaws",
        title: "Operating AAWS Systems Safely",
        description:
          "Practical demonstration of operating aerial work platforms, scaffold erection sequences, and emergency descent procedures.",
        duration: "15:45",
        youtubeId: "kJQP7kiw5Fk",
      },
    ],
    quiz: [
      {
        id: "aaws-q1",
        question:
          "What is the minimum height at which fall protection is required when working on a scaffold?",
        options: ["1.5 metres", "2.0 metres", "2.5 metres", "3.0 metres"],
        correctIndex: 1,
        explanation:
          "Fall protection is required at 2.0 metres or above on scaffolding, in line with standard workplace safety regulations.",
      },
      {
        id: "aaws-q2",
        question:
          "Before operating aerial access equipment, what must always be completed?",
        options: [
          "Visual inspection only",
          "Pre-use inspection and risk assessment",
          "Manager approval only",
          "Training certificate review",
        ],
        correctIndex: 1,
        explanation:
          "A pre-use inspection combined with a risk assessment must be completed before every use of aerial access equipment.",
      },
      {
        id: "aaws-q3",
        question:
          "Which of the following is NOT a valid reason to take aerial equipment out of service?",
        options: [
          "Cracked structural component",
          "Missing safety pin",
          "Minor surface rust on non-structural part",
          "Frayed safety lanyard",
        ],
        correctIndex: 2,
        explanation:
          "Minor surface rust on non-structural parts doesn't require immediate removal from service, unlike structural damage or missing safety components.",
      },
      {
        id: "aaws-q4",
        question: "What does the acronym AAWS stand for?",
        options: [
          "Automated Aerial Work System",
          "Advanced Access and Work Safety",
          "Aerial Access and Working at Scaffold",
          "Aerial Awareness and Work Standards",
        ],
        correctIndex: 2,
        explanation:
          "AAWS stands for Aerial Access and Working at Scaffold, covering all operations involving aerial platforms and scaffold structures.",
      },
      {
        id: "aaws-q5",
        question:
          "Who is responsible for the safety of all persons on and around a scaffold?",
        options: [
          "The scaffold erector only",
          "The site manager only",
          "All workers collectively",
          "The scaffold user only",
        ],
        correctIndex: 2,
        explanation:
          "Safety on and around a scaffold is a shared responsibility of all workers, the erector, and site management collectively.",
      },
    ],
  },
  {
    id: "brake",
    title: "Brake System",
    fullTitle: "Brake System Engineering",
    description:
      "Comprehensive training on hydraulic and electronic brake systems, components, and maintenance procedures.",
    color: "#DC2626",
    iconName: "disc",
    videos: [
      {
        id: "brake-v1",
        sectionId: "brake",
        title: "Brake System Overview",
        description:
          "Introduction to the complete brake system architecture including hydraulic circuits, master cylinders, calipers, and brake fluid specification.",
        duration: "11:20",
        youtubeId: "JJqBgJEzR4Y",
      },
      {
        id: "brake-v2",
        sectionId: "brake",
        title: "Hydraulic Brake Components",
        description:
          "Deep dive into hydraulic brake components: master cylinder operation, wheel cylinders, brake lines, and ABS modulator units.",
        duration: "14:05",
        youtubeId: "1-uh8GKRMLU",
      },
      {
        id: "brake-v3",
        sectionId: "brake",
        title: "Brake Maintenance & Testing",
        description:
          "Practical brake inspection, pad and disc replacement procedures, brake fluid bleeding, and performance testing protocols.",
        duration: "17:30",
        youtubeId: "8RBCCpKEhm4",
      },
    ],
    quiz: [
      {
        id: "brake-q1",
        question:
          "What type of fluid is used in most modern hydraulic brake systems?",
        options: [
          "Engine oil",
          "DOT-rated glycol-ether brake fluid",
          "Power steering fluid",
          "Coolant",
        ],
        correctIndex: 1,
        explanation:
          "Modern hydraulic brake systems use DOT-rated glycol-ether brake fluid (e.g. DOT 3, DOT 4, DOT 5.1) which has specific boiling point requirements.",
      },
      {
        id: "brake-q2",
        question: "What is the primary purpose of the master cylinder?",
        options: [
          "Store brake fluid",
          "Convert pedal force into hydraulic pressure",
          "Reduce brake fade",
          "Control ABS activation",
        ],
        correctIndex: 1,
        explanation:
          "The master cylinder converts mechanical force from the brake pedal into hydraulic pressure which is transmitted to the wheel cylinders or calipers.",
      },
      {
        id: "brake-q3",
        question:
          "When should brake pads typically be replaced on a standard vehicle?",
        options: [
          "Every 10,000 km regardless",
          "When pad thickness reaches 2-3mm",
          "Only when metal-on-metal grinding occurs",
          "Every 5 years regardless of wear",
        ],
        correctIndex: 1,
        explanation:
          "Brake pads should be inspected regularly and replaced when the friction material reaches approximately 2-3mm thickness to ensure safe stopping performance.",
      },
      {
        id: "brake-q4",
        question:
          "What does ABS stand for in the context of brake systems?",
        options: [
          "Automatic Braking System",
          "Anti-lock Braking System",
          "Advanced Brake Sensor",
          "Auxiliary Braking Standard",
        ],
        correctIndex: 1,
        explanation:
          "ABS stands for Anti-lock Braking System, which prevents wheel lockup during hard braking by modulating brake pressure automatically.",
      },
      {
        id: "brake-q5",
        question: "What is brake fade?",
        options: [
          "Gradual wear of brake pads",
          "Reduction in braking effectiveness due to heat buildup",
          "Colour change of brake discs",
          "Loss of brake fluid over time",
        ],
        correctIndex: 1,
        explanation:
          "Brake fade refers to the reduction in stopping power caused by heat buildup in the brake components during repeated or prolonged braking.",
      },
    ],
  },
  {
    id: "control",
    title: "Control System",
    fullTitle: "Industrial Control Systems",
    description:
      "Master industrial control system fundamentals including PLCs, sensors, actuators, and system calibration techniques.",
    color: "#059669",
    iconName: "cpu",
    videos: [
      {
        id: "control-v1",
        sectionId: "control",
        title: "Control System Architecture",
        description:
          "Overview of industrial control system architecture, open vs closed loop systems, feedback mechanisms, and signal types.",
        duration: "13:10",
        youtubeId: "lBC1nEq0_nk",
      },
      {
        id: "control-v2",
        sectionId: "control",
        title: "Electronic Control Units (ECU)",
        description:
          "Understanding ECU function, input sensors, output actuators, communication protocols (CAN, LIN), and diagnostic interfaces.",
        duration: "16:50",
        youtubeId: "ZVHyD1rIcCs",
      },
      {
        id: "control-v3",
        sectionId: "control",
        title: "Calibration & Diagnostics",
        description:
          "Hands-on calibration procedures, fault code interpretation, using diagnostic scan tools, and control system troubleshooting methodology.",
        duration: "14:25",
        youtubeId: "TXxGBXaYbB8",
      },
    ],
    quiz: [
      {
        id: "control-q1",
        question:
          "What is the key difference between an open-loop and closed-loop control system?",
        options: [
          "Open-loop uses more power",
          "Closed-loop uses feedback to correct the output",
          "Open-loop is more accurate",
          "Closed-loop cannot be automated",
        ],
        correctIndex: 1,
        explanation:
          "A closed-loop control system uses feedback (from sensors measuring the output) to continuously correct and adjust the process, unlike open-loop which has no feedback.",
      },
      {
        id: "control-q2",
        question: "What does PLC stand for?",
        options: [
          "Programmable Logic Controller",
          "Process Loop Controller",
          "Precision Load Control",
          "Programmable Line Computer",
        ],
        correctIndex: 0,
        explanation:
          "PLC stands for Programmable Logic Controller, a ruggedised digital computer used to automate industrial electromechanical processes.",
      },
      {
        id: "control-q3",
        question:
          "Which communication protocol is most commonly used in automotive control systems?",
        options: ["Ethernet", "RS-232", "CAN Bus", "USB"],
        correctIndex: 2,
        explanation:
          "CAN (Controller Area Network) Bus is the dominant communication protocol in automotive and industrial control systems, enabling ECUs to communicate without a central computer.",
      },
      {
        id: "control-q4",
        question: "What is the purpose of a sensor in a control system?",
        options: [
          "To execute mechanical actions",
          "To measure a physical quantity and convert it to a signal",
          "To store control logic",
          "To supply power to actuators",
        ],
        correctIndex: 1,
        explanation:
          "Sensors measure physical quantities (temperature, pressure, position, speed, etc.) and convert them into electrical signals that the controller can process.",
      },
      {
        id: "control-q5",
        question:
          "During calibration, what must be verified before adjusting any control parameter?",
        options: [
          "The system has been running for 24 hours",
          "Reference standards are traceable and within calibration date",
          "All sensors are replaced with new ones",
          "The ECU firmware has been updated",
        ],
        correctIndex: 1,
        explanation:
          "Before adjusting any control parameter, calibration reference standards must be verified to be traceable to national/international standards and within their calibration validity period.",
      },
    ],
  },
];

export function getSectionById(id: string): Section | undefined {
  return SECTIONS.find((s) => s.id === id);
}

export function getVideoById(
  sectionId: string,
  videoId: string
): Video | undefined {
  const section = getSectionById(sectionId);
  return section?.videos.find((v) => v.id === videoId);
}
