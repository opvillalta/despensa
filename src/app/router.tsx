import { createBrowserRouter } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { RegisterPage } from '../features/auth/pages/RegisterPage'
import { HomePage } from './pages/HomePage'
import { InventoryPage } from '../features/inventory/pages/InventoryPage'
import { ItemFormPage } from '../features/inventory/pages/ItemFormPage'
import { ItemDetailPage } from '../features/inventory/pages/ItemDetailPage'
import { ShoppingPage } from '../features/shopping/pages/ShoppingPage'
import { SettingsPage } from '../features/settings/pages/SettingsPage'

export const router = createBrowserRouter([
  // Rutas públicas
  { path: '/login', element: <LoginPage /> },
  { path: '/registro', element: <RegisterPage /> },

  // Rutas protegidas (con BottomNav)
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'inventario', element: <InventoryPage /> },
      { path: 'agregar', element: <ItemFormPage /> },
      { path: 'item/:id', element: <ItemDetailPage /> },
      { path: 'compras', element: <ShoppingPage /> },
      { path: 'ajustes', element: <SettingsPage /> },
    ],
  },
])
