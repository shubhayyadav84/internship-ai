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
  const { getVideoById, getSectionById } = useContent();
  const video = getVideoById(sectionId, id);
  const section = getSectionById(sectionId);
  const { isVideoWatched, markVideoWatched } = useProgress();
  const [marking, setMarking] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const videoRef = useRef<Video>(null);

  const watched = video ? isVideoWatched(sectionId, video.id) : false;

  if (!video) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#090D16" }}>
        <ActivityIndicator color="#00A0F0" />
      </View>
    );
  }

  const videos = section?.videos ?? [];
  const currentIdx = videos.findIndex((v) => v.id === video.id);
  const nextVideo = currentIdx !== -1 && currentIdx < videos.length - 1 ? videos[currentIdx + 1] : null;

  async function handleMarkWatched() {
    if (watched || marking) return;
    setMarking(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await markVideoWatched(sectionId, video!.id);
    setMarking(false);
  }

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace({ pathname: "/(app)/section/[id]", params: { id: sectionId } });
    }
  }

  async function handleReplay() {
    if (videoRef.current) {
      try {
        await videoRef.current.setStatusAsync({
          positionMillis: 0,
          shouldPlay: true,
        });
      } catch (err) {
        console.warn("Replay failed via setStatusAsync:", err);
        try {
          const videoElement = (videoRef.current as any)._video || (videoRef.current as any).video;
          if (videoElement) {
            videoElement.currentTime = 0;
            videoElement.play();
          }
        } catch (webErr) {
          console.warn("HTML5 video playback fallback failed:", webErr);
        }
      }
    }
  }

  function handlePlaybackStatusUpdate(status: AVPlaybackStatus) {
    if (status.isLoaded && status.didJustFinish && !watched) {
      void handleMarkWatched();
    }
  }

  const styles = StyleSheet.create({
    container: { 
      flex: 1, 
      backgroundColor: "#090D16" 
    },

    backBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.15)",
    },
    playerWrap: {
      width: "100%",
      aspectRatio: 16 / 9,
      backgroundColor: "#000",
    },
    player: { 
      flex: 1 
    },
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
      paddingBottom: Platform.OS === "web" ? 80 : 40,
    },
    contentContainer: {
      width: "100%",
      maxWidth: 850,
      alignSelf: "center",
      padding: 20,
    },
    sectionBranding: {
      fontSize: 11,
      fontFamily: "Inter_700Bold",
      color: "#00A0F0",
      letterSpacing: 1.5,
      marginBottom: 6,
    },
    videoTitle: {
      fontSize: 28,
      fontFamily: "Inter_700Bold",
      color: "#FFFFFF",
      marginBottom: 16,
      lineHeight: 34,
    },
    actionRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
      marginBottom: 20,
    },
    actionBtn: {
      height: 48,
      borderRadius: 24,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 18,
      gap: 8,
    },
    actionBtnPrimary: {
      backgroundColor: "#00A0F0",
      flexGrow: 1,
      minWidth: 140,
    },
    actionBtnPrimaryText: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: "#FFFFFF",
    },
    actionBtnSecondary: {
      backgroundColor: "rgba(255, 255, 255, 0.08)",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.15)",
    },
    actionBtnSecondaryText: {
      fontSize: 13,
      fontFamily: "Inter_500Medium",
      color: "#FFFFFF",
    },
    actionBtnSuccess: {
      borderColor: "rgba(16, 185, 129, 0.3)",
      backgroundColor: "rgba(16, 185, 129, 0.05)",
    },
    actionBtnLiked: {
      borderColor: "rgba(245, 158, 11, 0.3)",
      backgroundColor: "rgba(245, 158, 11, 0.05)",
    },
    infoBadgeRow: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 24,
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: "rgba(255, 255, 255, 0.06)",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.1)",
    },
    badgeText: {
      fontSize: 12,
      fontFamily: "Inter_600SemiBold",
      color: "#94A3B8",
    },
    descriptionContainer: {
      marginBottom: 28,
      borderTopWidth: 1,
      borderTopColor: "rgba(255, 255, 255, 0.06)",
      paddingTop: 16,
    },
    descLabel: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: "#FFFFFF",
      marginBottom: 8,
    },
    descText: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: "#94A3B8",
      lineHeight: 22,
    },
    recommendationContainer: {
      borderTopWidth: 1,
      borderTopColor: "rgba(255, 255, 255, 0.06)",
      paddingTop: 20,
    },
    recLabel: {
      fontSize: 16,
      fontFamily: "Inter_700Bold",
      color: "#FFFFFF",
      marginBottom: 14,
    },
    recCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255, 255, 255, 0.03)",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.06)",
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
      gap: 12,
    },
    recImagePlaceholder: {
      width: 56,
      height: 56,
      borderRadius: 8,
      backgroundColor: "rgba(255, 255, 255, 0.05)",
      alignItems: "center",
      justifyContent: "center",
    },
    recContent: {
      flex: 1,
    },
    recBadgeText: {
      fontSize: 10,
      fontFamily: "Inter_700Bold",
      color: "#00A0F0",
      letterSpacing: 1,
      marginBottom: 2,
    },
    recTitle: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: "#FFFFFF",
      marginBottom: 2,
    },
    recDesc: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: "#94A3B8",
    },
  });

  return (
    <View style={styles.container}>
      {/* ScrollView wraps everything (Player + Content) to allow page-level scrolling */}
      <ScrollView
        style={{ flex: 1, backgroundColor: "#0B0F19" }}
        contentContainerStyle={styles.scrollBody}
        showsVerticalScrollIndicator={true}
      >
        {/* Video Player - stretches full width */}
        <View style={styles.playerWrap}>
          {video.videoUrl ? (
            <Video
              ref={videoRef}
              source={{ uri: video.videoUrl }}
              style={styles.player}
              videoStyle={{ width: "100%", height: "100%" }}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
              playsInSilentModeIOS
              playThroughEarpieceAndroid={false}
            />
          ) : (
            <View style={styles.noVideoWrap}>
              <Feather name="video-off" size={40} color="rgba(255,255,255,0.3)" />
              <Text style={styles.noVideoText}>No video uploaded yet</Text>
            </View>
          )}
        </View>

        {/* Content Container - centered at 850px max-width */}
        <View style={styles.contentContainer}>
          {/* Section Branding Tag */}
          <Text style={styles.sectionBranding}>
            {section?.title ? section.title.toUpperCase() : "TRAINING MODULE"}
          </Text>

          {/* Large Title */}
          <Text style={styles.videoTitle}>{video.title}</Text>

          {/* Horizontal Action Row */}
          <View style={styles.actionRow}>
            {/* Play/Replay Button */}
            <TouchableOpacity 
              style={[styles.actionBtn, styles.actionBtnPrimary]} 
              onPress={watched ? handleReplay : handleMarkWatched}
              activeOpacity={0.8}
            >
              <Feather name={watched ? "rotate-ccw" : "play"} size={18} color="#FFFFFF" />
              <Text style={styles.actionBtnPrimaryText}>
                {watched ? "Watch Again" : "Play Video"}
              </Text>
            </TouchableOpacity>

            {/* Status Button (Mark Watched / Completed) */}
            <TouchableOpacity 
              style={[styles.actionBtn, styles.actionBtnSecondary, watched && styles.actionBtnSuccess]} 
              onPress={watched ? undefined : handleMarkWatched}
              disabled={watched || marking}
              activeOpacity={0.7}
            >
              {marking ? (
                <ActivityIndicator color={watched ? "#10B981" : "#FFFFFF"} size="small" />
              ) : (
                <>
                  <Feather name={watched ? "check-circle" : "circle"} size={18} color={watched ? "#10B981" : "#FFFFFF"} />
                  <Text style={[styles.actionBtnSecondaryText, watched && { color: "#10B981" }]}>
                    {watched ? "Completed" : "Mark Watched"}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Like Button */}
            <TouchableOpacity 
              style={[styles.actionBtn, styles.actionBtnSecondary, isLiked && styles.actionBtnLiked]} 
              onPress={() => {
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setIsLiked(!isLiked);
              }}
              activeOpacity={0.7}
            >
              <Feather name="thumbs-up" size={18} color={isLiked ? "#F59E0B" : "#FFFFFF"} />
              <Text style={[styles.actionBtnSecondaryText, isLiked && { color: "#F59E0B" }]}>
                {isLiked ? "Liked" : "Like"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Info Badges */}
          <View style={styles.infoBadgeRow}>
            {video.duration ? (
              <View style={styles.badge}>
                <Feather name="clock" size={12} color="#94A3B8" />
                <Text style={styles.badgeText}>{video.duration}</Text>
              </View>
            ) : null}
            <View style={styles.badge}>
              <Text style={styles.badgeText}>HD</Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>English</Text>
            </View>
          </View>

          {/* Description */}
          {video.description ? (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descLabel}>Description</Text>
              <Text style={styles.descText}>{video.description}</Text>
            </View>
          ) : null}

          {/* Up Next & Quiz Recommendations */}
          <View style={styles.recommendationContainer}>
            <Text style={styles.recLabel}>Recommendations & Next Steps</Text>
            
            {nextVideo && (
              <TouchableOpacity
                style={styles.recCard}
                onPress={() => router.replace({ pathname: "/(app)/video/[id]", params: { id: nextVideo.id, sectionId } })}
                activeOpacity={0.85}
              >
                <View style={styles.recImagePlaceholder}>
                  <Feather name="play" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.recContent}>
                  <Text style={styles.recBadgeText}>UP NEXT</Text>
                  <Text style={styles.recTitle} numberOfLines={1}>{nextVideo.title}</Text>
                  <Text style={styles.recDesc}>{nextVideo.duration || "Training Video"}</Text>
                </View>
                <Feather name="chevron-right" size={20} color="#94A3B8" style={{ marginLeft: "auto" }} />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.recCard, { borderColor: colors.accent + "40" }]}
              onPress={() => router.push({ pathname: "/(app)/quiz/[sectionId]", params: { sectionId } })}
              activeOpacity={0.85}
            >
              <View style={[styles.recImagePlaceholder, { backgroundColor: colors.accent + "20" }]}>
                <Feather name="edit-3" size={20} color={colors.accent} />
              </View>
              <View style={styles.recContent}>
                <Text style={[styles.recBadgeText, { color: colors.accent }]}>ASSESSMENT</Text>
                <Text style={styles.recTitle} numberOfLines={1}>Module MCQ Test</Text>
                <Text style={styles.recDesc}>Test your knowledge and earn a certificate</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#94A3B8" style={{ marginLeft: "auto" }} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Absolute floating Back Button - placed directly in root to prevent click blocking */}
      <TouchableOpacity 
        style={[
          styles.backBtn, 
          { 
            position: "absolute",
            top: insets.top + (Platform.OS === "web" ? 20 : 12),
            left: Platform.OS === "web" ? "max(20px, calc(50% - 405px))" as any : 20,
            zIndex: 999 
          }
        ]} 
        onPress={handleBack}
        activeOpacity={0.7}
      >
        <Feather name="arrow-left" size={22} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}
