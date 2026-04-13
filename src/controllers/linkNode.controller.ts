import type { Request, Response } from "express";
import { DECORATORS, ExcludeDecorator, UseGlobalMiddleware } from "../middleware/auth.middleware";
import { manageReturnedError } from "../utils/utils";
import { ERRORSMG } from "../error/error";
import { LinkNodeService } from "../services/linkNode.service";
// import { LinkNodeService } from "../../services/link/linkNode.service";

const { authenticate } = DECORATORS;

@UseGlobalMiddleware(authenticate)
export class LinkNodeController {

  // ================= NODE =================

  async createNode(req: Request, res: Response) {
    try {
    //   const { name, description } = req.body;
      const node = await LinkNodeService.createNode( {
        user: req.user,
   ...req.body
      });

      res.json({success:true,data:node});
    } catch (e) {
      return manageReturnedError({
        error: e,
        overideError: ERRORSMG.SOMETHING_WENT_WRONG_ERROR,
        res
      });
    }
  }
  async getNode(req: Request, res: Response) {
    try {
      const { node } = req.query;
      const data = await LinkNodeService.getNode( {
node
// ,user:req.user
      });

      res.json({success:true,data});
    } catch (e) {
      return manageReturnedError({
        error: e,
        overideError: ERRORSMG.SOMETHING_WENT_WRONG_ERROR,
        res
      });
    }
  }
    @ExcludeDecorator(authenticate)
  async getAbNode(req: Request, res: Response) {
    try {
      const { node,id } = req.query;
      console.log(node,id,node||id,"fghgvgh")
      const data = await LinkNodeService.getNode( {
node:node||id
// ,user:req.user
      });

      res.json({success:true,data});
    } catch (e) {
      return manageReturnedError({
        error: e,
        overideError: ERRORSMG.SOMETHING_WENT_WRONG_ERROR,
        res
      });
    }
  }
  
  async getNodes(req: Request, res: Response) {
    try {
      
      const data = await LinkNodeService.getNodes( {

user:req.user
      });

      res.json({success:true,data});
    } catch (e) {
      return manageReturnedError({
        error: e,
        overideError: ERRORSMG.SOMETHING_WENT_WRONG_ERROR,
        res
      });
    }
  }

//  @ExcludeDecorator(authenticate)
  async getMyNode(req: Request, res: Response) {
    try {
      const { node } = req.query;
      console.log(node,"nododoe")
      const data = await LinkNodeService.getNode( {
node
,user:req.user
      });

      res.json({success:true,data});
    } catch (e) {
      return manageReturnedError({
        error: e,
        overideError: ERRORSMG.SOMETHING_WENT_WRONG_ERROR,
        res
      });
    }
  }
  async getLink(req: Request, res: Response) {
    try {
      const { id } = req.query;
     
      const data = await LinkNodeService.getLink( {
id
      });

      res.json({success:true,data});
    } catch (e) {
      return manageReturnedError({
        error: e,
        overideError: ERRORSMG.SOMETHING_WENT_WRONG_ERROR,
        res
      });
    }
  }
   @ExcludeDecorator(authenticate)
  async getPbLinks(req: Request, res: Response) {
    try {
      const { page } = req.query;
     
      const data = await LinkNodeService.getLinks( {
page:Number(page)
      });

      res.json({success:true,data});
    } catch (e) {
      return manageReturnedError({
        error: e,
        overideError: ERRORSMG.SOMETHING_WENT_WRONG_ERROR,
        res
      });
    }
  }
  async recordClick(req: Request, res: Response) {
    try {
      const { id } = req.query;
     
      const data = await LinkNodeService.recordClick( {
id:id as string
      });

      res.json({success:true,data});
    } catch (e) {
      return manageReturnedError({
        error: e,
        overideError: ERRORSMG.SOMETHING_WENT_WRONG_ERROR,
        res
      });
    }
  }

  async updateNode(req: Request, res: Response) {
    try {
      const { id } = req.query as any;
      const { name, description } = req.body;

      const node = await LinkNodeService.updateNode({
       ...req.body,
        node:id,
        user: req.user,
    });

      res.json(node);
    } catch (e) {
      return manageReturnedError({
        error: e,
        overideError: ERRORSMG.SOMETHING_WENT_WRONG_ERROR,
        res
      });
    }
  }
  async changeNodeParentNode(req: Request, res: Response) {
    try {
      const { id,node } = req.query as any;
    

      const node_ = await LinkNodeService.changeNodeParentNode({
      node,
      id,
        user: req.user,
    });

      res.json({success:true,data:node_});
    } catch (e) {
      return manageReturnedError({
        error: e,
        overideError: ERRORSMG.SOMETHING_WENT_WRONG_ERROR,
        res
      });
    }
  }
  async groupsReorder(req: Request, res: Response) {
    try {
      
    

      const node_ = await LinkNodeService.groupsReorder({
  ...req.body,
        user: req.user,
    });

      res.json({success:true,data:node_});
    } catch (e) {
      return manageReturnedError({
        error: e,
        overideError: ERRORSMG.SOMETHING_WENT_WRONG_ERROR,
        res
      });
    }
  }
  async linksReorder(req: Request, res: Response) {
    try {
      
    

      const node_ = await LinkNodeService.linksReorder({
  ...req.body,
        user: req.user,
    });

      res.json({success:true,data:node_});
    } catch (e) {
      return manageReturnedError({
        error: e,
        overideError: ERRORSMG.SOMETHING_WENT_WRONG_ERROR,
        res
      });
    }
  }

  async deleteNode(req: Request, res: Response) {
    try {
      const { id } = req.query as any;

      const result = await LinkNodeService.deleteNode({
        node:id,
        user: req.user
      });

      res.json({success:true,data:result});
    } catch (e) {
      return manageReturnedError({
        error: e,
        overideError: ERRORSMG.SOMETHING_WENT_WRONG_ERROR,
        res
      });
    }
  }


async createGroup(req: Request, res: Response) {
  try {
    // const { nodeId, groupName } = req.body;

    const result = await LinkNodeService.createGroup(
        {
            ...req.body,
            user:req.user,
    });

    res.json({success:true,data:result});
  } catch (e) {
    return manageReturnedError({
      error: e,
      overideError: ERRORSMG.SOMETHING_WENT_WRONG_ERROR,
      res
    });
  }
}


async deleteGroup(req: Request, res: Response) {
  try {
    const { id } = req.query;

    const result = await LinkNodeService.deleteGroup({
      user: req.user._id,
      id,
    //   groupName
    });

    res.json(result);
  } catch (e) {
    return manageReturnedError({
      error: e,
      overideError: ERRORSMG.SOMETHING_WENT_WRONG_ERROR,
      res
    });
  }
}



async updateGroup(req: Request, res: Response) {
  try {
    // const { nodeId, oldName, newName } = req.body;
const {id} = req.query
    const result = await LinkNodeService.updateGroup({
      user: req.user,
   data:req.body,
   id
    });

    res.json({success:true,data:result});
  } catch (e) {
    return manageReturnedError({
      error: e,
      overideError: ERRORSMG.SOMETHING_WENT_WRONG_ERROR,
      res
    });
  }
}


// async getGroups(req: Request, res: Response) {
//   try {
//     const { nodeId } = req.query as any;

//     const groups = await LinkNodeService.getGroups({
//       userId: req.user._id.toString(),
//       nodeId
//     });

//     res.json(groups);
//   } catch (e) {
//     return manageReturnedError({
//       error: e,
//       overideError: ERRORSMG.SOMETHING_WENT_WRONG_ERROR,
//       res
//     });
//   }
// }

//   async getNodes(req: Request, res: Response) {
//     try {
//       const nodes = await LinkNodeService.getNodes({
//         userId: req.user._id.toString()
//       });

//       res.json(nodes);
//     } catch (e) {
//       return manageReturnedError({
//         error: e,
//         overideError: ERRORSMG.SOMETHING_WENT_WRONG_ERROR,
//         res
//       });
//     }
//   }

  // ================= LINKS =================

  async createLink(req: Request, res: Response) {
    try {
    //   const { nodeId, title, url, description, tags, group } = req.body;

      const link = await LinkNodeService.createLink( req.user, {
     
     ...req.body
      });

      res.json(link);
    } catch (e) {
      return manageReturnedError({
        error: e,
        overideError: ERRORSMG.SOMETHING_WENT_WRONG_ERROR,
        res
      });
    }
  }

  async updateLink(req: Request, res: Response) {
    try {
      const { id } = req.query as any;
    //   const { title, url, description, tags, group } = req.body;

      const link = await LinkNodeService.updateLink( {
        // id,
        body:req.body,
        user: req.user,
        linkId:id
        // title,
        // url,
        // description,
        // tags,
        // group
      });

      res.json({success:true,data:link});
    } catch (e) {
      return manageReturnedError({
        error: e,
        overideError: ERRORSMG.SOMETHING_WENT_WRONG_ERROR,
        res
      });
    }
  }

  async deleteLink(req: Request, res: Response) {
    try {
      const { id } = req.query as any;

      const result = await LinkNodeService.deleteLink( {
        id,
        user: req.user
      });

      res.json(result);
    } catch (e) {
      return manageReturnedError({
        error: e,
        overideError: ERRORSMG.SOMETHING_WENT_WRONG_ERROR,
        res
      });
    }
  }

//   async getLinks(req: Request, res: Response) {
//     try {
//       const { nodeId } = req.query as any;

//       const links = await LinkNodeService.getLink({
//         nodeId,
//         userId: req.user._id.toString()
//       });

//       res.json(links);
//     } catch (e) {
//       return manageReturnedError({
//         error: e,
//         overideError: ERRORSMG.SOMETHING_WENT_WRONG_ERROR,
//         res
//       });
//     }
//   }
 @ExcludeDecorator(authenticate)
  async searchLinks(req: Request, res: Response) {
    try {
      const { q } = req.query as any;

      const results = await LinkNodeService.searchLinks({
        // userId: req.user._id.toString(),
       data:req.query
      });

      res.json({success:true,data:results});
    } catch (e) {
      return manageReturnedError({
        error: e,
        overideError: ERRORSMG.SOMETHING_WENT_WRONG_ERROR,
        res
      });
    }
  }
}