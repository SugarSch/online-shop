const thbFormatter = new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
});

const portal_root = document.getElementById('portal-root') ? document.getElementById('portal-root') : null;

export { thbFormatter, portal_root };