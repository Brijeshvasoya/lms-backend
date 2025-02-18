export const bookIssuerResolver = {
  Query: {
    bookIssuers: async (_, __, { models, me }) => {
      try {
        if (!me) {
          throw new Error('Authentication required');
        }
        if (me.role !== 'admin') {
          throw new Error('Unauthorized: Admin access required');
        }
        const bookIssuers = await models.BookIssuer.find()
          .populate('bookid', '_id')
          .populate('studentid', '_id'); 
        return bookIssuers;
      } catch (error) {
        throw new Error(error.message || 'Error fetching book issuers');
      }
    },
    BookIssuer: async (_, { _id }, { models, me }) => {
      try {
        if (!me) {
          throw new Error('Authentication required');
        }
        const bookIssuer = await models.BookIssuer.findById(_id)
          .populate('bookid', '_id')  
          .populate('studentid', '_id');  

        if (!bookIssuer) {
          throw new Error('Book issuer record not found');
        }

        if (me.role !== 'admin' && bookIssuer.studentid.toString() !== me._id.toString()) {
          throw new Error('Unauthorized: Access denied');
        }

        return bookIssuer;
      } catch (error) {
        throw new Error(error.message || 'Error fetching book issuer');
      }
    },
  },
  Mutation: {
    issueBook: async (_, { input }, { models }) => {
      try {
        const bookToBeReturned = input.bookToBeReturned 
          ? new Date(Date.parse(input.bookToBeReturned)) 
          : null;

        const newBookIssuer = new models.BookIssuer({
          bookid: input.bookid,
          studentid: input.studentid,
          returnDays: input.returnDays,
          issuedDate: new Date(),
          bookToBeReturned: bookToBeReturned,
          isReturned: false,
        });
        const result = await newBookIssuer.save();
        return result;
      } catch (error) {
        throw new Error(error.message || 'Error issuing book');
      }
    },
    returnBook: async (_, { input }, { models }) => {
      try {
        const bookIssuer = await models.BookIssuer.findByIdAndUpdate(
          input._id,
          { 
            returnDate: input.returnDate ? new Date(input.returnDate) : null,
            isReturned: true
          },
          { new: true }
        ).populate('bookid', '_id')
         .populate('studentid', '_id');

        if (!bookIssuer) {
          throw new Error('Book issuer record not found');
        }
        return bookIssuer;
      } catch (error) {
        throw new Error(error.message || 'Error returning book');
      }
    }
  }
};
