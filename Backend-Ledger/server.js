require("dotenv").config()

const app = require("./src/app.js")
const connectToDB = require("./src/config/database.js")

connectToDB().then(()=>{
    console.log("Connect to DB")
}).catch((err)=>{
    console.log("Error in connecting DB",err);
    process.exit(1)
})

app.listen(process.env.PORT || 3000 ,()=>{
    console.log(`Server is listening to PORT : ${process.env.PORT}`)
})