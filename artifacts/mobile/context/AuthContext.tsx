import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";
import { apiLogin, apiRegister } from "@/services/api";

export interface User {
  id: string;
  name: string;
  email: string;
  studentId: string;
  joinedAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: string }>;
  signup: (
    name: string,
    email: string,
    password: string,
    studentId: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = "@intern_token";
const USER_KEY = "@intern_user_v2";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, []);

  async function loadSession() {
    try {
      const [storedToken, storedUser] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(USER_KEY),
      ]);
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser) as User);
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  }

  async function saveSession(newToken: string, newUser: User) {
    await Promise.all([
      AsyncStorage.setItem(TOKEN_KEY, newToken),
      AsyncStorage.setItem(USER_KEY, JSON.stringify(newUser)),
    ]);
    setToken(newToken);
    setUser(newUser);
  }

  async function login(email: string, password: string): Promise<{ success: boolean; error?: string; role?: string }> {
    const result = await apiLogin(email, password);
    if ("error" in result && result.error) return { success: false, error: result.error };
    if (!("data" in result) || !result.data) return { success: false, error: "Login failed" };

    if (result.data.role === "admin") {
      if (Platform.OS === "web") {
        let adminUrl = "/admin/";
        if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
          adminUrl = "http://localhost:5173/admin/";
        } else if (process.env.EXPO_PUBLIC_ADMIN_URL) {
          adminUrl = process.env.EXPO_PUBLIC_ADMIN_URL;
        }
        window.location.href = `${adminUrl}${adminUrl.endsWith("/") ? "" : "/"}?token=${result.data.token}`;
      }
      return { success: true, role: "admin" };
    }

    if (!result.data.student) {
      return { success: false, error: "Student account details not returned." };
    }

    const u: User = {
      id: String(result.data.student.id),
      name: result.data.student.name,
      email: result.data.student.email,
      studentId: result.data.student.studentId,
      joinedAt: result.data.student.createdAt,
    };
    await saveSession(result.data.token, u);
    return { success: true, role: "student" };
  }

  async function signup(
    name: string,
    email: string,
    password: string,
    studentId: string,
  ): Promise<{ success: boolean; error?: string }> {
    const result = await apiRegister(name, email, password, studentId);
    if ("error" in result && result.error) return { success: false, error: result.error };
    if (!("data" in result) || !result.data) return { success: false, error: "Registration failed" };
    const u: User = {
      id: String(result.data.student.id),
      name: result.data.student.name,
      email: result.data.student.email,
      studentId: result.data.student.studentId,
      joinedAt: result.data.student.createdAt,
    };
    await saveSession(result.data.token, u);
    return { success: true };
  }

  async function logout() {
    await Promise.all([AsyncStorage.removeItem(TOKEN_KEY), AsyncStorage.removeItem(USER_KEY)]);
    setToken(null);
    setUser(null);
  }

  async function resetPassword(_email: string): Promise<{ success: boolean; error?: string }> {
    return { success: true };
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, signup, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
