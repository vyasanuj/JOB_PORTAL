import express, { json } from "express" 
import cors from "cors"
import cookieparser from "cookie-parser"

const app = express() 

app.use(cors({
    origin:process.env.CORS_ORIGIN ,
    credentials: true
}))
app.use(json({
    limit : "1mb"
}))
// app.use(express.json({
//     limit : "16kb"
// }))
app.use(express.urlencoded({
    limit : "16kb"
}))
app.use(express.static("public"))
app.use(cookieparser())

// routes import
import UserRouter from "./routes/user.routes.js"
import JobRouter from "./routes/job.routes.js"
import ApplicationRouter from "./routes/application.routes.js"

// routes decliration 
app.use("/api/v1/users", UserRouter)
app.use("/api/v1/job", JobRouter)
app.use("/api/v1/application", ApplicationRouter)

export default app