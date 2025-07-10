// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC2w274yXYtHqPSG7xneyQ_j5w0fYH8KVA",
  authDomain: "puntolavanderia.firebaseapp.com",
  projectId: "puntolavanderia",
  storageBucket: "puntolavanderia.firebasestorage.app",
  messagingSenderId: "517549724899",
  appId: "1:517549724899:web:9fa4083a10bc53f7c3a1d6"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Exporta la instancia de Firestore
export const db = getFirestore(app);
