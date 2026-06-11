import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { SECTIONS } from "@/data/courses";

export interface SectionProgress {
  watchedVideos: string[];
  quizScore: number | null;
  quizPassed: boolean;
  certificateEarned: boolean;
  certificateDate: string | null;
}

interface ProgressContextType {
  progress: Record<string, SectionProgress>;
  markVideoWatched: (sectionId: string, videoId: string) => Promise<void>;
  isVideoWatched: (sectionId: string, videoId: string) => boolean;
  areAllVideosWatched: (sectionId: string) => boolean;
  submitQuiz: (sectionId: string, score: number, total: number) => Promise<void>;
  hasCertificate: (sectionId: string) => boolean;
  getOverallProgress: () => number;
  resetSectionProgress: (sectionId: string) => Promise<void>;
}

const ProgressContext = createContext<ProgressContextType | null>(null);

const PROGRESS_KEY = "@intern_progress";
const PASS_THRESHOLD = 0.6;

function defaultSectionProgress(): SectionProgress {
  return {
    watchedVideos: [],
    quizScore: null,
    quizPassed: false,
    certificateEarned: false,
    certificateDate: null,
  };
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<Record<string, SectionProgress>>({});

  useEffect(() => {
    loadProgress();
  }, []);

  async function loadProgress() {
    try {
      const raw = await AsyncStorage.getItem(PROGRESS_KEY);
      if (raw) setProgress(JSON.parse(raw));
    } catch {}
  }

  async function saveProgress(updated: Record<string, SectionProgress>) {
    setProgress(updated);
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(updated));
  }

  function getSection(sectionId: string): SectionProgress {
    return progress[sectionId] ?? defaultSectionProgress();
  }

  async function markVideoWatched(sectionId: string, videoId: string) {
    const section = getSection(sectionId);
    if (section.watchedVideos.includes(videoId)) return;
    const updated = {
      ...progress,
      [sectionId]: {
        ...section,
        watchedVideos: [...section.watchedVideos, videoId],
      },
    };
    await saveProgress(updated);
  }

  function isVideoWatched(sectionId: string, videoId: string): boolean {
    return getSection(sectionId).watchedVideos.includes(videoId);
  }

  function areAllVideosWatched(sectionId: string): boolean {
    const sec = SECTIONS.find((s) => s.id === sectionId);
    if (!sec) return false;
    const watched = getSection(sectionId).watchedVideos;
    return sec.videos.every((v) => watched.includes(v.id));
  }

  async function submitQuiz(sectionId: string, score: number, total: number) {
    const section = getSection(sectionId);
    const passed = score / total >= PASS_THRESHOLD;
    const updated = {
      ...progress,
      [sectionId]: {
        ...section,
        quizScore: score,
        quizPassed: passed,
        certificateEarned: passed,
        certificateDate: passed ? new Date().toISOString() : section.certificateDate,
      },
    };
    await saveProgress(updated);
  }

  function hasCertificate(sectionId: string): boolean {
    return getSection(sectionId).certificateEarned;
  }

  function getOverallProgress(): number {
    let total = 0;
    let completed = 0;
    for (const sec of SECTIONS) {
      total += sec.videos.length + 1;
      const p = getSection(sec.id);
      completed += p.watchedVideos.length;
      if (p.quizPassed) completed += 1;
    }
    return total > 0 ? completed / total : 0;
  }

  async function resetSectionProgress(sectionId: string) {
    const updated = { ...progress, [sectionId]: defaultSectionProgress() };
    await saveProgress(updated);
  }

  return (
    <ProgressContext.Provider
      value={{
        progress,
        markVideoWatched,
        isVideoWatched,
        areAllVideosWatched,
        submitQuiz,
        hasCertificate,
        getOverallProgress,
        resetSectionProgress,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress(): ProgressContextType {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}
