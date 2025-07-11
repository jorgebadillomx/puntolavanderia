import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import PuntoVenta from '../screens/PuntoVenta';
import GestionProductos from '../screens/GestionProductos';
import HistorialTurnos from '../screens/HistorialTurnos';
import CustomDrawerContent from './CustomDrawerContent';
import { useAuth } from '../context/AuthContext';

const Drawer = createDrawerNavigator();

export default function MainDrawer() {
    const { user } = useAuth();
  const initialRoute = user?.role === 'operador' ? 'PuntoVenta' : 'HistorialTurnos';
  return (
    <Drawer.Navigator
      initialRouteName={initialRoute}
      drawerContent={props => <CustomDrawerContent {...props} />}
    >
            {user?.role === 'operador' && (
        <Drawer.Screen name="PuntoVenta" component={PuntoVenta} options={{ title: 'Punto de Venta' }} />
      )}
      <Drawer.Screen name="GestionProductos" component={GestionProductos} options={{ title: 'Administrar Productos' }} />
      {user?.role === 'administrador' && (
        <Drawer.Screen name="HistorialTurnos" component={HistorialTurnos} options={{ title: 'Historial de Turnos' }} />
      )}
    </Drawer.Navigator>
  );
}


