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

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; font-family: system-ui, sans-serif; background: #fff; color: #111; }
`

const AppContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1.25rem;
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
            <Route path="/collections/:id" element={<CollectionDetailPage />} />
          </Route>
        </Routes>
      </AppContainer>
    </>
  )
}
