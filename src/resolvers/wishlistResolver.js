export const wishlistResolver = {
  Query: {
    wishlists: async (_, __, { models, me }) => {
      try {
        if (!me) {
          throw new Error('Authentication required');
        }

        const wishlists = await models.Wishlist.find({ user: me._id })
          .populate('book');
        return wishlists;
      } catch (error) {
        throw new Error(error.message || 'Error fetching wishlists');
      }
    },
  },
  Mutation: {
    addToWishlist: async (_, { input }, { models, me }) => {
      try {
        if (!me) {
          throw new Error('Authentication required');
        }

        const existingWishlist = await models.Wishlist.findOne({
          user: me._id,
          book: input.bookId
        });

        if (existingWishlist) {
          throw new Error('Book already in wishlist');
        }

        const newWishlist = new models.Wishlist({
          user: me._id,
          book: input.bookId
        });

        const result = await newWishlist.save();
        return await models.Wishlist.findById(result._id).populate('book');
      } catch (error) {
        throw new Error(error.message || 'Error adding to wishlist');
      }
    },
    removeFromWishlist: async (_, { _id }, { models, me }) => {
      try {
        if (!me) {
          throw new Error('Authentication required');
        }

        const wishlist = await models.Wishlist.findOneAndDelete({
          _id,
          user: me._id
        });

        if (!wishlist) {
          throw new Error('Wishlist item not found');
        }

        return wishlist;
      } catch (error) {
        throw new Error(error.message || 'Error removing from wishlist');
      }
    }
  }
};
