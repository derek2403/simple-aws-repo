import mysql from 'mysql2/promise';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import 'dotenv/config';

async function readSecret(arn) {
  const client = new SecretsManagerClient({});
  const res = await client.send(new GetSecretValueCommand({ SecretId: arn }));
  const s = res.SecretString ? JSON.parse(res.SecretString) : {};
  return {
    host: s.host,
    port: s.port || 3306,
    user: s.username || s.user,
    password: s.password,
    database: s.dbname || s.database || process.env.DB_NAME || 'studentdb'
  };
}

export async function getPool() {
  let cfg;
  if (process.env.DB_SECRET_ARN) {
    cfg = await readSecret(process.env.DB_SECRET_ARN);
  } else {
    cfg = {
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'studentdb'
    };
  }
  return mysql.createPool({ ...cfg, waitForConnections: true, connectionLimit: 10 });
}