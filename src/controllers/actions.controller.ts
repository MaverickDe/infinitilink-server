import type { Request, Response } from "express";
import { DECORATORS, ExcludeDecorator, UseGlobalMiddleware } from "../middleware/auth.middleware";
import { manageReturnedError } from "../utils/utils";
import { ERRORSMG } from "../error/error";
import { LinkNodeService } from "../services/linkNode.service";
import { ActionsService } from "../services/actions.service";
// import { LinkNodeService } from "../../services/link/linkNode.service";

const { authenticate } = DECORATORS;

@UseGlobalMiddleware(authenticate)
export class ActionController {
async createAction(req: Request, res: Response) {
    try {
    //   const { name, description } = req.body;
      const action = await ActionsService.createAction( req.body,
          req.user);

      res.json({success:true,data:action});
    }
        catch (e) {
        return manageReturnedError({
            error: e,
            overideError: ERRORSMG.SOMETHING_WENT_WRONG_ERROR,
            res
        });
    }
}



async updateAction(req: Request, res: Response) {
    try {
      const actionId = (req.query.id as string) || req.body.actionId;
      const action = await ActionsService.updateAction(actionId, req.body, req.user);

      res.json({ success: true, data: action });
    }
    catch (e) {
        return manageReturnedError({
            error: e,
            overideError: ERRORSMG.SOMETHING_WENT_WRONG_ERROR,
            res
        });
    }
}


async deleteAction(req: Request, res: Response) {
    try {
    //   const { name, description } = req.body;
      const action = await ActionsService.deleteAction( req.query.id as string,
          req.user);

      res.json({success:true,data:action});
    }
        catch (e) {
        return manageReturnedError({
            error: e,
            overideError: ERRORSMG.SOMETHING_WENT_WRONG_ERROR,
            res
        });
    }
}
async getUserActions(req: Request, res: Response) {
    try {
    //   const { name, description } = req.body;
      const action = await ActionsService.getUserActions( req.user ,
        );

      res.json({success:true,data:action});
    }
        catch (e) {
            console.log(e,"Eeee")
        return manageReturnedError({
            error: e,
            overideError: ERRORSMG.SOMETHING_WENT_WRONG_ERROR,
            res
        });
    }
}
async deleteActionResponses(req: Request, res: Response) {
    try {
      const data = await ActionsService.deleteActionResponses(req.body, req.user);
      res.json({ success: true, data });
    }
    catch (e) {
        return manageReturnedError({
            error: e,
            overideError: ERRORSMG.SOMETHING_WENT_WRONG_ERROR,
            res
        });
    }
}
  @ExcludeDecorator(authenticate)
async performResouceAction(req: Request, res: Response) {
    try {
    //   const { name, description } = req.body;
      const action = await ActionsService.performResouceAction( req.body,
        req.query.id as string, 
        {...  req.query??{} as any},
          req.user,
        );

      res.json({success:true,data:action});
    }
        catch (e) {
        return manageReturnedError({
            error: e,
            overideError: ERRORSMG.SOMETHING_WENT_WRONG_ERROR,
            res
        });
    }
}


async getResouceActionResponses(req: Request, res: Response) {
    try {
      let filters: any = undefined;
      if (req.query.filters) {
        try { filters = JSON.parse(req.query.filters as string); } catch { filters = undefined; }
      }
      const data = await ActionsService.getResouceActionResponses({
        id: req.query.id as string,
        page: req.query.page ? Number(req.query.page) : 1,
        search: req.query.search as string,
        filters,
        user: req.user,
      });
      res.json({ success: true, data });
    }
    catch (e) {
        return manageReturnedError({ error: e, overideError: ERRORSMG.SOMETHING_WENT_WRONG_ERROR, res });
    }
}
// async getResouceActionResponses(req: Request, res: Response) {
//     try {
//     //   const { name, description } = req.body;
//       const data = await ActionsService.getResouceActionResponses( {...req.query as any,user:req.user});

//       res.json({success:true,data:data});
//     }
//         catch (e) {
//         return manageReturnedError({
//             error: e,
//             overideError: ERRORSMG.SOMETHING_WENT_WRONG_ERROR,
//             res
//         });
//     }
// }
async addActionToResource(req: Request, res: Response) {
    try {
    //   const { name, description } = req.body;
      const data = await ActionsService.addActionToResource( req.body,
          req.user);

      res.json({success:true,data:data});
    }
        catch (e) {
        return manageReturnedError({
            error: e,
            overideError: ERRORSMG.SOMETHING_WENT_WRONG_ERROR,
            res
        });
    }
}
async removeActionFromResource(req: Request, res: Response) {
    try {
    //   const { name, description } = req.body;
      const data = await ActionsService.removeActionFromResource( req.body,
          req.user);

      res.json({success:true,data:data});
    }
        catch (e) {
        return manageReturnedError({
            error: e,
            overideError: ERRORSMG.SOMETHING_WENT_WRONG_ERROR,
            res
        });
    }
}
  @ExcludeDecorator(authenticate)
async getResourceAction(req: Request, res: Response) {
    try {
    //   const { name, description } = req.body;
    // console.log(req.query,"nmrss")
      const data = await ActionsService.getResourceAction( {resourceId:req.query.id as string,
        resourceActionId:req.query.resourceActionId as string,
      });

      res.json({success:true,data:data});
    }
        catch (e) {
        return manageReturnedError({
            error: e,
            overideError: ERRORSMG.SOMETHING_WENT_WRONG_ERROR,
            res
        });
    }
}

}