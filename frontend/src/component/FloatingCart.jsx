import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Table , Button, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartShopping, faSquareMinus, faSquarePlus, faTrashCan } from '@fortawesome/free-solid-svg-icons';

import { thbFormatter, portal_root } from '../baseVariable';
import { useCart } from '../hooks/useCart';

function CartModal({ isOpen, onClose, cart }){
    
    if (!cart) return null;
    
    const cartItem = cart.cartItems;
    const TotalPrice = cart.total_price;
    const navigate = useNavigate();

    const {updateCart, removeCart, reserveStockCart } = useCart();

    useEffect(() => {
        // ถ้า Modal เปิดอยู่ และข้อมูลตะกร้าโหลดมาแล้ว แต่ไม่มีสินค้าเหลือเลย >>> ปิด Modal
        if (isOpen && cart && cart.cartItems && cart.cartItems.length === 0) {
            onClose();
        }
    }, [cart, isOpen, onClose]);

    function updateItemQuantity(cartItem, mode){

        if(mode == 'remove'){
            const payload = {
                id: cartItem.id
            }
            removeCart(payload, {
                onSuccess: () => {
                    alert('ลบสินค้าสำเร็จ');
                },
                onError: (err) => {
                    alert("เกิดข้อผิดพลาด: " + err.response?.data?.message);
                }
            });
        }else{
            var quantity = cartItem.quantity;

            if(mode == 'increase'){
                quantity = quantity + 1;
            }else{
                quantity = quantity - 1;
            }

            const payload = {
                id: cartItem.id,
                quantity: quantity
            };
            updateCart(payload, {
                onSuccess: () => {
                    if(!cart.cartItems || cart.cartItems.length == 0){
                        onClose();
                    }
                },
                onError: (err) => {
                    alert("เกิดข้อผิดพลาด: " + err.response?.data?.message);
                }
            });
        }

    }

    function toOrderPage(){
        const payload = { id: cart.cart.id };
        console.log(payload);
        reserveStockCart(payload, {
            onSuccess: () => {
                navigate("/order");
            },
            onError: (err) => {
                alert("เกิดข้อผิดพลาด: " + err.response?.data?.message);
            }
        });
        onClose();
    }
    
    return createPortal(
        <Modal show={isOpen} onHide={onClose} centered backdrop="static" keyboard={false}>
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
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            cartItem?.map( c => (<tr key={c.id}>
                                <td>{c.name}</td>
                                <td className="text-end">
                                    <FontAwesomeIcon 
                                        className="pointer orange-icon icon-size-20"
                                        icon={faSquareMinus}
                                        onClick={() => updateItemQuantity(c, 'decrease')}
                                    />
                                </td>
                                <td className="text-center">{c.quantity}</td>
                                <td className="text-start">
                                    <FontAwesomeIcon
                                        className="pointer orange-icon icon-size-20"
                                        icon={faSquarePlus}
                                        onClick={() => updateItemQuantity(c, 'increase')}
                                    />
                                </td>
                                <td className="text-end">{thbFormatter.format(c.total)}</td>
                                <td className="text-center">
                                    <FontAwesomeIcon 
                                        className="pointer"
                                        icon={faTrashCan}
                                        onClick={() => updateItemQuantity(c, 'remove')}
                                    />
                                </td>
                            </tr>))
                        }
                        <tr>
                            <td colSpan={4}>ยอดรวม</td>
                            <td className="text-end">{thbFormatter.format(TotalPrice)}</td>
                            <td></td>
                        </tr>
                    </tbody>
                </Table>
                <div className="text-center">
                    <Button variant="primary" onClick={ toOrderPage }>สั่งซื้อ</Button>
                </div>
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