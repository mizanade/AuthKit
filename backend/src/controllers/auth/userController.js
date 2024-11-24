import asyncHandler from "express-async-handler";
import User from "../../models/auth/UserModel.js";
import generateToken from "../../helpers/generateToken.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import Token from "../../models/auth/Token.js";
import hashToken from "../../helpers/hashToken.js";
import sendEmail from "../../helpers/sendEmail.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { name, username, email, password } = req.body;

  //validation add username
  if (!name || !email || !password || !username) {
    res.status(400).json({
      message: "Please add all fields",
    });
  }

  if (username.length < 3) {
    res.status(400).json({
      message: "Username should be at least 3 characters",
    });
  }

  //check password length
  if (password.length < 8) {
    res.status(400).json({
      message: "Password should be at least 8 characters",
    });
  }

  //check if user alerady exists
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });

  if (existingUser) {
    res.status(400).json({
      message: "User already exists",
    });
  }

  const user = await User.create({
    name,
    username,
    email,
    password,
  });

  const token = generateToken(user._id);

  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, //30 days
    sameSite: true,
    secure: true,
  });

  if (user) {
    const { _id, name, username, email, role, photo, bio, isVerified } = user;

    res.status(201).json({
      _id,
      name,
      username,
      email,
      role,
      photo,
      bio,
      isVerified,
      token,
    });
  } else {
    res.status(400).json({
      message: "Invalid user data",
    });
  }
});

export const loginUser = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    res.status(400).json({
      message: "Please add all fields",
    });
  }

  const existingUser = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  }).select("+password");

  if (!existingUser) {
    res.status(400).json({
      message: "User does not exist",
    });
  }

  if (!existingUser.password) {
    res.status(400).json({
      message: "Password not set",
    });
  }

  const isMatch = await bcrypt.compare(password, existingUser.password);

  if (!isMatch) {
    res.status(400).json({
      message: "Invalid email or password",
    });
  }

  const token = generateToken(existingUser._id);

  if (existingUser && isMatch) {
    const { _id, name, username, email, role, photo, bio, isVerified } =
      existingUser;

    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      maxAge: 30 * 24 * 60 * 60 * 1000, //30 days
      sameSite: true,
      secure: true,
    });

    res.status(200).json({
      _id,
      name,
      username,
      email,
      role,
      photo,
      bio,
      isVerified,
      token,
    });
  } else {
    res.status(400).json({
      message: "Invalid email/username or password",
    });
  }
});

export const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({
    message: "user logged out",
  });
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (user) {
    res.status(200).json(user);
  } else {
    res.status(404).json({
      message: "User not found",
    });
  }
});

export const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    // user propeties to be updated
    const { name, username, email, bio, photo } = req.body;
    user.name = req.body.name || user.name;
    user.username = req.body.username || user.username;
    user.bio = req.body.bio || user.bio;
    user.photo = req.body.photo || user.photo;

    const updated = await user.save();

    res.status(200).json({
      _id: updated._id,
      name: updated.name,
      username: updated.username,
      email: updated.email,
      bio: updated.bio,
      photo: updated.photo,
    });
  } else {
    res.status(404).json({
      message: "User not found",
    });
  }
});

//login status
export const userLoginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    res.status(401).json({
      message: "Not authorized, please login",
    });
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (decoded) {
    res.status(200).json(true);
  } else {
    res.status(401).json(false);
  }
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  //if user exist
  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  //check if user is already verified
  if (user.isVerified) {
    return res.status(400).json({
      message: "User already verified",
    });
  }

  let token = await Token.findOne({ userId: user._id });

  //if token exist -> delete token
  if (token) {
    await token.deleteOne();
  }

  const verificationToken = crypto.randomBytes(32).toString("hex") + user._id;

  const hashedToken = hashToken(verificationToken);

  await new Token({
    userId: user._id,
    verificationToken: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, //1 day
  }).save();

  const verificationLink = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;

  const subject = "Email Verification - AuthKit";
  const send_to = user.email;
  const reply_to = "noreply@gmail.com";
  const template = "emailVerification";
  const send_from = process.env.USER_EMAIL;
  const name = user.name;
  const url = verificationLink;

  try {
    //order matters --> subject, send_to, reply_to, template, send_from, name, url
    await sendEmail(subject, send_to, reply_to, template, send_from, name, url);
    return res.json({ message: "Email sent" });
  } catch (error) {
    return res.status(500).json({
      message: "Email could not be sent",
    });
  }
});

export const verifyUser = asyncHandler(async (req, res) => {
  const { verificationToken } = req.params;

  if (!verificationToken) {
    return res.status(400).json({
      message: "Invalid verification token",
    });
  }

  const hashedToken = hashToken(verificationToken);

  const userToken = await Token.findOne({
    verificationToken: hashedToken,
    expiresAt: { $gt: Date.now() },
  });

  if (!userToken) {
    return res
      .status(400)
      .json({ message: "Invalid or expired verification token" });
  }

  const user = await User.findById(userToken.userId);

  if (user.isVerified) {
    return res.status(400).json({
      message: "User already verified",
    });
  }

  user.isVerified = true;
  await user.save();
  res.status(200).json({
    message: "User verified",
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "email is required",
    });
  }

  //check if user exist
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  let token = await Token.findOne({ userId: user._id });

  if (token) {
    await token.deleteOne();
  }

  const passwordResetToken = crypto.randomBytes(32).toString("hex") + user._id;

  const hashedToken = hashToken(passwordResetToken);
  try {
    await new Token({
      userId: user._id,
      passwordResetToken: hashedToken,
      createdAt: Date.now(),
      expiresAt: Date.now() + 60 * 60 * 1000, //60 minutes
    }).save();
  } catch (error) {
    console.error("Error saving reset token:", error);
    return res.status(500).json({ message: "Could not save reset token" });
  }

  const resetLink = `${process.env.CLIENT_URL}/reset-password/${passwordResetToken}`;

  //send email to user
  const subject = "Reset Password - AuthKit";
  const send_to = user.email;
  const send_from = process.env.USER_EMAIL;
  const reply_to = "noreply@gmail.com";
  const template = "forgotPassword";
  const name = user.name;
  const url = resetLink;

  try {
    await sendEmail(subject, send_to, reply_to, template, send_from, name, url);
    res.json({ message: "Email sent" });
  } catch (error) {
    res.status(500).json({
      message: "Email could not be sent",
    });
  }
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { resetPasswordToken } = req.params;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  //hash the reset token
  const hashedToken = hashToken(resetPasswordToken);

  const userToken = await Token.findOne({
    passwordResetToken: hashedToken,
    expiresAt: { $gt: Date.now() },
  });

  if (!userToken) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  const user = await User.findById(userToken.userId);

  user.password = password;
  await user.save();

  res.status(200).json({
    message: "Password reset successful",
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Please add all fields" });
  }

  const user = await User.findById(req.user._id).select("+password");
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  console.log("Current Password:", currentPassword);
  console.log("Stored Password (user.password):", user.password);

  // Check if user.password exists before comparing
  if (!user.password) {
    console.error("User password is undefined");
    return res.status(500).json({ message: "Internal server error" });
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);

  if (!isMatch) {
    return res.status(400).json({ message: "Invalid password!" });
  }

  // reset password
  if (isMatch) {
    user.password = newPassword;
    await user.save();
    return res.status(200).json({ message: "Password changed successfully" });
  } else {
    return res.status(400).json({ message: "Password could not be changed!" });
  }
});
