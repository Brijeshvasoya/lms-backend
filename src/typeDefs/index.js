import { userTypeDefs } from './user.js';
import { wishlistTypeDefs } from './wishlist.js';
import { bookTypeDefs } from './book.js';
import { bookIssuerTypeDefs } from './bookIssuer.js';
import { mergeTypeDefs } from '@graphql-tools/merge';
import gql from 'graphql-tag';

const dateScalarTypeDef = gql`
  scalar Date
`;

const types = [
  userTypeDefs, 
  wishlistTypeDefs, 
  bookTypeDefs, 
  bookIssuerTypeDefs,
  dateScalarTypeDef
];

const typeDefs = mergeTypeDefs(types);

export { typeDefs };