import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form } from 'react-bootstrap';

import { useAdminProductDetail } from '../hooks/useAdmin';

function ProductForm(){
    const { id } = useParams();
    const navigate = useNavigate();
    const { product, manageProduct } = useAdminProductDetail(id);

    const [ name, setName ] = useState(product?.name ? product.name : '');
    const [ price, setPrice ] = useState(product?.price ? product.price : 0);
    const [ description, setDescription ] = useState(product?.description ? product.description : '');
    const [ stock_number, setStockNumber ] = useState(product?.stock_number ? product.stock_number : 0);
    const [ preview, setPreview ] = useState(null);
    const [ file, setFile ] = useState(null);

    useEffect(() => {
        if (product) {
            setName(product.name || '');
            setPrice(product.price || 0);
            setDescription(product.description || '');
            setStockNumber(product.stock_number || 0);
            // ถ้ามีรูปเดิมอยู่แล้ว ให้โชว์เป็น preview เบื้องต้น (ถ้าต้องการ)
            if (product.img_path) setPreview(product.img_path);
        }
    }, [product]);

    const handleImgChange = (e) => {
        const fileInput = e.target.files[0];
        if (fileInput) {
            setFile(fileInput);
            setPreview(URL.createObjectURL(fileInput)); // แสดง Preview รูป
        }
    };

    function submitForm(){

        if(product?.reservations_sum_quantity > 0 && stock_number < product.reservations_sum_quantity){
            alert("จำนวนสินค้าต้องไม่ต่ำกว่าจำนวนที่ลูกค้าจองไว้ (" + product.reservations_sum_quantity + " ชิ้น)");
        }else{
            const formData = new FormData();
            if (id) formData.append('id', id); // ใส่ ID เข้าไปถ้าเป็นการแก้ไข
            formData.append('name', name);
            formData.append('price', price);
            formData.append('description', description);
            formData.append('stock_number', stock_number);

            if (file) {
                formData.append('img_path', file);
            }

            manageProduct(formData, {
                onSuccess: (res) => {
                    const product_id = res.data.data.id; // ดึง id ของสินค้าที่ถูกเพิ่มหรือแก้ไข
                    alert(id ? "แก้ไขข้อมูลสินค้าเรียบร้อยแล้ว" : "เพิ่มสินค้าเรียบร้อยแล้ว");
                    navigate("/admin/product/" + product_id);
                },
                onError: (err) => {
                    alert("เกิดข้อผิดพลาด: " + err.response?.data?.message);
                }
            });
        }
    }

    return <Container>
        <Row className="px-2 py-2">
            <Col className="card-title h2 text-center">{id && product ? 'แก้ไข' : 'เพิ่ม'}สินค้า</Col>
        </Row>
        <Row>
            <Card>
                <Card.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>ชื่อสินค้า</Form.Label>
                        <Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>ราคา</Form.Label>
                        <Form.Control type="number" value={price} onChange={(e) => setPrice(parseFloat(e.target.value) || 0)} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>รายละเอียด</Form.Label>
                        <Form.Control type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>จำนวนสินค้า</Form.Label>
                        <Form.Control type="number" value={stock_number} onChange={(e) => setStockNumber(parseInt(e.target.value) || 0)} />
                        {product?.reservations_sum_quantity > 0 && (
                            <div className="mt-3" style={{color: "red"}}>*สินค้าห้ามมีจำนวนต่ำกว่าที่ลูกค้าจองไว้ ({product.reservations_sum_quantity} ชิ้น)</div>
                        )}
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>รูปภาพสินค้า (ขนาดไม่เกิน 2 MB)</Form.Label>
                        <Form.Control name="img_path" 
                                type="file" 
                                accept="image/*" 
                                onChange={handleImgChange} 
                        />
                    </Form.Group>
                    {preview && (
                        <Form.Group className="mb-3">
                            <Form.Label>ตัวอย่างรูปภาพ</Form.Label>
                            <img src={preview} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                        </Form.Group>
                    )}
                    <Button variant="primary" onClick={() => submitForm()}>
                        {id && product ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}
                    </Button>
                </Card.Body>
            </Card>
        </Row>
    </Container>
}

export default ProductForm;