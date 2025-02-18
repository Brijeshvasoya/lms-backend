import gql from "graphql-tag";

const bookIssuerTypeDefs = gql`
    type Query {
        bookIssuers: [BookIssuer]
        BookIssuer(_id: ID!): BookIssuer
    }

    type BookIssuer {
        _id: ID!
        bookid: ID!
        studentid: ID!
        returnDays: Int
        issuedDate: Date
        bookToBeReturned: Date
        returnDate: Date
        isReturned: Boolean
        panalty: Int
    }

    type Mutation {
        issueBook(input: issueBookInput!): BookIssuer
        returnBook(input: returnBookInput!): BookIssuer
    }

    input issueBookInput{
        bookid: ID!
        studentid: ID!
        returnDays: Int!
        bookToBeReturned: Date!
    }

    input returnBookInput{
        _id: ID!
        returnDate: Date!
        panalty: Int!
    }
`;


export { bookIssuerTypeDefs };