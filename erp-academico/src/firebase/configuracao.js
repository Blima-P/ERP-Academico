// Configuração do Firebase — conecta o app React com o projeto Firebase
import { initializeApp } from 'firebase/app';//cria projeto com o projeto firebase usado as credenciais
import { getAuth } from 'firebase/auth';//ativa o serviço de autenticação do firebase(login e logout)
import { getFirestore } from 'firebase/firestore';//ativa o BD(usado nos cruds)

// Credenciais do Firebase lidas das variáveis de ambiente (.env por segurança, se não ele nao sobe para o github)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Inicializa o Firebase e exporta os serviços de autenticação e banco de dados
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);