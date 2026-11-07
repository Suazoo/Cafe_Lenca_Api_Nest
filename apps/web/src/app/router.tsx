import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Inicio from '../pages/Inicio';
import Menu from '../pages/Menu';
import Reservas from '../pages/Reservas';
import Perfil from '../pages/Perfil';
import Pedidos from '../pages/Pedidos';
import Paradigmas from '../pages/Paradigmas';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Inicio /> },
      { path: 'menu', element: <Menu /> },
      { path: 'reservas', element: <Reservas /> },
      { path: 'pedidos', element: <Pedidos /> },
      { path: 'perfil', element: <Perfil /> },
      { path: 'paradigmas', element: <Paradigmas /> },
    ],
  },
]);