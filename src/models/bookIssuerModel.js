import mongoose from "mongoose";

const bookIssuerSchema = new mongoose.Schema({
    bookid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    studentid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    returnDays:{
        type:Number,
        required:true
    },
    issuedDate: {
        type: Date,
        default: Date.now
    },
    bookToBeReturned: {
        type: Date,
        required: true
    },
    returnDate:{
        type: Date,
        required: false
    },
    isReturned:{
        type:Boolean,
        default:false
    },
    panalty:{
        type:Number,
        default:0
    }
}, { timestamps: true });

export const BookIssuer = mongoose.model("BookIssuer", bookIssuerSchema);