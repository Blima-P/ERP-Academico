import { useState, useEffect } from 'react';
import { buscarTodos } from '../../firebase/banco';
import estilos from './Relatorio.module.css';

function Relatorio() {
  const [matriculas, setMatriculas] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtroCurso, setFiltroCurso] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

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

  // Criando mapas para buscar por ID
  const alunosMap = new Map(
    alunos.map((aluno) => [aluno.id, aluno])
  );

  const cursosMap = new Map(
    cursos.map((curso) => [curso.id, curso])
  );

  // JOIN: cruzar matrículas com alunos e cursos usando map
  const dadosRelatorio = matriculas.map((matricula) => {
    const aluno = alunosMap.get(matricula.aluno_id);
    const curso = cursosMap.get(matricula.curso_id);

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

  // Aplicar filtros
  const dadosFiltrados = dadosRelatorio
    .filter((d) => !filtroCurso || d.nomeCurso === filtroCurso)
    .filter((d) => !filtroStatus || d.status === filtroStatus);

  // Totalizadores
  const totalAtivas = dadosFiltrados.filter((d) => d.status === 'Ativa').length;
  const totalTrancadas = dadosFiltrados.filter((d) => d.status === 'Trancada').length;
  const totalConcluidas = dadosFiltrados.filter((d) => d.status === 'Concluída').length;

  // Exportar CSV
  function exportarCSV() {
    const cabecalho = 'Aluno,E-mail,Curso,Carga Horária,Turno,Data Matrícula,Status\n';
    const linhas = dadosFiltrados.map((d) =>
      `"${d.nomeAluno}","${d.emailAluno}","${d.nomeCurso}",${d.cargaHoraria},"${d.turno}","${d.dataMatricula}","${d.status}"`
    ).join('\n');

    const csv = cabecalho + linhas;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'relatorio_matriculas.csv';
    link.click();
    URL.revokeObjectURL(url);
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
