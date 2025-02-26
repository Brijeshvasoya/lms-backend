import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

export const userResolver = {
  Query: {
    users: async (_, { searchTerm }, { models, me }) => {
      if (!me) {
        throw new Error("Authentication required");
      }
      if (me.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
      }
      try {
        let query = { isDeleted: false, role: { $ne: "admin" } };
        if (searchTerm) {
          query.$or = [
            { fname: { $regex: searchTerm, $options: "i" } },
            { lname: { $regex: searchTerm, $options: "i" } },
          ];
        }

        const users = await models.User.find(query);
        const userIds = users.map((user) => new mongoose.Types.ObjectId(user._id));
        
        const detail = await models.BookIssuer.aggregate([
          {
            $match: {
              studentid: {
                $in: userIds
              },
            },
          },
          {
            $lookup: {
              from: "books",
              localField: "bookid",
              foreignField: "_id",
              as: "bookDetails",
            },
          },
          {
            $unwind: {
              path: "$bookDetails",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $group: {
              _id: "$studentid",
              totalPenalty: { $sum: "$penalty" },
              totalLateReturnedBooks: {
                $sum: { $cond: [{ $eq: ["$isLateReturn", true] }, 1, 0] },
              },
            },
          },
        ]);
        const response = users.map((user) => {
          return {
            ...user.toObject(),
            totalPenalty:
              detail.find((d) => d._id.toString() === user._id.toString())
                ?.totalPenalty || 0,
            totalLateReturnedBooks:
              detail.find((d) => d._id.toString() === user._id.toString())
                ?.totalLateReturnedBooks || 0,
          };
        });
        return response;
      } catch (error) {
        throw new Error(error.message || "Error fetching users");
      }
    },
    userHistory: async (_, __, { models, me }) => {
      const userHistory = await models.BookIssuer.aggregate([
        { $match: { studentid: new mongoose.Types.ObjectId(me._id) } },
        {
          $lookup: {
            from: "books",
            localField: "bookid",
            foreignField: "_id",
            as: "bookDetails",
          },
        },
        {
          $unwind: {
            path: "$bookDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: "$studentid",
            totalIssuedBooks: { $sum: 1 },
            totalPenalty: { $sum: "$penalty" },
            totalPendingBooks: {
              $sum: { $cond: [{ $eq: ["$isReturned", false] }, 1, 0] },
            },
            totalReturnedBooks: {
              $sum: { $cond: [{ $eq: ["$isReturned", true] }, 1, 0] },
            },
            totalLateReturnedBooks: {
              $sum: { $cond: [{ $eq: ["$isLateReturn", true] }, 1, 0] },
            },
            issuedBooksDetails: {
              $push: {
                bookid: "$bookid",
                title: { $ifNull: ["$bookDetails.title", "Unknown Title"] },
                returnDays: "$returnDays",
                issuedDate: { $ifNull: ["$issuedDate", null] },
                bookToBeReturned: { $ifNull: ["$bookToBeReturned", null] },
                returnDate: { $ifNull: ["$returnDate", null] },
                isReturned: "$isReturned",
                penalty: { $ifNull: ["$penalty", 0] },
              },
            },
          },
        },
      ]);
      return userHistory;
    },
    GetUser: async (_, __, { models, me }) => {
      try {
        const user = await models.User.findById(me._id);
        return user;
      } catch (error) {
        throw new Error("Error fetching user");
      }
    },
  },
  Mutation: {
    createUser: async (_, { input }, { models }) => {
      try {
        const existingUser = await models.User.findOne({
          email: input.email,
        });
        if (existingUser) {
          throw new Error("User already exists");
        }
        const hashedPassword = await bcrypt.hash(input.password, 12);
        const role =
          (await models.User.countDocuments()) === 0 ? "admin" : "user";
        const isVerified = role === "admin" ? true : false;
        const newUser = new models.User({
          ...input,
          password: hashedPassword,
          role: role,
          isVerified: isVerified,
        });
        const result = await newUser.save();
        if (!result) {
          throw new Error("The user could not be created");
        }
        return result;
      } catch (error) {
        throw new Error(error.message || "Error creating user");
      }
    },
    updateUser: async (_, { userData }, { models, me }) => {
      try {
        if (me._id.toString() !== userData._id.toString()) {
          throw new Error("Unauthorized for updating this user");
        }
        const { _id, ...updateData } = userData;
        const updatedUser = await models.User.findByIdAndUpdate(
          _id,
          updateData,
          { new: true }
        );
        if (!updatedUser) {
          throw new Error("User not found");
        }
        return updatedUser;
      } catch (error) {
        throw new Error(error.message || "Error updating user");
      }
    },
    deleteUser: async (_, { id }, { me, models }) => {
      try {
        if (id.toString() !== me?._id.toString() && me?.role !== "admin") {
          throw new Error("Unauthorized for deleting this user");
        }
        const deletedUser = await models.User.findByIdAndUpdate(
          id,
          { isDeleted: true },
          { new: true }
        );
        if (!deletedUser) {
          throw new Error("User not found");
        }
        return "User deleted successfully";
      } catch (error) {
        throw new Error(error.message || "Error deleting user");
      }
    },
    signInUser: async (_, { userData }, { models }) => {
      try {
        const { email, password } = userData;
        const user = await models.User.findOne({ email });

        if (!user) {
          throw new Error("Invalid Email");
        }

        if (user?.role !== "admin" && user?.isDeleted) {
          throw new Error("Your Account is Deleted");
        }

        if (user?.isVerified !== true) {
          throw new Error("Please Activate Your Account from Admin");
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          throw new Error("Invalid Password");
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
          expiresIn: "1d",
        });
        return {
          token,
          user,
        };
      } catch (error) {
        throw new Error(error.message || "Error signing in");
      }
    },
    forgotPassword: async (_, { userData }, { models }) => {
      try {
        const user = await models.User.findOne({ email: userData.email });
        if (!user) {
          throw new Error("User not found");
        }
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        user.password = hashedPassword;
        await user.save();
        return user;
      } catch (error) {
        throw new Error(error.message || "Error sending reset email");
      }
    },
    verifyUser: async (_, { id }, { me, models }) => {
      try {
        if (me?.role !== "admin") {
          throw new Error("Unauthorized for verifying this user");
        }
        const user = await models.User.findByIdAndUpdate(
          id,
          { isVerified: true },
          { new: true }
        );
        if (!user) {
          throw new Error("User not found");
        }
        return "User verified successfully";
      } catch (error) {
        throw new Error(error.message || "Error verifying user");
      }
    },
    deactiveUser: async (_, { id }, { me, models }) => {
      try {
        if (me?.role !== "admin") {
          throw new Error("Unauthorized for deactivating this user");
        }
        const user = await models.User.findByIdAndUpdate(
          id,
          { isVerified: false },
          { new: true }
        );
        if (!user) {
          throw new Error("User not found");
        }
        return "User deactivated successfully";
      } catch (error) {
        throw new Error(error.message || "Error deactivating user");
      }
    },
  },
};
