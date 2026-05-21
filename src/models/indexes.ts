// // import { BankAdminVAccounts, getBankAdminVAccountsModel,  } from "./bankModels/accounts";
// import { BankRegisterModel, DenormalizedLedgerGroupModel, DenormalizedLedgerModel } from "./bankRegister";
// import { sandboxDB } from "./db.connection";

import { LinksModel } from "./links";
import { NodesModel } from "./node";

// DenormalizedLedgerGroupModel.collection.createIndex({ "SGId": 1 }, { background: true });

// DenormalizedLedgerModel.collection.createIndex({ "user._id": 1 }, { background: true });
// DenormalizedLedgerModel.collection.createIndex({ accountNumber: 1 }, { background: true });
// DenormalizedLedgerModel.collection.createIndex({ "user.SGId": 1 }, { background: true });

// BankRegisterModel.collection.createIndex({ user: 1 },  { background: true })
//   .then(() => console.log("Index on user created"))
//   .catch(console.error);


// BankAdminVAccounts.collection.createIndex({ accountNumber: 1, bank: 1 }, { unique: true });
// getBankAdminVAccountsModel(sandboxDB).collection.createIndex({ accountNumber: 1, bank: 1 }, { unique: true });


LinksModel.collection.createIndex({ user: 1, node: 1 },{ background: true });
LinksModel.collection.createIndex(
  {
    title: "text",
    description: "text",
    tags: "text"
  },
  {
    weights: {
      title: 5,
      tags: 3,
      description: 1
    }
  }
);
// new — covers { user, node: { $in: [...] }, createdAt } from searchNode
LinksModel.collection.createIndex({ user: 1, node: 1, createdAt: -1 }, { background: true });

// new — covers the descendant path lookup on NodesModel
NodesModel.collection.createIndex({ user: 1, path: 1 }, { background: true });
export const runIndex= ()=>{

}