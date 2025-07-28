import mongoose from "mongoose";

const connectDb= async()=>{
    await mongoose.connect(process.env.MONGO,{
        dbName:"ChatterBox",
    }).then(()=>console.log("DataBase Connected"))

}

export default connectDb;

