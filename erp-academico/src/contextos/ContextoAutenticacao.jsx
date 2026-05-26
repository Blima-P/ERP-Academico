import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ContextoAutenticacao = createContext();

// Credenciais simuladas para avaliação
const USUARIO_MOCK = {
  email: 'admin@erp.com',
  senha: '123456',
  nome: 'Administrador'
};

// Tempo de expiração da sessão: 30 minutos (em milissegundos)
const TEMPO_EXPIRACAO = 30 * 60 * 1000;

export function ProvedorAutenticacao({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [estaAutenticado, setEstaAutenticado] = useState(false);
  const [carregando, setCarregando] = useState(true);

  // Verifica se a sessão expirou
  const verificarExpiracao = useCallback(() => {
    const horarioLogin = localStorage.getItem('erp_horario_login');
    if (horarioLogin) {
      const agora = Date.now();
      const diferenca = agora - parseInt(horarioLogin);
      if (diferenca > TEMPO_EXPIRACAO) {
        // Sessão expirou
        localStorage.removeItem('erp_usuario');
        localStorage.removeItem('erp_horario_login');
        setUsuario(null);
        setEstaAutenticado(false);
        return true;
      }
    }
    return false;
  }, []);

  // Ao montar, verifica se já existe sessão válida no localStorage
  useEffect(() => {
    const usuarioSalvo = localStorage.getItem('erp_usuario');
    if (usuarioSalvo) {
      const expirou = verificarExpiracao();
      if (!expirou) {
        const dados = JSON.parse(usuarioSalvo);
        setUsuario(dados);
        setEstaAutenticado(true);
      }
    }
    setCarregando(false);
  }, [verificarExpiracao]);

  // Verifica expiração periodicamente (a cada 60 segundos)
  useEffect(() => {
    const intervalo = setInterval(() => {
      if (estaAutenticado) {
        verificarExpiracao();
      }
    }, 60000);
    return () => clearInterval(intervalo);
  }, [estaAutenticado, verificarExpiracao]);

  function entrar(email, senha) {
    if (email === USUARIO_MOCK.email && senha === USUARIO_MOCK.senha) {
      const agora = Date.now();
      const dadosUsuario = {
        email: USUARIO_MOCK.email,
        nome: USUARIO_MOCK.nome,
        ultimoLogin: new Date(agora).toLocaleString('pt-BR')
      };
      localStorage.setItem('erp_usuario', JSON.stringify(dadosUsuario));
      localStorage.setItem('erp_horario_login', agora.toString());
      setUsuario(dadosUsuario);
      setEstaAutenticado(true);
      return { sucesso: true };
    }
    return { sucesso: false, mensagem: 'E-mail ou senha incorretos' };
  }

  function sair() {
    localStorage.removeItem('erp_usuario');
    localStorage.removeItem('erp_horario_login');
    setUsuario(null);
    setEstaAutenticado(false);
  }

  return (
    <ContextoAutenticacao.Provider value={{ usuario, estaAutenticado, carregando, entrar, sair }}>
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
