import asyncHandler from "express-async-handler";
import User from "../../models/auth/UserModel.js";
import generateToken from "../../helpers/generateToken.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const registerUser = asyncHandler(async (req, res) => {
  const { name, username, email, password } = req.body;

  //validation add username
  if (!name || !email || !password || !username) {
    res.status(400);
    throw new Error("Please add all fields");
  }

  if (username.length < 3) {
    res.status(400);
    throw new Error("Username should be at least 3 characters");
  }

  //check password length
  if (password.length < 8) {
    res.status(400);
    throw new Error("Password should be at least 8 characters");
  }

  //check if user alerady exists
  const existingUser = await User.findOne({ $or: [{ email }, { username }] });

  if (existingUser) {
    res.status(400);
    throw new Error("User already exists");
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
    res.status(400);
    throw new Error("Invalid user data");
  }
});

export const loginUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if ((!email && !username) || !password) {
    res.status(400);
    throw new Error("Please add email or username and password");
  }

  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  }).select("+password");

  if (!existingUser) {
    res.status(400);
    throw new Error("User does not exist, sign up!");
  }

  if (!existingUser.password) {
    res.status(400);
    throw new Error("Password hash not found");
  }

  const isMatch = await bcrypt.compare(password, existingUser.password);

  if (!isMatch) {
    res.status(400);
    throw new Error("Invalid credentials");
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
    res.status(400);
    throw new Error("Invalid email/username or password");
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
    res.status(404);
    throw new Error("User not found!");
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
    res.status(404);
    throw new Error("User not found!");
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
