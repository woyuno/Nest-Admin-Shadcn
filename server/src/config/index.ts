import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';

const configFileNameObj = {
  development: 'dev',
  test: 'test',
  production: 'prod',
};

const env = process.env.NODE_ENV;

console.log(env);

function buildMysqlUrl(mysql?: Record<string, any>): string | undefined {
  if (!mysql) {
    return undefined;
  }

  const host = mysql.host;
  const port = mysql.port;
  const username = mysql.username;
  const database = mysql.database;

  if (!host || !port || !username || !database) {
    return undefined;
  }

  const password = mysql.password ?? '';
  const encodedUsername = encodeURIComponent(String(username));
  const encodedPassword = encodeURIComponent(String(password));

  return `mysql://${encodedUsername}:${encodedPassword}@${host}:${port}/${database}`;
}

export default () => {
  const config = yaml.load(readFileSync(join(__dirname, `./${configFileNameObj[env]}.yml`), 'utf8')) as Record<string, any>;
  const mysql = config?.db?.mysql;
  const databaseUrl = process.env.DATABASE_URL || mysql?.url || buildMysqlUrl(mysql);

  if (mysql && databaseUrl) {
    mysql.url = databaseUrl;
    process.env.DATABASE_URL = databaseUrl;
  }

  return config;
};
