import { Request, Response, NextFunction } from 'express';
import Category from '../models/Category';
import { catchAsync } from '../utils/catchAsync';
import { uploadToCloudinary } from '../services/uploadService';
import { AppError } from '../utils/AppError';


// ─────────────────────────────────────────────
// CREATE CATEGORY (ADMIN)
// ─────────────────────────────────────────────
export const createCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    let imageUrl = '';

    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer, 'categories');
    } else {
      return next(new AppError('Category image is required', 400));
    }

    const category = await Category.create({
      ...req.body,
      image: imageUrl,
    });

    res.status(201).json({
      status: 'success',
      data: { category },
    });
  }
);


// ─────────────────────────────────────────────
// GET ALL CATEGORIES (PUBLIC)
// ─────────────────────────────────────────────
export const getAllCategories = catchAsync(
  async (req: Request, res: Response) => {

    const categories = await Category.find();

    res.status(200).json({
      status: 'success',
      results: categories.length,
      data: { categories },
    });
  }
);


// ─────────────────────────────────────────────
// ✅ GET CATEGORY BY ID (ANY USER)
// ─────────────────────────────────────────────
export const getCategoryById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const category = await Category.findById(req.params.id);

    if (!category) {
      return next(new AppError('Category not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { category },
    });
  }
);


// ─────────────────────────────────────────────
// ✅ UPDATE CATEGORY BY ID (ADMIN ONLY)
// ─────────────────────────────────────────────
export const updateCategoryById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const category = await Category.findById(req.params.id);

    if (!category) {
      return next(new AppError('Category not found', 404));
    }

    let imageUrl = category.image;

    // If new image uploaded → replace
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer, 'categories');
    }

    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        image: imageUrl,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: { category: updated },
    });
  }
);


// ─────────────────────────────────────────────
// ✅ DELETE CATEGORY BY ID (ADMIN ONLY)
// ─────────────────────────────────────────────
export const deleteCategoryById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const category = await Category.findById(req.params.id);

    if (!category) {
      return next(new AppError('Category not found', 404));
    }

    await Category.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  }
);
