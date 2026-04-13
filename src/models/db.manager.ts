import { getBankAdminInstitutionsModel, IBankAdminInstitutions } from "./bankModels/instituition";
import { getBankAdminApiCredModel, IBankAdminApiCred } from "./bankModels/bankApi";

// console.log("cxv")
export function buildModels(conn?: Connection|"main") {
  return {
    BankAdminInstitutions: getBankAdminInstitutionsModel(conn),
    BankAdminApiCred:getBankAdminApiCredModel(conn),
    BankAdminVAccounts:getBankAdminVAccountsModel(conn),
    BankAdmin:getBankAdminModel(conn),
    BankAdminApiEndpointManager:getBankAdminApiEndpointManagerModel(conn),
    QueueModel:getQueueModel(conn),
    // BankConsentsModel:getQueueModel(conn),
    // Transaction: getTransactionModel(conn),
    // User: getUserModel(conn)
  }
}

import { Connection, Model } from "mongoose";
import { IBank } from "./banks";
import {  getBankAdminVAccountsModel, IBankAdminVAccounts } from "./bankModels/accounts";
import { getBankAdminModel, IBankAdmin } from "./bankModels/bankAdmin";
import { BankAdminApiEndpointManager, getBankAdminApiEndpointManagerModel, IBankAdminApiEndpointManager } from "./bankModels/apiendpoints";
import { getQueueModel, IQueueModel } from "./queue";
// import { IBank } from "./bank.schema";
// import other model interfaces like ITransaction, IUser if needed

export interface IDBModels {
  BankAdminInstitutions: Model<IBankAdminInstitutions>;
  BankAdminApiCred: Model<IBankAdminApiCred>;
  BankAdminVAccounts: Model<IBankAdminVAccounts>;
  BankAdmin: Model<IBankAdmin>;
  BankAdminApiEndpointManager: Model<IBankAdminApiEndpointManager>;
  QueueModel: Model<IQueueModel>;
  // Transaction: Model<ITransaction>;
  // User: Model<IUser>;
  // Add more models here as needed
}