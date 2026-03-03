import React from 'react';
import { Container, Row, Col, Button, Modal } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';

import api from '../api';

import ClientNav from '../component/ClientNav';

function Home(){
    return <><ClientNav />
    <Outlet />
    </>
}

export default Home;