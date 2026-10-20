// @ts-check
import nextjs from "@prisma/composer/nextjs";
import { compute } from "@prisma/composer-prisma-cloud";
import { postgres, dataContract } from "@prisma/composer-prisma-cloud/orm";
import lubriflowLubricantErpContractJson from "./src/prisma/contract.json" with { type: "json" };

export default compute({
  name: "lubriflow-lubricant-erp",
  deps: { db: postgres(dataContract(lubriflowLubricantErpContractJson)) },
  build: nextjs({ module: import.meta.url, appDir: "." }),
});
