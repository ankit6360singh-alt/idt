import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateTokens = (id) => {
  const accessToken = jwt.sign({ id }, process.env.JWT_SECRET || 'travlo_secret_jwt_key_2026', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
  const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || 'travlo_refresh_secret_key_2026', {
    expiresIn: '30d',
  });
  return { accessToken, refreshToken };
};

export const register = async (req, res, next) => {
  try {
    const { fullName, name, username, email, password, role } = req.body;
    const finalName = fullName || name || email.split('@')[0];
    const finalUsername = username || email.split('@')[0].replace(/[^a-zA-Z0-9._-]/g, '_');

    const existingUser = await User.findOne({ $or: [{ email }, { username: finalUsername }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: existingUser.email === email ? 'Email already registered' : 'Username already taken',
      });
    }

    const user = await User.create({
      fullName: finalName,
      username: finalUsername,
      email,
      password,
      role: role && ['user', 'admin', 'moderator'].includes(role) ? role : 'user',
    });

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token: accessToken,
      accessToken,
      refreshToken,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshTokens.push({ token: refreshToken });
    await user.save();

    res.status(200).json({
      success: true,
      token: accessToken,
      accessToken,
      refreshToken,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('favoriteDestinations')
      .populate('createdTrips');

    res.status(200).json({
      success: true,
      data: user,
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const fieldsToUpdate = ['fullName', 'phoneNumber', 'country', 'preferredCurrency', 'preferredLanguage', 'travelPreferences', 'budgetPreference', 'themePreference', 'notificationSettings'];
    
    const updates = {};
    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
      user,
    });
  } catch (error) {
    next(error);
  }
};
