"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategoryById = exports.updateCategoryById = exports.getCategoryById = exports.getAllCategories = exports.createCategory = void 0;
const Category_1 = __importDefault(require("../models/Category"));
const catchAsync_1 = require("../utils/catchAsync");
const uploadService_1 = require("../services/uploadService");
const AppError_1 = require("../utils/AppError");
// ─────────────────────────────────────────────
// CREATE CATEGORY (ADMIN)
// ─────────────────────────────────────────────
exports.createCategory = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    let imageUrl = '';
    if (req.file) {
        imageUrl = await (0, uploadService_1.uploadToCloudinary)(req.file.buffer, 'categories');
    }
    else {
        return next(new AppError_1.AppError('Category image is required', 400));
    }
    const category = await Category_1.default.create({
        ...req.body,
        image: imageUrl,
    });
    res.status(201).json({
        status: 'success',
        data: { category },
    });
});
// ─────────────────────────────────────────────
// GET ALL CATEGORIES (PUBLIC)
// ─────────────────────────────────────────────
exports.getAllCategories = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const categories = await Category_1.default.find();
    res.status(200).json({
        status: 'success',
        results: categories.length,
        data: { categories },
    });
});
// ─────────────────────────────────────────────
// ✅ GET CATEGORY BY ID (ANY USER)
// ─────────────────────────────────────────────
exports.getCategoryById = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const category = await Category_1.default.findById(req.params.id);
    if (!category) {
        return next(new AppError_1.AppError('Category not found', 404));
    }
    res.status(200).json({
        status: 'success',
        data: { category },
    });
});
// ─────────────────────────────────────────────
// ✅ UPDATE CATEGORY BY ID (ADMIN ONLY)
// ─────────────────────────────────────────────
exports.updateCategoryById = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const category = await Category_1.default.findById(req.params.id);
    if (!category) {
        return next(new AppError_1.AppError('Category not found', 404));
    }
    let imageUrl = category.image;
    // If new image uploaded → replace
    if (req.file) {
        imageUrl = await (0, uploadService_1.uploadToCloudinary)(req.file.buffer, 'categories');
    }
    const updated = await Category_1.default.findByIdAndUpdate(req.params.id, {
        ...req.body,
        image: imageUrl,
    }, { new: true, runValidators: true });
    res.status(200).json({
        status: 'success',
        data: { category: updated },
    });
});
// ─────────────────────────────────────────────
// ✅ DELETE CATEGORY BY ID (ADMIN ONLY)
// ─────────────────────────────────────────────
exports.deleteCategoryById = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const category = await Category_1.default.findById(req.params.id);
    if (!category) {
        return next(new AppError_1.AppError('Category not found', 404));
    }
    await Category_1.default.findByIdAndDelete(req.params.id);
    res.status(204).json({
        status: 'success',
        data: null,
    });
});
