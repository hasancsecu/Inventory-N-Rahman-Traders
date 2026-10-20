// @ts-check
import { module } from "@prisma/composer";
import { postgres, dataContract } from "@prisma/composer-prisma-cloud/orm";
import lubriflowLubricantErpContractJson from "./src/prisma/contract.json" with { type: "json" };
import lubriflowLubricantErpService from "./service.mjs";

export default module("lubriflow-lubricant-erp", ({ provision }) => {
  const database = provision(postgres({ name: "database", contract: dataContract(lubriflowLubricantErpContractJson), config: "./prisma.config.ts" }));
  provision(lubriflowLubricantErpService, { id: "lubriflowlubricanterp", deps: { db: database } });
});
