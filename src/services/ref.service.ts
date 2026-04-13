import { IUser, Ref } from "../models/user";

export class RefService{



    static async refstats ({user}:{user:IUser}){


        // let stats = await Ref.findOneo({user:user._id})
        const stats = await Ref.findOneAndUpdate(
  { user: user._id },
  { $setOnInsert: { user: user._id, credit: 0 } }, // only sets on insert
  { upsert: true, new: true } // create if not found, return the doc
);


        return stats

    }
}