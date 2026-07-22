import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.calculation.create({
    data: {
      title: "Booster Box Calculations, net profit including giving away 50. (10%)",
      formula: "450 booster boxes sold for 750 = 337 500. Moms on 25% makes the brutto go down to 253 125. Minus the purchase price of 56 500.",
      result: "196625"
    }
  });
  console.log("Done");
}
main();
