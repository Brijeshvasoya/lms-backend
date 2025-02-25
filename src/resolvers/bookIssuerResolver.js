export const bookIssuerResolver = {
  Query: {
    bookIssuers: async (_, __, { models, me }) => {
      try {
        if (!me) {
          throw new Error("Authentication required");
        }
        if (me.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        const bookIssuers = await models.BookIssuer.find()
          .populate("bookid", "_id")
          .populate("studentid", "_id");
        return bookIssuers;
      } catch (error) {
        throw new Error(error.message || "Error fetching book issuers");
      }
    },
    BookIssuer: async (_, __, { models, me }) => {
      try {
        if (!me) {
          throw new Error("Authentication required");
        }
        const bookIssues = await models.BookIssuer.find({
          studentid: me._id,
          isReturned: false,
        })
          .populate("bookid")
          .populate("studentid")
          .sort({ issuedDate: -1 });

        // if (!bookIssues || bookIssues.length === 0) {
        //   throw new Error('No book issuer records found');
        // }
        if (me.role !== "admin") {
          const isOwnRecords = bookIssues.every(
            (issue) => issue.studentid._id.toString() === me._id.toString()
          );
          if (!isOwnRecords) {
            throw new Error("Unauthorized: Access denied");
          }
        }
        return bookIssues;
      } catch (error) {
        throw new Error(error.message || "Error fetching book issuers");
      }
    },
    studentBookIssuers: async (_, { studentid }, { models, me }) => {
      try {
        if (!me) {
          throw new Error("Authentication required");
        }
        if (me.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        const bookIssues = await models.BookIssuer.find({
          studentid: studentid,
        })
          .populate("bookid")
          .populate("studentid")
          .sort({ issuedDate: -1 });
        return bookIssues;
      } catch (error) {
        throw new Error(error.message || "Error fetching book issuers");
      }
    },
  },
  Mutation: {
    issueBook: async (_, { input }, { models, me }) => {
      if (!me) {
        throw new Error("Authentication required");
      }
      if (me.isBlocked) {
        throw new Error("Your account is blocked for Issues Book");
      }
      try {
        const existingBookIssuerForSameBook = await models.BookIssuer.findOne({
          studentid: input.studentid,
          bookid: input.bookid,
          isReturned: false,
        });
        if (existingBookIssuerForSameBook) {
          throw new Error(
            "User cannot issue this book again until the previous one is returned."
          );
        }
        const newBookIssuer = new models.BookIssuer({
          bookid: input.bookid,
          studentid: input.studentid,
          returnDays: input.returnDays,
          issuedDate: new Date(),
          bookToBeReturned: input.bookToBeReturned,
          isReturned: false,
        });
        const result = await newBookIssuer.save();
        return result;
      } catch (error) {
        throw new Error(error.message || "Error issuing book");
      }
    },
    returnBook: async (_, { input }, { models, me }) => {
      try {
        const bookIssuer = await models.BookIssuer.findById(input._id);
        if (!bookIssuer) {
          throw new Error("Book issuer record not found");
        }
        const updatedBookIssuer = await models.BookIssuer.findByIdAndUpdate(
          input._id,
          {
            returnDate: input.returnDate,
            isReturned: true,
            penalty: input.penalty,
            isLateReturn:
              new Date(input.returnDate) >
              new Date(bookIssuer.bookToBeReturned),
          },
          { new: true }
        );
        const count = await models.BookIssuer.countDocuments({
          studentid: me._id,
          isLateReturn: true,
        });
        console.log(count);
        if (count >= 3) {
          const user = await models.User.findById(me._id);
          user.isBlocked = true;
          await user.save();
        }
        if (!updatedBookIssuer) {
          throw new Error("Failed to update book issuer record");
        }
        return "Book returned successfully";
      } catch (error) {
        throw new Error(error.message || "Error returning book");
      }
    },
  },
};
