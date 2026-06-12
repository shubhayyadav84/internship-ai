import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiGetProgress, apiMarkVideoWatched, apiSubmitQuiz } from "@/services/api";
import type { SectionProgressData } from "@/services/api";

export interface SectionProgress {
  watchedVideos: string[];
  quizScore: number | null;
  quizPassed: boolean;
  certificateEarned: boolean;
  certificateDate: string | null;
}

interface ProgressContextType {
  progress: Record<string, SectionProgress>;
  isLoaded: boolean;
  markVideoWatched: (sectionId: string, videoId: string) => Promise<void>;
  isVideoWatched: (sectionId: string, videoId: string) => boolean;
  areAllVideosWatched: (sectionId: string, videoCount: number) => boolean;
  submitQuiz: (sectionId: string, score: number, total: number) => Promise<void>;
  hasCertificate: (sectionId: string) => boolean;
  getOverallProgress: (sections: { id: string; videos: unknown[] }[]) => number;
  resetSectionProgress: (sectionId: string) => Promise<void>;
  refreshProgress: () => Promise<void>;
}

const ProgressContext = createContext<ProgressContextType | null>(null);
const PASS_THRESHOLD = 0.6;

function defaultSection(): SectionProgress {
  return { watchedVideos: [], quizScore: null, quizPassed: false, certificateEarned: false, certificateDate: null };
}

function mapSections(sections: SectionProgressData[]): Record<string, SectionProgress> {
  const map: Record<string, SectionProgress> = {};
  for (const s of sections) {
    map[s.sectionId] = {
      watchedVideos: s.watchedVideos,
      quizScore: s.quizScore,
      quizPassed: s.quizPassed,
      certificateEarned: s.certificateEarned,
      certificateDate: s.certificateDate,
    };
  }
  return map;
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [progress, setProgress] = useState<Record<string, SectionProgress>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (token) {
      void loadProgress();
    } else {
      setProgress({});
      setIsLoaded(true);
    }
  }, [token]);

  async function loadProgress() {
    try {
      const result = await apiGetProgress(token!);
      if (result.data) {
        setProgress(mapSections(result.data.sections));
      }
    } catch {
    } finally {
      setIsLoaded(true);
    }
  }

  function getSection(sectionId: string): SectionProgress {
    return progress[sectionId] ?? defaultSection();
  }

  async function markVideoWatched(sectionId: string, videoId: string) {
    if (!token) return;
    if (getSection(sectionId).watchedVideos.includes(videoId)) return;

    setProgress((prev) => ({
      ...prev,
      [sectionId]: { ...(prev[sectionId] ?? defaultSection()), watchedVideos: [...(prev[sectionId]?.watchedVideos ?? []), videoId] },
    }));

    const result = await apiMarkVideoWatched(token, videoId, sectionId);
    if (result.data) setProgress(mapSections(result.data.sections));
  }

  function isVideoWatched(sectionId: string, videoId: string): boolean {
    return getSection(sectionId).watchedVideos.includes(videoId);
  }

  function areAllVideosWatched(sectionId: string, videoCount: number): boolean {
    if (videoCount === 0) return false;
    const watched = getSection(sectionId).watchedVideos;
    return watched.length >= videoCount;
  }

  async function submitQuiz(sectionId: string, score: number, total: number) {
    if (!token) return;
    const passed = score / total >= PASS_THRESHOLD;

    setProgress((prev) => ({
      ...prev,
      [sectionId]: {
        ...(prev[sectionId] ?? defaultSection()),
        quizScore: score,
        quizPassed: passed,
        certificateEarned: passed,
        certificateDate: passed ? new Date().toISOString() : (prev[sectionId]?.certificateDate ?? null),
      },
    }));

    const result = await apiSubmitQuiz(token, sectionId, score, total);
    if (result.data) setProgress(mapSections(result.data.sections));
  }

  function hasCertificate(sectionId: string): boolean {
    return getSection(sectionId).certificateEarned;
  }

  function getOverallProgress(sections: { id: string; videos: unknown[] }[]): number {
    let total = 0;
    let completed = 0;
    for (const sec of sections) {
      total += sec.videos.length + 1;
      const p = getSection(sec.id);
      completed += p.watchedVideos.length;
      if (p.quizPassed) completed += 1;
    }
    return total > 0 ? completed / total : 0;
  }

  async function resetSectionProgress(sectionId: string) {
    setProgress((prev) => ({ ...prev, [sectionId]: defaultSection() }));
  }

  async function refreshProgress() {
    if (token) await loadProgress();
  }

  return (
    <ProgressContext.Provider
      value={{
        progress,
        isLoaded,
        markVideoWatched,
        isVideoWatched,
        areAllVideosWatched,
        submitQuiz,
        hasCertificate,
        getOverallProgress,
        resetSectionProgress,
        refreshProgress,
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
