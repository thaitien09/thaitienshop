// d:/node js/sneaker/backend/prisma.config.ts
import "dotenv/config";
import { defineConfig, env } from "@prisma/config";

export default defineConfig({
    schema: "prisma/schema.prisma",
    datasource: {
        url: process.env.DATABASE_URL!, // Prisma 7 sẽ đọc URL trực tiếp từ đây
    },
});
