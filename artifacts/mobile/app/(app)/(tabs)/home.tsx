import { useAuth } from "@/context/AuthContext";
import { useProgress } from "@/context/ProgressContext";
import { SECTIONS } from "@/data/courses";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function SectionCard({
  section,
  watchedCount,
  totalVideos,
  quizPassed,
  hasCert,
}: {
  section: (typeof SECTIONS)[0];
  watchedCount: number;
  totalVideos: number;
  quizPassed: boolean;
  hasCert: boolean;
}) {
  const colors = useColors();
  const pct = totalVideos > 0 ? watchedCount / totalVideos : 0;

  return (
    <TouchableOpacity
      onPress={() => router.push(`/(app)/section/${section.id}`)}
      activeOpacity={0.88}
      style={[styles(colors).sectionCard, { borderTopColor: section.color }]}
    >
      <View style={styles(colors).sectionCardInner}>
        <View style={[styles(colors).sectionIconWrap, { backgroundColor: section.color + "18" }]}>
          <Feather name={section.iconName as any} size={22} color={section.color} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles(colors).sectionCardHeader}>
            <Text style={styles(colors).sectionTitle}>{section.title}</Text>
            {hasCert && (
              <View style={styles(colors).certBadge}>
                <Feather name="award" size={12} color={colors.accent} />
                <Text style={styles(colors).certBadgeText}>Certified</Text>
              </View>
            )}
          </View>
          <Text style={styles(colors).sectionSubtitle}>{section.fullTitle}</Text>
          <Text style={styles(colors).sectionDesc} numberOfLines={2}>{section.description}</Text>

          <View style={styles(colors).progressRow}>
            <View style={styles(colors).progressBarBg}>
              <View style={[styles(colors).progressBarFill, { width: `${pct * 100}%` as any, backgroundColor: section.color }]} />
            </View>
            <Text style={styles(colors).progressText}>
              {watchedCount}/{totalVideos} videos
            </Text>
          </View>

          <View style={styles(colors).tagsRow}>
            <View style={[styles(colors).tag, { backgroundColor: section.color + "18" }]}>
              <Feather name="play-circle" size={12} color={section.color} />
              <Text style={[styles(colors).tagText, { color: section.color }]}>
                {totalVideos} Videos
              </Text>
            </View>
            <View style={[styles(colors).tag, quizPassed ? styles(colors).tagSuccess : styles(colors).tagMuted]}>
              <Feather name={quizPassed ? "check-circle" : "help-circle"} size={12} color={quizPassed ? colors.success : colors.mutedForeground} />
              <Text style={[styles(colors).tagText, { color: quizPassed ? colors.success : colors.mutedForeground }]}>
                {quizPassed ? "Quiz Passed" : "MCQ Test"}
              </Text>
            </View>
          </View>
        </View>
        <Feather name="chevron-right" size={18} color={colors.mutedForeground} style={{ alignSelf: "center" }} />
      </View>
    </TouchableOpacity>
  );
}

const styles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingBottom: 24,
    },
    headerTop: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    greeting: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: "rgba(255,255,255,0.7)",
      marginBottom: 2,
    },
    userName: {
      fontSize: 20,
      fontFamily: "Inter_700Bold",
      color: "#FFFFFF",
    },
    notifBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(255,255,255,0.15)",
      alignItems: "center",
      justifyContent: "center",
    },
    overallCard: {
      backgroundColor: "rgba(255,255,255,0.12)",
      borderRadius: 16,
      padding: 16,
    },
    overallLabel: {
      fontSize: 12,
      fontFamily: "Inter_500Medium",
      color: "rgba(255,255,255,0.7)",
      marginBottom: 6,
    },
    overallProgressRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    overallBar: {
      flex: 1,
      height: 6,
      borderRadius: 3,
      backgroundColor: "rgba(255,255,255,0.25)",
    },
    overallBarFill: {
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.accent,
    },
    overallPct: {
      fontSize: 14,
      fontFamily: "Inter_700Bold",
      color: "#FFFFFF",
    },
    body: {
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: Platform.OS === "web" ? 120 : 100,
    },
    sectionLabel: {
      fontSize: 11,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      letterSpacing: 0.8,
      textTransform: "uppercase",
      marginBottom: 12,
    },
    sectionCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      marginBottom: 14,
      borderTopWidth: 3,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    sectionCardInner: {
      flexDirection: "row",
      padding: 16,
      gap: 12,
      alignItems: "flex-start",
    },
    sectionIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    sectionCardHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 2,
    },
    sectionTitle: {
      fontSize: 16,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    certBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: "#FEF3C7",
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 20,
    },
    certBadgeText: {
      fontSize: 10,
      fontFamily: "Inter_600SemiBold",
      color: colors.accent,
    },
    sectionSubtitle: {
      fontSize: 11,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
      marginBottom: 6,
    },
    sectionDesc: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      lineHeight: 17,
      marginBottom: 10,
    },
    progressRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 10,
    },
    progressBarBg: {
      flex: 1,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.muted,
    },
    progressBarFill: {
      height: 4,
      borderRadius: 2,
    },
    progressText: {
      fontSize: 11,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
      minWidth: 60,
    },
    tagsRow: {
      flexDirection: "row",
      gap: 8,
    },
    tag: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 20,
    },
    tagSuccess: {
      backgroundColor: colors.successLight,
    },
    tagMuted: {
      backgroundColor: colors.muted,
    },
    tagText: {
      fontSize: 11,
      fontFamily: "Inter_500Medium",
    },
  });

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { progress, getOverallProgress } = useProgress();
  const overallPct = getOverallProgress();
  const s = styles(colors);

  const firstName = user?.name?.split(" ")[0] ?? "Intern";

  return (
    <View style={s.container}>
      <View style={[s.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 16) }]}>
        <View style={s.headerTop}>
          <View>
            <Text style={s.greeting}>Good day,</Text>
            <Text style={s.userName}>{firstName}</Text>
          </View>
          <View style={s.notifBtn}>
            <Feather name="bell" size={20} color="#FFFFFF" />
          </View>
        </View>

        <View style={s.overallCard}>
          <Text style={s.overallLabel}>OVERALL PROGRESS</Text>
          <View style={s.overallProgressRow}>
            <View style={s.overallBar}>
              <View style={[s.overallBarFill, { width: `${Math.round(overallPct * 100)}%` as any }]} />
            </View>
            <Text style={s.overallPct}>{Math.round(overallPct * 100)}%</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.body} showsVerticalScrollIndicator={false}>
        <Text style={s.sectionLabel}>Training Modules</Text>
        {SECTIONS.map((section) => {
          const p = progress[section.id];
          const watchedCount = p?.watchedVideos?.length ?? 0;
          const quizPassed = p?.quizPassed ?? false;
          const hasCert = p?.certificateEarned ?? false;
          return (
            <SectionCard
              key={section.id}
              section={section}
              watchedCount={watchedCount}
              totalVideos={section.videos.length}
              quizPassed={quizPassed}
              hasCert={hasCert}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}
