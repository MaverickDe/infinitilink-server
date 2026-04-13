import { BankTransactionService } from "../services/bankAdmin/transactions.service";




export class JobService{

static async  userTransactionIngestion (job){
  return await BankTransactionService.queueIngestTransactions(job)
}


}
// let factory = AnchorFactory()
