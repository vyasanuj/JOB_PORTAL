import { Router } from "express";
import { isAuthorized, jwtverify } from "../middlewares/Auth.middleware.js";
import { getalljob, PostJob ,getmyjob ,deletejob ,getASingleJob} from "../controllers/Job.controller.js";
const router = Router() 

// router.route("/post").post(jwtverify,isAuthorized,PostJob)
router.route("/post").post(jwtverify, isAuthorized("Employer"), PostJob);
router.route("/getalljob").get(jwtverify,getalljob)
router.route("/getmyjob").get(jwtverify,isAuthorized("Employer"),getmyjob)
router.route("/deletejob/:id").delete(jwtverify ,isAuthorized("Employer"), deletejob)
router.route("/getASingleJob/:id").get(jwtverify , getASingleJob)



export default router ;