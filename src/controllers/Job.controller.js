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

    // Log the city query parameter to check if it's being received correctly
    // console.log("City Query Parameter:", req.query.city);

    // Hardcode location to "New York" temporarily for testing
    // query.location = "INDORE"; // For testing only

    if (city) {
        query.location = city; 
        console.log("City filter applied:", city);
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
    console.log("Final Query:", query);

    const jobs = await Job.find(query)
    return res.status(200).json(
        new ApiResponse ({success: true,
            jobs,
            count: jobs.length })
    )

})

const getmyjob = asyncHandler(async (req,res,next)=>{
    const myjob = await Job.find({postedBy : req.user._id});
    return res.status(200).json(
        new ApiResponse ({
            success : true ,
            myjob ,
            count: myjob.length
        })
    )
})

const deletejob = asyncHandler (async (req,res)=>{
    const {id} = req.params ;
    console.log(" job id ",req.params)
    const job = await Job.findById(id) ;
    if (!job){
        throw new ApiError (404 , "oops! job not found")
    }
    await job.deleteOne();
    return res.status(200).json(
        new ApiResponse ( {
            success : true ,
            message : "job deleted"
        }
        )
    )
})

const getASingleJob = asyncHandler (async (req,res)=>{
    const {id} = req.params ;
    const job = await Job.findById(id);
    if (!job){
        throw new ApiError (404 , "job not found");
    }
    return res.status(200).json(
        new ApiResponse ({
            success : true ,
            job
        })
    )

})

export {PostJob ,
    getalljob ,
    getmyjob ,
    deletejob ,
    getASingleJob
}