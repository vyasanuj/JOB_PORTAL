import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asycnHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/User.model.js"



const jwtverify = asyncHandler(async (req, res, next) => {
  console.log("JWT verification started");
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }

        const decodedtoken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedtoken?._id).select("-password -refreshToken");
        console.log("Decoded token:", decodedtoken);

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

const isAuthorized = (...roles) => {
  return (req, res, next) => {
      if (!roles.includes(req.user.Role)) {
          return next(
              new ApiError(403, `${req.user.Role} is not allowed to access this resource.`)
          );
      }
      next();
  };
};


export {jwtverify,isAuthorized} 

// const isAuthorized = (...roles) => {
//     return (req,res,next) => {
//         if (!roles.includes(req.user.role)) {
//             throw new ApiError(403, `${req.user.role} not allowed to access this resource.`);
//         }
//         next();
//     };

// }