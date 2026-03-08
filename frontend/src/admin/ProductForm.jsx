import React from 'react';
import { useParams } from 'react-router-dom';

function ProductForm(){
    const { id } = useParams();
    return <h1>ProductForm</h1>
}

export default ProductForm;