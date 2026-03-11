import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Modal, Button, Form } from 'react-bootstrap';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';

import { thbFormatter, portal_root } from '../baseVariable';
import FloatingCart from '../component/FloatingCart';
import { useProduct } from '../hooks/useProduct';
import { useCart } from '../hooks/useCart';
import NumericInput from '../component/NumericInput';
import PaginationSection from '../component/PaginationSection';

function AddProductModal({ isOpen, onClose, currentProduct }){
    if (!currentProduct) return null;

    const [ quantity, setQuantity ] = useState(1);
    const handleDecrease = () => setQuantity(prev => Math.max(0, prev - 1));
    const handleIncrease = () => setQuantity(prev => Math.min(100, prev + 1));

    const { addCart, isCartAdding } = useCart();

    function addToCart(){
        const payload = {
            product_id: currentProduct.id,
            quantity: quantity
        };
        addCart(payload, {
            onSuccess: () => {
                alert("เพิ่มสินค้าลงรถเข็นแล้ว!");
                setQuantity(1);
                onClose();
            },
            onError: (err) => {
                alert("เกิดข้อผิดพลาด: " + err.response?.data?.message);
            }
        });
    }

    return createPortal(
        <Modal show={isOpen} onHide={onClose} centered backdrop="static" keyboard={false}>
            <Modal.Header closeButton>
                <Modal.Title className="text-center">{currentProduct.name} {thbFormatter.format(currentProduct.price)}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="d-flex justify-content-center my-2"><NumericInput number={quantity} onMinus={handleDecrease} onPlus={handleIncrease}/></div>
                <div className="text-center">
                    <Button variant="primary" onClick={addToCart} disabled={isCartAdding}>
                        {isCartAdding ? (
                            "กำลังบันทึก..."
                        ) : (
                            "เพิ่มไปยังรถเข็น"
                        )}
                    </Button></div>
            </Modal.Body>
        </Modal>,
        portal_root
    )
}

//เอาไว้เป็น placeholder ก่อนโชว์สินค้าจริง
const ProductSkeleton = () => (
    <Col lg={2} md={4} xs={6} className="mb-4 d-flex align-items-stretch">
        <Card className="shadow-sm w-100 mx-1 border-0">
            <div className="skeleton-box skeleton-image" />
            <Card.Body>
                <div className="skeleton-box skeleton-text title" />
                <div className="skeleton-box skeleton-text price" />
                <div className="skeleton-box skeleton-text btn" />
            </Card.Body>
        </Card>
    </Col>
);

function Product(){

    //filter 
    const [filterName, setFilterName] = useState('');
    const [page, setPage] = useState(1);

    const { product, isLoading } = useProduct({
        name: filterName,
        page: page
    });
    const [ modal, setModal ] = useState(false);
    const [ currentProduct, setCurrentProduct ] = useState(null);

    const isReady = !isLoading && product ;

    //สำหรับเช็กว่าภาพสินค้าโหลดสำเร็จรึยัง >>> โหลดเสร็จค่อยโชว์
    const [loadedImagesCount, setLoadedImagesCount] = useState(0);
    const [isDataReady, setIsDataReady] = useState(false);

    const handleImageLoad = () => setLoadedImagesCount(prev => prev + 1);

    // เมื่อได้ข้อมูลสินค้ามาแล้ว ให้เริ่มเตรียมตัวโชว์
    useEffect(() => {
        if (!isLoading && product) {
            // ถ้าภาพโหลดครบ (หรือไม่มีสินค้า) ให้สั่งพร้อมโชว์
            if (!product.data || product.data.length === 0 || loadedImagesCount >= product.data.length) {
                setIsDataReady(true);
            }
        }
    }, [isLoading, product, loadedImagesCount]);

    function handleProductModal(p){
        setCurrentProduct(p);
        setModal(true);
    }

    function closedModal(){
        setCurrentProduct(null);
        setModal(false);
    }

    return <><Container>
        <Row className="px-2 py-2">
            <Col className="card-title h2 text-center">รายการสินค้า</Col>
        </Row>
        <Row className="px-2 py-2">
            {
                //ใส่ filter เพิ่มเติมได้ที่นี่
            }
            <Col>
                <Form.Group>
                    <Form.Label className="fw-bold">ชื่อ</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="กรอกชื่อสินค้า"
                        value={filterName}
                        onChange={(e) => {setFilterName(e.target.value); setPage(1)}}
                    />
                </Form.Group>
            </Col>
        </Row>
        <Row>
            {
                !isDataReady && Array.from({ length: 12 }).map((_, i) => (
                    <ProductSkeleton key={i} />
                ))
            }
            <div className={`row fade-in-up ${isDataReady ? 'show' : 'd-none'}`}>
            {
                product?.data?.map( p => (
                    <Col key={p.id} lg={2} md={4} xs={6} className="mb-4 d-flex align-items-stretch">
                        <Card className="shadow-sm w-100 mx-1">
                            <Card.Img 
                                className="card-img-top"
                                variant="top"src={p.img_path}
                                onLoad={handleImageLoad}
                                onError={handleImageLoad}
                                />
                            <Card.Body>
                                <Card.Title>{p.name}</Card.Title>
                                <Card.Text>
                                    ราคา: {thbFormatter.format(p.price)}
                                </Card.Text>
                                <div className="text-center">
                                    { ( p.stock_number - p.reservations_sum_quantity) < 1 ? "สินค้าหมด" : 
                                        <FontAwesomeIcon 
                                            className="orange-icon pointer icon-size-20"
                                            data-id={p.id}
                                            icon={faCirclePlus}
                                            onClick={() => handleProductModal(p)}
                                    />}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))
            }
            </div>
        </Row>
        {product && (
            <Row>
                <Col className="d-flex justify-content-center mt-4">
                    <PaginationSection 
                        currentPage={product.current_page} 
                        totalPages={product.last_page} 
                        onPageChange={setPage} 
                    />
                </Col>
            </Row>
            )
        }
    </Container>
    <FloatingCart />
    <AddProductModal isOpen={modal} onClose={closedModal} currentProduct={currentProduct} />
    </>
}

export default Product;