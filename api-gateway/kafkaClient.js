// api-gateway/kafkaClient.js
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'api-gateway',
  brokers: ['localhost:9092']
});

const producer = kafka.producer();

const sendMessage = async (message) => {
  try {
    await producer.connect();
    await producer.send({
      topic: 'content_submitted',
      messages: [{ value: JSON.stringify(message) }],
    });
    await producer.disconnect();
  } catch (err) {
    console.error('❌ Failed to send to Kafka:', err);
    throw err;
  }
};

module.exports = sendMessage;
