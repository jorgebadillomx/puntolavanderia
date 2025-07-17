import 'react-native-reanimated'; // ⚠️ debe estar en la PRIMERA línea
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { AuthProvider } from './src/context/AuthContext';
import { SucursalProvider } from './src/context/SucursalContext';
import RootNavigator from './src/navigation/RootNavigator';
import SucursalSelectorModal from './src/components/SucursalSelectorModal';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SucursalProvider>
        <AuthProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
          <SucursalSelectorModal />
        </AuthProvider>
      </SucursalProvider>
    </GestureHandlerRootView>
  );
}