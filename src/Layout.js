import React from 'react';
import { Card } from 'react-bootstrap';
import { NavMenu } from './NavMenu';

export const Layout = ({children}) => {
    // TODO: Can I set this based on the size of the browser window?
    const expand="sm";

    return (
        <>
            <NavMenu />
            <Card>
                <Card.Body>
                    {children}
                </Card.Body>
            </Card>
        </>
    );
}