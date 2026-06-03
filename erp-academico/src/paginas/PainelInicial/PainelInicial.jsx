// PainelInicial — Dashboard com contagens e últimas matrículas
// Faz JOIN entre matrículas, alunos e cursos para exibir dados relacionados
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAutenticacao } from '../../contextos/ContextoAutenticacao';
import { buscarTodos } from '../../firebase/banco';
import estilos from './PainelInicial.module.css';

function PainelInicial() {
  const { usuario } = useAutenticacao();
  const navegar = useNavigate();
  const [contagens, setContagens] = useState({ alunos: 0, cursos: 0, matriculas: 0 });
  const [ultimasMatriculas, setUltimasMatriculas] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    const [resAlunos, resCursos, resMatriculas] = await Promise.all([
      buscarTodos('alunos'),
      buscarTodos('cursos'),
      buscarTodos('matriculas')
    ]);

    setContagens({
      alunos: resAlunos.sucesso ? resAlunos.dados.length : 0,
      cursos: resCursos.sucesso ? resCursos.dados.length : 0,
      matriculas: resMatriculas.sucesso ? resMatriculas.dados.length : 0
    });

    // Últimas 5 matrículas
    if (resMatriculas.sucesso && resAlunos.sucesso && resCursos.sucesso) {
      const ultimas = resMatriculas.dados
        .sort((a, b) => (b.criadoEm || '').localeCompare(a.criadoEm || ''))
        .slice(0, 5)
        .map((m) => {
          const aluno = resAlunos.dados.find((a) => a.id === m.aluno_id);
          const curso = resCursos.dados.find((c) => c.id === m.curso_id);
          return {
            id: m.id,
            aluno: aluno ? aluno.nome : '—',
            curso: curso ? curso.nome : '—',
            status: m.status
          };
        });
      setUltimasMatriculas(ultimas);
    }
    setCarregando(false);
  }

  const cartoes = [
    { icone: '👨‍🎓', titulo: 'Total de Alunos', valor: carregando ? '...' : contagens.alunos, caminho: '/alunos' },
    { icone: '📚', titulo: 'Total de Cursos', valor: carregando ? '...' : contagens.cursos, caminho: '/cursos' },
    { icone: '📋', titulo: 'Total de Matrículas', valor: carregando ? '...' : contagens.matriculas, caminho: '/matriculas' },
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

      {/* Últimas matrículas */}
      {ultimasMatriculas.length > 0 && (
        <div className={estilos.secaoRecentes}>
          <h2 className={estilos.secaoTitulo}>📋 Últimas Matrículas</h2>
          <div className={estilos.listaRecentes}>
            {ultimasMatriculas.map((m) => (
              <div key={m.id} className={estilos.itemRecente}>
                <span className={estilos.recenteNome}>{m.aluno}</span>
                <span className={estilos.recenteCurso}>{m.curso}</span>
                <span className={estilos.recenteStatus}>{m.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PainelInicial;
