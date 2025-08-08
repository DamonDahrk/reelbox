import { app } from "./app.js";
import dotenv from "dotenv";
import connectDB from "./db/index.js";

dotenv.config({
    path: "./.env"
})

//we are listening to the app and the port

const PORT = process.env.PORT;


connectDB().then( () => {
    app.listen(PORT, () =>
    {
        console.log(`Server is running on port ${PORT}`);
    })
})
.catch((err) => {
    console.log("MongoDB connection error!",err);
}
);