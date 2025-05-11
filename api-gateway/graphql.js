const { gql } = require('apollo-server-express');
const { getDb } = require('./db');
const { ObjectId } = require('mongodb');

const typeDefs = gql`
  type Content {
    _id: ID
    text: String
    userId: String
    approved: Boolean
    createdAt: String
  }

  type Query {
    allContent: [Content]
    approvedContent: [Content]
    getContentById(id: ID!): Content
  }

  type Mutation {
    submitContent(text: String!, userId: String!): Content
    approveContent(id: ID!): Content
    rejectContent(id: ID!): Content
  }
`;

const resolvers = {
  Query: {
    allContent: async () => {
      const db = getDb();
      const pending = await db.collection('pendingContent').find().toArray();
      const approved = await db.collection('approvedContent').find().toArray();
      return [...approved, ...pending];
    },
    approvedContent: async () => {
      const db = getDb();
      return db.collection('approvedContent').find().toArray();
    },
    getContentById: async (_, { id }) => {
      const db = getDb();
      const fromPending = await db.collection('pendingContent').findOne({ _id: new ObjectId(id) });
      if (fromPending) return fromPending;
      return await db.collection('approvedContent').findOne({ _id: new ObjectId(id) });
    }
  },

  Mutation: {
    submitContent: async (_, { text, userId }) => {
      const db = getDb();
      const content = {
        text,
        userId,
        approved: false,
        createdAt: new Date().toISOString(),
      };
      const result = await db.collection('pendingContent').insertOne(content);
      return { _id: result.insertedId, ...content };
    },

    approveContent: async (_, { id }) => {
      const db = getDb();
      const content = await db.collection('pendingContent').findOne({ _id: new ObjectId(id) });
      if (!content) throw new Error('Content not found');

      content.approved = true;
      await db.collection('approvedContent').insertOne(content);
      await db.collection('pendingContent').deleteOne({ _id: new ObjectId(id) });
      return content;
    },

    rejectContent: async (_, { id }) => {
      const db = getDb();
      const content = await db.collection('pendingContent').findOne({ _id: new ObjectId(id) });
      if (!content) throw new Error('Content not found');

      await db.collection('pendingContent').deleteOne({ _id: new ObjectId(id) });
      return content;
    }
  }
};

module.exports = { typeDefs, resolvers };
