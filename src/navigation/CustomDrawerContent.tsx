import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { useAuth } from '../context/AuthContext';

export default function CustomDrawerContent(props: any) {
  const { cerrarTurno, user } = useAuth();

// console.log('user', user && user?.role, new Date().toString());

return (
  <DrawerContentScrollView {...props}>
    <DrawerItemList {...props} />
  <DrawerItem
    label={user?.role === 'administrador' ? 'Cerrar sesi\u00f3n' : 'Cerrar turno'}

      onPress={() => {
        
        if (user?.role === 'administrador') {
          cerrarTurno({ billetes: '0', monedas: '0' });
        } else {
          props.navigation.emit({ type: 'cerrarTurno' });
        }
      }}
    />
    </DrawerContentScrollView>
  );
}
