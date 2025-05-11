
# 🧠 Projet de Modération de Contenu avec Microservices

Ce projet est une application distribuée utilisant une architecture microservices pour modérer du contenu textuel soumis par les utilisateurs. Il intègre les technologies suivantes : **Node.js**, **Kafka**, **gRPC**, **GraphQL**, et **MongoDB**.

---

## 🔧 Technologies Utilisées

- **API Gateway** : Express + Apollo Server (GraphQL)
- **Base de données** : MongoDB
- **Broker de messages** : Kafka
- **Service gRPC** : Node.js gRPC (modération de contenu)
- **Service de consommation Kafka** : `consumer.js` (modération + sauvegarde MongoDB)
- **Communication inter-services** : Kafka + gRPC
- **Front-end de test** : Postman, GraphQL Playground

---

## 📁 Structure du Projet

```
microservices-app/
├── api-gateway/           → Expose GraphQL API
├── moderation-service/    → Consomme les messages Kafka et modère avec gRPC
├── grpc-processor/        → gRPC Server (modération logique)
├── kafka/                 → docker-compose Kafka & Zookeeper
├── shared/                → .proto file
└── README.md
```

---

## 🧪 Fonctionnement et Tests

### ➕ 1. Soumission de contenu (Postman ou Playground)

**Mutation GraphQL** :
```graphql
mutation {
  submitContent(text: "This is clean", userId: "hedy") {
    _id
    text
    approved
  }
}
```
- Le contenu est envoyé à Kafka (`content_submitted`)
- Le consumer le lit et l’envoie au service gRPC
- Si le contenu **ne contient pas 'bad'**, il est approuvé et sauvegardé

---

### 🔍 2. Vérification des contenus approuvés

**Query GraphQL** :
```graphql
query {
  approvedContent {
    _id
    text
    userId
    approved
    createdAt
  }
}
```

---

## 📦 Installation & Exécution

### 1. Lancer Kafka & Zookeeper

```bash
cd kafka
docker-compose up -d
```

### 2. Lancer le gRPC Server

```bash
cd grpc-processor
node server.js
```

### 3. Lancer le consumer Kafka

```bash
cd moderation-service
node consumer.js
```

### 4. Lancer l'API Gateway

```bash
cd api-gateway
node index.js
```

---

## 🧪 Outils de Test

- ✅ [Postman](https://www.postman.com/)
- ✅ [Apollo GraphQL Sandbox](https://studio.apollographql.com/)
- ✅ MongoDB Compass (base : `approvedContent`)

---

## ⚠️ Défis rencontrés

- Intégration correcte entre Kafka et le gRPC client
- Mapping des collections MongoDB entre "pending" et "approved"
- Détection automatique de contenus toxiques (logique simple pour la démo)

---

## 📄 Auteur

**Hedy Fathallah – Projet académique (Microservices & Architecture SOA)**  

