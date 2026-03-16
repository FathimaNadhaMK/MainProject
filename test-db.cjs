const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  const logFile = 'db-error.log';
  try {
    fs.appendFileSync(logFile, `[${new Date().toISOString()}] Attempting to connect...\n`);
    const userCount = await prisma.user.count();
    fs.appendFileSync(logFile, `Connection successful! count: ${userCount}\n`);
    console.log("Success");
  } catch (error) {
    fs.appendFileSync(logFile, `Connection failed!\n${error.stack || error}\n`);
    console.error("Failed");
  } finally {
    await prisma.$disconnect();
  }
}

main();
