import gql from "graphql-tag";

const wishlistTypeDefs = gql`
    type Query {
        wishlists: [Wishlist]
    }

    type Wishlist {
        _id: ID!
        user: User!
        book: Book!
    }

    type Mutation {
        addToWishlist(input: wishlistInput!): Wishlist
        removeFromWishlist(_id: ID!): Wishlist
    }

    input wishlistInput {
        bookId: ID!
    }
`;

export { wishlistTypeDefs };