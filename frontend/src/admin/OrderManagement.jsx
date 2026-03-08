import React, {useState} from 'react';
import { Container, Row, Col, Card, Accordion, Table, Badge, Button, Form, Pagination } from 'react-bootstrap';
import { useAdmin } from '../hooks/useAdmin';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { thbFormatter, formatDateTime } from '../baseVariable';

function OrderManagement(){

    //filter 
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterDate, setFilterDate] = useState('current_week');
    const [sortBy, setSortBy] = useState('date');
    const [page, setPage] = useState(1);

    const { orders, isOrderLoading, updateOrder } = useAdmin({
        status: filterStatus,
        date: filterDate,
        sortBy: sortBy,
        page: page
    });
    console.log(orders);
    //ดึงมาเอา option
    const { user } = useContext(AuthContext);
    const date_options = user?.search_filter?.date_options || [];
    const cart_status_options = user?.search_filter?.cart_status_options || [];
    const cart_status_badges = user?.search_filter?.cart_status_badges || [];

    function deliverButton(order){
        updateOrder({id: order.id, status: 'completed'});
        alert("จัดส่งสินค้าเรียบร้อยแล้ว");
    }

    return <Container>
        <Row className="px-2 py-2">
            <Col className="card-title h2 text-center">รายการออเดอร์</Col>
        </Row>
        <Row className="px-2 py-2">
            {
                //ใส่ filter เพิ่มเติมได้ที่นี่
            }
            <Col md={4}>
                <Form.Group>
                    <Form.Label className="fw-bold">สถานะ</Form.Label>
                    <Form.Select value={filterStatus} onChange={(e) => {setFilterStatus(e.target.value); setPage(1)}}>
                        <option value="all">ทั้งหมด</option>
                        {cart_status_options.map(opt => (
                            <option key={opt.id} value={opt.id}>{opt.label}</option>
                        ))}
                    </Form.Select>
                </Form.Group>
            </Col>
            <Col md={4}>
                <Form.Group>
                    <Form.Label className="fw-bold">ช่วงเวลา</Form.Label>
                    <Form.Select value={filterDate} onChange={(e) => {setFilterDate(e.target.value); setPage(1)}}>
                        <option value="all">ทั้งหมด</option>
                        {Object.entries(date_options).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </Form.Select>
                </Form.Group>
            </Col>
            <Col md={4}>
                <Form.Group>
                    <Form.Label className="fw-bold">เรียงตาม</Form.Label>
                    <Form.Select value={sortBy} onChange={(e) => {setSortBy(e.target.value); setPage(1)}}>
                        <option value="date">วันที่ (ใหม่ไปเก่า)</option>
                        <option value="status">ลำดับความสำคัญ (ชำระแล้วขึ้นก่อน)</option>
                    </Form.Select>
                </Form.Group>
            </Col>

        </Row>
        {
            isOrderLoading ? <Row>
                <Col className="text-center">กำลังโหลดข้อมูล...</Col>
            </Row> : orders?.data?.length == 0 ? <Row>
                <Col className="text-center">ไม่มีออเดอร์</Col>
            </Row> :
            <>
            {orders?.data?.map( order => (
                <Row className="my-3 mx-2" key={order.id}>
                    <Card>
                        <Card.Body>
                            <Card.Title className="mb-3 d-flex gap-2">{ order.user.name }
                                <Badge bg={
                                    cart_status_badges.find(b => b.id === order.status)?.badge || 'secondary'}
                                >
                                    {cart_status_badges.find(b => b.id === order.status)?.label || 'รอการจัดส่ง'}
                                </Badge>
                                {
                                    cart_status_badges.find(b => b.id === order.status)?.code != 'completed' && 
                                    <div className="ms-auto">
                                        <Button 
                                            variant="info"
                                            size="sm"
                                            onClick={() => deliverButton(order)}>
                                            จัดส่งสินค้า
                                        </Button>
                                    </div>
                                }
                            </Card.Title>
                            <Card.Subtitle className="mb-2 text-muted">{formatDateTime(order.ordered_at)}</Card.Subtitle>
                            <Card.Subtitle className="mb-2">ที่อยู่จัดส่ง: {order.location}</Card.Subtitle>
                            <Card.Subtitle className="mb-3">
                                ยอดรวม: {thbFormatter.format(order?.cart_items.reduce((accumulator, currentValue) => {
                                    return accumulator + (currentValue.snap_price * currentValue.quantity);
                                }, 0))}
                            </Card.Subtitle>
                            <Card.Text className="mb-3">
                                <Accordion>
                                    <Accordion.Item eventKey={order.id + "_detail"}>
                                        <Accordion.Header>รายละเอียดสินค้า</Accordion.Header>
                                        <Accordion.Body>
                                            <Table striped bordered hover>
                                                <thead>
                                                    <tr>
                                                        <th>สินค้า</th>
                                                        <th>ราคา</th>
                                                        <th>จำนวน</th>
                                                        <th>รวม</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {order?.cart_items.map(item => (
                                                        <tr key={item.id}>
                                                            <td>{item.snap_name}</td>
                                                            <td>{thbFormatter.format(item.snap_price)}</td>
                                                            <td>{item.quantity}</td>
                                                            <td>{thbFormatter.format(item.snap_price * item.quantity)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </Table>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                </Accordion>
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Row>
            ))}
            <Row>
                <Col className="d-flex justify-content-center mt-4">
                    {//ใส่ pagination 
                    }
                    <Pagination>
                        <Pagination.Prev 
                            disabled={orders.current_page === 1} 
                            onClick={() => setPage(page - 1)} 
                        />
                        {[...Array(orders.last_page)].map((_, i) => (
                            <Pagination.Item 
                                key={i + 1} 
                                active={i + 1 === orders.current_page}
                                onClick={() => setPage(i + 1)}
                            >
                                {i + 1}
                            </Pagination.Item>
                        ))}
                        <Pagination.Next 
                            disabled={orders.current_page === orders.last_page} 
                            onClick={() => setPage(page + 1)} 
                        />
                    </Pagination>
                </Col>
            </Row>
            </>
        }
    </Container>
}

export default OrderManagement;