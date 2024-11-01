import { asyncHandler } from "../utils/asycnHandler.js";
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { UploadOnCloudinary } from "../utils/Cloudinary.js";
import {User} from "../models/User.model.js"
import jwt from "jsonwebtoken"

const generateAccessandRefereshTokens = async(UserID) => {
    try {

        const user = await User.findById(UserID)
        const accessToken = user.generateAccessToken()
        const RefereshToken = user.generateAccessToken()

        user.refreshToken = RefereshToken
        user.save({validateBeforeSave:false})
        // console.log("Access Token:", accessToken);
        // console.log("Refresh Token:", RefereshToken);


        return {accessToken,RefereshToken}
        

    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating referesh and access token")
    }
}

const Registeruser = asyncHandler(async (req, res) => {
    // Log the raw request body to check for spaces in keys
    // console.log("Incoming request body:", req.body);
    
    // function normalizeRequestBody(obj) {
    //     return Object.fromEntries(
    //         Object.entries(obj).map(([key, value]) => [key.trim(), value])
    //     );
    // }

    // req.body = normalizeRequestBody(req.body);

    // console.log("Normalized request body:", req.body);
    
    const {
        Username,
        Email, 
        Password,
        Role,
        Phone,
        Address,
        firstNiche,
        secondNiche,
        thirdNiche
    } = req.body;

    // Validation
    // if ([Username, Email, Password, Role, Phone, Address, firstNiche, secondNiche, thirdNiche]
    //     .some((field) => field === undefined || field === "")) {
    //     throw new ApiError(400, "All fields are required and must be non-empty");
    // }
    if ([Username, Email, Password, Role, Phone, Address, firstNiche, secondNiche, thirdNiche]
         .some((field) => field?.trim()  === "")){
            throw new ApiError (400, "All fields are required and must be non-empty") ;
         }
    // Check if user already exists
    const existedUser = await User.findOne({
        $or: [
            { Username: Username },
            { Email: Email }
        ]
    });

    if (existedUser) {
        throw new ApiError(409, "User with this username or email already exists");
    }

    // Handle file uploads
    const AvatarLocalpath = req.files?.Avatar?.[0]?.path;
    if (!AvatarLocalpath) {
        throw new ApiError(400, "Avatar file is required");
    }

    let CoverImageLocalpath;
    if (req.files?.CoverImage?.[0]?.path) {
        CoverImageLocalpath = req.files.CoverImage[0].path;
    }

    const ResumeLocalpath = req.files?.Resume?.[0]?.path;
    if (!ResumeLocalpath) {
        throw new ApiError(400, "Resume file is required");
    }

    // Upload files to Cloudinary
    const avatar = await UploadOnCloudinary(AvatarLocalpath);
    const coverImage = CoverImageLocalpath ? await UploadOnCloudinary(CoverImageLocalpath) : null;
    const resume = await UploadOnCloudinary(ResumeLocalpath);

    // Create user with exact field names matching the schema
    const user = await User.create({
        Username: Username,
        Email: Email,
        Avatar: avatar.url,
        CoverImage: coverImage?.url || null,
        Resume: resume.url,
        Password,
        Role,
        Phone,
        Address,
        Niches: {
            firstNiche,
            secondNiche,
            thirdNiche
        }
    });

    // Fetch the created user without sensitive data
    const createdUser = await User.findById(user._id).select("-Password -refreshToken");

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    );
});



const LoginUser = asyncHandler (async (req,res) => {
    console.log("Full request body:", req.body); // Log entire request body
    const { Email , Username , Password } = req.body
    // testing 
    console.log("email :" , Email)

    if (!Username && !Email) {
        throw new ApiError(400 , "Username and email are required")
    }

    const user = await User.findOne({
        $or : [{Username} , {Email}]
    })

    if (!user) {
        throw new ApiError(400 , "you are not registred")
    }
    
    const isPasswordValid = await user.isPasswordCorrect(Password) 
    console.log("correct password is:" , Password)
    if (!isPasswordValid){
        throw new ApiError(400 , "password is not valid") 
    }

    const { accessToken , RefereshToken } = 
    await generateAccessandRefereshTokens(user._id)

    const loggedinuser = await User.findById(user._id).select("-password -refreshToken")
    const options = {
        httpOnly : true ,
        secure : true 
    }
    return res
    .status(200)
    .cookie("accessToken" , accessToken , options)
    .cookie("RefereshToken" , RefereshToken , options)
    .json(
        new ApiResponse(
            200,
            {
                user : loggedinuser , accessToken  ,  RefereshToken
            } ,
            "User logged In successfully"
        )
    )
})

const LogoutUser = asyncHandler(async (req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set : {
                refreshToken : undefined
            } 
        } ,
        {
            new : true 
        }
        
    )
    const options = {
        httpOnly : true ,
        secure : true 
    }

    return res
    .status(200)
    .clearCookie("accessToken" , options)
    .clearCookie("RefereshToken" , options )
    .json(new ApiResponse(200 , {} , "User logged Out"))
})

const refreshAccessToken = asyncHandler (async(req,res) => {

    const incomingrefreshTOken = req.cookie.RefereshToken||req.body.RefereshToken
    
    if (!incomingrefreshTOken) {
        throw new ApiError (401 , "invalid refreshToken")
    }

    try {
        const DecodedToken = jwt.verify(incomingrefreshTOken , process.env.REFRESH_TOKEN_SECRET)
    
        console.log("the value of decoded Token :",DecodedToken)
    
        const user = await User.findById(DecodedToken?._id)
    
        if (!user) {
            throw  new ApiError (401 , "invalid refreshToken")
        }
    
        if (incomingrefreshTOken !== user?.refreshToken) {
            throw new ApiError (401 , "expired refresh token")
        }
    
        const {accessToken , RefereshToken}=await generateAccessandRefereshTokens(user._id)
    
        const options = {
            httpOnly : true ,
            secure : true 
        }
    
        res.status(200)
        .cookie("accesstoken" , accessToken , options)
        .cookie("refreshtoken" , RefereshToken , options)
        .json(
            new ApiResponse(
                200 , 
                {
                    accessToken , newrefreshToken : RefereshToken
                } ,
                "access Token refreshed successfullly"
            )
        )
    } catch (error) {
        throw new ApiError (401 , error.message || "invalid refresh token")
    }
})

const Changepassword = asyncHandler (async(req,res)=>{
    const {OldPassword,NewPassword}=req.body
    const user = await User.findById(req.user?._id)
    const checkpassword = await user.isPasswordCorrect(OldPassword)
    if (!checkpassword){
        throw new ApiError(400 ,"Plese enter a valid Password")
    }
    user.password = NewPassword
    await user.save({validateBeforeSave:false})

    return res.status(200)
    .json(
        new ApiResponse(200 , {} , "Password Changed SucceSsfully")
    )
})

const getCurrentUser = asyncHandler (async(req,res)=>{
    return res.status(200)
    .json(
        new ApiResponse (200 , req.user , "current User Fetched Succesfully" )
    )
})

const updateAccountdeatils = asyncHandler (async(req, res) => {
    const {fullname , Username } = req.body
    if (!fullname && !Username) {
        throw new ApiError(400 ,  "All Fields Are Reqiured")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id , 
        { 
            $set :{
            fullname ,
            email
            } 
        },
        {new:true}).select("-password")

    return res.status(200)
    .json(
        new ApiResponse (200 , {fullname , Username}, "Username and fullname updated successsfully")
    )

})

const UpdateUserAvatar = asyncHandler (async(req,res)=>{
    const localfilepath = req.file?.path
    if (!localfilepath){
        throw new ApiError (400 , "local avatar file path is required" )
    }
    const avatar = await UploadOnCloudinary(localfilepath)

    if (!avatar.url){
        throw new ApiError (200 , "avatar url is required to upload on cloudinary")
    }

    const user = User.findByIdAndUpdate(req.user._id ,
        {
            $set : {
                avatar : avatar.url
            }
        },{ new : true }
    ).select("-password")
    return res.status(200)
    .json(200 , user ,  "avatar updated successfully")
})

export { Registeruser ,
    LoginUser ,
    LogoutUser ,
    refreshAccessToken ,
    Changepassword ,
    getCurrentUser ,
    updateAccountdeatils ,
    UpdateUserAvatar
 };




 
// const Registeruser = asyncHandler(async (req, res) => {
//     // Log the raw request body to check for spaces in keys
//     console.log("Incoming request body:", req.body);

//     // Destructure and trim fields, ensuring consistency
//     const {
//         Username,  
//         Email,
//         Password ,
//         Role, 
//         Phone, 
//         Address,
//         firstNiche,
//         secondNiche,
//         thirdNiche
//     } = req.body;


//     if ([Username ,Email , Password , Role, Phone, Address, firstNiche, secondNiche, thirdNiche].some((field) => field?.trim() ==="")) {
//         throw new ApiError(400, "All fields are required and must be non-empty");
//     }

//     // Check if user already exists
//     const existedUser = await User.findOne({
//         $or: [{ Username }, { Email }]
//     });

//     if (existedUser) {
//         throw new ApiError(409, "User with this username or email already exists");
//     }

//     // Handle file uploads
//     const AvatarLocalpath = req.files?.Avatar?.[0]?.path;
//     if (!AvatarLocalpath) {
//         throw new ApiError(400, "Avatar file is required");
//     }

//     let CoverImageLocalpath;
//     if (req.files?.CoverImage?.[0]?.path) {
//         CoverImageLocalpath = req.files.CoverImage[0].path;
//     }

//     const ResumeLocalpath = req.files?.Resume?.[0]?.path;
//     if (!ResumeLocalpath) {
//         throw new ApiError(400, "Resume file is required");
//     }

//     // Upload files to Cloudinary
//     const avatar = await UploadOnCloudinary(AvatarLocalpath);
//     const coverImage = CoverImageLocalpath ? await UploadOnCloudinary(CoverImageLocalpath) : null;
//     const resume = await UploadOnCloudinary(ResumeLocalpath);

//     // Create user
//     const user = await User.create({
//         Username ,
//         Avatar: avatar.url,
//         CoverImage: coverImage ? coverImage.url : null,
//         Resume: resume.url,
//         Email,
//         Password,
//         Role,
//         Phone,
//         Address,
//         Niches: {
//             firstNiche,
//             secondNiche,
//             thirdNiche
//         }
//     });

//     // Fetch the created user without sensitive data
//     const createdUser = await User.findById(user._id).select("-Password -refreshToken");

//     if (!createdUser) {
//         throw new ApiError(500, "Something went wrong while registering the user");
//     }

//     return res.status(201).json(
//         new ApiResponse(200, createdUser, "User created successfully")
//     );
// });

// export { Registeruser };