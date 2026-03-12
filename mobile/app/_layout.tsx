import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider } from '../lib/auth';
import { colors } from '../lib/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <StatusBar style="light" backgroundColor={colors.background} />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            headerTitleStyle: { fontFamily: 'BebasNeue_400Regular', fontSize: 20 },
            contentStyle: { backgroundColor: colors.background },
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="partner/[id]"
            options={{ title: 'Partner', presentation: 'card' }}
          />
          <Stack.Screen
            name="gym/[id]"
            options={{ title: 'Gym', presentation: 'card' }}
          />
          <Stack.Screen
            name="chat/[userId]"
            options={{ title: 'Chat', presentation: 'card' }}
          />
          <Stack.Screen
            name="community"
            options={{ title: 'COMMUNITY', presentation: 'card' }}
          />
          <Stack.Screen
            name="notifications"
            options={{ title: 'NOTIFICATIONS', presentation: 'card' }}
          />
          <Stack.Screen
            name="settings"
            options={{ title: 'SETTINGS', presentation: 'card' }}
          />
          <Stack.Screen
            name="onboarding"
            options={{ title: 'SETUP PROFILE', headerShown: false }}
          />
        </Stack>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
