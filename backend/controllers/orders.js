const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createOrder = async (req, res) => {
    const { orderId, customerId, orderDate, items, paymentMethod, totalAmount, paymentDate, remark } = req.body;

    if (!customerId || !items || !orderId || !paymentMethod || !totalAmount || !paymentDate || !remark) {
        return res.status(400).json({ message: 'Invalid order data' });
    }

    try {
        const [order, payment] = await prisma.$transaction([
            prisma.orders.create({
                data: {
                    order_id: orderId,
                    customer_id: customerId,
                    order_date: new Date(orderDate),
                    order_status: 'processing',
                    total_amount: totalAmount,
                    orderdetail: {
                        create: items.map((item) => ({
                            product_id: item.productId,
                            quantity: item.quantity,
                            unit_price: item.unitPrice,
                        })),
                    },
                },
            }),
            prisma.payments.create({
                data: {
                    order_id: orderId,
                    amount: totalAmount,
                    payment_method: paymentMethod,
                    payment_date: new Date(paymentDate), // ใช้ paymentDate ที่ส่งมา
                    payment_status: 'pending',
                    remark: remark, // ใช้ remark ที่ส่งมา
                },
            }),
        ]);

        console.log('Transaction committed:', { order, payment });
        res.status(200).json('Order created successfully.');
    } catch (err) {
        console.error('Failed to create orders:', err.message);
        res.status(500).json(err);
    }
};

const getAllOrders = async (req, res) => {
    try {
      const orders = await prisma.orders.findMany({
        include: {
          orderdetail: true, // รวมรายละเอียดคำสั่งซื้อ
          payments: true,    // รวมข้อมูลการชำระเงิน
          customers: true,   // รวมข้อมูลลูกค้า
        },
      });
      res.status(200).json(orders);  // ส่งข้อมูลคำสั่งซื้อทั้งหมด
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to retrieve orders', error });
    }
  };
  

const getOrder = async (req, res) => {
    const { id } = req.params; // orderId
  
    try {
      const order = await prisma.orders.findUnique({
        where: { order_id: parseInt(id) },  // ใช้ `order_id` ในการค้นหาคำสั่งซื้อ
        include: {
          orderdetail: true,  // รวมรายละเอียดคำสั่งซื้อ
          payments: true,     // รวมข้อมูลการชำระเงิน
          customers: true,    // รวมข้อมูลลูกค้า
        },
      });
  
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      res.status(200).json(order);  // ส่งข้อมูลคำสั่งซื้อที่ค้นพบ
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to retrieve order', error });
    }
  };
  
  const updateOrder = async (req, res) => {
    const { id } = req.params; // orderId
    const { orderStatus, totalAmount, items, paymentMethod, paymentDate, remark } = req.body;
  
    try {
      // 1. ค้นหาข้อมูลการชำระเงินตาม `order_id`
      const payment = await prisma.payments.findFirst({
        where: { order_id: parseInt(id) },
      });
  
      if (!payment) {
        return res.status(404).json({ message: 'Payment not found for this order' });
      }
  
      // 2. ทำการอัปเดตคำสั่งซื้อและการชำระเงินในหนึ่ง transaction
      const updatedOrder = await prisma.$transaction([
        // อัปเดตคำสั่งซื้อ
        prisma.orders.update({
          where: { order_id: parseInt(id) },
          data: {
            order_status: orderStatus,
            total_amount: totalAmount,
          },
        }),
        // อัปเดตการชำระเงิน
        prisma.payments.update({
          where: { payment_id: payment.payment_id }, // ใช้ `payment_id` ที่ได้จากการค้นหา
          data: {
            payment_method: paymentMethod,
            payment_date: new Date(paymentDate),
            remark: remark,
            payment_status: 'pending', // หรือ 'completed' ขึ้นอยู่กับสถานะ
          },
        }),
        // ลบรายละเอียดคำสั่งซื้อเก่า
        prisma.orderdetail.deleteMany({
          where: { order_id: parseInt(id) },
        }),
        // สร้างรายละเอียดคำสั่งซื้อใหม่
        prisma.orderdetail.createMany({
          data: items.map((item) => ({
            order_id: parseInt(id),
            product_id: item.productId,
            quantity: item.quantity,
            unit_price: item.unitPrice,
          })),
        }),
      ]);
  
      res.status(200).json({ message: 'Order updated successfully', updatedOrder });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to update order', error });
    }
  };
  const deleteOrder = async (req, res) => {
    const { id } = req.params; // orderId
  
    try {
      // 1. ค้นหาข้อมูลการชำระเงินที่เกี่ยวข้องกับคำสั่งซื้อ
      const payment = await prisma.payments.findFirst({
        where: { order_id: parseInt(id) },
      });
  
      if (!payment) {
        return res.status(404).json({ message: 'Payment not found for this order' });
      }
  
      // 2. ลบข้อมูลทั้งหมดที่เกี่ยวข้องกับคำสั่งซื้อ
      const deletedOrder = await prisma.$transaction([
        // ลบรายละเอียดคำสั่งซื้อ
        prisma.orderdetail.deleteMany({
          where: { order_id: parseInt(id) },
        }),
        // ลบการชำระเงินที่เกี่ยวข้องกับ order_id
        prisma.payments.delete({
          where: { payment_id: payment.payment_id }, // ใช้ `payment_id` ที่ได้จากการค้นหาการชำระเงิน
        }),
        // ลบคำสั่งซื้อ
        prisma.orders.delete({
          where: { order_id: parseInt(id) },
        }),
      ]);
  
      res.status(200).json({ message: 'Order deleted successfully', deletedOrder });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to delete order', error });
    }
  };
  


  
module.exports = { createOrder , getOrder, getAllOrders, updateOrder, deleteOrder

 };
