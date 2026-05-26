import { useNavigate } from 'react-router-dom';
import { useAutenticacao } from '../../contextos/ContextoAutenticacao';
import estilos from './PainelInicial.module.css';

function PainelInicial() {
  const { usuario } = useAutenticacao();
  const navegar = useNavigate();

  const cartoes = [
    { icone: '👨‍🎓', titulo: 'Total de Alunos', valor: '—', caminho: '/alunos' },
    { icone: '📚', titulo: 'Total de Cursos', valor: '—', caminho: '/cursos' },
    { icone: '📋', titulo: 'Total de Matrículas', valor: '—', caminho: '/matriculas' },
    { icone: '📈', titulo: 'Relatórios', valor: '→', caminho: '/relatorio' },
  ];

  return (
    <div className={estilos.painel}>
      <h1 className={estilos.saudacao}>Bem-vindo, {usuario?.nome}!</h1>
      <p className={estilos.subtitulo}>Painel de controle do sistema acadêmico</p>

      <div className={estilos.cartoes}>
        {cartoes.map((cartao) => (
          <div
            key={cartao.caminho}
            className={estilos.cartao}
            onClick={() => navegar(cartao.caminho)}
          >
            <div className={estilos.cartaoIcone}>{cartao.icone}</div>
            <div className={estilos.cartaoTitulo}>{cartao.titulo}</div>
            <div className={estilos.cartaoValor}>{cartao.valor}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PainelInicial;
