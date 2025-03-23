import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import ThemesProvider from '@/contexts/ThemesProvider';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function Layout() {
    const colorScheme = useColorScheme();

    useEffect(() => {
        SplashScreen.hideAsync();
    }, []);

    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemesProvider>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            />
        </ThemesProvider>
      </GestureHandlerRootView>
    );
}