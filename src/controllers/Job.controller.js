import { Job } from "../models/Job.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asycnHandler.js";

const PostJob = asyncHandler (async(req , res , next )=>{
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

const getalljob = asyncHandler (async(req,res,next)=>{
    const {city , niche , searchKeyword} = req.query ;
    const query = {} ;
    if (city) {
        query.location = city ;
    }
    if (niche) {
        query.jobNiche = niche ;
    }
    if (searchKeyword) {
        query.$or = [
            {title : {$regex : searchKeyword , $options : "i"}},
            {companyName: { $regex: searchKeyword, $options: "i" }},
            {introduction: { $regex: searchKeyword, $options: "i" }}
        ];
    }
    const jobs = await Job.find(query)
    return res.status(200).json(
        new ApiResponse ({success: true,
            jobs,
            count: jobs.length })
    )
})

export {PostJob ,
    getalljob}