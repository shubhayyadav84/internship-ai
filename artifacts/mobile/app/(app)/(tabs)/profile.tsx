import { useAuth } from "@/context/AuthContext";
import { useProgress } from "@/context/ProgressContext";
import { SECTIONS } from "@/data/courses";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { progress, getOverallProgress } = useProgress();
  const overallPct = getOverallProgress();

  const totalVideos = SECTIONS.reduce((a, s) => a + s.videos.length, 0);
  const watchedVideos = SECTIONS.reduce((a, s) => {
    return a + (progress[s.id]?.watchedVideos?.length ?? 0);
  }, 0);
  const certsEarned = SECTIONS.filter((s) => progress[s.id]?.certificateEarned).length;
  const quizPassed = SECTIONS.filter((s) => progress[s.id]?.quizPassed).length;

  function handleLogout() {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  }

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "IN";

  const joinDate = user?.joinedAt
    ? new Date(user.joinedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "";

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingBottom: 32,
      alignItems: "center",
    },
    headerLabel: {
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
      color: "#FFFFFF",
      alignSelf: "flex-start",
      marginBottom: 20,
    },
    avatarWrap: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    avatarText: {
      fontSize: 28,
      fontFamily: "Inter_700Bold",
      color: "#FFFFFF",
    },
    userName: {
      fontSize: 20,
      fontFamily: "Inter_700Bold",
      color: "#FFFFFF",
      marginBottom: 2,
    },
    userEmail: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: "rgba(255,255,255,0.7)",
      marginBottom: 4,
    },
    studentId: {
      fontSize: 12,
      fontFamily: "Inter_500Medium",
      color: "rgba(255,255,255,0.6)",
      backgroundColor: "rgba(255,255,255,0.1)",
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 20,
    },
    statsRow: {
      flexDirection: "row",
      marginHorizontal: 16,
      marginTop: -20,
      backgroundColor: colors.card,
      borderRadius: 16,
      padding: 16,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
      gap: 0,
    },
    statItem: {
      flex: 1,
      alignItems: "center",
    },
    statDivider: {
      width: 1,
      backgroundColor: colors.border,
      marginVertical: 4,
    },
    statValue: {
      fontSize: 22,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      marginBottom: 2,
    },
    statLabel: {
      fontSize: 11,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
    },
    body: {
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: Platform.OS === "web" ? 120 : 100,
    },
    sectionHeading: {
      fontSize: 11,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      letterSpacing: 0.8,
      textTransform: "uppercase",
      marginBottom: 12,
      marginTop: 8,
    },
    certCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 1,
    },
    certIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: "#FEF3C7",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    certTitle: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      marginBottom: 2,
    },
    certDate: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    viewBtn: {
      marginLeft: "auto" as any,
      backgroundColor: colors.primaryLight,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    viewBtnText: {
      fontSize: 12,
      fontFamily: "Inter_600SemiBold",
      color: colors.primary,
    },
    noCertText: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
      paddingVertical: 16,
    },
    menuCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      marginBottom: 12,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 1,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      gap: 12,
    },
    menuItemBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    menuIconWrap: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: colors.muted,
      alignItems: "center",
      justifyContent: "center",
    },
    menuText: {
      flex: 1,
      fontSize: 14,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
    },
    menuTextDanger: {
      color: colors.destructive,
    },
    joinedText: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
      marginTop: 16,
    },
  });

  const earnedSections = SECTIONS.filter((s) => progress[s.id]?.certificateEarned);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 16) }]}>
        <Text style={styles.headerLabel}>My Profile</Text>
        <View style={styles.avatarWrap}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <Text style={styles.studentId}>ID: {user?.studentId}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{watchedVideos}</Text>
          <Text style={styles.statLabel}>Videos{"\n"}Watched</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{quizPassed}</Text>
          <Text style={styles.statLabel}>Quizzes{"\n"}Passed</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.accent }]}>{certsEarned}</Text>
          <Text style={styles.statLabel}>Certificates{"\n"}Earned</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionHeading}>My Certificates</Text>

        {earnedSections.length === 0 ? (
          <Text style={styles.noCertText}>
            Complete all videos and pass the MCQ test to earn certificates.
          </Text>
        ) : (
          earnedSections.map((sec) => {
            const p = progress[sec.id];
            const dateStr = p?.certificateDate
              ? new Date(p.certificateDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
              : "";
            return (
              <View key={sec.id} style={styles.certCard}>
                <View style={styles.certIconWrap}>
                  <Feather name="award" size={20} color={colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.certTitle}>{sec.fullTitle}</Text>
                  <Text style={styles.certDate}>Awarded {dateStr}</Text>
                </View>
                <TouchableOpacity
                  style={styles.viewBtn}
                  onPress={() => router.push(`/(app)/certificate/${sec.id}`)}
                >
                  <Text style={styles.viewBtnText}>View</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}

        <Text style={[styles.sectionHeading, { marginTop: 16 }]}>Account</Text>

        <View style={styles.menuCard}>
          <TouchableOpacity style={[styles.menuItem, styles.menuItemBorder]} activeOpacity={0.7}>
            <View style={styles.menuIconWrap}>
              <Feather name="user" size={16} color={colors.mutedForeground} />
            </View>
            <Text style={styles.menuText}>Edit Profile</Text>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, styles.menuItemBorder]} activeOpacity={0.7}>
            <View style={styles.menuIconWrap}>
              <Feather name="bar-chart-2" size={16} color={colors.mutedForeground} />
            </View>
            <Text style={styles.menuText}>My Progress</Text>
            <Text style={{ fontSize: 13, color: colors.primary, fontFamily: "Inter_600SemiBold" }}>
              {Math.round(overallPct * 100)}%
            </Text>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} style={{ marginLeft: 4 }} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleLogout} activeOpacity={0.7}>
            <View style={[styles.menuIconWrap, { backgroundColor: "#FEF2F2" }]}>
              <Feather name="log-out" size={16} color={colors.destructive} />
            </View>
            <Text style={[styles.menuText, styles.menuTextDanger]}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {!!joinDate && (
          <Text style={styles.joinedText}>Member since {joinDate}</Text>
        )}
      </ScrollView>
    </View>
  );
}
