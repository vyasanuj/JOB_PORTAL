import { Router } from "express";
import { isAuthorized, jwtverify } from "../middlewares/Auth.middleware.js";
import { PostJob } from "../controllers/Job.controller.js";
const router = Router() 

// router.route("/post").post(jwtverify,isAuthorized,PostJob)
router.route("/post").post(jwtverify, isAuthorized("Employer"), PostJob);


export default router ;