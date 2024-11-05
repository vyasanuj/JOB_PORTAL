import { Router } from "express";
import { jwtverify } from "../middlewares/Auth.middleware.js";
const router = Router() 

import {Registeruser , LoginUser , LogoutUser , getCurrentUser, Changepassword } from "../controllers/User.controller.js"
import { upload } from "../middlewares/multer.middleware.js";

router.route("/register").post(
    upload.fields([
        {
            name : "Avatar" ,
            maxCount : 1 ,
        } ,
        {
            name : "CoverImage" ,
            maxCount : 1 
        } ,
        {
            name : "Resume" ,
            maxCount : 1 
        }
    ]),
    Registeruser
)


router.route("/login").post(LoginUser)
router.route("/logout").post( jwtverify , LogoutUser)
router.route("/getUser").get(jwtverify ,getCurrentUser)
router.route("/changePassword").put(jwtverify , Changepassword)

export default router