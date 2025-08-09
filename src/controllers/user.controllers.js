import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/user.models.js';
import {uploadOnCloudinary, deleteFromCloudinary} from '../utils/cloudinary.js';
import {ApiResponse} from '../utils/ApiResponse.js';



const registerUser = asyncHandler (async (req, res) => {
  const {fullname, email, username, password} = req.body 

//validation

//we can apply the same to all fields

    if([fullname, username, email, password].some((field) => 
        field?.trim() === "")
    ){
    throw new ApiError(400, "All fields are required")
    //here is where we can use this util  for illegal length
}

//await this because server is diff region again

const existedUser = await User.findOne({
  $or: [
    {username},
    {email}
  ]}) //we are searching based on username and email

  if(existedUser){
    throw new ApiError(409, "User already exists")
  }
  //Standardized response and existing error 
  //now we are doing new user thingy:

  console.warn(req.files);
 const avatarLocalPath = req.files?.avatar?.[0]?.path;
  //handling in case of no files so the question mark here
  //now if file there and avatar not there we are handling that too
  const coverLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath){ 
      throw new ApiError(400, "Avatar is required")
  }

// const avatar = await uploadOnCloudinary(avatarLocalPath);
 // let coverImage = "";
 // if(coverLocalPath){
  //coverImage = await uploadOnCloudinary(coverImage);
  //}
  //incase coverImage has been uploaded then only we are pushing it 
  //to cloudinary otherwise we arent.


  //Time to register the user: 

  let avatar;
  try {
    avatar = await uploadOnCloudinary(avatarLocalPath);
    console.log("Avatar uploaded successfully", avatar);
  } catch (error) {
    console.log("Failed to load avatar ",error);
    throw new ApiError(500, "Failed to load avatar");
  }

  let coverImage;
try {
    coverImage = await uploadOnCloudinary(coverLocalPath);
    console.log("Uploaded coverImage", coverImage);
} catch (error) {
    console.log("Error uploading coverImage", error);
    throw new ApiError(500, "Failed to upload coverImage");
}



try {
    const user = await User.create({
      fullname,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      username: username.toLowerCase(),
  
      //now we are making it lowercase so that it is not case sensitive
    })
  
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );
    //making sure that we are getting the user id from the db
    //and no chance of error (reliability)
  
    if(!createdUser){
      throw new ApiError(500, "Something went wrong while creating user");
    };
  
    return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User created successfully!!"))
} catch (error) {
  console.log("User Creation failed", error);
  if(avatar) {
    await deleteFromCloudinary(avatar.public_id);
  }
  if(coverImage) {
    await deleteFromCloudinary(coverImage.public_id);
  }
throw new ApiError(500, "Something went wrong while creating user and images were deleted");



  //throwing error so that it can be caught by the error handler
}

  //finally the success message that the user has been created successfully
  
});

export {registerUser}