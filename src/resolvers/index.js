import { userResolver } from "./userResolver.js";
import { wishlistResolver } from "./wishlistResolver.js";
import { bookResolver } from "./bookResolver.js";
import { bookIssuerResolver } from "./bookIssuerResolver.js";
import { mergeResolvers } from "@graphql-tools/merge";
import { DateScalar } from "../scalar/DateScalar.js";

const resolvers = mergeResolvers([
    userResolver, 
    wishlistResolver,
    bookResolver,
    bookIssuerResolver,
    { Date: DateScalar }
]);
  
export { resolvers };
