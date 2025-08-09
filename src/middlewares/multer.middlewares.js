import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      
      cb(null, file.originalname)
    }
  })
  
export const upload = multer({ 
    storage, 
})



//This code configures Multer to save files in /tmp/my-uploads and gives them unique names combining the field name, current timestamp,
//  and a random number. This ensures secure, organized, and collision-free file uploads.


 //const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    //task to see if task name can be changed
    

    //explore more later

