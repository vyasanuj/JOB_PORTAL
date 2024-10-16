import connectDb from "./db/index.js"
import app from "./app.js"
import dotenv from "dotenv"


dotenv.config(
    {path : '/.env'}
)


// console.log("MONGODB_URI:", process.env.MONGODB_URI);
// console.log("DB_NAME:", process.env.DB_NAME);

connectDb()
.then(()=>{
    app.listen(process.env.PORT||8000 , ()=>{
        console.log("surver is running on port",`${process.env.PORT}`)
    })
    app.on(error , (error)=>{
        console.log(error)
        process.exit(1)
    })
})
.catch((error)=>{
    console.log("DATABASE CONNECTION ERROR",error)
})