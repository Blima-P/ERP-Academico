import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/configuracao';
import { entrarComEmail, sairDoSistema, enviarRedefinicaoSenha } from '../firebase/autenticacao';

const ContextoAutenticacao = createContext();

export function ProvedorAutenticacao({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [estaAutenticado, setEstaAutenticado] = useState(false);
  const [carregando, setCarregando] = useState(true);

  // Listener do Firebase Auth — detecta login/logout automaticamente
  useEffect(() => {
    const cancelar = onAuthStateChanged(auth, (usuarioFirebase) => {
      if (usuarioFirebase) {
        setUsuario({
          uid: usuarioFirebase.uid,
          email: usuarioFirebase.email,
          nome: usuarioFirebase.displayName || usuarioFirebase.email.split('@')[0]
        });
        setEstaAutenticado(true);
      } else {
        setUsuario(null);
        setEstaAutenticado(false);
      }
      setCarregando(false);
    });
    return () => cancelar();
  }, []);

  async function entrar(email, senha) {
    const resultado = await entrarComEmail(email, senha);
    return resultado;
  }

  async function sair() {
    const resultado = await sairDoSistema();
    return resultado;
  }

  async function redefinirSenha(email) {
    const resultado = await enviarRedefinicaoSenha(email);
    return resultado;
  }

  return (
    <ContextoAutenticacao.Provider value={{ usuario, estaAutenticado, carregando, entrar, sair, redefinirSenha }}>
      {children}
    </ContextoAutenticacao.Provider>
  );
}

export function useAutenticacao() {
  const contexto = useContext(ContextoAutenticacao);
  if (!contexto) {
    throw new Error('useAutenticacao deve ser usado dentro de um ProvedorAutenticacao');
  }
  return contexto;
}
