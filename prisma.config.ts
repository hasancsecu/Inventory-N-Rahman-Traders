import "dotenv/config";
import { definePrismaConfig } from "prisma/config";
import { defineConfig as definePostgresConfig, prisma7Schema } from "@prisma/orm-postgres/config";
import { defineConfig as composer } from "@prisma/composer/config";
import { nextjsBuild } from "@prisma/composer/nextjs/control";
import { nodeBuild } from "@prisma/composer/node/control";
import { prismaCloud, prismaState } from "@prisma/composer-prisma-cloud/control";

export default definePrismaConfig({
  orm: definePostgresConfig({
    contract: prisma7Schema("prisma/schema.prisma"),
    output: "src/prisma/generated",
    db: {
      connection:
        process.env.DATABASE_URL ||
        process.env.POSTGRES_PRISMA_URL ||
        process.env.POSTGRES_URL,
    },
  }),
  composer: composer({
    extensions: [prismaCloud({ region: "us-east-1" }), nodeBuild(), nextjsBuild()],
    state: prismaState(),
  }),
});
