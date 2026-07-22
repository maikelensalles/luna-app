import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';
import { SessionProvider, useSession } from '../contexts/SessionContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useDailyNotifications } from '../hooks/useDailyNotifications';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { session, isLoading: isSessionLoading } = useSession();
  const [fontsLoaded, fontError] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_800ExtraBold,
  });
  useDailyNotifications();

  const fontsReady = fontsLoaded || !!fontError;
  const isLoading = isSessionLoading || !fontsReady;

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SessionProvider>
        <RootNavigator />
      </SessionProvider>
    </SafeAreaProvider>
  );
}
