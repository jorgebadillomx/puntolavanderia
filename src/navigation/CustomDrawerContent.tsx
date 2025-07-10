import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { useAuth } from '../context/AuthContext';

export default function CustomDrawerContent(props: any) {
  const { cerrarTurno } = useAuth();

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
    <DrawerItem
      label="Cerrar turno"
      onPress={() => {
        props.navigation.emit({ type: "cerrarTurno" });
      }}/>
    </DrawerContentScrollView>
  );
}
