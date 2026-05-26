
import mongoose, { Types } from "mongoose";
import { validateInput, manageGeneralError, overideObj, sortByPosition, buildPath, escapeRegex, wouldCreateCycle } from "../utils/utils";

import { ERRORSMG } from "../error/error";
import { E_STORAGE_FOLDER } from "../storage";
import { E_RESOURCE_TYPES, ILinks, LinksModel } from "../models/links";
import { NodesModel, NodesModelName } from "../models/node";
import { createLinkValidator ,


      updateLinkValidator,
  createNodeValidator,
  updateNodeValidator,
  searchLinkValidator,
  createLinkGroupValidator,
  updateLinkGroupValidator
} from "../validators/links";
import { LinkGroupModel } from "../models/linkGroup";
import { IUser, User } from "../models/user";
import { group } from "console";
import { v2 as cloudinary } from 'cloudinary';
import { ResourceJumbutronModel } from "../models/resouceJumbutron";
import { populate } from "dotenv";


export class LinkNodeService {
  
  // =========================
  // CREATE NODE
  // =========================
  static createNode = async (data: { name: string; user: IUser,description?:string }) => {
    try {
       let parentPath: string | null = null;
      const validated = await validateInput({
        input: data,
        schema: createNodeValidator,
        async: true
      });
       const { node, isAnchor, anchor,  } = validated;
       let user = data?.user

       if(!user){
            throw manageGeneralError(
        overideObj(ERRORSMG.INVALID_CREDENTIALS, {
          message: "Your not authorize to perform this function"
        })
      );
       }
    if (isAnchor && !anchor) {
      throw manageGeneralError(
        overideObj(ERRORSMG.VALIDATION_ERROR, {
          message: "anchor is required when isAnchor is true"
        })
      );
    }

const userId = new Types.ObjectId(user?._id?.toString());

const nodePromise = node
  ? NodesModel.findOne({ user: userId, _id: node })
  : Promise.resolve(null);


const anchorPromise = anchor
  ? NodesModel.exists({ _id: anchor })
  : Promise.resolve(null);

const [nodeOk, anchorOk] = await Promise.all([
  nodePromise,

  anchorPromise,
]);
// validate results in same order
let i = 0;

// if (node) {
  if (!nodeOk) {
    throw manageGeneralError(
      overideObj(ERRORSMG.VALIDATION_ERROR, {
        message: "You're not authorized to add link to this node",
      })
    );
  }

    parentPath = nodeOk.path;


// }


if (anchor) {
  if (!anchorOk) {
    throw manageGeneralError(
      overideObj(ERRORSMG.VALIDATION_ERROR, {
        message: "Invalid anchor",
      })
    );
  }
}






      const node_:any = await NodesModel.create({
        ...validated,
        // user: new Types.ObjectId(data?.user?._id?.toString())
        user: new Types.ObjectId(user?._id?.toString()),
      node: new Types.ObjectId(node),
      // group: groupId ? new Types.ObjectId(groupId) : null,
      anchor: anchor ? new Types.ObjectId(anchor) : null,
      path:"/"
      });

       node_.path = buildPath(parentPath, node_._id);
  await node_.save();

      return node_;

    } catch (e) {
      manageGeneralError(e, ERRORSMG.SOMETHING_WENT_WRONG_ERROR);
    }
  };

static async uploadNodeLogo({file,user,nodeId}:{file:any,user:IUser,nodeId:string}) {
  // const { nodeId } = req.body; // or req.params
try{

  if (!file) {
           throw manageGeneralError(
        overideObj(ERRORSMG.INVALID_CREDENTIALS, {
          message: "Invalid file"
        }))
    // return res.status(400).json({ message: 'No file uploaded' });
  }

   const nodeExist = await NodesModel.exists(
      {
        _id: new Types.ObjectId(nodeId),
        user: new Types.ObjectId(user?._id?.toString())
      })

        if (!nodeExist) {
           throw manageGeneralError(
        overideObj(ERRORSMG.INVALID_CREDENTIALS, {
          message: "Your not authorise to perform this action"
        }))
    // return res.status(400).json({ message: 'No file uploaded' });
  }

  const result = await cloudinary.uploader.upload(file.path, {
    folder: E_STORAGE_FOLDER.squarelnode,
    public_id: `node_${nodeId}`,   // 👈 unique per node
    overwrite: true,               // 👈 replace existing image
    resource_type: 'image',
  });


      const node = await NodesModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(nodeId),
        user: new Types.ObjectId(user?._id?.toString())
      },
      { $set: {logo:result.secure_url} },
      { new: true }
    );

  return {
    node,
    logo: result.secure_url,
    public_id: result.public_id,
  };
}catch(e){
  console.log("upload error ", e)
    manageGeneralError(e, ERRORSMG.SOMETHING_WENT_WRONG_ERROR);
}
}
  // =========================
  // CREATE LINK
  // =========================
 
  static createLink = async (user:IUser,data: any) => {
  try {

    const validated = await validateInput({
      input: data,
      schema: createLinkValidator,
      // async: true
    });

    const { node, isAnchor, anchor, group:groupId } = validated;

    if (isAnchor && !anchor) {
      throw manageGeneralError(
        overideObj(ERRORSMG.VALIDATION_ERROR, {
          message: "anchor is required when isAnchor is true"
        })
      );
    }

// validate results in same order
const userId = new Types.ObjectId(user?._id?.toString());

const nodePromise = node
  ? NodesModel.exists({ user: userId, _id: node })
  : Promise.resolve(null);

const groupPromise = groupId
  ? LinkGroupModel.exists({ user: userId, _id: groupId })
  : Promise.resolve(null);

const anchorPromise = anchor
  ? LinksModel.exists({ _id: anchor,resourceType:data.resourceType })
  : Promise.resolve(null);

const [nodeOk, groupOk, anchorOk] = await Promise.all([
  nodePromise,
  groupPromise,
  anchorPromise,
]);

// if (node) {
  if (!nodeOk) {
    throw manageGeneralError(
      overideObj(ERRORSMG.VALIDATION_ERROR, {
        message: "You're not authorized to add link to this node",
      })
    );
  }

// }

if (groupId) {
  if (!groupOk) {
    throw manageGeneralError(
      overideObj(ERRORSMG.VALIDATION_ERROR, {
        message: "Invalid Group",
      })
    );
  }

}

if (anchor) {
  if (!anchorOk) {
    throw manageGeneralError(
      overideObj(ERRORSMG.VALIDATION_ERROR, {
        message: "Invalid anchor",
      })
    );
  }
}
    const link = await LinksModel.create({
      ...validated,
      user: new Types.ObjectId(user?._id?.toString()),
      node: new Types.ObjectId(node),
      group: groupId ? new Types.ObjectId(groupId) : null,
      anchor: anchor ? new Types.ObjectId(anchor) : null
    //  position: Date.now()
    });

    return { data: link, success: true };

  } catch (e) {
    manageGeneralError(e, ERRORSMG.SOMETHING_WENT_WRONG_ERROR);
  }
};

static AddResourceToJumbutron = async (user:IUser,data: {
     isRedirect?:boolean
    isPopup?:boolean
    node:string
    resource:string
}) => {
  try { 
    // resouce exist

    let resourceExist = await LinksModel.exists({ _id: new Types.ObjectId(data.resource) })
    if(!resourceExist){ 
        throw manageGeneralError( 
      overideObj(ERRORSMG.VALIDATION_ERROR, {
        message: "Invalid resource"
      })
    );
     }

      // node exist
    let nodeExist = await NodesModel.exists({ _id: new Types.ObjectId(data.node) })
    if(!nodeExist){
        throw manageGeneralError(
      overideObj(ERRORSMG.VALIDATION_ERROR, {
        message: "Invalid node"
      })
    );
    }

    const jumbutron = await ResourceJumbutronModel.findOneAndUpdate({

       node: new Types.ObjectId(data.node),
    resource: new Types.ObjectId(data.resource)
    },{
    isRedirect: data.isRedirect || false,
  
    isPopup: data.isPopup || false,
    // node: new Types.ObjectId(data.node),
    // resource: new Types.ObjectId(data.resource)
  
  
  },{new:true,upsert:true})

  // update link.jumbutron
  let link_ = await LinksModel.findOneAndUpdate(  {
    _id: new Types.ObjectId(data.resource),
    user: new Types.ObjectId(user?._id?.toString())
  },{
    $set:{
      jumbotron: jumbutron._id
    }
  })
  if(link_){

    link_.jumbotron =jumbutron
  }

  return link_;

  }catch (e) {


      manageGeneralError(e, ERRORSMG.SOMETHING_WENT_WRONG_ERROR);
  }
  
}


static RemoveResourceFromJumbutron = async (user:IUser,data: {  id:string}) => {
  try {//id is resource if

  // delete jumbtroon, set link.jumbutron to null
    const jumbutron = await ResourceJumbutronModel.findOneAndDelete({
      resource: new Types.ObjectId(data.id)
    })
    let resource = await LinksModel.findOneAndUpdate(  {
      _id: new Types.ObjectId(data.id),
      user: new Types.ObjectId(user?._id?.toString())
    },{
      $set:{
        jumbotron: null
      }
    },{new:true})
    return resource;
  }  catch (e) {
      manageGeneralError(e, ERRORSMG.SOMETHING_WENT_WRONG_ERROR);
  }
}

  static createGroup = async (data: any) => {
  try {
    let user = data?.user
    if(user){

    }
    const validated = await validateInput({
      input: data,
      schema: createLinkGroupValidator,
      // async: true
    });

    let link = validated.link
    let userId =  new Types.ObjectId(user?._id?.toString())
  let g = NodesModel.exists({
      user: userId,
      _id: new Types.ObjectId(validated.node),
    })

      if (!g) {
    throw manageGeneralError(
      overideObj(ERRORSMG.VALIDATION_ERROR, {
        message: "You're not authorized to add link to this node",
      })
    );
  }
  if(link?.anchor){
    let anchorExist = await LinksModel.exists({ _id: new Types.ObjectId(link?.anchor),resourceType:link.resourceType })
    if(!anchorExist){ 
      
      throw manageGeneralError(
        overideObj(ERRORSMG.VALIDATION_ERROR, {
          message: "Invalid anchor",
        })
      )
      }
      
    }
    const group = await LinkGroupModel.create({
      ...validated,
      user: new Types.ObjectId(user?._id?.toString()),
      node: new Types.ObjectId(validated.node)
    });
 
        const link_ = await LinksModel.create({
      ...link,
      user: new Types.ObjectId(user?._id?.toString()),
      node: new Types.ObjectId(validated.node),
      group: group?._id,
      anchor: link?.anchor ? new Types.ObjectId(link?.anchor) : null,
      isFeatured:false
    });

    return  {group,link:link_} ;

  } catch (e) {
    manageGeneralError(e, ERRORSMG.SOMETHING_WENT_WRONG_ERROR);
  }
};

static updateGroup = async (data: any) => {
  try {

    let user = data.user
    const validated = await validateInput({
      input: {...data.data,id:data.id},
      schema: updateLinkGroupValidator,
      // async: true
    });

    const { id:groupId, ...rest } = validated;

    const group = await LinkGroupModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(groupId),
        user: new Types.ObjectId(user._id.toString())
      },
      { $set: rest },
      { new: true }
    );

    return group;

  } catch (e) {
    manageGeneralError(e, ERRORSMG.SOMETHING_WENT_WRONG_ERROR);
  }
};

static deleteGroup = async ({ user, id }: any) => {
    const session = await mongoose.startSession();
  try {
     await session.withTransaction(async () => {

       const groupObjectId = new Types.ObjectId(id);
   let userId = user._id.toString()
       // remove group from links
       await LinksModel.deleteMany(
         { group: groupObjectId, user: new Types.ObjectId(userId) },
         // { $unset: { group: "" } }
       {session});
   
       // delete group
       await LinkGroupModel.findOneAndDelete({
         _id: groupObjectId,
         user: new Types.ObjectId(userId)
       },{session});
     })

    return { success: true };

  } catch (e) {
    manageGeneralError(e, ERRORSMG.SOMETHING_WENT_WRONG_ERROR);
  }finally{
  session.endSession();
  }
};

  // =========================
  // GET NODE (with links)
  // =========================
//   static getNode = async ({ nodeId, userId }: any) => {
//     try {
//       const node = await NodesModel.findOne({
//         _id: new Types.ObjectId(nodeId),
//         user: new Types.ObjectId(userId)
//       });

//       const links = await LinksModel.find({
//         node: new Types.ObjectId(nodeId),
//         user: new Types.ObjectId(userId)
//       });

//       return {
//         data: { node, links },
//         success: true
//       };

//     } catch (e) {
//       manageGeneralError(e, ERRORSMG.SOMETHING_WENT_WRONG_ERROR);
//     }
//   };

  static populateuser =[
     
    {
      path: "user",
      model: "User", 
      select: "firstname lastname  avatar bio rootnode isVisibleInNode isVisibleInNodeTimeStamp",
    
  } ]
  static populatenode =[
     
LinkNodeService.populateuser ,
     
    {
      path: "anchor",
      model: NodesModelName, 
      // select: "all",
      populate:[
      LinkNodeService.populateuser 
      ]
    
  } ,

]

static getGroupLinks = async ({ groupId ,user}: any,config?:any) => { 
  try {
    const groupObjectId = new Types.ObjectId(groupId);
    const userObjectId = new Types.ObjectId(user._id.toString());
    console.log(groupObjectId,userObjectId)
    const links = await LinksModel.find({
      group: groupObjectId,
      user: userObjectId
    }).populate("anchor jumbotron");
    if(config.actionNoGuide){

      return links;
    }

return links.map((e) => {
  if (e.action) {
    const { url, text, ...rest } = e.toObject();
    return rest;
  }

  return e;
});
  } catch (e) {
    manageGeneralError(e, ERRORSMG.SOMETHING_WENT_WRONG_ERROR); 
  }

}
static getNodeLinks2 = async ({ nodeId ,user}: any,config?:any) => { 
  try {
    const nodeObjectId = new Types.ObjectId(nodeId);
    const userObjectId = new Types.ObjectId(user._id.toString());
    const links = await LinksModel.find({
      node: nodeObjectId,
      user: userObjectId
    }).populate("anchor jumbotron");
    return links;
  } catch (e) {
    manageGeneralError(e, ERRORSMG.SOMETHING_WENT_WRONG_ERROR); 
  }

}
static   getNode = async ({ node:nodeId ,user}: any,config?:any) => {
  try {
let nd: any;
let nodeObjectId =null
if (Types.ObjectId.isValid(nodeId)) {
   nodeObjectId = new Types.ObjectId(nodeId);

  nd = {
    _id: nodeObjectId,
  };
} else {
  nd = {
    username: nodeId,
  };
}

    

    if(user){
      nd.user=new Types.ObjectId((user._id)?.toString());

    }
    
    const node = config?.node||await NodesModel.findOne(nd).populate(this.populateuser);
    if(!node){
          throw manageGeneralError(
        overideObj(ERRORSMG.INVALID_CREDENTIALS, {
          message: "Invalid node"
        })
      );
    }
    // const user_ = await User.findOne({node.}).;
    const mainNode = await NodesModel.findOne({_id:(node.user as IUser).rootnode});
    let userObjectId = new Types.ObjectId((node?.user?._id)?.toString());
    nodeObjectId =(node?.anchor as Types.ObjectId)||node?._id
    let  anchorNode = null
    if(node?.anchor){
       anchorNode = await NodesModel.findOne({_id:node?.anchor}).populate(this.populateuser);;

    }
    if((node?.action||anchorNode?.action) && !config?.actionNoGuide){

      return {
      node,
      anchorNode}
    }

// console.log(node,nd,"nodend")
      const nodes = await NodesModel.find({node:nodeObjectId});
      // const nodes = await NodesModel.find({user:userObjectId});

    // ✅ sort groups by creation date (oldest → newest or reverse if you prefer)
    const groups = await LinkGroupModel.find({
      node: nodeObjectId,
      // user: userObjectId
    }).sort({ createdAt: 1 }); // or -1 for newest first

    const links_ = await LinksModel.find({
      node: nodeObjectId,
      // user: userObjectId,
      $or:[

        
      {  isFeatured: false,},
       { isFeatured: { $exists: false } }
      ]

      
    }).populate("anchor jumbotron");

let links = links_
    if(!config?.actionNoGuideLink){

      links = links_.map(e=>{
        let groupAction = groups.find(ee=>ee?._id?.toString() ==e?.group ?.toString())?.action

        if(e?.action || groupAction){
          let {url,text,...rest} =e.toObject()

          return rest as any

        }
        return e
      })

    }

// const featuredLinkIsNodeLevel = node?.featuredLinkIsNodeLevel;

// const featuredLinks = await LinksModel.find({
//   user: anchorNode?.user || userObjectId,
//   isFeatured: true,


// });




const featuredLinks = await LinksModel.find({
  user: anchorNode?.user || userObjectId,
  isFeatured: true,

  $or: [
    // node-level featured links
    {
      featuredLinkIsNodeLevel: true,
      node: nodeObjectId,
    },

    // global featured links
    {
      featuredLinkIsNodeLevel: false,
    },

    // old docs where field doesn't exist
    {
      featuredLinkIsNodeLevel: { $exists: false },
    },
  ],
});

    // ✅ unified grouped structure
    const grouped: Record<string, any[]> = {
      ungroup: []
    };

    // initialize group keys
    groups.forEach((g) => {
      grouped[(g._id as any)?.toString()] = [];
    });

    // distribute links
    links.forEach((link) => {
      if (!link.group) {
        grouped["ungroup"].push(link);
      } else {
        const gid = link.group.toString();
        if (!grouped[gid]) {
          // fallback in case group is missing
          grouped[gid] = [];
        }
        grouped[gid].push(link);
      }
    });
Object.keys(grouped).forEach((key) => {
  grouped[key] = sortByPosition(grouped[key]);
});
    return {
        node,
        anchorNode,

        mainNode:mainNode,
        nodes,
        groups:sortByPosition<any>(groups),
        links: grouped,
        unStructuredGroupLink:links,
        featuredLinks,
        // anchorData:{}
      }
   
    ;

  } catch (e) {
    manageGeneralError(e, ERRORSMG.SOMETHING_WENT_WRONG_ERROR);
  }
};
static getNodeFeaturedLink = async ({ node:nodeId ,user }: any) => {
  try {
let nd: any;
let nodeObjectId =null
if (Types.ObjectId.isValid(nodeId)) {
   nodeObjectId = new Types.ObjectId(nodeId);

  nd = {
    _id: nodeObjectId,
  };
} else {
  nd = {
    username: nodeId,
  };
}

    

    if(user){
      nd.user=new Types.ObjectId((user._id)?.toString());

    }
    
    const node = await NodesModel.findOne(nd).populate(this.populateuser);
    if(!node){
          throw manageGeneralError(
        overideObj(ERRORSMG.INVALID_CREDENTIALS, {
          message: "Invalid node"
        })
      );
    }
    // const user_ = await User.findOne({node.}).;
    // const mainNode = await NodesModel.findOne({_id:(node.user as IUser).rootnode});
    let userObjectId = new Types.ObjectId((node?.user?._id)?.toString());
    nodeObjectId =(node?.anchor as Types.ObjectId)||node?._id
    let  anchorNode = null
    if(node?.anchor){
       anchorNode = await NodesModel.findOne({_id:node?.anchor}).populate(this.populateuser);;

    }




const featuredLinkIsNodeLevel = node?.featuredLinkIsNodeLevel;

const featuredLinks = await LinksModel.find({
  user: anchorNode?.user || userObjectId,
  isFeatured: true,

  ...(featuredLinkIsNodeLevel
    ? {
        featuredLinkIsNodeLevel: true,
        node: nodeObjectId,
      }
    : {
        $or: [
          { featuredLinkIsNodeLevel: false },
          { featuredLinkIsNodeLevel: { $exists: false } },
        ],
      }),
});


    return  featuredLinks;
   

   
    

  } catch (e) {
    manageGeneralError(e, ERRORSMG.SOMETHING_WENT_WRONG_ERROR);
  }
};

static getNodes = async ({user,page=1 ,isPb }: any) => {
  try {
  
    let nd:any ={
    
      user:new Types.ObjectId((user._id)?.toString())
    }
   let  limit =100
const skip = (page - 1) * limit;

    

    if(user){

    }
    
    const node = await NodesModel.find(nd)

     .skip(skip)
        .limit(limit+1)
        
      

    return {
          data: node,
          nextPage:Number(page+1),
          hasMore:node.length>limit,
          page
        }
   
    ;

  } catch (e) {
    manageGeneralError(e, ERRORSMG.SOMETHING_WENT_WRONG_ERROR);
  }
};
static getPbNodes = async ({user,...rest}: any) => {
  try {
      const user_ = await User.findById(user)
      if(!user){
      throw manageGeneralError(
        overideObj(ERRORSMG.INVALID_CREDENTIALS, {
          message: "Invalid resources"
        })
      );
      }
   return this.getNodes({user:user_,...rest})

  } catch (e) {
    manageGeneralError(e, ERRORSMG.SOMETHING_WENT_WRONG_ERROR);
  }
};

  // =========================
  // ADD TO LINK (attach node or metadata)
  // =========================
  static addToLink = async (data: any) => {
    try {
      const { linkId, ...rest } = data;

      const link = await LinksModel.findByIdAndUpdate(
        new Types.ObjectId(linkId),
        { $set: rest },
        { new: true }
      );

      return { data: link, success: true };

    } catch (e) {
      manageGeneralError(e, ERRORSMG.SOMETHING_WENT_WRONG_ERROR);
    }
  };


  // =========================
  // DELETE LINK
  // =========================
  static deleteLink = async ({ id, user }: any) => {
    try {
    let d =  await LinksModel.findOneAndDelete({
        _id: new Types.ObjectId(id),
        user: new Types.ObjectId(user?._id?.toString())
      });

      return { success: true  ,data:d};

    } catch (e) {
      manageGeneralError(e, ERRORSMG.SOMETHING_WENT_WRONG_ERROR);
    }
  };


  // =========================
  // DELETE NODE (cascade delete links)
  // =========================
//   static deleteNode = async ({ nodeId, user }: any) => {
//     try {
//       // await NodesModel.findOneAndDelete({
//       //   _id: new Types.ObjectId(nodeId),
//       //   user: new Types.ObjectId(userId)
//       // });

//       let userId = user._id?.toString()
//       await NodesModel.findOneAndDelete({
        
//         _id: new Types.ObjectId(nodeId),
//         user: new Types.ObjectId(userId)
//       });

//       // delete all links under node
//       await LinksModel.deleteMany({
//         node: new Types.ObjectId(nodeId),
//         user: new Types.ObjectId(userId)
//       });
//       await LinkGroupModel.deleteMany({
//         node: new Types.ObjectId(nodeId),
//         user: new Types.ObjectId(userId)
//       });
//       await NodesModel.updateMany({
//         node: new Types.ObjectId(nodeId),
//         user: new Types.ObjectId(userId)
//       },{
//         $set:{
// node:new Types.ObjectId(user.rootnode?.toString())
//         }
//       });

//       return { success: true };

//     } catch (e) {
//       manageGeneralError(e, ERRORSMG.SOMETHING_WENT_WRONG_ERROR);
//     }
//   };

static deleteNode_ = async ({ node:nodeId, user }: any) => {
  const session = await mongoose.startSession();

  try {
    let result: any;
let deletedNode
  await session.withTransaction(async () => {
  const userId = new Types.ObjectId(user._id?.toString());
  const _nodeId = new Types.ObjectId(nodeId);

   deletedNode = await NodesModel.findOneAndDelete(
  {
    $and: [
      { _id: _nodeId },
      { user: userId },
      ...(user?.rootnode
        ? [{ _id: { $ne: new Types.ObjectId(user.rootnode.toString()) } }]
        : []),
    ],
  },
    { session }
  );

  if (!deletedNode) {
    throw new Error("Node not found or unauthorized");
  }

  // 🚀 run independent operations in parallel
  await Promise.all([
    LinksModel.deleteMany(
      { node: _nodeId, user: userId },
      { session }
    ),

    LinkGroupModel.deleteMany(
      { node: _nodeId, user: userId },
      { session }
    ),

    NodesModel.updateMany(
      { node: _nodeId, user: userId },
      {
        $set: {
          node: user.rootnode
            ? new Types.ObjectId(user.rootnode.toString())
            : null,
        },
      },
      { session }
    ),
  ]);

  // return { success: true };
});

    return deletedNode;

  } catch (e) {
    manageGeneralError(e, ERRORSMG.SOMETHING_WENT_WRONG_ERROR);
  } finally {
    session.endSession();
  }
};

static deleteNode = async ({ node: nodeId, user }: any) => {
  const session = await mongoose.startSession();

  try {
    let deletedNode: any;

    await session.withTransaction(async () => {
      const userId:any = new Types.ObjectId(user._id?.toString());
      const _nodeId:any = new Types.ObjectId(nodeId);

      // 🛡️ Root node is tied to user lifecycle — cannot be deleted
      if (user?.rootnode && _nodeId.equals(new Types.ObjectId(user.rootnode.toString()))) {
        throw manageGeneralError(
          overideObj(ERRORSMG.VALIDATION_ERROR, {
            message: "Root node cannot be deleted",
          })
        );
      }

      // Fetch deleted node AND root node path in parallel
      const [foundNode, rootNode] = await Promise.all([
        NodesModel.findOneAndDelete(
          { _id: _nodeId, user: userId }, // ✅ $ne guard no longer needed
          { session }
        ),
        user?.rootnode
          ? NodesModel.findOne(
              { _id: new Types.ObjectId(user.rootnode.toString()) },
              { path: 1 },
              { session }
            ).lean()
          : null,
      ]);

      if (!foundNode)   throw manageGeneralError(
          overideObj(ERRORSMG.VALIDATION_ERROR, {
            message: "Node not found ",
          })
        );
      deletedNode = foundNode;

      const oldPathPrefix = deletedNode.path;
      const newParentId = rootNode?._id ?? null;
      const newParentPath = rootNode?.path ?? "";

      await Promise.all([
        LinksModel.deleteMany({ node: _nodeId, user: userId }, { session }),
        LinkGroupModel.deleteMany({ node: _nodeId, user: userId }, { session }),
        NodesModel.bulkWrite(
          [
            {
              updateMany: {
                filter: {
                  user: userId,
                  path: { $regex: `^${escapeRegex(oldPathPrefix)}` },
                },
                update: [
                  {
                    $set: {
                      path: {
                        $concat: [
                          newParentPath,
                          { $substr: ["$path", oldPathPrefix.length, -1] },
                        ],
                      },
                    },
                  },
                ],
              },
            },
            {
              updateMany: {
                filter: { node: _nodeId, user: userId },
                update: { $set: { node: newParentId } },
              },
            },
          ],
          { session }
        ),
      ]);
    });

    return deletedNode;
  } catch (e) {
    manageGeneralError(e, ERRORSMG.SOMETHING_WENT_WRONG_ERROR);
  } finally {
    session.endSession();
  }
};

  // =========================
  // UPDATE LINK
  // =========================
  static updateLink = async (data: any) => {
    try {
      const validated = await validateInput({
        input: {...data.body,linkId:data.linkId},
        schema: updateLinkValidator,
        // async: true
      });
// featured is not added to the update , only for verification
      const { linkId,anchor,node,isFeatured,group, ...rest } = validated;
      let user = data.user

          if(!user){
            throw manageGeneralError(
        overideObj(ERRORSMG.INVALID_CREDENTIALS, {
          message: "Your not authorize to perform this function"
        })
      );
       }

   
    const obj: any = {
      ...rest,
    };

    // ✅ handle anchor safely
    if (data?.body?.isAnchor !== undefined &&anchor!=linkId) {
      obj.anchor = (data?.body?.isAnchor&&anchor)
        ? new Types.ObjectId(anchor)
        : null;
    }

    // const nodeid =new Types.ObjectId(node)
    const groupid =new Types.ObjectId(group)
   const userId = new Types.ObjectId(user?._id?.toString());

// const nodePromise = node
//   ? NodesModel.exists({ user: userId, _id: nodeid })
//   : Promise.resolve(null);

const groupPromise = groupid
  ? LinkGroupModel.exists({ user: userId, _id: groupid })
  : Promise.resolve(null);

const anchorPromise = anchor
  ? LinksModel.exists({ _id: anchor ,resourceType:data.resourceType})
  : Promise.resolve(null);

const [
  // nodeOk,
   groupOk, anchorOk] = await Promise.all([
  // nodePromise,
  groupPromise,
  anchorPromise,
]);
// validate results in same order
let i = 0;

// if (node) {
//   if (!nodeOk) {
//     throw manageGeneralError(
//       overideObj(ERRORSMG.VALIDATION_ERROR, {
//         message: "You're not authorized to add link to this node",
//       })
//     );
//   }
//   i++;
// }

if (group) {
  if (!groupOk) {
    throw manageGeneralError(
      overideObj(ERRORSMG.VALIDATION_ERROR, {
        message: "Invalid Group",
      })
    );
  }
  i++;
}

if (anchor) {
  if (!anchorOk) {
    throw manageGeneralError(
      overideObj(ERRORSMG.VALIDATION_ERROR, {
        message: "Invalid anchor",
      })
    );
  }
}
      const link = await LinksModel.findOneAndUpdate(
        {
          _id: new Types.ObjectId(linkId),
          user: new Types.ObjectId(user._id)
        },
        { $set: obj },
        { new: true }
      );

      return link;

    } catch (e) {
      manageGeneralError(e, ERRORSMG.SOMETHING_WENT_WRONG_ERROR);
    }
  };


  // =========================
  // UPDATE NODE
  // =========================
static updateNode = async (data: any) => {
  try {
    const validated = await validateInput({
      input: data,
      schema: updateNodeValidator,
      // async: true
    });

    const { node: nodeId, anchor, ...rest } = validated;

    const user = data.user;

    if (!user) {
      throw manageGeneralError(
        overideObj(ERRORSMG.INVALID_CREDENTIALS, {
          message: "You're not authorized to perform this function"
        })
      );
    }

    const obj: any = {
      ...rest,
    };

    // ✅ handle anchor safely
     if (data?.isAnchor !== undefined &&anchor!=nodeId) {
      obj.anchor = (data?.isAnchor&&anchor)
        ? new Types.ObjectId(anchor)
        : null;
    }
 if(anchor){
        let g = NodesModel.exists({
        //  user: new Types.ObjectId(user._id),
      _id: new Types.ObjectId(validated.node),
    })

      if (!g) {
    throw manageGeneralError(
      overideObj(ERRORSMG.VALIDATION_ERROR, {
        message: "Invalid Anchor",
      })
    );
  }
    }
    const node = await NodesModel.findOneAndUpdate(
      {
        _id: new Types.ObjectId(nodeId),
        user: new Types.ObjectId(user?._id?.toString())
      },
      { $set: obj },
      { new: true }
    );

    return { data: node, success: true };

  } catch (e) {
    manageGeneralError(e, ERRORSMG.SOMETHING_WENT_WRONG_ERROR);
  }
};


// static changeNodeParentNode = async (data: any) => {
//   try {


//     const { node: nodeId, user,id } = data;

 

//     if (!user) {
//       throw manageGeneralError(
//         overideObj(ERRORSMG.INVALID_CREDENTIALS, {
//           message: "You're not authorized to perform this function"
//         })
//       );
//     }
// let newNode =    await NodesModel.exists(
//       {
//         _id: new Types.ObjectId(nodeId),
//         user: new Types.ObjectId(user?._id?.toString())
//       },
  
//     );

//         if (!newNode) {
//       throw manageGeneralError(
//         overideObj(ERRORSMG.INVALID_CREDENTIALS, {
//           message: "Invalid Node"
//         })
//       );
//     }



//     const targetId = new Types.ObjectId(id);
// const newParentId = new Types.ObjectId(nodeId);

// const invalidMove = await isNodeDescendant(targetId, newParentId);

// if (invalidMove) {
//   throw manageGeneralError(
//     overideObj(ERRORSMG.VALIDATION_ERROR, {
//       message: "Cannot move a node into its own descendant",
//     })
//   );
// }
//     const obj: any = {
//      node:new Types.ObjectId(nodeId),
//     };



//     const node = await NodesModel.findOneAndUpdate(
//       {
//         _id: new Types.ObjectId(id),
//         user: new Types.ObjectId(user?._id?.toString())
//       },
//       { $set: obj },
//       { new: true }
//     );

//     return node

//   } catch (e) {
//     manageGeneralError(e, ERRORSMG.SOMETHING_WENT_WRONG_ERROR);
//   }
// };


static changeNodeParentNode = async (data: any) => {
  try {
    const { node: newParentId, user, id } = data;

    if (!user) throw  manageGeneralError(overideObj(ERRORSMG.INVALID_CREDENTIALS, { message: "Your not authorize to perform this function" }));

    const [movingNode, newParent] = await Promise.all([
      NodesModel.findOne(
        { _id: new Types.ObjectId(id), user: new Types.ObjectId(user._id) },
        { path: 1 }
      ).lean(),
      NodesModel.findOne(
        { _id: new Types.ObjectId(newParentId), user: new Types.ObjectId(user._id) },
        { path: 1 }
      ).lean(),
    ]);

    if (!movingNode) throw manageGeneralError(overideObj(ERRORSMG.INVALID_CREDENTIALS, { message: "Invalid Node" }));
    if (!newParent)  throw manageGeneralError(overideObj(ERRORSMG.INVALID_CREDENTIALS, { message: "Invalid new parent" }));

    // ✅ O(1) cycle check — no traversal needed
    if (wouldCreateCycle(new Types.ObjectId(id), newParent.path)) {
      throw manageGeneralError(
        overideObj(ERRORSMG.VALIDATION_ERROR, {
          message: "Cannot move a node into its own descendant",
        })
      );
    }

    // Compute old and new path prefix for this node
    const oldPath = movingNode.path;                                // e.g. "/a/b/c/"
    const newPath = buildPath(newParent.path, new Types.ObjectId(id)); // e.g. "/a/x/c/"

    // Bulk-update all descendants in one query using regex on path
    // Any node whose path starts with oldPath is a descendant
    const descendantFilter = { path: { $regex: `^${escapeRegex(oldPath)}` } };

    await NodesModel.bulkWrite([
      // 1. Update all descendants — replace the old path prefix with new one
      {
        updateMany: {
          filter: descendantFilter,
          update: [
            {
              $set: {
                path: {
                  $concat: [
                    newPath,
                    { $substr: ["$path", oldPath.length, -1] },
                  ],
                },
              },
            },
          ],
        },
      },
      // 2. Update the node itself
      {
        updateOne: {
          filter: { _id: new Types.ObjectId(id) },
          update: { $set: { node: new Types.ObjectId(newParentId), path: newPath } },
        },
      },
    ]);

    return await NodesModel.findById(id).lean();
  } catch (e) {
    manageGeneralError(e, ERRORSMG.SOMETHING_WENT_WRONG_ERROR);
  }
};


  // =========================
  // SEARCH LINKS (paginated)
  // =========================
static searchLinks = async ({ data }: { data: any }) => {
  try {
    const {
      // userId,
      query,
      category,
      sort,
      page = 1,
      limit = 30,
    } = await validateInput({
      input: data,
      schema: searchLinkValidator,
      async: true,
    });

    const skip = (page - 1) * limit;

    // ✅ Build dynamic filter
    const filter: any = {
      // user: new Types.ObjectId(userId),
    };
// console.log(query)
    if (query) {
      filter.$text = { $search: query };
    }

    if (category) {
      filter.category = category;
    }

    // ✅ Build sort
    let sortOption: any = {};

    if (query) {
      // prioritize relevance if searching
      sortOption.score = { $meta: "textScore" };
    }

    if (sort === "latest") {
      sortOption.createdAt = -1;
    }

    if (sort === "oldest") {
      sortOption.createdAt = 1;
    }

    // default fallback
    if (!sort && !query) {
      sortOption.createdAt = -1;
    }

    const results = await LinksModel.find(filter)
      .skip(skip)
      .limit(limit + 1)
      .sort(sortOption);




    return {
      data: results.slice(0, limit), // remove extra item
      nextPage:page+1,
      page,
      hasMore : results.length>limit
    };
  } catch (e) {
    manageGeneralError(e, ERRORSMG.SOMETHING_WENT_WRONG_ERROR);
  }
};

static searchNode = async ({ data, node: nodeId }: { data: any; node: string }) => {
  try {
    const {
      query,
      category,
      sort,
      page = 1,
      limit = 30,
    } = await validateInput({
      input: data,
      schema: searchLinkValidator,
      async: true,
    });

    const _nodeId = new Types.ObjectId(nodeId);

    const targetNode = await NodesModel.findOne(
      { _id: _nodeId },
      { path: 1, title: 1, description: 1, action: 1 }
    ).lean();

    if (!targetNode) {
      throw manageGeneralError(
        overideObj(ERRORSMG.NOT_FOUND_ERROR, {
          message: "Node not found or unauthorized",
        })
      );
    }

    const skip = (page - 1) * limit;

    const descendantNodes = await NodesModel.find(
      { path: { $regex: `^${escapeRegex(targetNode.path)}` } },
      { _id: 1, title: 1, description: 1, logo: 1, action: 1 }
    ).lean();

    const nodeMap = new Map(descendantNodes.map((n) => [n._id.toString(), n]));
    nodeMap.set(targetNode._id.toString(), targetNode);

    const nodeScope = [_nodeId, ...descendantNodes.map((n) => n._id)];

    // 1️⃣ Build $match stage
    const matchStage: any = {
      node: { $in: nodeScope },
      isFeatured: false,
    };
    if (query) matchStage.$text = { $search: query };
    if (category) matchStage.category = category;

    // 2️⃣ Build $sort stage
    const sortStage: any = {};
    if (query) sortStage.score = { $meta: "textScore" };
    if (sort === "latest") sortStage.createdAt = -1;
    else if (sort === "oldest") sortStage.createdAt = 1;
    else if (!sort && !query) sortStage.createdAt = -1;

    // 3️⃣ Aggregation pipeline
    const pipeline: any[] = [
      { $match: matchStage },
      ...(Object.keys(sortStage).length ? [{ $sort: sortStage }] : []),
      { $skip: skip },
      { $limit: limit + 1 },

      // Lookup group and filter out if group.action exists
      {
        $lookup: {
          from: "groups", // ✅ your actual collection name
          localField: "group",
          foreignField: "_id",
          as: "_groupData",
        },
      },

      // Filter: exclude if group.action is set
      {
        $match: {
          $or: [
            { "_groupData.0": { $exists: false } },      // no group at all
            { "_groupData.0.action": { $exists: false } }, // group exists but no action
            { "_groupData.0.action": null },               // group.action is explicitly null
          ],
        },
      },

      // Attach resolved node from nodeMap via $addFields after — done in JS below
      // But first, filter out links whose node has an action
      {
        $match: {
          node: {
            $in: nodeScope.filter((id) => {
              const n = nodeMap.get(id.toString());
              return !n?.action; // ✅ only keep nodes without action
            }),
          },
        },
      },

      // Shape the group field to match expected object (drop internal array)
      {
        $addFields: {
          group: { $arrayElemAt: ["$_groupData", 0] },
        },
      },
      {
        $unset: "_groupData",
      },
    ];

    const results = await LinksModel.aggregate(pipeline);

    // 4️⃣ Attach full node object (from nodeMap) to each link
    const data_ = results.slice(0, limit).map((link) => ({
      ...link,
      node: nodeMap.get(link.node?.toString()) ?? null,
    }));

    // 5️⃣ Node title/description match check
    let nodeMatch = null;
    if (query) {
      const q = query.toLowerCase();
      const titleHit = targetNode.title?.toLowerCase().includes(q);
      const descHit = targetNode.description?.toLowerCase().includes(q);
      if (titleHit || descHit) {
        nodeMatch = {
          _id: targetNode._id,
          title: targetNode.title,
          description: targetNode.description,
        };
      }
    }

    return {
      nodeMatch,
      data: data_.map(e=>{
        if(e?.action){
          let {url,text,...rest} = e
          return rest
        }
        return e
      }),
      nextPage: page + 1,
      page,
      hasMore: results.length > limit,
    };
  } catch (e) {
    manageGeneralError(e, ERRORSMG.SOMETHING_WENT_WRONG_ERROR);
  }
};
// static searchNode = async ({ data, node: nodeId }: { data: any; node: string }) => {
//   try {
//     const {
//       query,
//       category,
//       sort,
//       page = 1,
//       limit = 30,
//     } = await validateInput({
//       input: data,
//       schema: searchLinkValidator,
//       async: true,
//     });

//     // const userId = new Types.ObjectId(user._id?.toString());
//     const _nodeId = new Types.ObjectId(nodeId);

//     // 1️⃣ Verify node exists and belongs to user
//     const targetNode = await NodesModel.findOne(
//       { _id: _nodeId, 
//         // user: userId 
//       },
//       { path: 1, title: 1, description: 1 }
//     ).lean();

//     if (!targetNode) {
//       throw manageGeneralError(
//         overideObj(ERRORSMG.NOT_FOUND_ERROR, {
//           message: "Node not found or unauthorized",
//         })
//       );
//     }

//     const skip = (page - 1) * limit;

//     // 2️⃣ Build link filter — scoped to node + all descendants via path prefix
//     //    First get all node IDs whose path starts with targetNode.path
//  const descendantNodes = await NodesModel.find(
//   {
//     // user: userId,
//     path: { $regex: `^${escapeRegex(targetNode.path)}` },
//   },
//   { _id: 1, title: 1, description: 1, logo: 1 } // project only what you need
// )
//   .lean()
//   .then((nodes) => nodes);
// const nodeMap = new Map(descendantNodes.map((n) => [n._id.toString(), n]));

// // Don't forget the target node itself
// nodeMap.set(targetNode._id.toString(), targetNode);
//     // Always include the target node itself
//     // const nodeScope = [_nodeId, ...descendantNodeIds];
//     const nodeScope = [_nodeId, ...descendantNodes.map((n) => n._id)];

//     const filter: any = {
//       // user: userId,
//       node: { $in: nodeScope },
//       isFeatured:false,
//     };

//     if (query) {
//       filter.$text = { $search: query };
//     }

//     if (category) {
//       filter.category = category;
//     }

//     // 3️⃣ Build sort
//     let sortOption: any = {};

//     if (query) {
//       sortOption.score = { $meta: "textScore" };
//     }

//     if (sort === "latest") sortOption.createdAt = -1;
//     if (sort === "oldest") sortOption.createdAt = 1;
//     if (!sort && !query) sortOption.createdAt = -1;

 

//     // 4️⃣ Search links scoped to the node tree
//     const results = await LinksModel.find(filter)
//       .skip(skip)
//       .limit(limit + 1)
//       .sort(sortOption)
//       .lean();

//     // 5️⃣ Check if node title/description matches query too
//     let nodeMatch = null;
//     if (query) {
//       const q = query.toLowerCase();
//       const titleHit = targetNode.title?.toLowerCase().includes(q);
//       const descHit = targetNode.description?.toLowerCase().includes(q);
//       if (titleHit || descHit) {
//         nodeMatch = { _id: targetNode._id, title: targetNode.title, description: targetNode.description };
//       }
//     }
//     const data_ = results.slice(0, limit).map((link) => ({
//   ...link,
//   node: nodeMap.get(link.node?.toString()) ?? null,
// }));

//     return {
//       nodeMatch,        // non-null if the node itself matched the query
//       data: data_.slice(0, limit),

//       nextPage: page + 1,
//       page,
//       hasMore: results.length > limit,
//     };
//   } catch (e) {
//     manageGeneralError(e, ERRORSMG.SOMETHING_WENT_WRONG_ERROR);
//   }
// };


  // =========================
  // GET LINKS FOR NODE (paginated)
  // =========================
  static getNodeLinks = async ({ nodeId, page = 1 }: any) => {
    try {
      const limit = 30;
      const skip = (page - 1) * limit;

      const links = await LinksModel.find({
        node: new Types.ObjectId(nodeId)
      })
        .skip(skip)
        .limit(limit);

      return {
        data: links,
        success: true
      };

    } catch (e) {
      manageGeneralError(e, ERRORSMG.SOMETHING_WENT_WRONG_ERROR);
    }
  };
  static getLink = async ({ id }: any,config?:any) => {
    try {
    

      const link = await LinksModel.findOne({
        _id: new Types.ObjectId(id),
        // isFeatured:false
      }).populate("anchor")
      if(!link){
        return link
      }
if(config?.actionNoGuide){

  return link
}
const {url, text,...rest}  = link
return rest

    } catch (e) {
      manageGeneralError(e, ERRORSMG.SOMETHING_WENT_WRONG_ERROR);
    }
  };
static groupsReorder = async ({ groups, node, user }: any) => {
  try {

     const userId = new Types.ObjectId(user?._id?.toString());
    const nodeId = new Types.ObjectId(node);
    // const groupId = new Types.ObjectId(group);

    const nodeIsExist = await NodesModel.exists({
      _id: nodeId,
      user: userId,
    });

    if (!nodeIsExist) {
      throw manageGeneralError(
        overideObj(ERRORSMG.INVALID_CREDENTIALS, {
          message: "You're not authorized to perform this function",
        })
      );
    }

  


    if (!Array.isArray(groups) || groups.length === 0) {
         throw manageGeneralError(
        overideObj(ERRORSMG.BAD_PARAMETER_ERROR, {
          message: "Invalid groups",
        })
      );
    };
    const operations = groups.map((id: string, index: number) => ({
      updateOne: {
        filter: {
          _id: new Types.ObjectId(id),
          user: userId,
          node: nodeId,
        },
        update: {
          $set: { position: index },
        },
      },
    }));

    const result = await LinkGroupModel.bulkWrite(operations);

    return result;
  } catch (e) {
    manageGeneralError(e, ERRORSMG.SOMETHING_WENT_WRONG_ERROR);
  }
};
static linksReorder = async ({ group, node, user, links }: any) => {
  try {
    const userId = new Types.ObjectId(user?._id?.toString());
    const nodeId = new Types.ObjectId(node);
    const groupId =  group == "ungroup"||!group?null:new Types.ObjectId(group);

    const nodeIsExist = await NodesModel.exists({
      _id: nodeId,
      user: userId,
    });

    if (!nodeIsExist) {
      throw manageGeneralError(
        overideObj(ERRORSMG.INVALID_CREDENTIALS, {
          message: "You're not authorized to perform this function",
        })
      );
    }

    const groupIsExist = group == "ungroup" || await LinkGroupModel.exists({
      _id: groupId,
      user: userId,
    });

    if (!groupIsExist) {
      throw manageGeneralError(
        overideObj(ERRORSMG.INVALID_CREDENTIALS, {
          message: "You're not authorized to perform this function",
        })
      );
    }

    if (!Array.isArray(links) || links.length === 0) {
         throw manageGeneralError(
        overideObj(ERRORSMG.BAD_PARAMETER_ERROR, {
          message: "Invalid links",
        })
      );
    };

    const operations = links.map((id: string, index: number) => ({
      updateOne: {
        filter: {
          _id: new Types.ObjectId(id),
          user: userId,
          node: nodeId,
          // $or:[
          //   {group:groupId},
          //   {group:groupId}
          // ] ,
        },
        update: {
          $set: {
            position: index, group: groupId,
          },
        },
      },
    }));

    return await LinksModel.bulkWrite(operations);
  } catch (e) {
    manageGeneralError(e, ERRORSMG.SOMETHING_WENT_WRONG_ERROR);
  }
};


// Add these to your LinkNodeService class

// =========================
// GET GLOBAL LINKS (Discovery)
// =========================
static getLinks = async ({ query, page = 1, user }: { query?: string; page: number; user?: IUser }) => {
  try {
    const limit = 20;
    const skip = (page - 1) * limit;

    // 1. Fetch Special/Featured Links (Top 6 by likes + clicks + views)
    let specialLinks = { data: [], hasMore: false, nextPage: null };
    if (page === 1) {
      const featured = await LinksModel.find({ isPrivate: false, isHidden: false })
        .sort({ likes: -1, clicks: -1, views: -1 })
        .limit(15)
        .populate(this.populateuser);
      
      specialLinks.data = featured as any;
    }

    // 2. Build Filter for General Feed
    const filter: any = { isPrivate: false, isHidden: false ,isFeatured:false,resourceType:E_RESOURCE_TYPES.URL};
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } },
        { url: { $regex: query, $options: "i" } }
      ];
    }

    // 3. Fetch Feed Links
    const links = await LinksModel.find(filter)
      .sort({ createdAt: -1 }) // Latest stuff first
      .skip(skip)
      .limit(limit + 1)
      .populate(this.populateuser);

    const hasMore = links.length > limit;
    const data = hasMore ? links.slice(0, limit) : links;

    return {
      specialLinks:{
        data:data,
        page,
        nextPage: hasMore ? page + 1 : null,
        hasMore:false
      },
      links: {
        data,
        page,
        nextPage: hasMore ? page + 1 : null,
        hasMore
      }
    };
  } catch (e) {
    manageGeneralError(e, ERRORSMG.SOMETHING_WENT_WRONG_ERROR);
  }
};

// =========================
// RECORD CLICK / VIEW
// =========================
static recordClick = async ({id:linkId}:{id: string}) => {
  try {
    // Incrementing both clicks and views for discovery metrics
    let link = await LinksModel.findByIdAndUpdate(
      new Types.ObjectId(linkId),
      { $inc: { clicks: 1, views: 1 } },
      { new: true }
    );


    if(link?.node){

      let node = await NodesModel.findByIdAndUpdate(
        // new Types.ObjectId(link?.node),
         link?.node,
        { $inc: { clicks: 1, views: 1 } },
        { new: true }
      );
    }


    return link
  } catch (e) {
    manageGeneralError(e, ERRORSMG.SOMETHING_WENT_WRONG_ERROR);
  }
};
static changeProfileVisibility = async ({user,visibility,node}:{user: IUser,visibility:boolean,node?:string}) => {
  try {
    // Incrementing both clicks and views for discovery metrics
    // let global_ = !!Number(global)

    if(!node){

      let user_ = await User.findByIdAndUpdate(
        // new Types.ObjectId(link?.node),
         user._id,
        {isVisibleInNode:visibility,

           isVisibleInNodeTimeStamp: new Date()
        },
        { new: true }
      );
    }else{
      let node_ = await NodesModel.findOneAndUpdate(
        // new Types.ObjectId(link?.node),
   {user:  new Types.ObjectId(user._id?.toString()),
         _id:new Types.ObjectId(node)},
        {userIsVisibleInNode:visibility,

  userIsVisibleInNodeTimeStamp: new Date()

        },
        { new: true }
      );

    }
    return {success:true}
  } catch (e) {
    manageGeneralError(e, ERRORSMG.SOMETHING_WENT_WRONG_ERROR);
  }
};

// =========================
// TOGGLE LIKE
// =========================
// static toggleLike = async ({ linkId, user }: { linkId: string; user: IUser }) => {
//   try {
//     const userId = new Types.ObjectId(user._id.toString());
//     const lid = new Types.ObjectId(linkId);

//     // Assuming you have a LikeModel to track unique likes per user
//     const existingLike = await mongoose.model("Like").findOne({ user: userId, link: lid });

//     if (existingLike) {
//       // UNLIKE
//       await mongoose.model("Like").deleteOne({ _id: existingLike._id });
//       const updated = await LinksModel.findByIdAndUpdate(lid, { $inc: { likes: -1 } }, { new: true });
//       return { likes: updated?.likes, isLiked: false };
//     } else {
//       // LIKE
//       await mongoose.model("Like").create({ user: userId, link: lid });
//       const updated = await LinksModel.findByIdAndUpdate(lid, { $inc: { likes: 1 } }, { new: true });
//       return { likes: updated?.likes, isLiked: true };
//     }
//   } catch (e) {
//     manageGeneralError(e, ERRORSMG.SOMETHING_WENT_WRONG_ERROR);
//   }
// };
}







/**
 * Build path for a new node given its parent's path and own _id.
 * Root nodes (no parent) get path = "/<ownId>/"
 */


/**
 * O(1) cycle check — just see if the new parent's path
 * already contains the node we're trying to move.
 */
