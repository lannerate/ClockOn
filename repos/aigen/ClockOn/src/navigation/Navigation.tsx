// Navigation setup with React Navigation (Enhanced Theme)

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { PaperProvider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import SettingsScreen from '../screens/SettingsScreen';
import MonthlyStatsScreen from '../screens/MonthlyStatsScreen';

// Enhanced Theme Configuration
import clockOnTheme from '../theme/theme';

const Tab = createBottomTabNavigator();

function Navigation() {
  return (
    <PaperProvider theme={clockOnTheme}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: clockOnTheme.colors.primary,
            tabBarInactiveTintColor: '#94A3B8',
            tabBarStyle: {
              backgroundColor: clockOnTheme.colors.surface,
              borderTopColor: '#E2E8F0',
              borderTopWidth: 1,
              height: 60,
              paddingBottom: 8,
              paddingTop: 8,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '500',
            },
          }}
        >
          <Tab.Screen
            name="Dashboard"
            component={DashboardScreen}
            options={{
              title: 'Dashboard',
              tabBarLabel: 'Dashboard',
              tabBarIcon: ({ color, size }) => (
                <Icon name="clock-outline" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="MonthlyStats"
            component={MonthlyStatsScreen}
            options={{
              title: 'Monthly Stats',
              tabBarLabel: 'Statistics',
              tabBarIcon: ({ color, size }) => (
                <Icon name="chart-line-variant" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              title: 'Settings',
              tabBarLabel: 'Settings',
              tabBarIcon: ({ color, size }) => (
                <Icon name="cog" size={size} color={color} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

export default Navigation;
