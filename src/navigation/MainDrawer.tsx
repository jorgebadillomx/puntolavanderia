import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import PuntoVenta from '../screens/PuntoVenta';
import GestionProductos from '../screens/GestionProductos';
import HistorialTurnos from '../screens/HistorialTurnos';
import HistorialNotas from '../screens/HistorialNotas';
import CustomDrawerContent from './CustomDrawerContent';

const Drawer = createDrawerNavigator();

export default function MainDrawer() {
  return (
    <Drawer.Navigator
      initialRouteName="PuntoVenta"
      drawerContent={props => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="PuntoVenta" component={PuntoVenta} options={{ title: "Punto de Venta" }} />
      <Drawer.Screen name="GestionProductos" component={GestionProductos} options={{ title: "Administrar Productos" }} />
      <Drawer.Screen name="HistorialTurnos" component={HistorialTurnos} options={{ title: "Historial de Turnos" }} />
      {/* <Drawer.Screen name="HistorialNotas" component={HistorialNotas} options={{ title: "Historial de Ventas" }} /> */}
      
    </Drawer.Navigator>
  );
}


