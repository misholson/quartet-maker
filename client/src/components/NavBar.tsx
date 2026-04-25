import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

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

export default function NavBar() {
  return (
    <Nav>
      <Title>Quartet Maker</Title>
      <StyledLink to="/my-songs">My Songs</StyledLink>
      <StyledLink to="/quartet">Find a Quartet</StyledLink>
    </Nav>
  )
}
