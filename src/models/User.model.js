import mongoose , {Schema} from "mongoose"

const Userschema = new Schema({
    Username : {
        type : String ,
        required : true ,
        trim : true ,
        index : true
    },
    Email : {
        type : String ,
        required : true ,
        unique : true ,
        lowercase : true ,
        trim : true
    },
    Fullname : {
        type : String ,
        required : true ,
        trim : true ,
        index : true ,
        lowercase : true 
    },
    Password : {
        type : String ,
        required : [true , "password is required"],
        unique : true ,
        minLength: [8, "Password must cantain at least 8 chatacters."],
        maxLength: [32, "Password cannot exceed 32 characters."],
    } ,
    Resume: {
        public_id: String,
        url: String,
      },
    Role: {
        type: String,
        required: true,
        enum: ["Job Seeker", "Employer"],
    },
    Phone : {
        type: Number,
        required: true,
    },
    Address : {
        type: String,
        required: true,
    } ,
    Niches : {
        firstNiche: String,
        secondNiche: String,
        thirdNiche: String,
    } 
},{timestamps:true}) 

export const User = mongoose.model("User",Userschema)