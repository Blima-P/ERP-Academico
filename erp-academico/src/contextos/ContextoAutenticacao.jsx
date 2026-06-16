// Contexto de Autenticação — gerencia o estado de login em toda a aplicação
// Utiliza Context API do React para compartilhar dados do usuário entre componentes
import { createContext, useContext, useState, useEffect } from 'react';//Func Firebase
import { onAuthStateChanged } from 'firebase/auth';//listener
import { auth } from '../firebase/configuracao';
import { entrarComEmail, sairDoSistema } from '../firebase/autenticacao';

const ContextoAutenticacao = createContext();

// Provedor que envolve toda a aplicação e fornece os dados de autenticação
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
    // Cleanup: cancela o listener quando o componente desmonta
    return () => cancelar();
  }, []);

  // Função para fazer login
  async function entrar(email, senha) {
    const resultado = await entrarComEmail(email, senha);
    return resultado;
  }

  // Função para fazer logout
  async function sair() {
    const resultado = await sairDoSistema();
    return resultado;
  }

  // Provider disponibiliza os valores para todos os componentes filhos
  return (
    <ContextoAutenticacao.Provider value={{ usuario, estaAutenticado, carregando, entrar, sair }}>
      {children}
    </ContextoAutenticacao.Provider>
  );
}

// Hook customizado para acessar o contexto de autenticação em qualquer componente
export function useAutenticacao() {
  const contexto = useContext(ContextoAutenticacao);
  if (!contexto) {
    throw new Error('useAutenticacao deve ser usado dentro de um ProvedorAutenticacao');
  }
  return contexto;
}
