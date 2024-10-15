import mongoose from "mongoose";

const connectDb = async (params) => {
    try {
        const connectioninstance = await mongoose.connect(`${process.env.MONGODB_URI}/`);
        console.log (`\n MONGODB CONNECTED !! DB_HOST:${connectioninstance.connection.host}`);
    } catch (error) {

        console.error("MONGODB CONNECTION ERROR", error);
        process.exit(1);
        
    }
}

export default connectDb ;