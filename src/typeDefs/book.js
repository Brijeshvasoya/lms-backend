import gql from "graphql-tag";

const bookTypeDefs = gql`
    type Query {
        books(searchTerm: String): [Book]
        book(_id: ID!): Book
    }

    type Book {
        _id: ID!
        title: String
        author: String
        publisher: String
        publishDate: Date
        coverImage: String
        user: User
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

    input BookFilterInput {
        title: String
        author: String
        publisher: String
        publishDateFrom: Date
        publishDateTo: Date
    }

    type Mutation{
        createBook(input: bookInput!): Book
        updateBook(_id: ID!, input: bookInput!): Book
        deleteBook(_id: ID!): String
    }

    input bookInput{
        title: String
        author: String
        publisher: String
        publishDate: Date
        coverImage: String
    }
`;

export { bookTypeDefs };