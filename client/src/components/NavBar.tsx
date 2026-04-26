import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useAppDispatch, useAppSelector } from '../store'
import { logout } from '../store/authSlice'

const Nav = styled.nav`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  padding: 0.75rem 0;
  border-bottom: 2px solid #222;
  margin-bottom: 1.5rem;
`

const Title = styled.h1`
  margin: 0;
  margin-right: auto;
  font-size: 1.3rem;
  letter-spacing: -0.5px;
`

const HamburgerButton = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  line-height: 1;
  padding: 0.2rem 0.3rem;
  color: #222;
  @media (max-width: 600px) { display: block; }
`

const NavLinks = styled.div<{ $open: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem 1rem;

  @media (max-width: 600px) {
    display: ${({ $open }) => ($open ? 'flex' : 'none')};
    flex-direction: column;
    align-items: flex-start;
    flex-basis: 100%;
    padding: 0.5rem 0 0.25rem;
    border-top: 1px solid #eee;
    gap: 0.15rem;
  }
`

const StyledLink = styled(NavLink)`
  text-decoration: none;
  color: #666;
  padding: 0.4rem 0.6rem;
  border-radius: 4px;
  font-size: 0.9rem;
  white-space: nowrap;

  &.active {
    color: #111;
    font-weight: 600;
    background: #eee;
  }

  &:hover:not(.active) { color: #111; }

  @media (max-width: 600px) {
    width: 100%;
    padding: 0.55rem 0.6rem;
    font-size: 1rem;
  }
`

const UserName = styled.span`
  font-size: 0.85rem;
  color: #444;
  margin-left: auto;
  @media (max-width: 600px) {
    margin-left: 0;
    padding: 0.4rem 0.6rem;
    font-size: 0.9rem;
  }
`

const LogoutButton = styled.button`
  background: none;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0.35rem 0.6rem;
  font-size: 0.85rem;
  cursor: pointer;
  color: #555;
  white-space: nowrap;
  &:hover { background: #f5f5f5; }
  @media (max-width: 600px) {
    font-size: 0.95rem;
    padding: 0.5rem 0.6rem;
  }
`

export default function NavBar() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const name = useAppSelector(s => s.auth.name)
  const [menuOpen, setMenuOpen] = useState(false)

  function handleLogout() {
    dispatch(logout())
    navigate('/login', { replace: true })
  }

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <Nav>
      <Title>Quartet Maker</Title>
      <HamburgerButton
        onClick={() => setMenuOpen(v => !v)}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
      >
        {menuOpen ? '✕' : '☰'}
      </HamburgerButton>
      <NavLinks $open={menuOpen}>
        <StyledLink to="/my-songs" onClick={closeMenu}>My Songs</StyledLink>
        <StyledLink to="/quartet" onClick={closeMenu}>Find a Quartet</StyledLink>
        <StyledLink to="/collections" onClick={closeMenu}>Collections</StyledLink>
        {name && <UserName>{name}</UserName>}
        <LogoutButton onClick={() => { handleLogout(); closeMenu() }}>Sign out</LogoutButton>
      </NavLinks>
    </Nav>
  )
}
