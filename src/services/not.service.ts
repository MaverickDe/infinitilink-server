// import { notification, userNotificationStats, users } from "@shared/schema"; 
import { Types } from "mongoose";
import { Notification,userNotificationStats } from "../models/notification";
import { IUser } from "../models/user";
import { IPagobject, IPagResponse } from "../types";
// Assuming these are now Mongoose models
// import { IPagobject, IPagResponse } from "server/types";

export class NotService {

  // ------------------- GET NOTIFICATIONS -------------------
  static async getNotifications(
    filters: IPagobject = { nextPage: 1, perPage: 10 }
  ): Promise<IPagResponse> {
    const { nextPage = 1, perPage = 10, sort, order, user } = filters;
    const nextPage_ = Number(nextPage) < 1 ? 1 : Number(nextPage);
    const offset = (nextPage_ - 1) * perPage;

    // Valid sortable fields
    const sortableColumns: any = {
      id: "_id",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    };

    // Filters
    const query: any = {};
    if (user) query.user = (user as IUser)._id;

    // Sorting
    const sortOption: any = {};
    if (sort && sortableColumns[sort]) {
      sortOption[sortableColumns[sort]] = order === "desc" ? -1 : 1;
    }

    // Query MongoDB
    const notsList = await Notification
      .find(query)
      .populate("user") // assuming `notification.user` references `users`
      .sort(sortOption)
      .skip(offset)
      .limit(perPage + 1)
      .lean();

    return {
      data: notsList.slice(0, perPage),
      total: await Notification.countDocuments(query),
      currentPage: nextPage_,
      nextPage: nextPage_ + 1,
      perPage,
      hasMore: notsList.length > perPage,
    };
  }

  // ------------------- UPDATE LAST READ -------------------
  static async updateLastRead({
    userId,
    lastRead,
  }: {
    userId: number;
    lastRead: Date;
  }) {
    if (!lastRead) return null;

    const result = await userNotificationStats.findOneAndUpdate(
      { user: userId },
      {
        $max: { lastRead: new Date(lastRead) }, // ensures we only update if new > old
      },
      { upsert: true, new: true }
    );

    return result;
  }

  // ------------------- GET NOTIFICATION STATS -------------------
  static async getNotStat({ userId }: { userId: number }) {
    const result = await userNotificationStats.findOne({
      user: userId,
    });

    const lastReadDate = result?.lastRead ? new Date(result.lastRead) : new Date();

    const count = await Notification.countDocuments({
      user: userId,
      createdAt: { $gt: lastReadDate },
    });

    return result ? { ...result.toObject(), new: count } : null;
  }



    static async notification({
      user,
      // page = 1,
      id,
    }: {
      user: IUser;
      id: string;
      // page: number;
    }) {
      const dcount = 10; // Example: items per page — adjust this as you like
      // const skip = (page - 1) * dcount;
  
      const query = user.admin
        ? { _id: new Types.ObjectId(id) } // Admin gets all notifications
        : {
            _id: new Types.ObjectId(id),
            $or: [{ user: user._id.toString() }, { user: "all" }],
          }; // Normal user
  
      return Notification.findOne(query)
        // .skip(skip)
        // .limit(dcount)
        // .sort({ createdAt: -1 }); // Optionally sort newest first
    }
}
