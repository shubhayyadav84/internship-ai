export interface Video {
  id: string;
  sectionId: string;
  title: string;
  description: string;
  duration: string;
  videoUrl: string;
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

export const SECTION_COLORS: Record<string, string> = {
  aaws: "#1D4ED8",
  pis: "#7C3AED",
  apc: "#DC2626",
  cvvrs: "#059669",
  etbu: "#D97706",
};

export const SECTION_ICONS: Record<string, string> = {
  aaws: "bell",
  pis: "monitor",
  apc: "zap",
  cvvrs: "video",
  etbu: "phone-call",
};
