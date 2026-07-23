import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TaskListScreen from '@tasks/screens/TaskListScreen';
import TaskDetailScreen from '@tasks/screens/TaskDetailScreen';
import TaskFormScreen from '@tasks/screens/TaskFormScreen';
import CategoriesScreen from '@categories/screens/CategoriesScreen';
import { colors } from '../../theme';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * A single stack navigator, per the spec's tech-stack requirement
 * ("React Navigation (stack navigator)"). Categories is reached via a
 * header button on the Task List screen rather than a bottom tab bar —
 * the spec lists 4 required screens and a stack navigator, not tabs, so
 * this stays deliberately simple rather than adding navigation structure
 * that wasn't asked for.
 */
function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="TaskList"
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen
          name="TaskList"
          component={TaskListScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="TaskDetail"
          component={TaskDetailScreen}
          options={{ title: 'Task Details' }}
        />
        <Stack.Screen
          name="TaskForm"
          component={TaskFormScreen}
          options={({ route }) => ({
            title: route.params.mode === 'edit' ? 'Edit Task' : 'Create Task',
          })}
        />
        <Stack.Screen
          name="Categories"
          component={CategoriesScreen}
          options={{ title: 'Categories' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default RootNavigator;
