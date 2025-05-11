const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const path = require('path');

const PROTO_PATH = path.join(__dirname, '../shared/moderation.proto');

const packageDef = protoLoader.loadSync(PROTO_PATH);
const grpcObj = grpc.loadPackageDefinition(packageDef);
const moderationPackage = grpcObj.moderation;

const server = new grpc.Server();

// 🚫 List of toxic / negative words
const toxicWords = ['bad', 'hate', 'violence', 'kill', 'stupid', 'dumb', 'terror'];

server.addService(moderationPackage.ModerationService.service, {
  CheckContent: (call, callback) => {
    const { text } = call.request;
    const lowerText = text.toLowerCase();

    const isToxic = toxicWords.some(word => lowerText.includes(word));
    const result = isToxic ? 'rejected' : 'approved';

    console.log(`🧠 Moderation result for "${text}": ${result}`);
    callback(null, { result });
  }
});

server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), () => {
  console.log('✅ gRPC Moderation server running on port 50051');
  server.start();
});
