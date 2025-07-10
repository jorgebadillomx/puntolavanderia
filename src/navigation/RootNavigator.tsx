import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import MainDrawer from './MainDrawer';
import { useAuth } from '../context/AuthContext';
import HistorialNotas from '../screens/HistorialNotas';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="MainDrawer" component={MainDrawer} />
          <Stack.Screen
            name="HistorialNotas"
            component={HistorialNotas}
            options={{ headerShown: true, title: "Historial de Ventas" }}
          />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
}