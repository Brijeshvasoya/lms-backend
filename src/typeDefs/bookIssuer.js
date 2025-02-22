import gql from "graphql-tag";

const bookIssuerTypeDefs = gql`
    type Query {
        bookIssuers: [BookIssuer]
        BookIssuer: [BookIssuer]
        studentBookIssuers(studentid: ID!): [BookIssuer]
    }

    type BookIssuer {
        _id: ID
        bookid: Book
        studentid: User
        returnDays: Int
        issuedDate: String
        bookToBeReturned: String
        returnDate: String
        isReturned: Boolean
        panalty: Int
    }

    type Mutation {
        issueBook(input: issueBookInput!): BookIssuer
        returnBook(input: returnBookInput!): String
    }

    input issueBookInput{
        bookid: ID!
        studentid: ID!
        returnDays: Int!
        bookToBeReturned: String!
    }

    input returnBookInput{
        _id: ID!
        returnDate: String!
        panalty: Int!
    }
`;


export { bookIssuerTypeDefs };