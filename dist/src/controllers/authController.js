"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUserRoleOrStatus = exports.resetPassword = exports.forgotPassword = exports.updatePassword = exports.updateMe = exports.getMe = exports.logout = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const User_1 = __importDefault(require("../models/User"));
const env_1 = require("../config/env");
const catchAsync_1 = require("../utils/catchAsync");
const AppError_1 = require("../utils/AppError");
const emailService_1 = require("../services/emailService");
/**
 * Utility to sign JWT - Using 'as any' for expiresIn to satisfy TS overload requirements
 */
const signToken = (id) => {
    return jsonwebtoken_1.default.sign({ id }, env_1.env.JWT_SECRET, {
        expiresIn: env_1.env.JWT_EXPIRES_IN
    });
};
/**
 * Utility to send token in response
 */
const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id.toString());
    // Remove password from local object output for security
    user.password = undefined;
    res.status(statusCode).json({
        status: 'success',
        token,
        data: { user }
    });
};
exports.register = (0, catchAsync_1.catchAsync)(async (req, res) => {
    const role = req.body.role === 'vendor' ? 'vendor' : 'customer';
    const newUser = await User_1.default.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        role
    });
    // Background welcome email
    emailService_1.EmailService.sendWelcomeEmail(newUser).catch(err => console.error('Email Error:', err));
    createSendToken(newUser, 201, res);
});
exports.login = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password)
        return next(new AppError_1.AppError('Please provide email and password', 400));
    const user = await User_1.default.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError_1.AppError('Incorrect email or password', 401));
    }
    createSendToken(user, 200, res);
});
const logout = (req, res) => {
    res.status(200).json({ status: 'success', message: 'Logged out successfully' });
};
exports.logout = logout;
exports.getMe = (0, catchAsync_1.catchAsync)(async (req, res) => {
    res.status(200).json({ status: 'success', data: { user: req.user } });
});
exports.updateMe = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    if (req.body.password)
        return next(new AppError_1.AppError('This route is not for password updates.', 400));
    const updatedUser = await User_1.default.findByIdAndUpdate(req.user.id, { name: req.body.name, photo: req.body.photo }, { new: true, runValidators: true });
    res.status(200).json({ status: 'success', data: { user: updatedUser } });
});
exports.updatePassword = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const user = await User_1.default.findById(req.user.id).select('+password');
    if (!(await user.correctPassword(req.body.passwordCurrent, user?.password || ''))) {
        return next(new AppError_1.AppError('Your current password is wrong', 401));
    }
    user.password = req.body.password;
    await user.save();
    createSendToken(user, 200, res);
});
exports.forgotPassword = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const user = await User_1.default.findOne({ email: req.body.email });
    if (!user)
        return next(new AppError_1.AppError('No user found with that email address.', 404));
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    try {
        const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/resetPassword/${resetToken}`;
        await emailService_1.EmailService.sendPasswordResetEmail(user, resetURL);
        res.status(200).json({ status: 'success', message: 'Token sent to email!' });
    }
    catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new AppError_1.AppError('Error sending the email. Try again later!', 500));
    }
});
exports.resetPassword = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const hashedToken = crypto_1.default.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User_1.default.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });
    if (!user)
        return next(new AppError_1.AppError('Token is invalid or has expired', 400));
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    createSendToken(user, 200, res);
});
// ─────────────────────────────────────────────
// ✅ ADMIN: Update user role or status
// ─────────────────────────────────────────────
exports.updateUserRoleOrStatus = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { id } = req.params;
    const { role, isActive } = req.body;
    // Validate input
    if (!role && typeof isActive === 'undefined') {
        return next(new AppError_1.AppError('Provide role or isActive to update', 400));
    }
    const user = await User_1.default.findById(id);
    if (!user)
        return next(new AppError_1.AppError('User not found', 404));
    if (role)
        user.role = role;
    if (typeof isActive !== 'undefined')
        user.isActive = isActive;
    await user.save();
    res.status(200).json({
        status: 'success',
        data: { user },
    });
});
// ─────────────────────────────────────────────
// ✅ ADMIN: Delete user by ID
// ─────────────────────────────────────────────
exports.deleteUser = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { id } = req.params;
    const user = await User_1.default.findById(id);
    if (!user)
        return next(new AppError_1.AppError('User not found', 404));
    await User_1.default.findByIdAndDelete(id);
    res.status(204).json({ status: 'success', data: null });
});
