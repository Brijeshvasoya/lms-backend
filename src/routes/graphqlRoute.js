import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import express from "express";
import { resolvers } from "../resolvers/index.js";
import { typeDefs } from "../typeDefs/index.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { models } from "../models/index.js";
import responseCachePlugin from "@apollo/server-plugin-response-cache";

dotenv.config();

const router = express.Router();

const graphqlRoute = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [
      responseCachePlugin({
        sessionId: (requestContext) => {
          return requestContext.request.http.headers.get('authorization') || null;
        }
      })
    ]
  });

  await server.start();

  router.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => {
        const { authorization } = req.headers || {};
        if (authorization) {
          try {
            const token = authorization.replace("Bearer ", "");
            const decoded = await jwt.verify(token, process.env.JWT_SECRET);
            const me = await models.User.findById(decoded.userId);
            return { me, models };
          } catch (error) {
            return { error: "JWT verification failed" };
          }
        }
        return { models };
      },
    })
  );
  return router;
};

export default graphqlRoute;
