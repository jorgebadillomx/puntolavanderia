import React, { useState } from 'react';
import { Modal, View, Text, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { SUCURSALES } from '../constants/Sucursales';
import { useSucursal } from '../context/SucursalContext';

export default function SucursalSelectorModal() {
  const { sucursal, setSucursal } = useSucursal();
  const [seleccionada, setSeleccionada] = useState(SUCURSALES[0]?.id ?? '');

  if (sucursal) return null;

  return (
    <Modal visible transparent animationType="fade">
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.4)'
        }}
      >
        <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 12, width: 300 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
            Selecciona sucursal
          </Text>
          <Picker selectedValue={seleccionada} onValueChange={(v) => setSeleccionada(String(v))}>
            {SUCURSALES.map((s) => (
              <Picker.Item key={s.id} label={s.nombre} value={s.id} />
            ))}
          </Picker>
          <Button title="Aceptar" onPress={() => setSucursal(seleccionada)} />
        </View>
      </View>
    </Modal>
  );
}