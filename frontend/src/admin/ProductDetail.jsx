import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useAdminProductDetail } from '../hooks/useAdmin';
import { AuthContext } from '../context/AuthContext';
import { thbFormatter } from '../baseVariable';

function ProductDetail(){
    const { id } = useParams();
    return <h1>ProductDetail</h1>
}

export default ProductDetail;