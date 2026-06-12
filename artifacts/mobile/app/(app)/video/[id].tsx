import { useProgress } from "@/context/ProgressContext";
import { useContent } from "@/context/ContentContext";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";
import { Video, ResizeMode, type AVPlaybackStatus } from "expo-av";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
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
  const { getVideoById } = useContent();
  const video = getVideoById(sectionId, id);
  const { isVideoWatched, markVideoWatched } = useProgress();
  const [marking, setMarking] = useState(false);
  const videoRef = useRef<Video>(null);

  const watched = video ? isVideoWatched(sectionId, video.id) : false;

  if (!video) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  async function handleMarkWatched() {
    if (watched || marking) return;
    setMarking(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await markVideoWatched(sectionId, video!.id);
    setMarking(false);
  }

  function handlePlaybackStatusUpdate(status: AVPlaybackStatus) {
    if (status.isLoaded && status.didJustFinish && !watched) {
      void handleMarkWatched();
    }
  }

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#000" },
    playerWrap: {
      width: "100%",
      aspectRatio: 16 / 9,
      backgroundColor: "#000",
    },
    player: { flex: 1 },
    noVideoWrap: {
      width: "100%",
      aspectRatio: 16 / 9,
      backgroundColor: "#0F172A",
      alignItems: "center",
      justifyContent: "center",
    },
    noVideoText: {
      color: "rgba(255,255,255,0.5)",
      fontFamily: "Inter_400Regular",
      fontSize: 14,
      marginTop: 12,
    },
    scrollBody: {
      backgroundColor: colors.background,
      padding: 16,
      paddingBottom: Platform.OS === "web" ? 80 : 40,
    },
    header: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingBottom: 16,
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
    markBtn: {
      marginTop: 20,
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
  });

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 12) }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Feather name="arrow-left" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={2}>{video.title}</Text>
      </View>

      <View style={styles.playerWrap}>
        {video.videoUrl ? (
          <Video
            ref={videoRef}
            source={{ uri: video.videoUrl }}
            style={styles.player}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
          />
        ) : (
          <View style={styles.noVideoWrap}>
            <Feather name="video-off" size={40} color="rgba(255,255,255,0.3)" />
            <Text style={styles.noVideoText}>No video uploaded yet</Text>
          </View>
        )}
      </View>

      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={styles.scrollBody}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.videoTitle}>{video.title}</Text>

        <View style={styles.infoRow}>
          {video.duration ? (
            <View style={styles.chip}>
              <Feather name="clock" size={12} color={colors.mutedForeground} />
              <Text style={styles.chipText}>{video.duration}</Text>
            </View>
          ) : null}
          {watched && (
            <View style={[styles.chip, { backgroundColor: colors.successLight }]}>
              <Feather name="check-circle" size={12} color={colors.success} />
              <Text style={[styles.chipText, { color: colors.success }]}>Watched</Text>
            </View>
          )}
        </View>

        {video.description ? (
          <>
            <Text style={styles.descLabel}>About This Video</Text>
            <Text style={styles.descText}>{video.description}</Text>
          </>
        ) : null}

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
      </ScrollView>
    </View>
  );
}
