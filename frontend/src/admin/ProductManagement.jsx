import React, {useState, useContext} from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Table, Badge, Button, Form, Pagination } from 'react-bootstrap';
import { useAdminProduct } from '../hooks/useAdmin';
import { AuthContext } from '../context/AuthContext';
import { thbFormatter } from '../baseVariable';
import PaginationSection from '../component/PaginationSection';

function ProductManagement(){
    //filter 
    const [filterName, setFilterName] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [page, setPage] = useState(1);
    const navigate = useNavigate();

    const { products, isProductLoading } = useAdminProduct({
        status: filterStatus,
        name: filterName,
        page: page
    });

    //ดึงมาเอา option
    const { user } = useContext(AuthContext);
    const product_status_options = user?.search_filter?.product_status_options || [];
    const product_status_badges = user?.search_filter?.product_status_badges || [];

    return <Container>
        <Row className="px-2 py-2">
            <Col className="card-title h2 text-center">รายการสินค้า</Col>
        </Row>
        <Row className="px-2 py-2">
            <Col className="text-end">
                <Button variant='info' onClick={() => navigate("/admin/product_form/")}>เพิ่มสินค้า</Button>
            </Col>
        </Row>
        <Row className="px-2 py-2">
            {
                //ใส่ filter เพิ่มเติมได้ที่นี่
            }
            <Col md={8}>
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
            <Col md={4}>
                <Form.Group>
                    <Form.Label className="fw-bold">สถานะ</Form.Label>
                    <Form.Select value={filterStatus} onChange={(e) => {setFilterStatus(e.target.value); setPage(1)}}>
                        <option value="all">ทั้งหมด</option>
                        {product_status_options.map(opt => (
                            <option key={opt.id} value={opt.id}>{opt.label}</option>
                        ))}
                    </Form.Select>
                </Form.Group>
            </Col>
        </Row>
        {
            isProductLoading ? <Row>
                <Col className="text-center">กำลังโหลดข้อมูล...</Col>
            </Row> : products?.data?.length == 0 ? <Row>
                <Col className="text-center">ไม่มีสินค้า</Col>
            </Row> :
            <>
                <Row>
                <Table hover responsive>
                    <thead>
                        <tr>
                            <th>สินค้า</th>
                            <th>ราคา</th>
                            <th>จำนวนคงเหลือ</th>
                            <th>สถานะ</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                    {
                        products?.data?.map(product => (
                            <tr>
                                <td>{product.name}</td>
                                <td>{thbFormatter.format(product.price)}</td>
                                <td>{product.stock_number}</td>
                                <td>
                                    <Badge bg={product_status_badges.find(opt => opt.id == product.status)?.badge}>
                                        {product_status_badges.find(opt => opt.id == product.status)?.label}
                                    </Badge>
                                </td>
                                <td className="text-center"><Button size="sm" onClick={() => navigate(`/admin/product/${product.id}`)}>ดูรายละเอียด</Button></td>
                            </tr>
                        ))
                    }
                    </tbody>
                </Table>
                </Row>
                <Row>
                    <Col className="d-flex justify-content-center mt-4">
                        <PaginationSection 
                            currentPage={products.current_page} 
                            totalPages={products.last_page} 
                            onPageChange={setPage} 
                        />
                    </Col>
                </Row>
            </>
        }
    </Container>
}

export default ProductManagement;