// PainelInicial — Dashboard com contagens e últimas matrículas
// Faz JOIN entre matrículas, alunos e cursos para exibir dados relacionados
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAutenticacao } from '../../contextos/ContextoAutenticacao';
import { buscarTodos } from '../../firebase/banco';
import estilos from './PainelInicial.module.css';

function PainelInicial() {
  const { usuario } = useAutenticacao(); // pega o nome do usuário logado
  const navegar = useNavigate();
  const [contagens, setContagens] = useState({ alunos: 0, cursos: 0, matriculas: 0 }); // totais para os cards
  const [ultimasMatriculas, setUltimasMatriculas] = useState([]); // últimas 5 matrículas (com JOIN)
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    // Busca as 3 coleções em paralelo
    const [resAlunos, resCursos, resMatriculas] = await Promise.all([
      buscarTodos('alunos'),
      buscarTodos('cursos'),
      buscarTodos('matriculas')
    ]);

    // Calcula as contagens para os cards do dashboard
    setContagens({
      alunos: resAlunos.sucesso ? resAlunos.dados.length : 0,
      cursos: resCursos.sucesso ? resCursos.dados.length : 0,
      matriculas: resMatriculas.sucesso ? resMatriculas.dados.length : 0
    });

    // JOIN: cruza matrículas com alunos e cursos para mostrar as últimas 5
    if (resMatriculas.sucesso && resAlunos.sucesso && resCursos.sucesso) {
      const ultimas = resMatriculas.dados
        .sort((a, b) => (b.criadoEm || '').localeCompare(a.criadoEm || '')) // ordena por data (mais recente primeiro)
        .slice(0, 5) // pega só as 5 primeiras
        .map((m) => {
          // find() busca o aluno e o curso correspondentes (JOIN)
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

  // Configuração dos 4 cards do dashboard
  // Cada card é clicável e navega para a página correspondente
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
