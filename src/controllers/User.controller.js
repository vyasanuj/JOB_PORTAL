import {asycnHandler} from "../utils/asyncHandler.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { UploadOnCloudinary } from "../utils/Cloudinary.js";
import {User} from "../models/User.model.js"

const Registeruser = asycnHandler( async (req , res) => {

    const {Username , Fullname , Email , Password , Avatar , Resume , Role , Phone , address , Niches } = req.body 

    if (
        [Username , Fullname , Email , Password , Avatar , Resume , Role , Phone , address , Niches].some((field)=>field.trim() ==="")
    ){
        throw new ApiError(400,"All fields are required");
        
    }

    const Existeduser = User.findOne({
        $or : [{Username},{Email}]
    })

    if (Existeduser) {
        throw new ApiError(409 , "user with this username or email already exists")
    }

} )