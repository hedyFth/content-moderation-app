const { Kafka } = require('kafkajs');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');
const { connect, getDb } = require('./db');
require('dotenv').config();



const PROTO_PATH = path.join(__dirname, '../shared/moderation.proto');

const packageDef = protoLoader.loadSync(PROTO_PATH);
const grpcObj = grpc.loadPackageDefinition(packageDef);
const moderationPackage = grpcObj.moderation;

const grpcClient = new moderationPackage.ModerationService(
  'localhost:50051',
  grpc.credentials.createInsecure()
);

const kafka = new Kafka({
  clientId: 'moderation-service',
  brokers: ['localhost:9092']

});

const consumer = kafka.consumer({ groupId: 'content-group' });

const run = async () => {
  await connect();

  await consumer.connect();
  await consumer.subscribe({ topic: 'content_submitted', fromBeginning: true });

  console.log('🟢 Listening to Kafka topic: content_submitted');
  await consumer.run({
    eachMessage: async ({ message }) => {
      const content = JSON.parse(message.value.toString());
      console.log(`📨 Received:`, content);

      grpcClient.CheckContent({ text: content.text }, async (err, res) => {
        if (err) {
          console.error('❌ gRPC Error:', err);
        } else {
          console.log(`✅ Moderation Result: ${res.result}`);
          
          if (res.result === 'approved') {
            const db = getDb();
            const collection = db.collection('approvedContent');
            await collection.insertOne({
              text: content.text,
              userId: content.userId,
              createdAt: new Date()
            });
            console.log('📥 Approved content saved to MongoDB');
          } else {
            console.log('🚫 Rejected content not saved');
          }
        }
      });
      
    },
  });
};

run();
