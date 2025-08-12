import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/user.models.js';
import {uploadOnCloudinary, deleteFromCloudinary} from '../utils/cloudinary.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import { access } from 'fs';
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
try {
    const user = await User.findById(userId);
    //small check for user existence
  
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    
    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave: false});
    return {accessToken, refreshToken}
} catch (error) {
  throw new ApiError(500, "Something went wrong while generating access and refresh tokens");
  
}
};

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

const loginUser = asyncHandler(async (req, res) => {

  //get data from body 
  const {email, username, password} = req.body;

  if(!email){
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({
    $or: [{username}, {email}]
  });

  if(!user){
    throw new ApiError(404, "User not found");
  }

  //end handling other errors 

  const isPasswordValid = await
   user.isPasswordCorrect(password) ;

   if(!isPasswordValid){
      throw new ApiError(401, "Invalid credentials");

    }

    const {accessToken, refreshToken} = await 
    generateAccessAndRefreshToken(user._id);

    //after validating we are taking the tokens for the userid

    const loggedInUser = await User.findById(user._id)
    .select("-password -refreshToken");

    if(!loggedInUser){
      throw new ApiError(500, "Something went wrong while logging in");
    }

    //check if the user is already logged in

    const options = {
      httpOnly : true,
  // This ensures that cookie cannot be accessed via client-side JavaScript.
  //  It helps prevent cross-site scripting (XSS) attacks by making the cookie inaccessible
      secure: process.env.NODE_ENV === "production",
  //This sets the cookie to be sent only over HTTPS connections
  //  when your application is running in production

    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
      "User logged in successfully"
    ))

  });

    //FINAL SUCCESS MESSAGE ON EVERYTHING MATCHING

const logOutUser = asyncHandler(async (req, res) => 
  {
    await User.findByIdAndUpdate(
      
    req.user._id, //After validation, the middleware attaches the authenticated user's information to req.user.
                  //  This means req.user is now an object representing the logged-in user.
    {
      $set: {
        refreshToken: undefined,
      },
    },
    { new: true }
    //deleting the refresh token from the database
    //new true ensures that the method will return the updated document after the update is applied

  );

    const options = {
      httpOnly : true,
      secure: process.env.NODE_ENV === "production",
 
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
      new ApiResponse(
        200, {},
      "User logged out successfully"))

});

//reminder: await wait untils the method is completed until 
//while it waits for the variable, the surrounding func is paused


const refreshAccessToken = asyncHandler( async (req, res) =>
    {
      //designed so that a new set of access tokens is generated for you
      
      const incomingRefreshToken = req.cookies.refreshToken ||
      req.body.refreshToken

      //body for mobile apps and cookies for web apps 

      if(!incomingRefreshToken){
        throw new 
        ApiError(401, "Please log in to refresh your access token");
      }
      
      try{
        const decodedToken = jwt.verify(
          incomingRefreshToken,
          process.env.REFRESH_TOKEN_SECRET
        );

        const user = await User.findById(decodedToken?._id);

        //token might not be there so we always use ? 
        if (!user) {
          throw new ApiError(401, "Invalid refresh token");
        }

        if(incomingRefreshToken !== user?.refreshToken) {
          throw new ApiError(401, "Invalid refresh token");
        }

        //we are confirming refresh token with that of that in db

        const options = {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production"
        };

        //industry practice for abstraction again 
        //casting refreshtoken as a new name
        const {accessToken, refreshToken: newRefreshToken} =
         await generateAccessAndRefreshToken(user._id);
        
         return res
         .status(200)
         .cookie("refreshToken", newRefreshToken, options)
         .json( 
          new ApiResponse(
            200, 
            {accessToken, 
              refreshToken: newRefreshToken
            }, 
            "Access token refreshed successfully"));

      }catch(error) {
        throw new ApiError(500, "Something went wrong while");
      }

     
       
    });
       
const changeCurrentPassword = asyncHandler ( async (req, res) =>
{
    const {oldPassword, newPassword} = req.body;

    const user = await User.findById(req.user?._id);

    const isPasswordCorrect =  
    await user.isPasswordCorrect(oldPassword);

    if(!isPasswordValid) {
      throw new ApiError(401, "Invalid old password");
    }

    user.password = newPassword;
    await user.save({validateBeforeSave : false });

    //validateBeforeSave option in Mongoose determines whether 
    // schema validation is automatically performed before 
    // saving a document to the database

    return res.status(200).json(
      new ApiResponse(
        200,
        {message: "Password changed successfully"},
        "Password changed successfully"
      )
    )
  
});



const getCurrentUser = asyncHandler ( async (req, res) =>
{
    return res.status(200).json(
      new ApiResponse(
        200, req.user,
  
        "User details fetched successfully"
      )
    )
});

const updateAccountDetails = asyncHandler ( async (req, res) =>
{
    const {fullname, email} = req.body;

    if(!fullname || !email) {
      throw new ApiError(400, "Please provide fullname and email");
    }

    //notes on findByIdAndUpdate() mongoose operation

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          fullname,
          email: email
        }
      },
      {new: true}).select("-password -refreshToken");

      return res.status(200).json(
        new ApiResponse(
          200, user,
  
          "User details updated successfully"
        )
      )
});



const updateUserAvatar = asyncHandler ( async (req, res) =>
{
  // no need for body as this is just image

  const avatarLocalPath = req.files?.path;

  if(!avatarLocalPath){
    throw new ApiError(400, "No image provided");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  //we got avatar back
  
  if(!avatar.url){
    throw new ApiError(500, 
      "Something went wrong while uploading the image")
  }

  const user = await User.findByIdAndUpdate(req.user?._id, {
    $set: {
      avatar: avatar.url
    }
    },
  {new: true}
).select("-password -refreshToken");

res.status(200).json(
  new ApiResponse(
    200, user,
  
    "Avatar details updated successfully"
  )
)
});


const updateUserCoverImage = asyncHandler ( async (req, res) =>
{
// no need for body as this is just image

  const coverImageLocalPath = req.files?.path;

  if(!coverImageLocalPath){
    throw new ApiError(400, "No image provided");
  }

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  //we got avatar back
  
  if(!coverImage.url){
    throw new ApiError(500, 
      "Something went wrong while uploading the image")
  }

  const user = await User.findByIdAndUpdate(req.user?._id, {
    $set: {
      coverImage: coverImage.url
    }
    },
  {new: true}
).select("-password -refreshToken");

res.status(200).json(
  new ApiResponse(
    200, user,
  
    "Cover Image details updated successfully"
  )
)
});





export {registerUser,
   loginUser,
    refreshAccessToken, 
    logOutUser,
  changeCurrentPassword,
getCurrentUser,
updateAccountDetails,
updateUserAvatar,
updateUserCoverImage}