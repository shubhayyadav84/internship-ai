import React, { createContext, useContext, useEffect, useState } from "react";
import { apiGetSections, type SectionData } from "@/services/api";

interface ContentContextType {
  sections: SectionData[];
  isLoaded: boolean;
  getSectionById: (id: string) => SectionData | undefined;
  getVideoById: (sectionId: string, videoId: string) => SectionData["videos"][0] | undefined;
  reload: () => Promise<void>;
}

const ContentContext = createContext<ContentContextType | null>(null);

export function ContentProvider({ children }: { children: React.ReactNode }) {
  const [sections, setSections] = useState<SectionData[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    void loadSections();
  }, []);

  async function loadSections() {
    try {
      const result = await apiGetSections();
      if (result.data) {
        setSections(result.data);
      }
    } catch {
    } finally {
      setIsLoaded(true);
    }
  }

  function getSectionById(id: string): SectionData | undefined {
    return sections.find((s) => s.id === id);
  }

  function getVideoById(sectionId: string, videoId: string): SectionData["videos"][0] | undefined {
    return getSectionById(sectionId)?.videos.find((v) => v.id === videoId);
  }

  return (
    <ContentContext.Provider
      value={{
        sections,
        isLoaded,
        getSectionById,
        getVideoById,
        reload: loadSections,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
}

export function useContent(): ContentContextType {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error("useContent must be used within ContentProvider");
  return ctx;
}
