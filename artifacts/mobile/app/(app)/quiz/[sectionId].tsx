import { useProgress } from "@/context/ProgressContext";
import { useContent } from "@/context/ContentContext";
import { useColors } from "@/hooks/useColors";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
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

type Phase = "quiz" | "result";

export default function QuizScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { sectionId } = useLocalSearchParams<{ sectionId: string }>();
  const { getSectionById } = useContent();
  const section = getSectionById(sectionId);
  const { submitQuiz } = useProgress();

  const [phase, setPhase] = useState<Phase>("quiz");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [score, setScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (section && answers.length !== section.quiz.length) {
      setAnswers(new Array(section.quiz.length).fill(null));
    }
  }, [section]);

  if (!section || answers.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const question = section.quiz[currentQ];
  const totalQ = section.quiz.length;
  const PASS_SCORE = Math.ceil(totalQ * 0.6);

  function selectAnswer(index: number) {
    if (answers[currentQ] !== null) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = [...answers];
    updated[currentQ] = index;
    setAnswers(updated);
  }

  function goNext() {
    if (currentQ < totalQ - 1) {
      setCurrentQ((q) => q + 1);
    }
  }

  function goPrev() {
    if (currentQ > 0) setCurrentQ((q) => q - 1);
  }

  async function handleSubmit() {
    const correct = section!.quiz.filter((q, i) => answers[i] === q.correctIndex).length;
    setScore(correct);
    setSubmitting(true);
    await submitQuiz(sectionId, correct, totalQ);
    setSubmitting(false);
    await Haptics.notificationAsync(
      correct >= PASS_SCORE
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Error
    );
    setPhase("result");
  }

  const allAnswered = answers.every((a) => a !== null);
  const passed = score >= PASS_SCORE;

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: {
      backgroundColor: section.color,
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    headerTop: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 16,
    },
    closeBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(255,255,255,0.2)",
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      flex: 1,
      fontSize: 16,
      fontFamily: "Inter_700Bold",
      color: "#FFFFFF",
    },
    progressBar: {
      height: 6,
      borderRadius: 3,
      backgroundColor: "rgba(255,255,255,0.25)",
    },
    progressFill: {
      height: 6,
      borderRadius: 3,
      backgroundColor: "#FFFFFF",
    },
    progressLabel: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      color: "rgba(255,255,255,0.7)",
      marginTop: 6,
    },
    body: {
      padding: 16,
      paddingBottom: Platform.OS === "web" ? 80 : 40,
      flex: 1,
    },
    questionNum: {
      fontSize: 11,
      fontFamily: "Inter_600SemiBold",
      color: colors.mutedForeground,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 8,
      marginTop: 4,
    },
    questionText: {
      fontSize: 17,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
      lineHeight: 25,
      marginBottom: 20,
    },
    optionBtn: {
      borderRadius: colors.radius,
      borderWidth: 2,
      padding: 14,
      marginBottom: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    optionDefault: {
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    optionSelected: {
      borderColor: section.color,
      backgroundColor: section.color + "10",
    },
    optionCorrect: {
      borderColor: colors.success,
      backgroundColor: colors.successLight,
    },
    optionWrong: {
      borderColor: colors.destructive,
      backgroundColor: "#FEF2F2",
    },
    optionLetter: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.muted,
    },
    optionLetterSelected: {
      backgroundColor: section.color,
    },
    optionLetterCorrect: {
      backgroundColor: colors.success,
    },
    optionLetterWrong: {
      backgroundColor: colors.destructive,
    },
    optionLetterText: {
      fontSize: 12,
      fontFamily: "Inter_700Bold",
      color: colors.mutedForeground,
    },
    optionLetterTextSelected: {
      color: "#FFFFFF",
    },
    optionText: {
      flex: 1,
      fontSize: 14,
      fontFamily: "Inter_500Medium",
      color: colors.foreground,
    },
    explanationBox: {
      backgroundColor: "#EFF6FF",
      borderRadius: 10,
      padding: 14,
      marginBottom: 16,
      flexDirection: "row",
      gap: 10,
    },
    explanationText: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      color: "#1E40AF",
      lineHeight: 19,
      flex: 1,
    },
    navRow: {
      flexDirection: "row",
      gap: 10,
      marginTop: 16,
    },
    navBtn: {
      flex: 1,
      height: 48,
      borderRadius: colors.radius,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 6,
    },
    navBtnPrev: {
      backgroundColor: colors.muted,
    },
    navBtnNext: {
      backgroundColor: section.color,
    },
    navBtnDisabled: {
      opacity: 0.4,
    },
    navBtnText: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
    },
    submitBtn: {
      flex: 1,
      height: 48,
      borderRadius: colors.radius,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 6,
    },
    submitBtnText: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
      color: "#FFFFFF",
    },
    dotRow: {
      flexDirection: "row",
      gap: 6,
      justifyContent: "center",
      marginTop: 20,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    resultContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
    },
    resultIconCircle: {
      width: 96,
      height: 96,
      borderRadius: 48,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
    },
    resultTitle: {
      fontSize: 26,
      fontFamily: "Inter_700Bold",
      marginBottom: 8,
      textAlign: "center",
    },
    resultScore: {
      fontSize: 18,
      fontFamily: "Inter_600SemiBold",
      marginBottom: 6,
      textAlign: "center",
    },
    resultDesc: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      color: colors.mutedForeground,
      textAlign: "center",
      lineHeight: 20,
      marginBottom: 32,
    },
    resultBtns: {
      width: "100%",
      gap: 10,
    },
    resultPrimaryBtn: {
      height: 52,
      borderRadius: colors.radius,
      alignItems: "center",
      justifyContent: "center",
    },
    resultPrimaryBtnText: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: "#FFFFFF",
    },
    resultSecondaryBtn: {
      height: 52,
      borderRadius: colors.radius,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    resultSecondaryBtnText: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
      color: colors.foreground,
    },
  });

  const LETTERS = ["A", "B", "C", "D"];
  const selectedAnswer = answers[currentQ];
  const hasAnswered = selectedAnswer !== null;
  const isCorrect = hasAnswered && selectedAnswer === question.correctIndex;

  if (phase === "result") {
    return (
      <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) }]}>
        <View style={styles.resultContainer}>
          <View style={[styles.resultIconCircle, { backgroundColor: passed ? colors.successLight : "#FEF2F2" }]}>
            <Feather name={passed ? "award" : "x-circle"} size={44} color={passed ? colors.success : colors.destructive} />
          </View>
          <Text style={[styles.resultTitle, { color: passed ? colors.success : colors.destructive }]}>
            {passed ? "Congratulations!" : "Not Quite Yet"}
          </Text>
          <Text style={[styles.resultScore, { color: colors.foreground }]}>
            Score: {score} / {totalQ}
          </Text>
          <Text style={styles.resultDesc}>
            {passed
              ? `You passed with ${Math.round((score / totalQ) * 100)}%! Your certificate for ${section.title} has been unlocked.`
              : `You scored ${Math.round((score / totalQ) * 100)}%. You need at least 60% to pass. Review the videos and try again.`}
          </Text>

          <View style={styles.resultBtns}>
            {passed ? (
              <TouchableOpacity
                style={[styles.resultPrimaryBtn, { backgroundColor: colors.accent }]}
                onPress={() => {
                  router.replace(`/(app)/certificate/${sectionId}`);
                }}
              >
                <Text style={styles.resultPrimaryBtnText}>View Certificate</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.resultPrimaryBtn, { backgroundColor: section.color }]}
                onPress={() => {
                  setPhase("quiz");
                  setCurrentQ(0);
                  setAnswers(new Array(totalQ).fill(null));
                  setScore(0);
                }}
              >
                <Text style={styles.resultPrimaryBtnText}>Retry Quiz</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.resultSecondaryBtn}
              onPress={() => router.back()}
            >
              <Text style={styles.resultSecondaryBtnText}>Back to Section</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + (Platform.OS === "web" ? 67 : 0) }]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
            <Feather name="x" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{section.title} — MCQ Test</Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${((currentQ + 1) / totalQ) * 100}%` as any }]} />
        </View>
        <Text style={styles.progressLabel}>
          Question {currentQ + 1} of {totalQ}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.questionNum}>Question {currentQ + 1}</Text>
        <Text style={styles.questionText}>{question.question}</Text>

        {question.options.map((opt, i) => {
          const isSelectedOpt = selectedAnswer === i;
          const isCorrectOpt = i === question.correctIndex;
          const showCorrectState = hasAnswered && isCorrectOpt;
          const showWrongState = hasAnswered && isSelectedOpt && !isCorrectOpt;

          return (
            <TouchableOpacity
              key={i}
              style={[
                styles.optionBtn,
                showCorrectState
                  ? styles.optionCorrect
                  : showWrongState
                  ? styles.optionWrong
                  : isSelectedOpt
                  ? styles.optionSelected
                  : styles.optionDefault,
              ]}
              onPress={() => selectAnswer(i)}
              disabled={hasAnswered}
              activeOpacity={0.85}
            >
              <View
                style={[
                  styles.optionLetter,
                  showCorrectState
                    ? styles.optionLetterCorrect
                    : showWrongState
                    ? styles.optionLetterWrong
                    : isSelectedOpt
                    ? styles.optionLetterSelected
                    : {},
                ]}
              >
                <Text
                  style={[
                    styles.optionLetterText,
                    (showCorrectState || showWrongState || isSelectedOpt) && styles.optionLetterTextSelected,
                  ]}
                >
                  {LETTERS[i]}
                </Text>
              </View>
              <Text style={styles.optionText}>{opt}</Text>
              {showCorrectState && <Feather name="check-circle" size={18} color={colors.success} />}
              {showWrongState && <Feather name="x-circle" size={18} color={colors.destructive} />}
            </TouchableOpacity>
          );
        })}

        {hasAnswered && (
          <View style={styles.explanationBox}>
            <Feather name="info" size={16} color="#1E40AF" />
            <Text style={styles.explanationText}>{question.explanation}</Text>
          </View>
        )}

        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navBtn, styles.navBtnPrev, currentQ === 0 && styles.navBtnDisabled]}
            onPress={goPrev}
            disabled={currentQ === 0}
          >
            <Feather name="arrow-left" size={16} color={colors.mutedForeground} />
            <Text style={[styles.navBtnText, { color: colors.mutedForeground }]}>Prev</Text>
          </TouchableOpacity>

          {currentQ === totalQ - 1 ? (
            <TouchableOpacity
              style={[styles.submitBtn, !allAnswered && { opacity: 0.5 }]}
              onPress={handleSubmit}
              disabled={!allAnswered || submitting}
            >
              <Feather name="send" size={16} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>Submit</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.navBtn, styles.navBtnNext, !hasAnswered && styles.navBtnDisabled]}
              onPress={goNext}
              disabled={!hasAnswered}
            >
              <Text style={[styles.navBtnText, { color: "#FFFFFF" }]}>Next</Text>
              <Feather name="arrow-right" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.dotRow}>
          {section.quiz.map((_, i) => (
            <TouchableOpacity key={i} onPress={() => setCurrentQ(i)}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      answers[i] !== null
                        ? answers[i] === section.quiz[i].correctIndex
                          ? colors.success
                          : colors.destructive
                        : i === currentQ
                        ? section.color
                        : colors.muted,
                  },
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
