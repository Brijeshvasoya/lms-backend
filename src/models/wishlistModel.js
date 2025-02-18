import mongoose from "mongoose";

const WishlistSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    }
}, { timestamps: true });

export const Wishlist = mongoose.model("Wishlist", WishlistSchema);