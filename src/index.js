import { app } from "./app.js";
import dotenv from "dotenv";

dotenv.config({
    path: "./.env"
})

//we are listening to the app and the port

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})

