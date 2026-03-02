import React, { useContext } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faListCheck, faBasketShopping, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../context/AuthContext';

function ClientNav(){
    const { user, logout } = useContext(AuthContext);
    return <Navbar bg="primary" expand="lg" sticky="top">
        <Container>

            <Navbar.Brand className="order-1">Online Shop</Navbar.Brand>

            <Navbar.Toggle aria-controls="client-navbar" className="order-2" />
            <Navbar.Collapse id="client-navbar" className="order-4 order-lg-2">
                <Nav className="me-auto">
                    <Nav.Link href={"/product"}>สั่งสินค้า <FontAwesomeIcon icon={faBasketShopping} /></Nav.Link>
                    <Nav.Link href={"/history"}>ประวัติการสั่งซื้อ <FontAwesomeIcon icon={faListCheck} /></Nav.Link>
                </Nav>
            </Navbar.Collapse>

            <Navbar.Text className="justify-content-end order-3 d-flex align-items-center">
                {user?.name ? user.name : "ผู้เยี่ยมชม"}
                {user && <FontAwesomeIcon className="ms-3 pointer" icon={faRightFromBracket} onClick={logout}/>}
            </Navbar.Text>
        </Container>
    </Navbar>
}

export default ClientNav;