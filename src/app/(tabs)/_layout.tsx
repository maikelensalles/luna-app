import { Image } from 'react-native';
import { Tabs } from 'expo-router';
import { theme } from '../../constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.silverMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.backgroundElevated,
          borderTopColor: theme.colors.accentBorder,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Hoje',
          tabBarIcon: ({ focused, size }) => (
            <Image
              source={require('../../../assets/images/luna-icon.png')}
              style={{ width: size, height: size, opacity: focused ? 1 : 0.5 }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="jornada/index"
        options={{
          title: 'Jornada',
          tabBarIcon: ({ focused, size }) => (
            <Image
              source={require('../../../assets/icons/icon-lua-cheia.png')}
              style={{ width: size, height: size, opacity: focused ? 1 : 0.5 }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="praticas/index"
        options={{
          title: 'Práticas',
          tabBarIcon: ({ focused, size }) => (
            <Image
              source={require('../../../assets/icons/icon-lotus.png')}
              style={{ width: size, height: size, opacity: focused ? 1 : 0.5 }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil/index"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ focused, size }) => (
            <Image
              source={require('../../../assets/icons/icon-meditar.png')}
              style={{ width: size, height: size, opacity: focused ? 1 : 0.5 }}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tabs>
  );
}
