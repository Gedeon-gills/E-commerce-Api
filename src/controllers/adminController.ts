import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import Order from '../models/Order';
import Product from '../models/Product';
import { catchAsync } from '../utils/catchAsync';

export const getDashboardStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const totalCustomers = await User.countDocuments({ role: 'customer' });
  const totalOrders = await Order.countDocuments();
  const totalProducts = await Product.countDocuments();
  
  const totalRevenue = await Order.aggregate([
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

export const getCustomers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const customers = await User.find({ role: 'customer' }).select('-password');
  
  // Calculate stats for each customer
  const customersWithStats = await Promise.all(
    customers.map(async (customer) => {
      const orders = await Order.find({ user: customer._id });
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
    })
  );

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

export const getOrders = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const orders = await Order.find()
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

export const getTopProducts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const topProducts = await Order.aggregate([
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