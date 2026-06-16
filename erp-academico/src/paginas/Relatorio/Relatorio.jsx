// Relatório — Tela que demonstra o JOIN entre entidades
// Cruza Matrículas + Alunos + Cursos usando map() e Map (estrutura de dados)
// Possui filtros por curso, status e nome do aluno, totalizadores e exportação CSV
import { useState, useEffect } from 'react';
import { buscarTodos } from '../../firebase/banco';
import estilos from './Relatorio.module.css';

function Relatorio() {
  // === ESTADOS ===
  const [matriculas, setMatriculas] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroCurso, setFiltroCurso] = useState('');     // filtro por nome do curso
  const [filtroStatus, setFiltroStatus] = useState('');   // filtro por status
  const [filtroAluno, setFiltroAluno] = useState('');     // busca por nome do aluno

  // === CARREGAMENTO ===
  useEffect(() => {
    carregarDados();
  }, []);

  // Busca as 3 coleções em paralelo
  async function carregarDados() {
    setCarregando(true);
    const [resMatriculas, resAlunos, resCursos] = await Promise.all([
      buscarTodos('matriculas'),
      buscarTodos('alunos'),
      buscarTodos('cursos')
    ]);
    if (resMatriculas.sucesso) setMatriculas(resMatriculas.dados);
    if (resAlunos.sucesso) setAlunos(resAlunos.dados);
    if (resCursos.sucesso) setCursos(resCursos.dados);
    setCarregando(false);
  }

  // === MAPAS PARA BUSCA RÁPIDA (otimização) ===
  // new Map() cria uma estrutura chave→valor para busca O(1)
  // Em vez de percorrer o array inteiro com find() para cada matrícula,
  // o Map permite acessar direto pelo ID (muito mais rápido com muitos dados)
  const alunosMap = new Map(
    alunos.map((aluno) => [aluno.id, aluno]) // [chave, valor]
  );

  const cursosMap = new Map(
    cursos.map((curso) => [curso.id, curso])
  );

  // === JOIN — Cruzamento de dados entre 3 entidades ===
  // Para cada matrícula, busca o aluno e o curso correspondentes
  // Isso simula um JOIN de banco de dados relacional usando JavaScript
  // Equivalente SQL: SELECT * FROM matriculas JOIN alunos ON ... JOIN cursos ON ...
  const dadosRelatorio = matriculas.map((matricula) => {
    const aluno = alunosMap.get(matricula.aluno_id); // busca O(1) pelo ID
    const curso = cursosMap.get(matricula.curso_id); // busca O(1) pelo ID

    // Retorna objeto "achatado" combinando dados das 3 entidades
    return {
      id: matricula.id,
      nomeAluno: aluno ? aluno.nome : 'Aluno não encontrado',
      emailAluno: aluno ? aluno.email : '—',
      nomeCurso: curso ? curso.nome : 'Curso não encontrado',
      cargaHoraria: curso ? curso.carga_horaria : 0,
      turno: curso ? curso.turno : '—',
      dataMatricula: matricula.data_matricula,
      status: matricula.status
    };
  });

  // === FILTROS ENCADEADOS ===
  // Cada filter() reduz o array; encadeados fazem AND lógico
  // Se o filtro está vazio (!filtro = true), passa todos os itens
  const dadosFiltrados = dadosRelatorio
    .filter(
     (d) =>
        !filtroAluno ||
        d.nomeAluno.toLowerCase().includes(filtroAluno.toLowerCase())
    )
    .filter((d) => !filtroCurso || d.nomeCurso === filtroCurso)
    .filter((d) => !filtroStatus || d.status === filtroStatus);

  // === TOTALIZADORES ===
  // Conta quantas matrículas existem em cada status após os filtros
  const totalAtivas = dadosFiltrados.filter((d) => d.status === 'Ativa').length;
  const totalTrancadas = dadosFiltrados.filter((d) => d.status === 'Trancada').length;
  const totalConcluidas = dadosFiltrados.filter((d) => d.status === 'Concluída').length;

  // === EXPORTAÇÃO CSV ===
  // Gera um arquivo CSV com os dados filtrados e inicia o download
  function exportarCSV() {
    const cabecalho = 'Aluno,E-mail,Curso,Carga Horária,Turno,Data Matrícula,Status\n';
    const linhas = dadosFiltrados.map((d) =>
      `"${d.nomeAluno}","${d.emailAluno}","${d.nomeCurso}",${d.cargaHoraria},"${d.turno}","${d.dataMatricula}","${d.status}"`
    ).join('\n');

    const csv = cabecalho + linhas;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' }); // cria arquivo na memória
    const url = URL.createObjectURL(blob); // gera URL temporária
    const link = document.createElement('a'); // cria link invisível
    link.href = url;
    link.download = 'relatorio_matriculas.csv'; // nome do arquivo
    link.click(); // dispara o download
    URL.revokeObjectURL(url); // libera a memória
  }

  if (carregando) {
    return <div className={estilos.carregando}>Carregando relatório...</div>;
  }

  return (
    <div className={estilos.pagina}>
      <div className={estilos.cabecalho}>
        <h1 className={estilos.titulo}>📈 Relatório de Matrículas</h1>
        <button className={estilos.botaoExportar} onClick={exportarCSV} disabled={dadosFiltrados.length === 0}>
          📥 Exportar CSV
        </button>
      </div>

      {/* Totalizadores */}
      <div className={estilos.totais}>
        <div className={estilos.totalCard}>
          <span className={estilos.totalValor}>{dadosFiltrados.length}</span>
          <span className={estilos.totalLabel}>Total</span>
        </div>
        <div className={`${estilos.totalCard} ${estilos.totalAtiva}`}>
          <span className={estilos.totalValor}>{totalAtivas}</span>
          <span className={estilos.totalLabel}>Ativas</span>
        </div>
        <div className={`${estilos.totalCard} ${estilos.totalTrancada}`}>
          <span className={estilos.totalValor}>{totalTrancadas}</span>
          <span className={estilos.totalLabel}>Trancadas</span>
        </div>
        <div className={`${estilos.totalCard} ${estilos.totalConcluida}`}>
          <span className={estilos.totalValor}>{totalConcluidas}</span>
          <span className={estilos.totalLabel}>Concluídas</span>
        </div>
      </div>

      {/* Filtros */}
      <div className={estilos.filtros}>
        <input
          className={estilos.campoFiltro}
          type="text"
          placeholder="Buscar aluno..."
          value={filtroAluno}
          onChange={(e) => setFiltroAluno(e.target.value)}
        />
        <select
          className={estilos.campoFiltro}
          value={filtroCurso}
          onChange={(e) => setFiltroCurso(e.target.value)}
        >
          <option value="">Todos os cursos</option>
          {cursos.map((curso) => (
            <option key={curso.id} value={curso.nome}>{curso.nome}</option>
          ))}
        </select>
        <select
          className={estilos.campoFiltro}
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
        >
          <option value="">Todos os status</option>
          <option value="Ativa">Ativa</option>
          <option value="Trancada">Trancada</option>
          <option value="Concluída">Concluída</option>
        </select>
      </div>

      {/* Tabela do Relatório */}
      {dadosFiltrados.length === 0 ? (
        <div className={estilos.vazio}>Nenhum dado encontrado para os filtros selecionados.</div>
      ) : (
        <div className={estilos.tabela}>
          <table>
            <thead>
              <tr>
                <th>Aluno</th>
                <th>Curso</th>
                <th>Carga Horária</th>
                <th>Turno</th>
                <th>Data Matrícula</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {dadosFiltrados.map((dado) => (
                <tr key={dado.id}>
                  <td><strong>{dado.nomeAluno}</strong><br /><small>{dado.emailAluno}</small></td>
                  <td>{dado.nomeCurso}</td>
                  <td>{dado.cargaHoraria}h</td>
                  <td>{dado.turno}</td>
                  <td>{dado.dataMatricula}</td>
                  <td><span className={`${estilos.badge} ${estilos['badge' + dado.status]}`}>{dado.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Relatorio;
