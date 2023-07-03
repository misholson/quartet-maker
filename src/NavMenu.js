import React from 'react';
import { Container, Nav, NavDropdown, Navbar, Offcanvas } from 'react-bootstrap';

export const NavMenu = () => {
    // TODO: Can I set this based on the size of the browser window?
    const expand="sm";

    return (
        <Navbar expand={expand} className="bg-body-tertiary mb-3">
            <Container fluid>
                <Navbar.Brand href="#">Quartet Maker</Navbar.Brand>
                <Navbar.Toggle aria-controls={`offcanvasNavbar-expand-${expand}`} />
                <Navbar.Offcanvas
                id={`offcanvasNavbar-expand-${expand}`}
                aria-labelledby={`offcanvasNavbarLabel-expand-${expand}`}
                >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title id={`offcanvasNavbarLabel-expand-${expand}`}>
                    Menu
                    </Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Nav className="justify-content-end flex-grow-1 pe-3">
                        <Nav.Link href="/">Dashboard</Nav.Link>
                        <Nav.Link href="/create-quartet">Create Quartet</Nav.Link>
                        <Nav.Link href="/join-quartet">Join Quartet</Nav.Link>
                        <NavDropdown
                            title="Manage"
                            id={`offcanvasNavbarDropdown-expand-${expand}`}
                        >
                            <NavDropdown.Item href="/manage-arrangers">Arrangers</NavDropdown.Item>
                            <NavDropdown.Item href="/manage-songs">Songs</NavDropdown.Item>
                            <NavDropdown.Item href="/manage-arrangements">Arrangements</NavDropdown.Item>
                            <NavDropdown.Item href="/manage-users">Users</NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                </Offcanvas.Body>
                </Navbar.Offcanvas>
            </Container>
        </Navbar>
    );
}