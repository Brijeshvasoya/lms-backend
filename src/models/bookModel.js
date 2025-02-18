import mongoose from "mongoose";

const BookSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    publisher: {
        type: String,
        required: true
    },
    publishDate: {
        type: Date,
        required: true
    },
    coverImage: {
        type: String,
        required: true
    }
}, { timestamps: true });

export const Book = mongoose.model("Book", BookSchema);