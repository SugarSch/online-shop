import React, {useState, useContext} from 'react';
import { Container, Card, Button, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

import { AuthContext } from '../context/AuthContext';
import api from '../api';

function Login(){

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {

        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await api.post("/login", { email, password });
            if(response.data.status == 'success'){
                const user = response.data.user;
                const token = response.data.plainTextToken;
                login(user, token, navigate);
            }
        } catch(err){ // ดึง Error Message จาก Laravel ที่เราทำไว้ (401 หรือ 422)
            setError(err.response?.data?.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        }

        setLoading(false);
    }

    return <Container className="d-flex vh-100 align-items-center justify-content-center">
            <Card>
                <Container>
                    <Card.Body>
                        <Card.Title className="text-center">ลงชื่อเข้าใช้งาน</Card.Title>
                        {error && <div className="error_msg text-center">{error}</div>}
                        <Form>
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
                        <div className="text-center">หากยังไม่มีบัญชี <Link to="/register">คลิกเพื่อลงทะเบียน</Link></div>
                    </Card.Body>
                </Container>
            </Card>
    </Container>
}

export default Login;