import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import SucursalSelectorModal from '../components/SucursalSelectorModal';

export default function CustomDrawerContent(props: any) {
  const { cerrarTurno, user } = useAuth();
    const [modalVisible, setModalVisible] = useState(false);

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      {user?.role === 'administrador' && (
        <DrawerItem
          label="Cambiar sucursal"
          onPress={() => setModalVisible(true)}
        />
      )}
      <DrawerItem
        label={user?.role === 'administrador' ? 'Cerrar sesión' : 'Cerrar turno'}
        onPress={() => {
          if (user?.role === 'administrador') {
            cerrarTurno({ billetes: '0', monedas: '0' });
          } else {
            props.navigation.emit({ type: 'cerrarTurno' });
          }
        }}
      />
      <SucursalSelectorModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </DrawerContentScrollView>
  );
}
