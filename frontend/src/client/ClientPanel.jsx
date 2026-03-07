import React from 'react';
import { Outlet } from 'react-router-dom';

import ClientNav from '../component/ClientNav';

function ClientPanel(){
    return <><ClientNav />
    <Outlet />
    </>
}

export default ClientPanel;