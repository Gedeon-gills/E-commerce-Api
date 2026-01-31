import { Request, Response, NextFunction } from 'express';
import Order from '../models/Order';
import Cart from '../models/Cart';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';


// ─────────────────────────────────────────────
// CREATE ORDER
// ─────────────────────────────────────────────
export const createOrder = catchAsync(
  async (req: any, res: Response, next: NextFunction) => {
    const { cartId, shippingAddress } = req.body;

    // Validate required fields
    if (!cartId || !shippingAddress) {
      return next(new AppError('cartId and shippingAddress are required', 400));
    }

    // Find the cart by ID and make sure it belongs to the logged-in user
    const cart = await Cart.findOne({ _id: cartId, user: req.user.id }).populate('items.product');

    if (!cart) {
      return next(new AppError('Cart not found', 404));
    }

    if (cart.items.length === 0) {
      return next(new AppError('Cart is empty', 400));
    }

    // Map cart items to order items
    const items = cart.items.map((item: any) => ({
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price,
    }));

    const totalAmount = items.reduce(
      (acc: number, item: any) => acc + item.price * item.quantity,
      0
    );

    // Create order
    const order = await Order.create({
      user: req.user.id,
      items,
      totalAmount,
      shippingAddress,
      // status & paymentStatus come from model defaults
    });

    // Delete cart after order creation
    await Cart.findByIdAndDelete(cart._id);

    res.status(201).json({
      status: 'success',
      data: { order },
    });
  }
);


// ─────────────────────────────────────────────
// ADMIN: GET ALL ORDERS
// ─────────────────────────────────────────────
export const getAllOrders = catchAsync(async (req: any, res: Response, next: NextFunction) => {

  if (req.user.role !== 'admin') {
    return next(new Error('Only admin can access all orders'));
  }

  const orders = await Order.find()
    .populate('user', 'name email')
    .populate('items.product')
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: { orders },
  });
});


// ─────────────────────────────────────────────
// ADMIN: UPDATE ORDER STATUS
// ─────────────────────────────────────────────
export const updateOrderStatus = catchAsync(async (req: any, res: Response, next: NextFunction) => {

  if (req.user.role !== 'admin') {
    return next(new Error('Only admin can update order status'));
  }

  const { status, paymentStatus } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new Error('Order not found'));
  }

  // Update only allowed fields
  if (status) order.status = status;
  if (paymentStatus) order.paymentStatus = paymentStatus;

  await order.save();

  res.status(200).json({
    status: 'success',
    data: { order },
  });
});


// ─────────────────────────────────────────────
// USER: GET ALL HIS/HER ORDERS
// ─────────────────────────────────────────────
export const getMyOrders = catchAsync(async (req: any, res: Response, next: NextFunction) => {
  const orders = await Order.find({ user: req.user.id })
    .populate('items.product')
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    results: orders.length,
    data: orders,
  });
});


// ─────────────────────────────────────────────
// USER: GET HIS/HER OWN ORDER BY ID
// ─────────────────────────────────────────────
export const getMyOrderById = catchAsync(async (req: any, res: Response, next: NextFunction) => {

  const order = await Order.findOne({
    _id: req.params.id,
    user: req.user.id,
  }).populate('items.product');

  if (!order) {
    return next(new Error('Order not found'));
  }

  res.status(200).json({
    status: 'success',
    data: { order },
  });
});


// ─────────────────────────────────────────────
// USER: CANCEL HIS/HER ORDER
// ─────────────────────────────────────────────
export const cancelMyOrder = catchAsync(async (req: any, res: Response, next: NextFunction) => {

  const order = await Order.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!order) {
    return next(new Error('Order not found'));
  }

  // BUSINESS RULES 🔐
  if (order.status === 'shipped' || order.status === 'delivered') {
    return next(
      new Error('You cannot cancel an order that is already shipped or delivered')
    );
  }

  if (order.paymentStatus === 'paid' && order.status === 'processing') {
    return next(
      new Error('Contact support to cancel a paid order in processing stage')
    );
  }

  order.status = 'cancelled';
  await order.save();

  res.status(200).json({
    status: 'success',
    message: 'Order cancelled successfully',
    data: { order },
  });
});
