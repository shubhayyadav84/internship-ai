const isLocal = process.env.EXPO_PUBLIC_DOMAIN?.includes("localhost") || process.env.EXPO_PUBLIC_DOMAIN?.includes("127.0.0.1");
const BASE_URL = `${isLocal ? "http" : "https"}://${process.env.EXPO_PUBLIC_DOMAIN}/api`;

type ApiSuccess<T> = { data: T; error?: undefined };
type ApiError = { data?: undefined; error: string };
type ApiResponse<T> = ApiSuccess<T> | ApiError;

async function request<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (res.status === 204) {
      return { data: undefined as unknown as T };
    }

    const json = await res.json();
    if (!res.ok) {
      return { error: (json as { error?: string }).error ?? "Request failed" };
    }
    return { data: json as T };
  } catch {
    return { error: "Network error. Please check your connection." };
  }
}

function authHeaders(token: string): Record<string, string> {
  return { Authorization: `Bearer ${token}` };
}

export interface Student {
  id: number;
  name: string;
  email: string;
  studentId: string;
  createdAt: string;
}

export interface SectionProgressData {
  sectionId: string;
  watchedVideos: string[];
  quizScore: number | null;
  quizPassed: boolean;
  certificateEarned: boolean;
  certificateDate: string | null;
}

export interface Progress {
  sections: SectionProgressData[];
}

export interface AuthPayload {
  token: string;
  student: Student;
}

export function apiRegister(
  name: string,
  email: string,
  password: string,
  studentId: string,
): Promise<ApiResponse<AuthPayload>> {
  return request<AuthPayload>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password, studentId }),
  });
}

export function apiLogin(email: string, password: string): Promise<ApiResponse<AuthPayload>> {
  return request<AuthPayload>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function apiGetProgress(token: string): Promise<ApiResponse<Progress>> {
  return request<Progress>("/students/me/progress", { headers: authHeaders(token) });
}

export function apiMarkVideoWatched(token: string, videoId: string, sectionId: string): Promise<ApiResponse<Progress>> {
  return request<Progress>("/students/me/progress/video", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ videoId, sectionId }),
  });
}

export function apiSubmitQuiz(
  token: string,
  sectionId: string,
  score: number,
  total: number,
): Promise<ApiResponse<Progress>> {
  return request<Progress>("/students/me/quiz", {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({ sectionId, score, total }),
  });
}

export interface SectionData {
  id: string;
  title: string;
  fullTitle: string;
  description: string;
  color: string;
  iconName: string;
  sortOrder: number;
  videos: {
    id: string;
    sectionId: string;
    title: string;
    description: string;
    videoUrl: string;
    duration: string;
    sortOrder: number;
  }[];
  quiz: {
    id: string;
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export function apiGetSections(): Promise<ApiResponse<SectionData[]>> {
  return request<SectionData[]>("/sections");
}
