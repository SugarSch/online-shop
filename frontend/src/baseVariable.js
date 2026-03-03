const thbFormatter = new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
});

const portal_root = document.getElementById('portal-root') ? document.getElementById('portal-root') : null;

// สำหรับจัดฟอร์แมตวันที่เป็น YYYY/MM/DD
const dateFormatter = new Intl.DateTimeFormat('th-TH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
});

const formatDate = (dateString) => {
    if (!dateString) return "-";
    
    const d = new Date(dateString);
    
    // เช็คว่า String ที่ส่งมาแปลงเป็นวันที่ได้จริงๆ ไหม (ป้องกัน Invalid Date)
    if (isNaN(d.getTime())) return "-"; 

    // ดึงส่วนประกอบออกมาตามที่ออกแบบไว้
    const [{ value: day }, , { value: month }, , { value: year }] = dateFormatter.formatToParts(d);
    return `${year}/${month}/${day}`;
};

const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "-";

    // ดึงส่วนประกอบต่างๆ ออกมา
    const parts = dateFormatter.formatToParts(d);
    const getPart = (type) => parts.find(p => p.type === type).value;

    const year = getPart('year');
    const month = getPart('month');
    const day = getPart('day');
    const hour = getPart('hour');
    const minute = getPart('minute');

    // คืนค่ารูปแบบ YYYY/MM/DD HH:mm
    return `${year}/${month}/${day} ${hour}:${minute}`;
};


export { thbFormatter, portal_root, formatDate, formatDateTime };