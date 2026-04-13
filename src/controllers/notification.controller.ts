import { Request, Response } from 'express';
import { DECORATORS, UseGlobalMiddleware } from '../middleware/auth.middleware';
import { NotService } from '../services/not.service';
  @UseGlobalMiddleware(DECORATORS.authenticate)
export class NotificationController{


      async notifications(req:Request, res:Response) {
        const { nextPage }:any = req.query;
        try {
          
          const nots = await NotService.getNotifications({nextPage,user:req.user});
          // if (!product) {
          //   return res.status(404).json({ message: 'Product not found' });
          // }               
          res.status(200).json({success:true,data:nots});
        } catch (error) {
            console.log(error)
          res.status(500).json({ message: 'Error getting notifications' });
        }
      }
      async notification(req:Request, res:Response) {
        const { id  }:any = req.params;
        try {
          
          const product = await NotService.notification({id,user:req.user});
          // if (!product) {
          //   return res.status(404).json({ message: 'Product not found' });
          // }
          res.status(200).json(product);
        } catch (error) {
          res.status(500).json({ message: 'Error getting notification' });
        }
      }

        async updateLastRead(req: Request, res: Response) {
    try {
      let data = await NotService.updateLastRead({
        ...(req.query as any),
        userId: req.user.id,
      });

      res.json({ success: true, data });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Failed to updatee stat" });
    }
  }


  async notificationstats(req: Request, res: Response) {
    try {
   
      let data = await NotService.getNotStat({
        ...(req.query as any),
        userId: req?.user?.id,
      });

      res.json({ success: true, data });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Failed to fetch stat" });
    }
  }

}