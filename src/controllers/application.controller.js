import { asyncHandler } from "../utils/asycnHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { Application } from "../models/Application.model.js";
import { UploadOnCloudinary } from "../utils/Cloudinary.js";
import { Job } from "../models/Job.model.js";


const postApplication = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { name, email, phone, address, coverLetter } = req.body;
  console.log("Request Body:", req.body);

  if ([name, email, phone, address, coverLetter]
    .some((field) => field?.trim()  === "")){
       throw new ApiError (400, "All fields are required and must be non-empty") ;
    }
  console.log("Request Body:", req.body);

  
  const jobSeekerInfo = {
    id: req.user._id,
    name,
    email,
    phone,
    address,
    coverLetter,
    role: "Job Seeker",
  };
  const jobDetails = await Job.findById(id);
  console.log(id)
  console.log(await Job.find({}));
  if (!jobDetails) {
    return next(new ApiError(404 ,"Job not found."));
  }
  const isAlreadyApplied = await Application.findOne({
    "jobInfo.jobId": id,
    "jobSeekerInfo.id": req.user._id,
  });
  if (isAlreadyApplied) {
    return next(
      new ApiError("You have already applied for this job.", 400)
    );
  }
  const ResumeLocalpath = req.files?.Resume?.[0]?.path;
  console.log("ResumeLocalpath :",ResumeLocalpath)
  if (!ResumeLocalpath) {
      throw new ApiError(400, "Resume file is required");
  }
  const resume = await UploadOnCloudinary(ResumeLocalpath);
  
  const employerInfo = {
  id: jobDetails.postedBy,
  role: "Employer",
  };
  const jobInfo = {
    jobId: id,
    jobTitle: jobDetails.title,
  };
  const application = await Application.create({
    Resume: resume.url,
    jobSeekerInfo,
    employerInfo,
    jobInfo,
  });
  res.status(201).json({
    success: true,
    message: "Application submitted.",
    application,
  });
});

const employerGetAllApplication = asyncHandler(
  async (req, res, next) => {
    const { _id } = req.user;
    const applications = await Application.find({
      "employerInfo.id": _id,
      "deletedBy.employer": false,
    });
    res.status(200).json({
      success: true,
      applications,
    });
  }
);

const jobSeekerGetAllApplication = asyncHandler(
  async (req, res, next) => {
    const { _id } = req.user;
    const applications = await Application.find({
      "jobSeekerInfo.id": _id,
      "deletedBy.jobSeeker": false,
    });
    res.status(200).json({
      success: true,
      applications,
    });
  }
);

const deleteApplication = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const application = await Application.findById(id);
  if (!application) {
    return next(new ApiError("Application not found.", 404));
  }
  const { role } = req.user;
  switch (role) {
    case "Job Seeker":
      application.deletedBy.jobSeeker = true;
      await application.save();
      break;
    case "Employer":
      application.deletedBy.employer = true;
      await application.save();
      break;

    default:
      console.log("Default case for application delete function.");
      break;
  }

  if (
    application.deletedBy.employer === true &&
    application.deletedBy.jobSeeker === true
  ) {
    await application.deleteOne();
  }
  res.status(200).json({
    success: true,
    message: "Application Deleted.",
  });
});

export {
    postApplication ,
    employerGetAllApplication ,
    jobSeekerGetAllApplication ,
    deleteApplication
}