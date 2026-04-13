
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


const {authenticate} = DECORATORS;
  @UseGlobalMiddleware(DECORATORS.authenticate)
export class RefController{


    async refstats(req: Request, res: Response){
try {


    let stats = await RefService.refstats({user:req.user})
         return res.json({
        success:true,
        status: "success",
        data:stats,
      })

}catch(e:any){
       console.error("ref stats error:", e)
      return res.status(400).json({
        status: "error",
        message: e.message || "an error occured",
      })
}
    }
}