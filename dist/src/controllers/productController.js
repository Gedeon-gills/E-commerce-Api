"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.getProduct = exports.getAllProducts = exports.createProduct = void 0;
const Product_1 = __importDefault(require("../models/Product"));
const Category_1 = __importDefault(require("../models/Category"));
const catchAsync_1 = require("../utils/catchAsync");
const uploadService_1 = require("../services/uploadService");
const AppError_1 = require("../utils/AppError");
// ─────────────────────────────────────────────
// CREATE PRODUCT (ADMIN ONLY)
// must provide: categoryId, price, image
// ─────────────────────────────────────────────
exports.createProduct = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { price, categoryId, name } = req.body;
    // VALIDATIONS
    if (!price || !categoryId || !name) {
        return next(new AppError_1.AppError('name, price and categoryId are required', 400));
    }
    // Validate category exists
    const category = await Category_1.default.findById(categoryId);
    if (!category) {
        return next(new AppError_1.AppError('Category not found', 404));
    }
    // IMAGE UPLOAD
    const imageUrls = [];
    if (req.files && Array.isArray(req.files)) {
        for (const file of req.files) {
            const url = await (0, uploadService_1.uploadToCloudinary)(file.buffer, 'products');
            imageUrls.push(url);
        }
    }
    if (imageUrls.length === 0) {
        return next(new AppError_1.AppError('At least one product image is required', 400));
    }
    const product = await Product_1.default.create({
        ...req.body,
        category: categoryId,
        images: imageUrls,
    });
    res.status(201).json({
        status: 'success',
        data: { product },
    });
});
// ─────────────────────────────────────────────
// GET ALL PRODUCTS (PUBLIC)
// show message if empty
// ─────────────────────────────────────────────
exports.getAllProducts = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const products = await Product_1.default.find();
    console.log("Products from DB:", products);
    if (products.length === 0) {
        return res.status(200).json({
            status: 'success',
            message: 'No products found',
            results: 0,
            data: [],
        });
    }
    res.status(200).json({
        status: 'success',
        results: products.length,
        data: { products },
    });
});
// ─────────────────────────────────────────────
// GET SINGLE PRODUCT BY ID
// ─────────────────────────────────────────────
exports.getProduct = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product_1.default.findById(id).populate('category');
    if (!product) {
        return next(new AppError_1.AppError('Product not found', 404));
    }
    res.status(200).json({
        status: 'success',
        data: { product },
    });
});
// ─────────────────────────────────────────────
// ✅ UPDATE PRODUCT (ADMIN ONLY)
// ─────────────────────────────────────────────
exports.updateProduct = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const product = await Product_1.default.findById(req.params.id);
    if (!product) {
        return next(new AppError_1.AppError('Product not found', 404));
    }
    // Validate new category if provided
    if (req.body.categoryId) {
        const category = await Category_1.default.findById(req.body.categoryId);
        if (!category) {
            return next(new AppError_1.AppError('Category not found', 404));
        }
    }
    // Handle new images if uploaded
    let imageUrls = product.images;
    if (req.files && Array.isArray(req.files)) {
        imageUrls = [];
        for (const file of req.files) {
            const url = await (0, uploadService_1.uploadToCloudinary)(file.buffer, 'products');
            imageUrls.push(url);
        }
    }
    const updated = await Product_1.default.findByIdAndUpdate(req.params.id, {
        ...req.body,
        category: req.body.categoryId || product.category,
        images: imageUrls,
    }, { new: true, runValidators: true });
    res.status(200).json({
        status: 'success',
        data: { product: updated },
    });
});
// ─────────────────────────────────────────────
// ✅ DELETE PRODUCT (ADMIN ONLY)
// ─────────────────────────────────────────────
exports.deleteProduct = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const product = await Product_1.default.findById(req.params.id);
    if (!product) {
        return next(new AppError_1.AppError('Product not found', 404));
    }
    await Product_1.default.findByIdAndDelete(req.params.id);
    res.status(204).json({
        status: 'success',
        data: null,
    });
});
