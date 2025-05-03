import { SQLDatabase } from "encore.dev/storage/sqldb";
import { PrismaClient } from "./generated/prisma";

const DB = new SQLDatabase("monitor", {
  migrations: {
    path: "./prisma/migrations",
    source: "prisma",
  },
});

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DB.connectionString,
    },
  },
});
