import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { createGlobalStyle } from 'styled-components'
import styled from 'styled-components'
import NavBar from './components/NavBar'
import { useAppSelector } from './store'
import LoginPage from './pages/LoginPage'
import MySongsPage from './pages/MySongsPage'
import QuartetFinderPage from './pages/QuartetFinderPage'
import JoinPage from './pages/JoinPage'
import CollectionsPage from './pages/CollectionsPage'
import CollectionDetailPage from './pages/CollectionDetailPage'
import CollectionImportPage from './pages/CollectionImportPage'
import SongImportPage from './pages/SongImportPage'

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; }

  :root {
    --bg: #fff;
    --bg-subtle: #f8f8f8;
    --bg-input: #fff;
    --bg-disabled: #f5f5f5;
    --surface: #f0f0f0;
    --border: #ccc;
    --border-strong: #222;
    --border-subtle: #e5e5e5;
    --text: #111;
    --text-muted: #555;
    --text-faint: #888;
    --text-placeholder: #999;
    --text-link: #666;
    --btn-primary-bg: #222;
    --btn-primary-text: #fff;
    --btn-ghost-text: #444;
    --active-bg: #eee;
    --active-text: #111;
    --success: #166534;
    --danger-text: #c00;
    --danger-bg: #fee2e2;
    --danger-border: #fca5a5;
    --part-tenor: #dbeafe;
    --part-lead: #dcfce7;
    --part-baritone: #fef9c3;
    --part-bass: #ffe4e6;
    --covered: #166534;
    --uncovered: #d1d5db;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      --bg: #111;
      --bg-subtle: #1c1c1c;
      --bg-input: #1e1e1e;
      --bg-disabled: #252525;
      --surface: #2a2a2a;
      --border: #3a3a3a;
      --border-strong: #e0e0e0;
      --border-subtle: #2a2a2a;
      --text: #f0f0f0;
      --text-muted: #aaa;
      --text-faint: #777;
      --text-placeholder: #555;
      --text-link: #999;
      --btn-primary-bg: #e0e0e0;
      --btn-primary-text: #111;
      --btn-ghost-text: #bbb;
      --active-bg: #333;
      --active-text: #f0f0f0;
      --success: #4ade80;
      --danger-text: #f87171;
      --danger-bg: #2d1515;
      --danger-border: #7f1d1d;
      --part-tenor: #1e3357;
      --part-lead: #1a3325;
      --part-baritone: #352e0f;
      --part-bass: #35181e;
      --covered: #4ade80;
      --uncovered: #3a3a3a;
    }
  }

  body {
    margin: 0;
    font-family: system-ui, sans-serif;
    background: var(--bg);
    color: var(--text);
    color-scheme: light dark;
  }
`

const AppContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1.25rem;
  @media (max-width: 480px) {
    padding: 0 0.75rem;
  }
`

function AuthLayout() {
  const token = useAppSelector(s => s.auth.token)
  if (!token) {
    sessionStorage.setItem('redirectAfterLogin', window.location.pathname)
    return <Navigate to="/login" replace />
  }
  return (
    <>
      <NavBar />
      <Outlet />
    </>
  )
}

export default function App() {
  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AuthLayout />}>
            <Route path="/" element={<Navigate to="/my-songs" replace />} />
            <Route path="/my-songs" element={<MySongsPage />} />
            <Route path="/quartet" element={<QuartetFinderPage />} />
            <Route path="/join/:inviteCode" element={<JoinPage />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/collections/import" element={<CollectionImportPage />} />
            <Route path="/collections/:id" element={<CollectionDetailPage />} />
            <Route path="/songs/import" element={<SongImportPage />} />
          </Route>
        </Routes>
      </AppContainer>
    </>
  )
}
