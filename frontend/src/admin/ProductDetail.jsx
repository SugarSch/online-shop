import React, { useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Accordion, Table, Badge, Button, Form } from 'react-bootstrap';
import { useAdminProductDetail } from '../hooks/useAdmin';
import { AuthContext } from '../context/AuthContext';
import { thbFormatter } from '../baseVariable';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MyChart = (data) => {
    const actualData = data?.data || [];
  return (
    // ResponsiveContainer ช่วยให้กราฟปรับขนาดตาม Div ที่หุ้มมันอยู่
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <LineChart data={actualData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip 
            contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
        />
        <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

function ProductDetail(){
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const product_status_badges = user?.search_filter?.product_status_badges || [];

    const { product, isProductDetailLoading } = useAdminProductDetail(id);
    const navigate = useNavigate();

    if (isProductDetailLoading) {
        return <Container className="d-flex align-items-center justify-content-center vh-100"><Row>กำลังโหลดข้อมูล...</Row></Container>;
    }

    if (!product) {
        return <Container className="d-flex align-items-center justify-content-center vh-100"><Row>ไม่พบสินค้า</Row></Container>;
    }

    return (
        <Container>
            <Row className="py-2">
                <Col className="card-title h2 text-center">{product.name}</Col>
            </Row>
            <Row className="py-2">
                <Col className="text-end">
                    <Button variant='info' onClick={() => navigate("/admin/product_form/" + id)}>แก้ไขข้อมูลสินค้า</Button>
                </Col>
            </Row>
            <Row className="mb-2">
                <Col lg={4}>
                    {
                        product.img_path && 
                        <div className="d-flex justify-content-center">
                            <img src={product.img_path} alt={product.name} style={{maxWidth: "300px"}} />
                        </div>
                    }
                </Col>
                <Col lg={8}>
                    <Card>
                        <Card.Body>
                            <div className="mb-2">ราคา: {thbFormatter.format(product.price)}</div>
                            <div className="mb-2">จำนวนคงเหลือ: {product.stock_number}</div>
                            <div className="d-flex gap-2 mb-2">
                                สถานะ: 
                                <Badge bg={product_status_badges.find(opt => opt.id == product.status)?.badge}>
                                    {product_status_badges.find(opt => opt.id == product.status)?.label}
                                </Badge>
                            </div>
                            <div className="mb-2">รายละเอียด: {product.description}</div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row className="my-3">
                <Col className="h4 text-center">ยอดขายย้อนหลัง 12 เดือน</Col>
            </Row>
            <Row className="my-3">
                {/* สำหรับกราฟ */}
                <MyChart data={product.chartData} />
            </Row>
        </Container>
    );
}

export default ProductDetail;