import React from 'react';
import { Card } from 'react-bootstrap';
import { NavMenu } from './NavMenu';

export const Layout = ({children}) => {
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