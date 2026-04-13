import { Queue, Worker, Job } from "bullmq";
import IORedis from "ioredis";
import { QueueModel } from "src/models/queue";

type JobHandler = (data: any) => Promise<any>;
function waitForRedis(redis: IORedis) {
  if (redis.status === "ready") return Promise.resolve();

  return new Promise((resolve, reject) => {
    redis.once("ready", resolve);
    redis.once("error", reject);
  });
}

// export JobQueueFork 
export class JobQueue {
  private connection: any;
//   private connection: IORedis;
  private queue: Queue;
  private worker?: Worker;
  private handlers: Map<string, JobHandler> = new Map();

  constructor(queueName: string, {redis:{redisConfig,connection}}:any) {

    console.log(redisConfig,"redisConfig")
    this.connection =connection|| new IORedis(redisConfig?.url,{
  tls: {},
  maxRetriesPerRequest: null, // ✅ REQUIRED
});
    // this.connection ={};

    this.queue = new Queue(queueName, {
      connection: this.connection,
    });

    this.init()
  }

  register(jobName: string, handler: JobHandler) {
    this.handlers.set(jobName, handler);
  }

  // 🔥 NEW RUN METHOD
  async run(name: string, data: any, options?: any) {
    const handler = this.handlers.get(name);
console.log("runcalled")
    if (!handler) {
      throw new Error(`No handler registered for ${name}`);
    }
    if(options?.persist){
      await QueueModel.create(data)
    }
if(options?.runNow){

    try {
      console.log(`🚀 Trying immediate execution: ${name}`);
      return await handler(data);
    } catch (error) {
      console.log(`⚠️ Immediate run failed. Adding to queue...`);

      // Add to Redis queue for retry
 
    }
}else{
     return await this.queue.add(name, data, {
        attempts: 5,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
        ...(options||{}),
      });
}
  }
  async persist(name: string, data: any, options?: any) {
   (await QueueModel.create(data)).$session(options?.dbsession)

   return {run:async () => {
    return await this.run(name, data, options);
  }}
  }
  async init(){
   await waitForRedis(this.connection)
   this.start()
  }

  start(concurrency = 1) {
    console.log("startcocurrency")
    this.worker = new Worker(
      this.queue.name,
      async (job: Job) => {
        console.log("runningjob")
        const handler = this.handlers.get(job.name);

        if (!handler) {
          throw new Error(`No handler for job: ${job.name}`);
        }

        return await handler(job);
      },
      {
        connection: this.connection,
        concurrency,
      }
    );

    this.worker.on("completed", (job) => {
      console.log(`✅ Job completed from queue: ${job.name}`);
    });

    this.worker.on("failed", (job, err) => {
      console.error(`❌ Job failed after retries: ${job?.name}`, err.message);
    });
  }
}
