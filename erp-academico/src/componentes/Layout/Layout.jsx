import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAutenticacao } from '../../contextos/ContextoAutenticacao';
import estilos from './Layout.module.css';

function Layout() {
  const { usuario, sair } = useAutenticacao();
  const navegar = useNavigate();
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  function aoSair() {
    setMostrarConfirmacao(true);
  }

  function confirmarSaida() {
    sair();
    navegar('/login');
  }

  function cancelarSaida() {
    setMostrarConfirmacao(false);
  }

  const itensMenu = [
    { caminho: '/', icone: '📊', rotulo: 'Painel Inicial' },
    { caminho: '/alunos', icone: '👨‍🎓', rotulo: 'Alunos' },
    { caminho: '/cursos', icone: '📚', rotulo: 'Cursos' },
    { caminho: '/matriculas', icone: '📋', rotulo: 'Matrículas' },
    { caminho: '/relatorio', icone: '📈', rotulo: 'Relatório' },
  ];

  return (
    <div className={estilos.layout}>
      {/* Modal de confirmação de logout */}
      {mostrarConfirmacao && (
        <div className={estilos.modalFundo} onClick={cancelarSaida}>
          <div className={estilos.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={estilos.modalTitulo}>Deseja sair do sistema?</h3>
            <p className={estilos.modalTexto}>
              Sua sessão será encerrada e você precisará fazer login novamente.
            </p>
            <div className={estilos.modalBotoes}>
              <button className={estilos.botaoCancelar} onClick={cancelarSaida}>
                Cancelar
              </button>
              <button className={estilos.botaoConfirmar} onClick={confirmarSaida}>
                Sim, sair
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barra Lateral */}
      <aside className={estilos.barraLateral}>
        <div className={estilos.cabecalhoLateral}>
          <h2 className={estilos.logoLateral}>🎓 ERP Acadêmico</h2>
        </div>
        <nav className={estilos.navegacao}>
          {itensMenu.map((item) => (
            <NavLink
              key={item.caminho}
              to={item.caminho}
              end={item.caminho === '/'}
              className={({ isActive }) =>
                `${estilos.linkNav} ${isActive ? estilos.linkNavAtivo : ''}`
              }
            >
              <span className={estilos.iconeNav}>{item.icone}</span>
              {item.rotulo}
            </NavLink>
          ))}
        </nav>
        <div className={estilos.rodapeLateral}>
          <p className={estilos.infoSessao}>
            🕐 Login: {usuario?.ultimoLogin || '—'}
          </p>
        </div>
      </aside>

      {/* Área principal */}
      <div className={estilos.principal}>
        <header className={estilos.cabecalho}>
          <span className={estilos.nomeUsuario}>👤 Olá, {usuario?.nome}</span>
          <button className={estilos.botaoSair} onClick={aoSair}>
            🚪 Sair
          </button>
        </header>
        <main className={estilos.conteudo}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
