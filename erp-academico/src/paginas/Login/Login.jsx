import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAutenticacao } from '../../contextos/ContextoAutenticacao';
import estilos from './Login.module.css';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [tentouEnviar, setTentouEnviar] = useState(false);

  const { entrar, estaAutenticado } = useAutenticacao();
  const navegar = useNavigate();

  // Se já está logado, redireciona para o painel
  if (estaAutenticado) {
    return <Navigate to="/" replace />;
  }

  function validarEmail(valor) {
    if (!valor.trim()) return 'Campo obrigatório';
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexEmail.test(valor)) return 'Formato de e-mail inválido';
    return '';
  }

  function validarSenha(valor) {
    if (!valor.trim()) return 'Campo obrigatório';
    if (valor.length < 6) return 'A senha deve ter pelo menos 6 caracteres';
    return '';
  }

  function validar() {
    const novosErros = {};
    const erroEmail = validarEmail(email);
    const erroSenha = validarSenha(senha);
    if (erroEmail) novosErros.email = erroEmail;
    if (erroSenha) novosErros.senha = erroSenha;
    return novosErros;
  }

  // Validação em tempo real após primeira tentativa de envio
  function aoMudarEmail(e) {
    const valor = e.target.value;
    setEmail(valor);
    setErroGeral('');
    if (tentouEnviar) {
      const erro = validarEmail(valor);
      setErros((prev) => ({ ...prev, email: erro || undefined }));
    }
  }

  function aoMudarSenha(e) {
    const valor = e.target.value;
    setSenha(valor);
    setErroGeral('');
    if (tentouEnviar) {
      const erro = validarSenha(valor);
      setErros((prev) => ({ ...prev, senha: erro || undefined }));
    }
  }

  function aoEnviar(e) {
    e.preventDefault();
    setErroGeral('');
    setTentouEnviar(true);

    const errosValidacao = validar();
    setErros(errosValidacao);

    if (Object.keys(errosValidacao).length > 0) {
      return;
    }

    setCarregando(true);

    // Simula um pequeno delay como se fosse uma requisição ao servidor
    setTimeout(() => {
      const resultado = entrar(email, senha);
      if (resultado.sucesso) {
        navegar('/');
      } else {
        setErroGeral(resultado.mensagem);
      }
      setCarregando(false);
    }, 800);
  }

  return (
    <div className={estilos.container}>
      <div className={estilos.card}>
        <div className={estilos.cabecalho}>
          <h1 className={estilos.logo}>🎓 ERP Acadêmico</h1>
          <p className={estilos.subtitulo}>Faça login para acessar o sistema</p>
        </div>

        {erroGeral && (
          <div className={estilos.erroGeral}>
            <span className={estilos.erroGeralIcone}>⚠️</span>
            {erroGeral}
          </div>
        )}

        <form onSubmit={aoEnviar} noValidate>
          <div className={estilos.grupoCampo}>
            <label className={estilos.rotulo} htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              className={`${estilos.campo} ${erros.email ? estilos.campoErro : ''}`}
              placeholder="Digite seu e-mail"
              value={email}
              onChange={aoMudarEmail}
              autoComplete="email"
              autoFocus
            />
            {erros.email && <span className={estilos.msgErro}>❌ {erros.email}</span>}
          </div>

          <div className={estilos.grupoCampo}>
            <label className={estilos.rotulo} htmlFor="senha">Senha</label>
            <div className={estilos.campoSenhaContainer}>
              <input
                id="senha"
                type={mostrarSenha ? 'text' : 'password'}
                className={`${estilos.campo} ${estilos.campoSenha} ${erros.senha ? estilos.campoErro : ''}`}
                placeholder="Digite sua senha"
                value={senha}
                onChange={aoMudarSenha}
                autoComplete="current-password"
              />
                <button
                  type="button"
                  className={estilos.botaoMostrarSenha}
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  tabIndex={-1}
                >
                  {mostrarSenha ? '🙈' : '👁️'}
                </button>
              </div>
              {erros.senha && <span className={estilos.msgErro}>❌ {erros.senha}</span>}
          </div>

          <button
            type="submit"
            className={estilos.botao}
            disabled={carregando}
          >
            {carregando ? (
              <span className={estilos.botaoCarregando}>
                <span className={estilos.spinner}></span>
                Entrando...
              </span>
            ) : 'Entrar'}
          </button>
        </form>

        <p className={estilos.dica}>
          💡 Credenciais de teste: admin@erp.com / 123456
        </p>
      </div>
    </div>
  );
}

export default Login;
