import React, { useContext } from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';

import { AuthContext } from '../context/AuthContext';

function AdminNav(){
    const { user, logout } = useContext(AuthContext);

    return <Navbar bg="dark" expand="lg" sticky="top">
        <Container>

            <Navbar.Brand className="order-1">Shop Management</Navbar.Brand>

            <Navbar.Toggle aria-controls="admin-navbar" className="order-2" />
            <Navbar.Collapse id="admin-navbar" className="order-4 order-lg-2">
                <Nav className="me-auto">
                    <Nav.Link href={"/admin/order_management"}>ออเดอร์</Nav.Link>
                    <Nav.Link href={"/admin/report"}>รายงาน</Nav.Link>
                    <Nav.Link href={"/admin/product_management"}>จัดการสินค้า</Nav.Link>
                </Nav>
            </Navbar.Collapse>

            <Navbar.Text className="justify-content-end order-3 d-flex align-items-center">
                {user?.name ? user.name : ""}
                {user && <FontAwesomeIcon className="ms-3 pointer" icon={faRightFromBracket} onClick={logout}/>}
            </Navbar.Text>
        </Container>
    </Navbar>
}

export default AdminNav;