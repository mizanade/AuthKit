import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/auth/UserModel.js";

export const protect = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies.token;

    //check if token exists
    if (!token) {
      res.status(401).json({
        message: "Not authorized, please login",
      });
    }

    //verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //get user from token excluded password
    const user = await User.findById(decoded.id).select("-password");

    //check if user exists
    if (!user) {
      res.status(401);
      throw new Error("User not found!");
    }

    //set user as req.user
    req.user = user;

    next();
  } catch (error) {
    res.status(401);
    throw new Error("Not authorized,Token Failed");
  }
});

//admin middleware
export const adminMiddleware = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
    return;
  } else {
    res.status(403).json({ message: "Access denied, only admin can do this" });
  }
});

export const creatorMiddleware = asyncHandler(async (req, res, next) => {
  if ((req.user && req.user.role === "creator") || req.user.role === "admin") {
    //if not creator, move to the next middleware/controller
    next();
    return;
  }
  //if not creator, send 403 forbidden --> terminate the request
  res.status(403).json({ message: "Access denied, only creator can do this" });
});

export const verifyMiddleware = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.isVerified) {
    next();
    return;
  }
  res.status(403).json({ message: "Please verify your email" });
});
