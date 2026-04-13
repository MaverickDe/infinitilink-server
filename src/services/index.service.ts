// import { notification, userNotificationStats, users } from "@shared/schema"; 


import { constData } from "../utils/constData";
// Assuming these are now Mongoose models
// import { IPagobject, IPagResponse } from "server/types";

export class IndexService {

  
    static async getConstant(): Promise<any> { 

        return constData
     }
}

