import { ToastProvider } from '@vercetti/ui'
import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { Layout } from './components/layout'
import './index.css'
import { ThemeProvider } from './lib/theme'

/**
 * Routes are split per page. The syntax highlighter is the heaviest dependency
 * here and is only needed once a component page is opened, so keeping it out
 * of the initial chunk is the single biggest win available.
 */
const lazyPage = (
  loader: () => Promise<Record<string, React.ComponentType>>,
  exportName: string,
) =>
  React.lazy(async () => {
    const module = await loader()
    const Component = module[exportName]
    if (!Component) throw new Error(`Export "${exportName}" not found`)
    return { default: Component }
  })

const HomePage = lazyPage(() => import('./pages/home'), 'HomePage')
const FoundationsPage = lazyPage(() => import('./pages/foundations'), 'FoundationsPage')
const ButtonPage = lazyPage(() => import('./pages/button'), 'ButtonPage')
const DialogPage = lazyPage(() => import('./pages/dialog'), 'DialogPage')
const ComboboxPage = lazyPage(() => import('./pages/combobox'), 'ComboboxPage')
const ToastPage = lazyPage(() => import('./pages/toast'), 'ToastPage')

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'foundations', element: <FoundationsPage /> },
      { path: 'components/button', element: <ButtonPage /> },
      { path: 'components/dialog', element: <DialogPage /> },
      { path: 'components/combobox', element: <ComboboxPage /> },
      { path: 'components/toast', element: <ToastPage /> },
    ],
  },
])

const container = document.getElementById('root')
if (!container) throw new Error('Root element #root not found')

createRoot(container).render(
  <React.StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
