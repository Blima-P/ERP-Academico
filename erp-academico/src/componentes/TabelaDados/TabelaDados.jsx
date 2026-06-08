// TabelaDados — Componente reutilizável para exibir dados em formato de tabela
// Recebe colunas (configuração) e dados (array de objetos) como props
// Usado em Alunos, Cursos e Matrículas para evitar repetição de código
import estilos from './TabelaDados.module.css';

function TabelaDados({ colunas, dados, aoEditar, aoExcluir, mensagemVazio }) {
  // Se não há dados, exibe mensagem de vazio
  if (dados.length === 0) {
    return (
      <div className={estilos.vazio}>
        {mensagemVazio || 'Nenhum registro encontrado.'}
      </div>
    );
  }

  return (
    <div className={estilos.tabela}>
      <table>
        <thead>
          <tr>
            {/* Renderiza os cabeçalhos a partir do array de colunas */}
            {colunas.map((col) => (
              <th key={col.chave}>{col.titulo}</th>
            ))}
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {/* Itera sobre cada item usando map() — requisito da avaliação */}
          {dados.map((item) => (
            <tr key={item.id}>
              {colunas.map((col) => (
                <td key={col.chave}>
                  {/* Se a coluna tem função renderizar, usa ela; senão exibe o valor direto */}
                  {col.renderizar ? col.renderizar(item) : item[col.chave]}
                </td>
              ))}
              <td>
                <div className={estilos.acoes}>
                  <button className={estilos.botaoEditar} onClick={() => aoEditar(item)}>✏️</button>
                  <button className={estilos.botaoExcluir} onClick={() => aoExcluir(item)}>🗑️</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TabelaDados;
