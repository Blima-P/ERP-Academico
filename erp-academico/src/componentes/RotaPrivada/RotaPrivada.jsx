import { Navigate } from 'react-router-dom';
import { useAutenticacao } from '../../contextos/ContextoAutenticacao';
import estilos from './RotaPrivada.module.css';

function RotaPrivada({ children }) {
  const { estaAutenticado, carregando } = useAutenticacao();

  if (carregando) {
    return (
      <div className={estilos.carregandoContainer}>
        <div className={estilos.spinner}></div>
        <p className={estilos.carregandoTexto}>Verificando sessão...</p>
      </div>
    );
  }

  if (!estaAutenticado) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default RotaPrivada;
