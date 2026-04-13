
// import { Projectservice } from '../services/projects.service';
import { Request, Response } from 'express';

import {

  authenticateAdmin,
  DECORATORS,
  ExcludeDecorator,
  UseGlobalMiddleware,
  UseMiddleware
} from "../middleware/auth.middleware";
import { RefService } from '../services/ref.service';
import { PaymentService } from '../services/payment.service';
import { subscribe } from 'diagnostics_channel';


const {authenticate} = DECORATORS;
//   @UseGlobalMiddleware(DECORATORS.authenticate)
export class PaymentController{


    async getplans(req: Request, res: Response){
try {


    let plans = await PaymentService.getplans()
         return res.json({
        success:true,
        status: "success",
        data:plans,
      })

}catch(e:any){
       console.error("getting plans error:", e)
      return res.status(400).json({
        status: "error",
        message: e.message || "an error occured",
      })
}
    }

     @UseMiddleware(DECORATORS.authenticate)
    async suscribe(req: Request, res: Response){
try {

let {plan_code} = req.body as {plan_code:string}
    let plans = await PaymentService.initializeTransaction(req.user,plan_code)
         return res.json({
        success:true,
        status: "success",
        data:plans,
      })

}catch(e:any){
       console.error("subcribtion error:", e)
      return res.status(400).json({
        status: "error",
        message: e.message || "an error occured",
      })
}
    }
     @UseMiddleware(DECORATORS.authenticate)
    async currentSubscription(req: Request, res: Response){
try {

let {plan_code} = req.body as {plan_code:string}
    let plans = await PaymentService.currentSubscription(req.user)
         return res.json({
        success:true,
        status: "success",
        data:plans,
      })

}catch(e:any){
       console.error("subcribtion error:", e)
      return res.status(400).json({
        status: "error",
        message: e.message || "an error occured",
      })
}
    }
     @UseMiddleware(DECORATORS.authenticate)
    async transactions(req: Request, res: Response){
try {


    let plans = await PaymentService.transactions(req.user)
         return res.json({
        success:true,
        status: "success",
        data:plans,
      })

}catch(e:any){
       console.error("subcribtion error:", e)
      return res.status(400).json({
        status: "error",
        message: e.message || "an error occured",
      })
}
    }
}