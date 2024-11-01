import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asycnHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/User.model.js"



const jwtverify = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedtoken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedtoken?._id).select("-password -refreshToken");

        if (!user) {
            throw new ApiError(401, "Invalid Access Token");
        }

        req.user = user; // Set the user in the request object
        next();
    } catch (error) {
        console.error("JWT Verification Error:", error.message);
        throw new ApiError(401, error?.message || "Invalid Access Token");
    }
});

export {jwtverify} 