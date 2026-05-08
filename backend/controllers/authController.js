const User = require("../models/User");
const jwt = require("jsonwebtoken");
//generate JWT token
const generateToken = (user) => {
  const payload = { id: user._id, role: user.role };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
};
const generateRefreshToken = (user) => {
  const payload = {
    id: user._id,
  };

  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};
//register user: POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }
    const user = await User.create({ name, email, password });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//login user: POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;

    await user.save();
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })
    .status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
const refreshAccessToken = async (req, res) => {

    try {

        const token = req.cookies.refreshToken;

        if (!token) {
            return res.status(401).json({
                message: 'Refresh token missing'
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_REFRESH_SECRET
        );

        const user = await User.findById(decoded.id);

        if (!user || user.refreshToken !== token) {
            return res.status(403).json({
                message: 'Invalid refresh token'
            });
        }

        const accessToken = generateToken(user);

        res.status(200).json({
            token: accessToken
        });

    } catch (error) {

        console.error(error);

        res.status(403).json({
            message: 'Invalid refresh token'
        });
    }
};
const logout = async (req, res) => {

    try {

        const token = req.cookies.refreshToken;

        if (token) {

            const decoded = jwt.verify(
                token,
                process.env.JWT_REFRESH_SECRET
            );

            const user = await User.findById(decoded.id);

            if (user) {
                user.refreshToken = null;
                await user.save();
            }
        }

        res.clearCookie('refreshToken');

        res.status(200).json({
            message: 'Logged out successfully'
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: 'Server error'
        });
    }
};
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password -refreshToken")
      .populate("assignedZone");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json({
      user,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch profile",
    });
  }
};
module.exports = { register, login, refreshAccessToken, logout, getMe };
