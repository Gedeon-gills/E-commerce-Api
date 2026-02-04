"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTopProducts = exports.getOrders = exports.getCustomers = exports.getDashboardStats = void 0;
const User_1 = __importDefault(require("../models/User"));
const Order_1 = __importDefault(require("../models/Order"));
const Product_1 = __importDefault(require("../models/Product"));
const catchAsync_1 = require("../utils/catchAsync");
exports.getDashboardStats = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const totalCustomers = await User_1.default.countDocuments({ role: 'customer' });
    const totalOrders = await Order_1.default.countDocuments();
    const totalProducts = await Product_1.default.countDocuments();
    const totalRevenue = await Order_1.default.aggregate([
        { $match: { status: 'delivered' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    res.status(200).json({
        status: 'success',
        data: {
            totalCustomers,
            totalOrders,
            totalProducts,
            totalRevenue: totalRevenue[0]?.total || 0
        }
    });
});
exports.getCustomers = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const customers = await User_1.default.find({ role: 'customer' }).select('-password');
    // Calculate stats for each customer
    const customersWithStats = await Promise.all(customers.map(async (customer) => {
        const orders = await Order_1.default.find({ user: customer._id });
        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        const lastOrder = orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
        return {
            _id: customer._id,
            name: customer.name,
            email: customer.email,
            totalOrders,
            totalSpent,
            lastOrderDate: lastOrder?.createdAt,
            createdAt: customer.createdAt,
            status: customer.isActive ? 'active' : 'inactive'
        };
    }));
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const stats = {
        total: customers.length,
        active: customers.filter(c => c.isActive).length,
        newThisMonth: customers.filter(c => new Date(c.createdAt) >= startOfMonth).length
    };
    res.status(200).json({
        status: 'success',
        data: {
            customers: customersWithStats,
            stats
        }
    });
});
exports.getOrders = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const orders = await Order_1.default.find()
        .populate('user', 'name email')
        .populate('items.product', 'name price')
        .sort({ createdAt: -1 });
    res.status(200).json({
        status: 'success',
        data: {
            orders
        }
    });
});
exports.getTopProducts = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const topProducts = await Order_1.default.aggregate([
        { $unwind: '$items' },
        {
            $group: {
                _id: '$items.product',
                totalSold: { $sum: '$items.quantity' },
                totalRevenue: { $sum: { $multiply: ['$items.quantity', '$items.price'] } }
            }
        },
        {
            $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: '_id',
                as: 'product'
            }
        },
        { $unwind: '$product' },
        {
            $project: {
                name: '$product.name',
                totalSold: 1,
                totalRevenue: 1,
                image: { $arrayElemAt: ['$product.images', 0] }
            }
        },
        { $sort: { totalSold: -1 } },
        { $limit: 10 }
    ]);
    res.status(200).json({
        status: 'success',
        data: {
            products: topProducts
        }
    });
});
