import express from "express";
import graphqlRoute from "./routes/graphqlRoute.js";
import dotenv from "dotenv";
import db from "./config/database.js";
import cors from "cors";
// const playground = require('graphql-playground-middleware-express').default;
dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

db();
const startServer = async () => {
  const graphqlRouter = await graphqlRoute();
  app.use(graphqlRouter);
  const PORT = process.env.PORT;
  // app.get('/', playground({ endpoint: '/graphql' }));
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/graphql`);
  });
};

startServer().catch((err) => {
  console.log("Error starting server:", err);
});
