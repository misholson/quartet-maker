import { Routes, Route, Navigate } from 'react-router-dom'
import { createGlobalStyle } from 'styled-components'
import styled from 'styled-components'
import NavBar from './components/NavBar'
import MySongsPage from './pages/MySongsPage'
import QuartetFinderPage from './pages/QuartetFinderPage'

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; font-family: system-ui, sans-serif; background: #fff; color: #111; }
`

const AppContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1.25rem;
`

export default function App() {
  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <NavBar />
        <Routes>
          <Route path="/" element={<Navigate to="/my-songs" replace />} />
          <Route path="/my-songs" element={<MySongsPage />} />
          <Route path="/quartet" element={<QuartetFinderPage />} />
        </Routes>
      </AppContainer>
    </>
  )
}
