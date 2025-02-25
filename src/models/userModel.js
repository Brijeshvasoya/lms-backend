import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    fname:{
        type: String,
        required: true
    },
    lname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    dob: {
        type: Date,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    isDisabled: {
        type: Boolean,
        default: false
    },
    profilePicture:{
        type: String,
        default: null
    },
    isBlocked:{
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const User = mongoose.model('User', UserSchema);
