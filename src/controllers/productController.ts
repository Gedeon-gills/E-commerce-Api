import { Request, Response, NextFunction } from 'express';
import Product from '../models/Product';
import Category from '../models/Category';
import { catchAsync } from '../utils/catchAsync';
import { uploadToCloudinary } from '../services/uploadService';
import { AppError } from '../utils/AppError';


// ─────────────────────────────────────────────
// CREATE PRODUCT (ADMIN ONLY)
// must provide: categoryId, price, image
// ─────────────────────────────────────────────
export const createProduct = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const { price, categoryId, name } = req.body;

    // VALIDATIONS
    if (!price || !categoryId || !name) {
      return next(
        new AppError('name, price and categoryId are required', 400)
      );
    }

    // Validate category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return next(new AppError('Category not found', 404));
    }

    // IMAGE UPLOAD
    const imageUrls: string[] = [];

    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files as Express.Multer.File[]) {
        const url = await uploadToCloudinary(file.buffer, 'products');
        imageUrls.push(url);
      }
    }

    if (imageUrls.length === 0) {
      return next(new AppError('At least one product image is required', 400));
    }

    const product = await Product.create({
      ...req.body,
      category: categoryId,
      images: imageUrls,
    });

    res.status(201).json({
      status: 'success',
      data: { product },
    });
  }
);


// ─────────────────────────────────────────────
// GET ALL PRODUCTS (PUBLIC)
// show message if empty
// ─────────────────────────────────────────────
export const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const products = await Product.find();
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
export const getProduct = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const { id } = req.params;

    const product = await Product.findById(id).populate('category');

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { product },
    });
  }
);


// ─────────────────────────────────────────────
// ✅ UPDATE PRODUCT (ADMIN ONLY)
// ─────────────────────────────────────────────
export const updateProduct = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    // Validate new category if provided
    if (req.body.categoryId) {
      const category = await Category.findById(req.body.categoryId);
      if (!category) {
        return next(new AppError('Category not found', 404));
      }
    }

    // Handle new images if uploaded
    let imageUrls = product.images;

    if (req.files && Array.isArray(req.files)) {
      imageUrls = [];

      for (const file of req.files as Express.Multer.File[]) {
        const url = await uploadToCloudinary(file.buffer, 'products');
        imageUrls.push(url);
      }
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        category: req.body.categoryId || product.category,
        images: imageUrls,
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: { product: updated },
    });
  }
);


// ─────────────────────────────────────────────
// ✅ DELETE PRODUCT (ADMIN ONLY)
// ─────────────────────────────────────────────
export const deleteProduct = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {

    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new AppError('Product not found', 404));
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null,
    });
  }
);
