"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCart = exports.updateCart = exports.addToCart = exports.createCart = exports.getMyCart = exports.getAllCarts = void 0;
const Cart_1 = __importDefault(require("../models/Cart"));
const catchAsync_1 = require("../utils/catchAsync");
const AppError_1 = require("../utils/AppError");
/**
 * Admin Only: Get all shopping carts in the system
 */
exports.getAllCarts = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const carts = await Cart_1.default.find().populate('user', 'name email').populate('items.product');
    res.status(200).json({
        status: 'success',
        results: carts.length,
        data: { carts }
    });
});
/**
 * Any Logged User: Get personal cart
 */
exports.getMyCart = (0, catchAsync_1.catchAsync)(async (req, res) => {
    let cart = await Cart_1.default.findOne({ user: req.user.id }).populate('items.product');
    if (!cart) {
        cart = await Cart_1.default.create({ user: req.user.id, items: [] });
    }
    res.status(200).json({
        status: 'success',
        data: { cart }
    });
});
/**
 * Any Logged User: Create a new cart (if one doesn't exist)
 */
exports.createCart = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const existingCart = await Cart_1.default.findOne({ user: req.user.id });
    if (existingCart)
        return next(new AppError_1.AppError('Cart already exists for this user', 400));
    const newCart = await Cart_1.default.create({
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
exports.addToCart = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { productId, quantity = 1 } = req.body;
    if (!productId)
        return next(new AppError_1.AppError('Please provide a product ID', 400));
    let cart = await Cart_1.default.findOne({ user: req.user.id });
    if (!cart) {
        cart = await Cart_1.default.create({ user: req.user.id, items: [] });
    }
    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
    if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
    }
    else {
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
exports.updateCart = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const cart = await Cart_1.default.findById(req.params.id);
    if (!cart)
        return next(new AppError_1.AppError('No cart found with that ID', 404));
    if (cart.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new AppError_1.AppError('You can only update your own cart', 403));
    }
    const updatedCart = await Cart_1.default.findByIdAndUpdate(req.params.id, req.body, {
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
exports.deleteCart = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const cart = await Cart_1.default.findById(req.params.id);
    if (!cart)
        return next(new AppError_1.AppError('No cart found with that ID', 404));
    if (cart.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new AppError_1.AppError('You can only delete your own cart', 403));
    }
    await Cart_1.default.findByIdAndDelete(req.params.id);
    res.status(204).json({
        status: 'success',
        data: null
    });
});
