import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const UploadOnCloudinary = async (Localfilepath) => {
    try {
        if (!Localfilepath) {
            console.error("No file path provided to UploadOnCloudinary");
            return null;
        }

        const response = await cloudinary.uploader.upload(Localfilepath, {
            resource_type: "auto"
        })
        
        console.log("File uploaded successfully to Cloudinary:", response.url);
        
        fs.unlinkSync(Localfilepath)
        
        return response;
    } 
    catch (error) {

        console.error("Error in UploadOnCloudinary:", error);
        
        if (fs.existsSync(Localfilepath)) {
            fs.unlinkSync(Localfilepath)
        }
        
        return null;
    }
}

export { UploadOnCloudinary }