export const bookResolver = {
  Query: {
    books: async (_, args, { models }) => {
      try {
        const books = await models.Book.find();
        return books;
      } catch (error) {
        throw new Error(error.message || "Error fetching books");
      }
    },
    book: async (_, { _id }, { models }) => {
      try {
        const book = await models.Book.findById(_id);
        if (!book) {
          throw new Error("Book not found");
        }
        return book;
      } catch (error) {
        throw new Error(error.message || "Error fetching book");
      }
    },
  },
  Mutation: {
    createBook: async (_, { input }, { models, me }) => {
      try {
        if (!me) {
          throw new Error("Authentication required");
        }

        if (me.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }

        const newBook = new models.Book({
          ...input,
          createdBy: me._id,
        });

        const result = await newBook.save();
        return result;
      } catch (error) {
        throw new Error(error.message || "Error creating book");
      }
    },
    updateBook: async (_, { _id, input }, { models, me }) => {
      try {
        if (!me) {
          throw new Error("Authentication required");
        }

        if (me.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }

        const updatedBook = await models.Book.findByIdAndUpdate(
          _id,
          { ...input, updatedBy: me._id },
          { new: true }
        );

        if (!updatedBook) {
          throw new Error("Book not found");
        }

        return updatedBook;
      } catch (error) {
        throw new Error(error.message || "Error updating book");
      }
    },
    deleteBook: async (_, { _id }, { models, me }) => {
      try {
        if (!me) {
          throw new Error("Authentication required");
        }

        if (me.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }

        const deletedBook = await models.Book.findByIdAndDelete(_id);

        if (!deletedBook) {
          throw new Error("Book not found");
        }

        return "Book deleted successfully";
      } catch (error) {
        throw new Error(error.message || "Error deleting book");
      }
    },
  },
};
