import React, { useState } from 'react';
import { Container, Card, Button, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

function Register(){

    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {

        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await api.post("/register", { email, name, password });
            if(response.data.status == 'success'){
                navigate("/login");
            }
        } catch(err){ // ดึง Error Message จาก Laravel ที่เราทำไว้ (401 หรือ 422)
            setError(err.response?.data?.message);
        }

        setLoading(false);
    }

    return <Container className="d-flex vh-100 align-items-center justify-content-center">
                <Card>
                    <Container>
                        <Card.Body>
                            <Card.Title className="text-center">ลงทะเบียน</Card.Title>
                            {error && <div className="error_msg text-center">{error}</div>}
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Control type="text" placeholder="Name" 
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Control type="email" placeholder="E-mail" 
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Control type="password" placeholder="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                    />
                                </Form.Group>
                            </Form>
                            <div className="text-center mb-3">
                                <Button variant="primary" type="submit" onClick={handleSubmit} disabled={loading}>เข้าสู่ระบบ</Button>
                            </div>
                            <div className="text-center">หากยังมีบัญชีแล้ว <Link to="/login">คลิกเพื่อลงชื่อเข้าใช้งาน</Link></div>
                        </Card.Body>
                    </Container>
                </Card>
        </Container>
}

export default Register;