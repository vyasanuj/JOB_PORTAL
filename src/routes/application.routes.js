import { Router } from "express";
import { isAuthorized, jwtverify } from "../middlewares/Auth.middleware.js";
import {   deleteApplication,employerGetAllApplication,jobSeekerGetAllApplication,
    postApplication } from "../controllers/application.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router() 


// router.post(
//   upload.fields(
//     {
//     name : "Resume" 
//     maxCount : 1 
// }
// ),
//     "/post/:id",
//     jwtverify,
//     isAuthorized("Job Seeker"),
//     postApplication
//   );
  
  router.route("/post/:id").post(upload.fields([{
    name : "Resume" ,
    maxCount : 1 
    }]),
    jwtverify,
    isAuthorized("Job Seeker"),
    postApplication)
    
  router.get(
    "/employer/getall",
    jwtverify,
    isAuthorized("Employer"),
    employerGetAllApplication
  );
  
  router.get(
    "/jobseeker/getall",
    jwtverify,
    isAuthorized("Job Seeker"),
    jobSeekerGetAllApplication
  );
  
  router.delete("/delete/:id", jwtverify, deleteApplication);

  export default router ;