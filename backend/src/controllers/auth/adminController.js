import asyncHandler from "express-async-handler";
import User from "../../models/auth/UserModel.js";

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500);
    throw new Error("Cannot delete user");
  }
});

export const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const user = await User.find({});

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500);
    throw new Error("Cannot get users");
  }
});
