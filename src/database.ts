import { createConnection, Connection } from 'typeorm';

let connection: Connection;

export const initializeDatabase = async () => {
  if (!connection) {
    connection = await createConnection();
  }
  return connection;
};

export const getDatabaseConnection = () => {
  if (!connection) {
    throw new Error('Database connection has not been initialized.');
  }
  return connection;
};
