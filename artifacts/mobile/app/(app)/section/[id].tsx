import { useContent } from "@/context/ContentContext";
import { useProgress } from "@/context/ProgressContext";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SectionScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getSectionById } = useContent();
  const section = getSectionById(id);
  const { progress, areAllVideosWatched } = useProgress();

  if (!section) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const sectionProgress = progress[section.id];
  const watchedVideos = sectionProgress?.watchedVideos ?? [];
  const allWatched = areAllVideosWatched(section.id, section.videos.length);
  const quizPassed = sectionProgress?.quizPassed ?? false;
  const quizScore = sectionProgress?.quizScore ?? null;
  const hasCert = sectionProgress?.certificateEarned ?? false;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      backgroundColor: section.color,
      paddingHorizontal: 20,
      paddingBottom: 28,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(255,255,255,0.2)",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    headerTitle: {
      fontSize: 24,
      fontFamily: "Inter_700Bold",
      color: "#FFFFFF",
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: "rgba(255,255,255,0.8)",
      marginBottom: 16,
    },
    progressChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: "rgba(255,255,255,0.2)",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      alignSelf: "flex-start",
    },
    progressChipText: {
      fontSize: 12,
      fontFamily: "Inter_600SemiBold",
      color: "#FFFFFF",
    },
    body: {
      padding: 16,
      paddingBottom: Platform.OS === "web" ? 80 : 40,
    },
    sectionLabel: {
      fontSize: 11,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      letterSpacing: 0.8,
      textTransform: "uppercase",
      marginBottom: 12,
    },
    videoCard: {
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      marginBottom: 10,
      flexDirection: "row",
      alignItems: "center",
      padding: 14,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 1,
    },
    videoNumWrap: {
      width: 40,
      height: 40,
      borderRadius: 10,
      backgroundColor: section.color + "18",
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
    },
    videoNum: {
      fontSize: 14,
      fontFamily: "Inter_700Bold",
      color: section.color,
    },
    videoTitle: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      marginBottom: 3,
      flex: 1,
    },
    videoDuration: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
    },
    videoWatchedBadge: {
      marginLeft: 8,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.successLight,
      alignItems: "center",
      justifyContent: "center",
    },
    quizCard: {
      borderRadius: colors.radius,
      padding: 18,
      marginTop: 8,
    },
    quizCardLocked: {
      backgroundColor: colors.muted,
    },
    quizCardUnlocked: {
      backgroundColor: section.color,
    },
    quizTitle: {
      fontSize: 15,
      fontFamily: "Inter_700Bold",
      marginBottom: 4,
    },
    quizDesc: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      lineHeight: 18,
      marginBottom: 12,
    },
    quizBtn: {
      backgroundColor: "rgba(255,255,255,0.25)",
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 8,
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    quizBtnText: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: "#FFFFFF",
    },
    certCard: {
      backgroundColor: "#FEF3C7",
      borderRadius: colors.radius,
      padding: 18,
      flexDirection: "row",
      alignItems: "center",
      marginTop: 10,
      gap: 14,
    },
    certTitle: {
      fontSize: 14,
      fontFamily: "Inter_700Bold",
      color: "#92400E",
      marginBottom: 2,
    },
    certDesc: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: "#B45309",
    },
    certBtn: {
      marginLeft: "auto" as any,
      backgroundColor: colors.accent,
      borderRadius: 8,
      paddingHorizontal: 14,
      paddingVertical: 7,
    },
    certBtnText: {
      fontSize: 12,
      fontFamily: "Inter_600SemiBold",
      color: "#FFFFFF",
    },
    noVideosBox: {
      backgroundColor: colors.muted,
      borderRadius: colors.radius,
      padding: 18,
      alignItems: "center",
      gap: 8,
    },
    noVideosText: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
    },
  });

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 12) }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{section.title}</Text>
        <Text style={styles.headerSubtitle}>{section.fullTitle}</Text>
        <View style={styles.progressChip}>
          <Feather name="play-circle" size={14} color="#FFFFFF" />
          <Text style={styles.progressChipText}>
            {watchedVideos.length}/{section.videos.length} videos watched
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionLabel}>Course Videos</Text>

        {section.videos.length === 0 ? (
          <View style={styles.noVideosBox}>
            <Feather name="video-off" size={24} color={colors.mutedForeground} />
            <Text style={styles.noVideosText}>No videos uploaded yet for this section.</Text>
          </View>
        ) : (
          section.videos.map((video, index) => {
            const watched = watchedVideos.includes(video.id);
            return (
              <TouchableOpacity
                key={video.id}
                style={styles.videoCard}
                onPress={() => router.push(`/(app)/video/${video.id}?sectionId=${section.id}`)}
                activeOpacity={0.85}
              >
                <View style={styles.videoNumWrap}>
                  <Feather name="play" size={16} color={section.color} style={{ marginLeft: 2 }} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.videoTitle} numberOfLines={2}>{video.title}</Text>
                  {video.duration ? (
                    <Text style={styles.videoDuration}>
                      <Feather name="clock" size={11} color={colors.mutedForeground} /> {video.duration}
                    </Text>
                  ) : null}
                </View>
                {watched ? (
                  <View style={styles.videoWatchedBadge}>
                    <Feather name="check" size={13} color={colors.success} />
                  </View>
                ) : (
                  <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
                )}
              </TouchableOpacity>
            );
          })
        )}

        <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Assessment</Text>

        {section.quiz.length === 0 || !allWatched ? (
          <View style={[styles.quizCard, styles.quizCardLocked]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <Feather name="lock" size={16} color={colors.mutedForeground} />
              <Text style={[styles.quizTitle, { color: colors.mutedForeground }]}>MCQ Test Locked</Text>
            </View>
            <Text style={[styles.quizDesc, { color: colors.mutedForeground }]}>
              {section.videos.length === 0
                ? "No videos are available for this section yet."
                : `Watch all ${section.videos.length} videos in this section to unlock the MCQ test.`}
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.quizCard, styles.quizCardUnlocked]}
            onPress={() => router.push(`/(app)/quiz/${section.id}`)}
            activeOpacity={0.88}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Feather name={quizPassed ? "check-circle" : "help-circle"} size={18} color="#FFFFFF" />
              <Text style={[styles.quizTitle, { color: "#FFFFFF" }]}>
                {quizPassed ? "MCQ Test Completed" : "MCQ Test Unlocked"}
              </Text>
            </View>
            <Text style={[styles.quizDesc, { color: "rgba(255,255,255,0.85)" }]}>
              {quizPassed
                ? `You scored ${quizScore}/${section.quiz.length}. Tap to retake.`
                : `${section.quiz.length} multiple choice questions. Score 60% or more to earn your certificate.`}
            </Text>
            <View style={styles.quizBtn}>
              <Feather name="edit-3" size={14} color="#FFFFFF" />
              <Text style={styles.quizBtnText}>{quizPassed ? "Retake Test" : "Start Test"}</Text>
            </View>
          </TouchableOpacity>
        )}

        {hasCert && (
          <View style={styles.certCard}>
            <Feather name="award" size={28} color={colors.accent} />
            <View style={{ flex: 1 }}>
              <Text style={styles.certTitle}>Certificate Earned!</Text>
              <Text style={styles.certDesc}>You have completed this training module.</Text>
            </View>
            <TouchableOpacity
              style={styles.certBtn}
              onPress={() => router.push(`/(app)/certificate/${section.id}`)}
            >
              <Text style={styles.certBtnText}>View</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
