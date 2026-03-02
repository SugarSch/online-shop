import React, { useState, useContext } from 'react';
import { createPortal } from 'react-dom';
import { Container, Table , Button, Modal } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping, faPenToSquare, faTrashCan } from '@fortawesome/free-solid-svg-icons';

import { thbFormatter, portal_root } from '../baseVariable';
import { useCart } from '../hooks/useCart';

function CartModal({ isOpen, onClose, cart }){
    
    if (!cart) return null;
    
    const cartItem = cart.cartItems;
    const TotalPrice = cart.total_price;
    
    return createPortal(
        <Modal show={isOpen} onHide={onClose} backdrop="static" keyboard={false}>
            <Modal.Header closeButton>
                <Modal.Title>รายการสินค้าในตะกร้า</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Table responsive>
                    <thead>
                        <tr>
                            <th>สินค้า</th>
                            <th></th>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            cartItem.map( c => (<tr>
                                <td>{c.name}</td>
                                <td className="text-center">{c.quantity}</td>
                                <td className="text-end">{thbFormatter.format(c.total)}</td>
                                <td className="text-center">
                                    <FontAwesomeIcon className="pointer orange-icon" icon={faPenToSquare} />
                                    <FontAwesomeIcon className="pointer" icon={faTrashCan} />
                                </td>
                            </tr>))
                        }
                        <tr>
                            <td colSpan={2}>ยอดรวม</td>
                            <td className="text-end">{thbFormatter.format(TotalPrice)}</td>
                            <td></td>
                        </tr>
                    </tbody>
                </Table>
            </Modal.Body>
        </Modal>,
        portal_root
    ) 
}

function FloatingCart(){
    const [ modal, setModal ] = useState(false);
    const { cart, isLoading } = useCart();

    //เช็กว่าข้อมูลตะกร้าพร้อมโชว์รึยัง
    const isReady = !isLoading && cart && cart.cartItems?.length > 0;

    return <>
        <Button 
            variant="warning" 
            className={`floating-cart fade-in-up ${isReady ? 'show' : ''}`}
            onClick={() => setModal(true)} // เปิด popup รายการที่สั่งไป
        >
            <FontAwesomeIcon icon={faCartShopping} style={{fontSize: "20px"}}/>
            <span className="badge bg-danger cart-badge cart-badge-pop" 
                    style={{ position: "absolute", right: "8px"}}>
                {isReady ? cart.cartItems.length : 0}
            </span>
        </Button>
        
        <CartModal isOpen={modal} onClose={() => setModal(false)} cart={cart}/>
    </>
}

export default FloatingCart;