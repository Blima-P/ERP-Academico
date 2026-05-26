import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProvedorAutenticacao } from './contextos/ContextoAutenticacao';
import RotaPrivada from './componentes/RotaPrivada/RotaPrivada';
import Layout from './componentes/Layout/Layout';
import Login from './paginas/Login/Login';
import PainelInicial from './paginas/PainelInicial/PainelInicial';

function App() {
  return (
    <ProvedorAutenticacao>
      <BrowserRouter>
        <Routes>
          {/* Rota pública */}
          <Route path="/login" element={<Login />} />

          {/* Rotas protegidas */}
          <Route
            path="/"
            element={
              <RotaPrivada>
                <Layout />
              </RotaPrivada>
            }
          >
            <Route index element={<PainelInicial />} />
            <Route path="alunos" element={<h2>👨‍🎓 Página de Alunos (em breve)</h2>} />
            <Route path="cursos" element={<h2>📚 Página de Cursos (em breve)</h2>} />
            <Route path="matriculas" element={<h2>📋 Página de Matrículas (em breve)</h2>} />
            <Route path="relatorio" element={<h2>📈 Relatório (em breve)</h2>} />
          </Route>

          {/* Qualquer rota desconhecida redireciona para / */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ProvedorAutenticacao>
  );
}

export default App;
