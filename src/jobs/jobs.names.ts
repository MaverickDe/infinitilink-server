import { redisConfig } from "../configs/redis";
import { JobQueue } from "./jobQueue";


export enum E_JOBS_IDENTIFIER{
    QUEUE="QUEUE",
    BANK_QUEUE="BANK_QUEUE",
    USER_BANK_TRANSACTION_QUEUE="USER_BANK_TRANSACTION_QUEUE",
    USER_BANK_TRANSACTION_PER_USER_QUEUE="USER_BANK_TRANSACTION_PER_USER_QUEUE",

}



// export const anchor_job_queue = new JobQueue(E_JOBS_IDENTIFIER.QUEUE, redisConfig);
// export const user_bank_transaction_job_queue = new JobQueue(E_JOBS_IDENTIFIER.BANK_QUEUE, {redis:{redisConfig}});
// user_bank_transaction_job_queue.start()
