import { useProgress } from "@/context/ProgressContext";
import { getVideoById } from "@/data/courses";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useState } from "react";
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

export default function VideoScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id, sectionId } = useLocalSearchParams<{ id: string; sectionId: string }>();
  const video = getVideoById(sectionId, id);
  const { isVideoWatched, markVideoWatched } = useProgress();
  const [marking, setMarking] = useState(false);
  const [opened, setOpened] = useState(false);

  const watched = video ? isVideoWatched(sectionId, video.id) : false;

  if (!video) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <Text style={{ color: colors.mutedForeground, fontFamily: "Inter_400Regular" }}>Video not found.</Text>
      </View>
    );
  }

  async function handleOpenVideo() {
    setOpened(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await WebBrowser.openBrowserAsync(`https://www.youtube.com/watch?v=${video!.youtubeId}`, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
    });
  }

  async function handleMarkWatched() {
    setMarking(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await markVideoWatched(sectionId, video!.id);
    setMarking(false);
  }

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingBottom: 24,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(255,255,255,0.15)",
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      flex: 1,
      fontSize: 16,
      fontFamily: "Inter_600SemiBold",
      color: "#FFFFFF",
    },
    videoThumb: {
      marginHorizontal: 16,
      marginTop: 16,
      borderRadius: 16,
      backgroundColor: "#0F172A",
      height: 200,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      position: "relative" as any,
    },
    thumbOverlay: {
      position: "absolute" as any,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.4)",
      alignItems: "center",
      justifyContent: "center",
    },
    playBtn: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: "rgba(255,255,255,0.9)",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    youtubeLabel: {
      marginTop: 10,
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: "rgba(255,255,255,0.6)",
    },
    durationChip: {
      position: "absolute" as any,
      bottom: 12,
      right: 12,
      backgroundColor: "rgba(0,0,0,0.7)",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    durationText: {
      color: "#FFFFFF",
      fontSize: 12,
      fontFamily: "Inter_600SemiBold",
    },
    body: {
      padding: 16,
      paddingBottom: Platform.OS === "web" ? 80 : 40,
    },
    videoTitle: {
      fontSize: 18,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
      marginBottom: 8,
    },
    descLabel: {
      fontSize: 11,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 8,
      marginTop: 16,
    },
    descText: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      lineHeight: 21,
    },
    openBtn: {
      marginTop: 24,
      backgroundColor: "#FF0000",
      borderRadius: colors.radius,
      height: 52,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    openBtnText: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: "#FFFFFF",
    },
    markBtn: {
      marginTop: 12,
      borderRadius: colors.radius,
      height: 52,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
    },
    markBtnWatched: {
      backgroundColor: colors.successLight,
    },
    markBtnUnwatched: {
      backgroundColor: colors.primary,
    },
    markBtnText: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
    },
    infoRow: {
      flexDirection: "row",
      gap: 10,
      marginTop: 8,
    },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: colors.muted,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
    },
    chipText: {
      fontSize: 12,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
    },
    noteBox: {
      backgroundColor: "#EFF6FF",
      borderRadius: 10,
      padding: 14,
      marginTop: 20,
      flexDirection: "row",
      gap: 10,
      alignItems: "flex-start",
    },
    noteText: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: "#1E40AF",
      lineHeight: 18,
      flex: 1,
    },
  });

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 12) }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={2}>{video.title}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.videoThumb} onPress={handleOpenVideo} activeOpacity={0.9}>
          <View style={{ alignItems: "center" }}>
            <View style={styles.playBtn}>
              <Feather name="play" size={26} color="#FF0000" style={{ marginLeft: 3 }} />
            </View>
            <Text style={styles.youtubeLabel}>Tap to watch on YouTube</Text>
          </View>
          <View style={styles.durationChip}>
            <Text style={styles.durationText}>{video.duration}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.body}>
          <Text style={styles.videoTitle}>{video.title}</Text>

          <View style={styles.infoRow}>
            <View style={styles.chip}>
              <Feather name="clock" size={12} color={colors.mutedForeground} />
              <Text style={styles.chipText}>{video.duration}</Text>
            </View>
            {watched && (
              <View style={[styles.chip, { backgroundColor: colors.successLight }]}>
                <Feather name="check-circle" size={12} color={colors.success} />
                <Text style={[styles.chipText, { color: colors.success }]}>Watched</Text>
              </View>
            )}
          </View>

          <Text style={styles.descLabel}>About This Video</Text>
          <Text style={styles.descText}>{video.description}</Text>

          {opened && !watched && (
            <View style={styles.noteBox}>
              <Feather name="info" size={16} color="#1E40AF" />
              <Text style={styles.noteText}>
                Once you have finished watching the video in YouTube, come back here and tap "Mark as Watched" to record your progress.
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.openBtn}
            onPress={handleOpenVideo}
            activeOpacity={0.88}
          >
            <Feather name="youtube" size={20} color="#FFFFFF" />
            <Text style={styles.openBtnText}>Watch Video</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.markBtn,
              watched ? styles.markBtnWatched : styles.markBtnUnwatched,
            ]}
            onPress={watched ? undefined : handleMarkWatched}
            disabled={watched || marking}
            activeOpacity={watched ? 1 : 0.85}
          >
            {marking ? (
              <ActivityIndicator color={watched ? colors.success : "#FFFFFF"} />
            ) : (
              <>
                <Feather
                  name={watched ? "check-circle" : "circle"}
                  size={18}
                  color={watched ? colors.success : "#FFFFFF"}
                />
                <Text style={[styles.markBtnText, { color: watched ? colors.success : "#FFFFFF" }]}>
                  {watched ? "Watched" : "Mark as Watched"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
