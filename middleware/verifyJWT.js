import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/User.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    // get token from cookies
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(200).json({
        success: true,
        message: "No Record Found",
      });
    }

    // verify token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // find user
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken",
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid access token",
      });
    }

    // attach user to request
    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || "Invalid access token",
    });
  }
});
