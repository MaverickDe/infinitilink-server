import { Request, Response } from 'express';
import { DECORATORS, UseGlobalMiddleware, UseMiddleware } from '../middleware/auth.middleware';

import { IndexService } from '../services/index.service';
import { manageReturnedError } from '../utils/utils';
import { ERRORSMG } from '../error/error';
//   @UseGlobalMiddleware(DECORATORS.authenticate)
export class IndexController{


      async getConstant(req:Request, res:Response) {
        const { nextPage }:any = req.query;
        try {
          
          const data = await IndexService.getConstant();
          // if (!product) {
          //   return res.status(404).json({ message: 'Product not found' });
          // }               
          res.status(200).json({success:true,data});
        } catch (e) {
             return manageReturnedError({error:e,overideError:ERRORSMG.SOMETHING_WENT_WRONG_ERROR,res})
        }
      }
 @UseMiddleware(DECORATORS.authenticate)
      async SessionCheck(req:Request, res:Response) {
        const { nextPage }:any = req.query;
        try {
        
          // if (!product) {
          //   return res.status(404).json({ message: 'Product not found' });
          // }               
          res.status(200).json({success:true,data:{session:true}});
        } catch (e) {
             return manageReturnedError({error:e,overideError:ERRORSMG.SOMETHING_WENT_WRONG_ERROR,res})
        }
      }
    

}