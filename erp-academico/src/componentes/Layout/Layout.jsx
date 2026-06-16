// Layout — Componente que define a estrutura visual (barra lateral + conteúdo)
// Usa <Outlet /> do React Router para renderizar as páginas filhas dentro da área principal
// Inclui modal de confirmação de logout
import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAutenticacao } from '../../contextos/ContextoAutenticacao';
import estilos from './Layout.module.css';

function Layout() {
  const { usuario, sair } = useAutenticacao(); // pega dados do usuário e função de logout
  const navegar = useNavigate();
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false); // controla o modal de logout

  // Abre o modal de confirmação ao clicar em "Sair"
  function aoSair() {
    setMostrarConfirmacao(true);
  }

  // Confirma logout: chama sair() do contexto e redireciona para /login
  async function confirmarSaida() {
    await sair();
    navegar('/login');
  }

  // Cancela o logout e fecha o modal
  function cancelarSaida() {
    setMostrarConfirmacao(false);
  }

  // Itens do menu de navegação lateral
  // Cada item tem caminho (rota), ícone (emoji) e rótulo (texto)
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
            🕐 Sessão ativa
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
