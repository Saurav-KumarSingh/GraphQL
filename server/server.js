const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const cors = require('cors');
const axios = require('axios');

const startServer = async () => {
    const app = express();

    const server = new ApolloServer({
        typeDefs: `
            type User {
                id: ID!
                name: String!
                username: String!
                email: String!
                phone: String
                todos:[Todo]
            }
            type Todo {
                id: ID!
                title: String!
                completed: Boolean
            }
            type Query {
                getTodos: [Todo]
                getUsers: [User]
                getUser(id: ID!): User
            }
        `,
        resolvers: {
            User: {
                todos: async (user) => (await axios.get(`https://jsonplaceholder.typicode.com/todos?userId=${user.id}`)).data,
            },
            Query: {
                getTodos: async () => (await axios.get('https://jsonplaceholder.typicode.com/todos')).data,
                getUsers: async () => (await axios.get('https://jsonplaceholder.typicode.com/users')).data,
                getUser: async (parent, { id }) => (await axios.get(`https://jsonplaceholder.typicode.com/users/${id}`)).data,
            }
        }
    });

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cors());

    await server.start();

    app.use('/graphql', expressMiddleware(server));

    app.listen(5000, () => console.log('Server started on port 5000'));
};

startServer();
