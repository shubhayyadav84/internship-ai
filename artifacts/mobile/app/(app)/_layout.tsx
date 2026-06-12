import { useAuth } from "@/context/AuthContext";
import { ContentProvider } from "@/context/ContentContext";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function AppLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#003580" }}>
        <ActivityIndicator color="#ffffff" size="large" />
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <ContentProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="section/[id]" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="video/[id]" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="quiz/[sectionId]" options={{ animation: "slide_from_bottom", presentation: "modal" }} />
        <Stack.Screen name="certificate/[sectionId]" options={{ animation: "slide_from_bottom", presentation: "modal" }} />
      </Stack>
    </ContentProvider>
  );
}
