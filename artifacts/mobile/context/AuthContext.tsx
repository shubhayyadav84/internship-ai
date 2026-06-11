import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  studentId: string;
  joinedAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string, studentId: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const USERS_KEY = "@intern_users";
const CURRENT_USER_KEY = "@intern_current_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCurrentUser();
  }, []);

  async function loadCurrentUser() {
    try {
      const raw = await AsyncStorage.getItem(CURRENT_USER_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
    } finally {
      setIsLoading(false);
    }
  }

  async function getUsers(): Promise<Record<string, { user: User; password: string }>> {
    try {
      const raw = await AsyncStorage.getItem(USERS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  async function saveUsers(users: Record<string, { user: User; password: string }>) {
    await AsyncStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    const users = await getUsers();
    const key = email.toLowerCase().trim();
    const entry = users[key];
    if (!entry) return { success: false, error: "No account found with this email." };
    if (entry.password !== password) return { success: false, error: "Incorrect password." };
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(entry.user));
    setUser(entry.user);
    return { success: true };
  }

  async function signup(
    name: string,
    email: string,
    password: string,
    studentId: string
  ): Promise<{ success: boolean; error?: string }> {
    const users = await getUsers();
    const key = email.toLowerCase().trim();
    if (users[key]) return { success: false, error: "An account with this email already exists." };
    const newUser: User = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      studentId: studentId.trim(),
      joinedAt: new Date().toISOString(),
    };
    users[key] = { user: newUser, password };
    await saveUsers(users);
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    setUser(newUser);
    return { success: true };
  }

  async function logout() {
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
    setUser(null);
  }

  async function resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    const users = await getUsers();
    const key = email.toLowerCase().trim();
    if (!users[key]) return { success: false, error: "No account found with this email." };
    return { success: true };
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
