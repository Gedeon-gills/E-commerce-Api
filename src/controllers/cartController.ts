import { Response, NextFunction } from 'express';
import Cart from '../models/Cart';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';

/**
 * Admin Only: Get all shopping carts in the system
 */
export const getAllCarts = catchAsync(async (req: any, res: Response) => {
  const carts = await Cart.find().populate('user', 'name email').populate('items.product');

  res.status(200).json({
    status: 'success',
    results: carts.length,
    data: { carts }
  });
});

/**
 * Any Logged User: Get personal cart
 */
export const getMyCart = catchAsync(async (req: any, res: Response) => {
  let cart = await Cart.findOne({ user: req.user.id }).populate('items.product');

  if (!cart) {
    cart = await Cart.create({ user: req.user.id, items: [] });
  }

  res.status(200).json({
    status: 'success',
    data: { cart }
  });
});

/**
 * Any Logged User: Create a new cart (if one doesn't exist)
 */
export const createCart = catchAsync(async (req: any, res: Response, next: NextFunction) => {
  const existingCart = await Cart.findOne({ user: req.user.id });
  if (existingCart) return next(new AppError('Cart already exists for this user', 400));

  const newCart = await Cart.create({
    user: req.user.id,
    items: req.body.items || []
  });

  res.status(201).json({
    status: 'success',
    data: { cart: newCart }
  });
});

/**
 * Any Logged User: Add a product to the cart
 * Body: { "productId": "id...", "quantity": 1 }
 */
export const addToCart = catchAsync(async (req: any, res: Response, next: NextFunction) => {
  const { productId, quantity = 1 } = req.body;
  if (!productId) return next(new AppError('Please provide a product ID', 400));

  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    cart = await Cart.create({ user: req.user.id, items: [] });
  }

  const itemIndex = cart.items.findIndex(
    (item: any) => item.product.toString() === productId
  );

  if (itemIndex > -1) {
    cart.items[itemIndex].quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();
  await cart.populate('items.product');

  res.status(200).json({
    status: 'success',
    data: { cart }
  });
});

/**
 * Owner Only: Update cart items
 */
export const updateCart = catchAsync(async (req: any, res: Response, next: NextFunction) => {
  const cart = await Cart.findById(req.params.id);

  if (!cart) return next(new AppError('No cart found with that ID', 404));

  if (cart.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You can only update your own cart', 403));
  }

  const updatedCart = await Cart.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('items.product');

  res.status(200).json({
    status: 'success',
    data: { cart: updatedCart }
  });
});

/**
 * Owner Only: Delete/Clear cart
 */
export const deleteCart = catchAsync(async (req: any, res: Response, next: NextFunction) => {
  const cart = await Cart.findById(req.params.id);

  if (!cart) return next(new AppError('No cart found with that ID', 404));

  if (cart.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You can only delete your own cart', 403));
  }

  await Cart.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null
  });
});
