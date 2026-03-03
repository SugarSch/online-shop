import React from 'react';
import { Container, Row, Col, Card, Table } from 'react-bootstrap';
import { useCart } from '../hooks/useCart';
import { thbFormatter, formatDateTime } from '../baseVariable';

function History(){
    const { cartHistory, isLoadingHistory } = useCart();

    return <Container>
        <Row className="px-2 py-2">
            <Col className="card-title h2 text-center">ประวัติการสั่งซื้อ</Col>
        </Row>
        {
            isLoadingHistory ? <Row>
                <Col className="text-center">กำลังโหลดข้อมูล...</Col>
            </Row> : cartHistory?.length == 0 ? <Row>
                <Col className="text-center">ไม่มีประวัติการสั่งซื้อ</Col>
            </Row> :
            cartHistory?.map( h => (
                <Row className="my-3 mx-2">
                <Card>
                    <Card.Body>
                        <Card.Title>{ formatDateTime(h.date) }</Card.Title>
                        <Card.Subtitle className="mb-2 text-muted">{h.location}</Card.Subtitle>
                        <Card.Text>
                            <Table>
                                <thead>
                                    <th colSpan={3}>รายการการสั่งซื้อ</th>
                                </thead>
                                <tbody>
                                    {
                                        h.items.map( i => (
                                            <tr>
                                                <td>{i.name}</td>
                                                <td className="text-center">{i.quantity}</td>
                                                <td className="text-end">{thbFormatter.format(i.total)}</td>
                                            </tr>
                                        ))
                                    }
                                    <tr>
                                        <th colSpan={2}>ยอดรวม</th>
                                        <td className="text-end">{thbFormatter.format(h.total)}</td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Card.Text>
                    </Card.Body>
                </Card>
                </Row>
            ))
        }
    </Container>
}

export default History;