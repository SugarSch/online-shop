import React from 'react';
import { Outlet } from 'react-router-dom';

import AdminNav from '../component/AdminNav';

function AdminPanel(){
    return <><AdminNav />
    <Outlet />
    </>
}

export default AdminPanel;