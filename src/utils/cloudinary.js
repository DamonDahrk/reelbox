import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';


//CONFIGURE CLOUDINARY
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null

         //if there is no file to upload just return null

        const response = await cloudinary.uploader.upload(
        localFilePath, {
            resource_type : "auto"
        }
        )
       console.log("File uploaded on cloudinary, File src: +"+
        response.url)
        //once the file is uploaded we can now delete the file from
        //our server
        fs.unlinkSync(localFilePath);
        return response
        //we return the response
    }
    catch (error) {
        fs.unlinkSync(localFilePath);
        return null
    }
    //we dont have to store the file in our server if it fails
    //in cloudinary as well

    //async exists here goes without any question
}

export {uploadOnCloudinary}