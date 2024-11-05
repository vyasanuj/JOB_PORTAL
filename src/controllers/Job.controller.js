import { Job } from "../models/Job.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asycnHandler.js";

export const PostJob = asyncHandler (async(req , res , next )=>{
    console.log("PostJob controller reached"); //debuging 
    const {title,
        jobType,
        location,
        companyName,
        introduction ,
        responsibilities ,
        qualifications , 
        offers , 
        salary ,
        hiringMultipleCandidates ,
        personalWebsitetitle , 
        personalWebsiteurl ,
        jobNiche , 
        newsLettersSent , 
        jobPostedOn ,
        } = req.body ;

    if ([title,jobType,location,companyName,introduction , responsibilities , qualifications , salary , jobNiche].some((filed)=> filed?.trim() ==="")){
        throw new ApiError (400 , "All fields are required and must be non-empty") ;
    }
    if ((personalWebsitetitle && !personalWebsiteurl)||(!personalWebsitetitle && personalWebsiteurl)){
        throw new ApiError (400 ,"Provide both the website url and title, or leave both blank.")
    }

    const postedBy = req.user._id ;
    const job = await Job.create({
        title,
        jobType,
        location,
        companyName,
        introduction ,
        responsibilities ,
        qualifications , 
        offers , 
        salary ,
        hiringMultipleCandidates ,
        personalWebsite : {
            personalWebsitetitle ,
            personalWebsiteurl
        } ,
        jobNiche ,
        postedBy 

    })
    if (!job){
        throw new ApiError (500 , "somthing went wrong while uploding job")
    }
    return res.status(201).json(
        new ApiResponse(200,job, "job uploded successfully")
    )
})