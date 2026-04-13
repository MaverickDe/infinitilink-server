import { QueueRegister } from "../jobs/jobs.register";
import { redis } from "../services/redis.service";

export const run = async ()=>{

await redis.connect();
new QueueRegister()
  // await PaymentService.seedPlans()

}