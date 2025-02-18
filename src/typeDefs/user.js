import gql from "graphql-tag";

const userTypeDefs = gql`
  type Query {
    users(searchTerm: String): [User]
    GetUser(_id: ID!): User
  }

  type User {
    _id: ID!
    fname: String
    lname: String
    email: String
    password: String
    age: Int
    dob: String
    role: String
    isVerified: Boolean
    isDeleted: Boolean
    profilePicture: String
  }

  type Token {
    token: String!
    user: User
  }

  type Mutation {
    createUser(input: userInput!): User
    updateUser(userData: updateUserInput!): User
    deleteUser(id: ID!): String
    verifyUser(id: ID!): String
    deactiveUser(id: ID!): String
    signInUser(userData: signinUserInput!): Token
    forgotPassword(userData: forgotPasswordInput!): User
  }

  input userInput {
    fname: String!
    lname: String!
    email: String!
    password: String!
    age: Int
    dob: String
    profilePicture: String
  }

  input updateUserInput {
    _id: ID!
    fname: String
    lname: String
    email: String
    age: Int
    dob: String
    profilePicture: String
  }

  input signinUserInput {
    email: String!
    password: String!
  }

  input forgotPasswordInput {
    email: String!
    password: String!
  }
`;

export { userTypeDefs };
