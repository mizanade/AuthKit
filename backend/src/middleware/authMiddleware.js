import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import User from "../models/auth/UserModel.js";

export const protect = asyncHandler(async (req, res, next) => {
  try {
    const token = req.cookies.token;

    //check if token exists
    if (!token) {
      res.status(401);
      throw new Error("Not authorized, please login");
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
