// types/express/index.d.ts
import { Request } from 'express';

// declare module 'express-serve-static-core' {
//   interface Request {
//  // Replace `any` with the actual type, e.g. `UserPayload`
//   }
// }


import { Connection } from "mongoose";
import { IRequestContext } from 'src/context';

declare global {
  namespace Express {
    interface Request {
          cred?: any;
      context: IRequestContext;
    }
  }
}

export {};