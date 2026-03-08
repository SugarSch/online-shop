import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table , Button, Container, Row, Col, Form } from 'react-bootstrap';

import { AuthContext } from '../context/AuthContext';
import { thbFormatter } from '../baseVariable';
import { useCart } from '../hooks/useCart';

function Order(){
    const { cart, orderCart } = useCart();
    const { user } = useContext(AuthContext);
    const targetTime = cart?.expired_at ? cart.expired_at : null;
    const cartItem = cart?.cartItems ? cart.cartItems : null;
    const TotalPrice = cart?.total_price ? cart.total_price : null;
    const [location, setLocation] = useState(user?.default_location ? user.default_location : '');
    const [isCheckLocation, setIsCheckLocation] = useState(false);
    const navigate = useNavigate();

    function calculateTimeLeft() {
        if (!targetTime) return null;
        const difference = +new Date(targetTime) - +new Date();
        if (difference <= 0) return null;

        return {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
        };
    }

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    function completeOrder() {
        if(!location){
            alert("โปรดใส่ที่อยู่จัดส่ง");
        }else{
            const payload = {id: cart.cart.id, location : location, isCheckLocation: isCheckLocation};
            orderCart(payload, {
                onSuccess: () => {
                    alert("บันทึกคำสั่งซื้อเรียบร้อย ขอบคุณที่อุดหนุนค่ะ");
                    navigate("/product");
                },
                onError: (err) => {
                    alert("เกิดข้อผิดพลาด: " + err.response?.data?.message);
                }
            });
        }
    }

    useEffect(() => {
        const timer = setInterval(() => {
        setTimeLeft(
            calculateTimeLeft());
        }, 1000);
        return () => clearInterval(timer); // Cleanup
    }, [targetTime]);

    if(!cart || !cart.cartItems || cart.cartItems.length === 0){
        return <Container className="align-items-center justify-content-center vh-100">
            <Row>
                <Col>
                    ยังไม่มีคำสั่งซื้อในขณะนี้
                </Col>
            </Row>
            <Row>
                <Col>
                    <Button
                        variant="primary"
                        onClick={() => navigate("/product")}
                    >กลับสู่หน้าหลัก</Button>
                </Col>
            </Row>
        </Container>
    }

    return <Container>
        <Row className="px-2 py-2">
            <Col className="card-title h2 text-center">รายการสินค้า</Col>
        </Row>
        <Row className="px-2 py-2">
            <Col>โปรดดำเนินการให้เสร็จสิ้นภายในเวลา: 
            {
                timeLeft 
                    ? `${timeLeft.minutes.toString().padStart(2, '0')}:${timeLeft.seconds.toString().padStart(2, '0')}` 
                    : "00:00"
            }
            </Col>
        </Row>
        <Row>
            <Table responsive>
                <thead>
                    <tr>
                        <th>สินค้า</th>
                        <th></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {
                        cartItem?.map( c => (<tr key={c.id}>
                            <td>{c.name}</td>
                            <td className="text-center">{c.quantity}</td>
                            <td className="text-end">{thbFormatter.format(c.total)}</td>
                        </tr>
                        ))
                    }
                    <tr>
                        <td colSpan={2}>ยอดรวม</td>
                        <td className="text-end">{thbFormatter.format(TotalPrice)}</td>
                    </tr>
                </tbody>
            </Table>
        </Row>
        <Row>
            <Form>
                <Form.Group className="mb-3">
                    <Form.Label>ที่อยู่จัดส่ง</Form.Label>
                    <Form.Control 
                        name="location"
                        as="textarea" 
                        rows={3}
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Check
                        inline
                        label="บันทึกไว้ใช้ครั้งถัดไป"
                        id="save_location"
                        name="save_location"
                        checked={isCheckLocation}
                        onChange={(e) => setIsCheckLocation(e.target.checked)}
                        value="save"
                    />
                </Form.Group>
            </Form>
        </Row>
        <Row>
            <Col className="text-center">
                <Button variant="primary" onClick={ completeOrder }>ยืนยันการสั่งซื้อ</Button>
            </Col>
        </Row>
    </Container>
}

export default Order;