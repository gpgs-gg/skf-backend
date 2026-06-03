import { User } from "../models/User.js";

// GET ALL ACTIVE USERS
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({
      isActive: true,
    })
      .select("-password -refreshToken")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE USER
export const getUserById = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      isActive: true,
    }).select("-password -refreshToken");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE USER
export const updateUser = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      {
        _id: req.params.id,
        isActive: true,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      },
    ).select("-password -refreshToken");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// SOFT DELETE USER
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        isActive: false,
      },
      {
        new: true,
      },
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deactivated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// CHECK USER BY EMAIL
export const checkUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    const user = await User.findOne({
      email,
      isActive: true,
    }).select("-password -refreshToken");

    if (user) {
      return res.status(200).json({
        success: true,
        exists: true,
        data: user,
      });
    }

    return res.status(200).json({
      success: true,
      exists: false,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
