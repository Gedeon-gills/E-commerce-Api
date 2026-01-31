"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelMyOrder = exports.getMyOrderById = exports.getMyOrders = exports.updateOrderStatus = exports.getAllOrders = exports.createOrder = void 0;
const Order_1 = __importDefault(require("../models/Order"));
const Cart_1 = __importDefault(require("../models/Cart"));
const catchAsync_1 = require("../utils/catchAsync");
const AppError_1 = require("../utils/AppError");
// ─────────────────────────────────────────────
// CREATE ORDER
// ─────────────────────────────────────────────
exports.createOrder = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { cartId, shippingAddress } = req.body;
    // Validate required fields
    if (!cartId || !shippingAddress) {
        return next(new AppError_1.AppError('cartId and shippingAddress are required', 400));
    }
    // Find the cart by ID and make sure it belongs to the logged-in user
    const cart = await Cart_1.default.findOne({ _id: cartId, user: req.user.id }).populate('items.product');
    if (!cart) {
        return next(new AppError_1.AppError('Cart not found', 404));
    }
    if (cart.items.length === 0) {
        return next(new AppError_1.AppError('Cart is empty', 400));
    }
    // Map cart items to order items
    const items = cart.items.map((item) => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price,
    }));
    const totalAmount = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    // Create order
    const order = await Order_1.default.create({
        user: req.user.id,
        items,
        totalAmount,
        shippingAddress,
        // status & paymentStatus come from model defaults
    });
    // Delete cart after order creation
    await Cart_1.default.findByIdAndDelete(cart._id);
    res.status(201).json({
        status: 'success',
        data: { order },
    });
});
// ─────────────────────────────────────────────
// ADMIN: GET ALL ORDERS
// ─────────────────────────────────────────────
exports.getAllOrders = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return next(new Error('Only admin can access all orders'));
    }
    const orders = await Order_1.default.find()
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
exports.updateOrderStatus = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    if (req.user.role !== 'admin') {
        return next(new Error('Only admin can update order status'));
    }
    const { status, paymentStatus } = req.body;
    const order = await Order_1.default.findById(req.params.id);
    if (!order) {
        return next(new Error('Order not found'));
    }
    // Update only allowed fields
    if (status)
        order.status = status;
    if (paymentStatus)
        order.paymentStatus = paymentStatus;
    await order.save();
    res.status(200).json({
        status: 'success',
        data: { order },
    });
});
// ─────────────────────────────────────────────
// USER: GET ALL HIS/HER ORDERS
// ─────────────────────────────────────────────
exports.getMyOrders = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const orders = await Order_1.default.find({ user: req.user.id })
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
exports.getMyOrderById = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const order = await Order_1.default.findOne({
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
exports.cancelMyOrder = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const order = await Order_1.default.findOne({
        _id: req.params.id,
        user: req.user.id,
    });
    if (!order) {
        return next(new Error('Order not found'));
    }
    // BUSINESS RULES 🔐
    if (order.status === 'shipped' || order.status === 'delivered') {
        return next(new Error('You cannot cancel an order that is already shipped or delivered'));
    }
    if (order.paymentStatus === 'paid' && order.status === 'processing') {
        return next(new Error('Contact support to cancel a paid order in processing stage'));
    }
    order.status = 'cancelled';
    await order.save();
    res.status(200).json({
        status: 'success',
        message: 'Order cancelled successfully',
        data: { order },
    });
});
