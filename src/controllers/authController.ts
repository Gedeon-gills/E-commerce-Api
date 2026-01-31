import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User';
import { env } from '../config/env';
import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { EmailService } from '../services/emailService';

/**
 * Utility to sign JWT - Using 'as any' for expiresIn to satisfy TS overload requirements
 */
const signToken = (id: string): string => {
  return jwt.sign({ id }, env.JWT_SECRET, { 
    expiresIn: env.JWT_EXPIRES_IN as any 
  });
};

/**
 * Utility to send token in response
 */
const createSendToken = (user: any, statusCode: number, res: Response) => {
  const token = signToken(user._id.toString());
  
  // Remove password from local object output for security
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user }
  });
};

export const register = catchAsync(async (req: Request, res: Response) => {
  const role = req.body.role === 'vendor' ? 'vendor' : 'customer';
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    role
  });

  // Background welcome email
  EmailService.sendWelcomeEmail(newUser).catch(err => console.error('Email Error:', err));

  createSendToken(newUser, 201, res);
});

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  if (!email || !password) return next(new AppError('Please provide email and password', 400));

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await (user as any).correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  createSendToken(user, 200, res);
});

export const logout = (req: Request, res: Response) => {
  res.status(200).json({ status: 'success', message: 'Logged out successfully' });
};

export const getMe = catchAsync(async (req: any, res: Response) => {
  res.status(200).json({ status: 'success', data: { user: req.user } });
});

export const updateMe = catchAsync(async (req: any, res: Response, next: NextFunction) => {
  if (req.body.password) return next(new AppError('This route is not for password updates.', 400));

  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    { name: req.body.name, photo: req.body.photo },
    { new: true, runValidators: true }
  );

  res.status(200).json({ status: 'success', data: { user: updatedUser } });
});

export const updatePassword = catchAsync(async (req: any, res: Response, next: NextFunction) => {
  const user = await User.findById(req.user.id).select('+password');
  
  if (!(await (user as any).correctPassword(req.body.passwordCurrent, user?.password || ''))) {
    return next(new AppError('Your current password is wrong', 401));
  }

  user!.password = req.body.password;
  await user!.save();

  createSendToken(user, 200, res);
});

export const forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError('No user found with that email address.', 404));

  const resetToken = (user as any).createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/resetPassword/${resetToken}`;
    await EmailService.sendPasswordResetEmail(user, resetURL);
    res.status(200).json({ status: 'success', message: 'Token sent to email!' });
  } catch (err) {
    (user as any).passwordResetToken = undefined;
    (user as any).passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Error sending the email. Try again later!', 500));
  }
});

export const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) return next(new AppError('Token is invalid or has expired', 400));

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  createSendToken(user, 200, res);
});


// ─────────────────────────────────────────────
// ✅ ADMIN: Update user role or status
// ─────────────────────────────────────────────
export const updateUserRoleOrStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { role, isActive } = req.body;

    // Validate input
    if (!role && typeof isActive === 'undefined') {
      return next(new AppError('Provide role or isActive to update', 400));
    }

    const user = await User.findById(id);
    if (!user) return next(new AppError('User not found', 404));

    if (role) user.role = role;
    if (typeof isActive !== 'undefined') user.isActive = isActive;

    await user.save();

    res.status(200).json({
      status: 'success',
      data: { user },
    });
  }
);

// ─────────────────────────────────────────────
// ✅ ADMIN: Delete user by ID
// ─────────────────────────────────────────────
export const deleteUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) return next(new AppError('User not found', 404));

    await User.findByIdAndDelete(id);

    res.status(204).json({ status: 'success', data: null });
  }
);
