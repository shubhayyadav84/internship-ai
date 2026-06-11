import { useAuth } from "@/context/AuthContext";
import { useProgress } from "@/context/ProgressContext";
import { getSectionById } from "@/data/courses";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import {
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CertificateScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { sectionId } = useLocalSearchParams<{ sectionId: string }>();
  const section = getSectionById(sectionId);
  const { user } = useAuth();
  const { progress } = useProgress();

  if (!section || !user) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: colors.mutedForeground }}>Certificate not found.</Text>
      </View>
    );
  }

  const sectionProgress = progress[sectionId];
  const certDate = sectionProgress?.certificateDate
    ? new Date(sectionProgress.certificateDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const quizScore = sectionProgress?.quizScore ?? 0;
  const totalQ = section.quiz.length;

  async function handleShare() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await Share.share({
      message: `I just completed the ${section!.fullTitle} training module on InternTrain and earned my certificate! Score: ${quizScore}/${totalQ}`,
      title: "InternTrain Certificate",
    });
  }

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingBottom: 20,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    closeBtn: {
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
    body: {
      padding: 16,
      paddingBottom: Platform.OS === "web" ? 80 : 40,
      alignItems: "center",
    },
    certWrap: {
      width: "100%",
      backgroundColor: "#FFFBF0",
      borderRadius: 20,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 20,
      elevation: 8,
      marginTop: 8,
      borderWidth: 1,
      borderColor: "#F3D083",
    },
    certTopBand: {
      backgroundColor: section.color,
      paddingVertical: 12,
      alignItems: "center",
    },
    certTopText: {
      fontSize: 11,
      fontFamily: "Inter_700Bold",
      color: "#FFFFFF",
      letterSpacing: 3,
      textTransform: "uppercase",
    },
    certContent: {
      padding: 28,
      alignItems: "center",
    },
    certLogoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 20,
    },
    certLogo: {
      fontSize: 15,
      fontFamily: "Inter_700Bold",
      color: colors.primary,
    },
    certBigTitle: {
      fontSize: 22,
      fontFamily: "Inter_700Bold",
      color: "#7C3509",
      textAlign: "center",
      marginBottom: 6,
    },
    certPresentedTo: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: "#B45309",
      letterSpacing: 0.5,
      textTransform: "uppercase",
      marginBottom: 10,
    },
    certName: {
      fontSize: 28,
      fontFamily: "Inter_700Bold",
      color: "#1A202C",
      textAlign: "center",
      marginBottom: 2,
    },
    certStudentId: {
      fontSize: 12,
      fontFamily: "Inter_500Medium",
      color: colors.mutedForeground,
      marginBottom: 20,
    },
    certDivider: {
      width: 60,
      height: 2,
      backgroundColor: colors.accent,
      borderRadius: 1,
      marginBottom: 20,
    },
    certCompletedText: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: "#92400E",
      textAlign: "center",
      lineHeight: 20,
      marginBottom: 6,
    },
    certModuleName: {
      fontSize: 17,
      fontFamily: "Inter_700Bold",
      color: section.color,
      textAlign: "center",
      marginBottom: 20,
    },
    certScoreRow: {
      flexDirection: "row",
      gap: 24,
      marginBottom: 24,
    },
    certScoreItem: {
      alignItems: "center",
    },
    certScoreValue: {
      fontSize: 22,
      fontFamily: "Inter_700Bold",
      color: colors.foreground,
    },
    certScoreLabel: {
      fontSize: 11,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    certBottomBand: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 24,
      paddingVertical: 14,
      backgroundColor: "#FEF3C7",
      borderTopWidth: 1,
      borderTopColor: "#F3D083",
    },
    certDateLabel: {
      fontSize: 11,
      fontFamily: "Inter_400Regular",
      color: "#B45309",
    },
    certDate: {
      fontSize: 13,
      fontFamily: "Inter_600SemiBold",
      color: "#92400E",
    },
    certSeal: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: section.color,
      alignItems: "center",
      justifyContent: "center",
    },
    shareBtn: {
      marginTop: 20,
      backgroundColor: section.color,
      borderRadius: colors.radius,
      height: 52,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      width: "100%",
    },
    shareBtnText: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: "#FFFFFF",
    },
    backBtn: {
      marginTop: 10,
      borderRadius: colors.radius,
      height: 52,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      width: "100%",
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    backBtnText: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
  });

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 12) }]}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Feather name="x" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Certificate of Completion</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.certWrap}>
          <View style={styles.certTopBand}>
            <Text style={styles.certTopText}>Certificate of Completion</Text>
          </View>

          <View style={styles.certContent}>
            <View style={styles.certLogoRow}>
              <Feather name="award" size={18} color={colors.primary} />
              <Text style={styles.certLogo}>InternTrain</Text>
            </View>

            <Text style={styles.certBigTitle}>This is to certify that</Text>
            <Text style={styles.certPresentedTo}>presented to</Text>
            <Text style={styles.certName}>{user.name}</Text>
            <Text style={styles.certStudentId}>Student ID: {user.studentId}</Text>

            <View style={styles.certDivider} />

            <Text style={styles.certCompletedText}>
              has successfully completed the training module
            </Text>
            <Text style={styles.certModuleName}>{section.fullTitle}</Text>

            <View style={styles.certScoreRow}>
              <View style={styles.certScoreItem}>
                <Text style={[styles.certScoreValue, { color: section.color }]}>
                  {Math.round((quizScore / totalQ) * 100)}%
                </Text>
                <Text style={styles.certScoreLabel}>Final Score</Text>
              </View>
              <View style={{ width: 1, backgroundColor: colors.border }} />
              <View style={styles.certScoreItem}>
                <Text style={[styles.certScoreValue, { color: colors.success }]}>
                  {quizScore}/{totalQ}
                </Text>
                <Text style={styles.certScoreLabel}>Correct</Text>
              </View>
            </View>
          </View>

          <View style={styles.certBottomBand}>
            <View>
              <Text style={styles.certDateLabel}>Date of Issue</Text>
              <Text style={styles.certDate}>{certDate}</Text>
            </View>
            <View style={styles.certSeal}>
              <Feather name="check" size={22} color="#FFFFFF" />
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.88}>
          <Feather name="share-2" size={18} color="#FFFFFF" />
          <Text style={styles.shareBtnText}>Share Certificate</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.85}>
          <Text style={styles.backBtnText}>Close</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
