import mongoose , {Schema} from "mongoose"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const Userschema = new Schema({
    Username : {
        type : String ,
        required : true ,
        trim : true ,
        index : true
    },
    Email: {
        type: String,
        required: true,
        unique: true,
    },
    Password : {
        type : String ,
        required : [true , "password is required"],
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
    } ,
    Avatar : {
        type: String, // cloudinary url
        // required: true,    
    } ,
    coverImage: {
        type: String, // cloudinary url
    }
},
{timestamps:true}) 

// Userschema.pre("save", async function (next) {
//     if(!this.isModified("Password")) return next();

//     this.Password = await bcrypt.hash(this.Password, 10)
//     next()
// })
Userschema.pre("save", async function (next) {
    // Debug to check if password is modified
    console.log("Is Password modified:", this.isModified("Password"));

    // Check if password is modified before hashing
    if (!this.isModified("Password")) return next();

    // Hash password and store it
    this.Password = await bcrypt.hash(this.Password, 10);
    console.log("Hashed Password:", this.Password); // Debug hashed password

    next();
});


Userschema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.Password)
}

Userschema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
Userschema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model("User",Userschema)