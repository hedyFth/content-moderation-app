const express = require('express');
const cors = require('cors');
const { ApolloServer } = require('apollo-server-express');
const sendMessage = require('./kafkaClient');
const { connect } = require('./db');
const { typeDefs, resolvers } = require('./graphql');

const app = express();
app.use(cors());
app.use(express.json()); // ✅ هذا كافي

app.post('/content', async (req, res) => {
  const content = req.body;
  try {
    await sendMessage(content);
    res.status(200).json({ message: 'Content submitted for moderation' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send to Kafka' });
  }
});

async function startServer() {
  await connect(); // MongoDB
  const server = new ApolloServer({ typeDefs, resolvers });

  await server.start();
  server.applyMiddleware({
    app,
    path: '/graphql',
  });

  app.listen(3000, () => {
    console.log('🚀 API Gateway running at http://localhost:3000');
    console.log(`📡 GraphQL available at http://localhost:3000${server.graphqlPath}`);
  });
}

startServer();
