# Punto Lavandería

Aplicación móvil hecha con [Expo](https://expo.dev/) y React Native para administrar un punto de venta de lavandería. Utiliza Firebase como backend para almacenar productos, notas de venta y turnos.

## Funcionalidades principales

- **Gestión de turnos**: los operadores pueden abrir un turno ingresando su nombre y la caja inicial (billetes y monedas). Al cerrar el turno se registran la caja final y el total vendido.
- **Roles de usuario**: si el usuario coincide con `ADMIN_USERNAME` (ver `.env.example`) entra como administrador. El administrador tiene acceso al historial de turnos y notas.
- **Punto de venta**: permite crear notas de venta, agregar productos, escoger método de pago (efectivo, tarjeta o transferencia) y calcular cambio. Las notas cerradas generan un ticket imprimible mediante `expo-print`.
- **Administración de productos**: CRUD de productos con búsqueda por nombre. Cada producto tiene precio y opcionalmente un gasto asociado.
- **Historial**: consulta de turnos anteriores y detalle de todas las notas de un turno.

## Configuración y ejecución

1. Instala las dependencias:

   ```bash
   npm install
   ```

2. Crea un archivo `.env` con las variables de `.env.example` para definir el usuario administrador.

3. Inicia la aplicación:

   ```bash
   npx expo start
   ```

La app puede ejecutarse en un emulador, dispositivo físico o en la web usando las opciones que muestra Expo.

## Pruebas

Se incluyen pruebas básicas ejecutables con:

```bash
npm test
```

## Licencia
MIT