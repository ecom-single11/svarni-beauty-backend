const db = require('../config/db');

async function createOrder(data) {
    const now = new Date();
    const [result] = await db.execute(
        `INSERT INTO orders
            (customerId, orderNumber, items, subtotal, deliveryCharge, total,
             deliveryAddress, contactPhone, guestName, guestEmail,
             paymentMethod, paymentId, razorpayOrderId, razorpayPaymentId,
             status, notes, created_at, updated_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
            data.customerId   || null,
            data.orderNumber,
            JSON.stringify(data.items   || []),
            data.subtotal     || 0,
            data.deliveryCharge ?? 0,
            data.total        || 0,
            JSON.stringify(data.deliveryAddress || null),
            data.contactPhone || null,
            data.guestName    || null,
            data.guestEmail   || null,
            data.paymentMethod || 'cod',
            data.paymentId    || null,
            data.razorpayOrderId   || null,
            data.razorpayPaymentId || null,
            data.status       || 'confirmed',
            data.notes        || null,
            now, now
        ]
    );
    return result.insertId;
}

async function getAllOrders(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const [rows] = await db.execute(
        `SELECT o.*,
                COALESCE(c.firstName, '') AS firstName,
                COALESCE(c.lastName,  '') AS lastName,
                COALESCE(c.email, o.guestEmail) AS email
         FROM orders o
         LEFT JOIN customers c ON c.id = o.customerId
         ORDER BY o.created_at DESC
         LIMIT ? OFFSET ?`,
        [limit, offset]
    );
    const [[{ total }]] = await db.execute('SELECT COUNT(*) as total FROM orders');
    return { orders: rows, total, page, limit };
}

async function getOrderById(id) {
    const [rows] = await db.execute(
        `SELECT o.*,
                COALESCE(c.firstName, o.guestName) AS firstName,
                COALESCE(c.lastName,  '')           AS lastName,
                COALESCE(c.email, o.guestEmail)     AS email
         FROM orders o
         LEFT JOIN customers c ON c.id = o.customerId
         WHERE o.id = ?`,
        [id]
    );
    return rows[0] || null;
}

async function getOrdersByCustomerId(customerId) {
    const [rows] = await db.execute(
        'SELECT * FROM orders WHERE customerId = ? ORDER BY created_at DESC',
        [customerId]
    );
    return rows;
}

async function updateOrderStatus(id, status) {
    const now = new Date();
    await db.execute('UPDATE orders SET status=?, updated_at=? WHERE id=?', [status, now, id]);
    return await getOrderById(id);
}

module.exports = { createOrder, getAllOrders, getOrderById, getOrdersByCustomerId, updateOrderStatus };
