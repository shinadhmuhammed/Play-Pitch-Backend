import mongoose from "mongoose";

const chatSchema=new mongoose.Schema({
    senderName:{
        type:String,
        required:true
    },    
    sender:{
        type:String,
        required:true
    },
    message:{
        type:String,
        required:true
    },
    timeStamp:{
        type:Date,
        required:true
    },
    activityId: {
        type: String,
        required: true
      }
})

const Chat=mongoose.model('Chat',chatSchema)
export default Chat