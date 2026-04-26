import { NavLink, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { useAppDispatch, useAppSelector } from '../store'
import { logout } from '../store/authSlice'

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 2px solid #222;
  margin-bottom: 1.5rem;
`

const Title = styled.h1`
  margin: 0;
  margin-right: auto;
  font-size: 1.3rem;
  letter-spacing: -0.5px;
`

const StyledLink = styled(NavLink)`
  text-decoration: none;
  color: #666;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  font-size: 0.95rem;

  &.active {
    color: #111;
    font-weight: 600;
    background: #eee;
  }

  &:hover:not(.active) {
    color: #111;
  }
`

const UserName = styled.span`
  font-size: 0.9rem;
  color: #444;
`

const LogoutButton = styled.button`
  background: none;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0.25rem 0.6rem;
  font-size: 0.85rem;
  cursor: pointer;
  color: #555;
  &:hover { background: #f5f5f5; }
`

export default function NavBar() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const name = useAppSelector(s => s.auth.name)

  function handleLogout() {
    dispatch(logout())
    navigate('/login', { replace: true })
  }

  return (
    <Nav>
      <Title>Quartet Maker</Title>
      <StyledLink to="/my-songs">My Songs</StyledLink>
      <StyledLink to="/quartet">Find a Quartet</StyledLink>
      <StyledLink to="/collections">Collections</StyledLink>
      {name && <UserName>{name}</UserName>}
      <LogoutButton onClick={handleLogout}>Sign out</LogoutButton>
    </Nav>
  )
}
