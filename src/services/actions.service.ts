
import mongoose, { Types } from "mongoose";
import { validateInput, manageGeneralError, overideObj, sortByPosition, buildPath, escapeRegex } from "../utils/utils";

import { ERRORSMG } from "../error/error";
import { E_STORAGE_FOLDER } from "../storage";
import { E_RESOURCE_TYPES, ILinks, LinksModel } from "../models/links";
import { NodesModel, NodesModelName } from "../models/node";


import { ActionsModel, createActionZod, E_RESOURCE_LEVELS, IActions, ResouceActionModel, validateActionSchema } from "../models/action";
import { ActionsResponseModel, ActionUniqueFieldModel } from "../models/actionResponse";
import { IUser, User } from "../models/user";
import { E_ActionTypes } from "../enums";
import { LinkGroupModel } from "../models/linkGroup";
import { LinkNodeService } from "./linkNode.service";


export class ActionsService {
static createPasswordAction = async (data:any,user:IUser) => {
  const action = await ActionsModel.create({
    name: data.name,
       description: data.description,
          //  user: new Types.ObjectId("69d72a82d4f9030e39d8ab71"),
           user: new Types.ObjectId(user?._id?.toString()),
    actionType: E_ActionTypes.password,
    config: {
      type: "password",
      passwordHash: data.config.password, // ideally hash this
    },
  });

  return action;
};

static createFormAction = async (data: any,user:IUser) => {
    // console.log(data,"data")
    const fields = data.config.fields || [];
  const action = await ActionsModel.create({
          user: new Types.ObjectId(user?._id?.toString()),
    // user: data.user,
    // user: new Types.ObjectId("69d72a82d4f9030e39d8ab71"),
    name: data.name,
    description: data.description,
    actionType: E_ActionTypes.formdata,
    config: {
      type: "formdata",
      fields,
    },
  });

    return action;
}


static createGeoAction = async (data: any,user:IUser) => {

    // future implementation can include getting user's location and save it as action response
    throw manageGeneralError(   
    overideObj(ERRORSMG.VALIDATION_ERROR, {

        message: "Geo action type is not implemented yet"
        })
);

}



static createRequestAction = async (data: any,user:IUser) => {

// future implementation can include making a request to a specified url with given method and body, and save the response as action response   
        throw manageGeneralError(
    overideObj(ERRORSMG.VALIDATION_ERROR, {
        message: "Request action type is not implemented yet"
        })
);
}



static createAction = async (data: {
    actionType: string;
    name: string;
    config?: any;
    description?: string;
    resourceType?: E_RESOURCE_TYPES;
},user:IUser) => {    
    try {
// validae input thros an error if its wrong
              const validated = await validateInput({
        input: data,
        schema: createActionZod,
        async: true
      });

        switch(data.actionType){
case E_ActionTypes.password:{
    return this.createPasswordAction(data,user)
}
case E_ActionTypes.formdata:{ 
    return this.createFormAction(data,user) }
case E_ActionTypes.geo:{
    return this.createGeoAction(data,user)
}
case E_ActionTypes.request:{
    return this.createRequestAction(data,user)
}
default:{
    throw manageGeneralError(   
        overideObj(ERRORSMG.VALIDATION_ERROR, {
            message: "Invalid action type"
            })
    );
}

        }
    }
catch(e){
    manageGeneralError(e, ERRORSMG.SOMETHING_WENT_WRONG_ERROR);
}
}

static deleteAction = async (actionId: string, user: IUser) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    if (!mongoose.Types.ObjectId.isValid(actionId)) {
      throw manageGeneralError(
        overideObj(ERRORSMG.VALIDATION_ERROR, {
          message: "Invalid action id",
        })
      );
    }

    const action = await ActionsModel.findOneAndDelete(
      {
        _id: new Types.ObjectId(actionId),
        // user: new Types.ObjectId("69d72a82d4f9030e39d8ab71"),
              user: new Types.ObjectId(user?._id?.toString()),
      },
      { session }
    );

    if (!action) {
      throw manageGeneralError(
        overideObj(ERRORSMG.VALIDATION_ERROR, {
          message: "Action not found",
        })
      );
    }

    const resource = await ResouceActionModel.findOne(
      { action: action._id },
      null,
      { session }
    );

    if (!resource) {
      await session.commitTransaction();
      return { success: true };
    }

    await Promise.all([
      ActionsResponseModel.deleteMany(
        { action: action._id },
        { session }
      ),

      ActionUniqueFieldModel.deleteMany(
        { action: resource._id },
        { session }
      ),

      LinkGroupModel.updateMany(
        { action: resource._id },
        {
          $unset: { action: "" },
          $inc: { actions: -1 },
        },
        { session }
      ),

      LinksModel.updateMany(
        { action: resource._id },
        {
          $unset: { action: "" },
          $inc: { actions: -1 },
        },
        { session }
      ),

      NodesModel.updateMany(
        { action: resource._id },
        {
          $unset: { action: "" },
          $inc: { actions: -1 },
        },
        { session }
      ),

      ResouceActionModel.deleteMany(
        { action: action._id },
        { session }
      ),
    ]);

    await session.commitTransaction();

    return { success: true };
  } catch (e) {
    await session.abortTransaction();
    manageGeneralError(e, ERRORSMG.SOMETHING_WENT_WRONG_ERROR);
  } finally {
    await session.endSession();
  }
}

static getUserActions = async (user: IUser) => {
    try {


        const actions = await ActionsModel.find(
            { 
              // user: new Types.ObjectId("69d72a82d4f9030e39d8ab71")
              user: new Types.ObjectId(user?._id?.toString())
             });

        return actions;
    } catch (e) {
        manageGeneralError(e, ERRORSMG.SOMETHING_WENT_WRONG_ERROR);
    }   
}


 


static performAction =async (data:any,resouceActionData:any,user?:IUser) =>{
    try{
        // console.log(resouceActionData,"resouceActionData in performAction"  )
            switch(resouceActionData.action.actionType){
        
                case E_ActionTypes.password:{
                    // compare data.password with action.config.passwordHash and return true or false
                 return  await this.performPasswordAction(data,resouceActionData.action);    
                }
                case E_ActionTypes.formdata:{
                 return await this.performFormAction(data,resouceActionData,user);
        
            }
                 default:{
                    throw manageGeneralError(   
                        overideObj(ERRORSMG.VALIDATION_ERROR, {
                            message: "Invalid action type"
                            })
                    );
                 }      
        }

    }catch(e){
        console.log(e,"error in performAction")
        manageGeneralError(e, ERRORSMG.SOMETHING_WENT_WRONG_ERROR); 
    }
}

static performPasswordAction = async (data: any, actionData: any) => {
//   const actionData = action 

  if (!actionData || actionData.actionType !== E_ActionTypes.password) {
    throw manageGeneralError(
      overideObj(ERRORSMG.VALIDATION_ERROR, {
        message: "Action not found",
      })
    );
  }

  if (actionData.config.type !== "password") {
      throw manageGeneralError(
      overideObj(ERRORSMG.VALIDATION_ERROR, {
        message: "Invalid action config",
      })
    );
  }

  const ok = data.password === actionData.config.passwordHash;

  return {
    success: ok,
    message: ok ? "Password is correct" : "Password is incorrect",
  };
};
static performFormAction = async (data:any,resouceActionData:any,user?:IUser) =>{

// let actionData = await ActionsModel.findById(action);
let actionData = resouceActionData.action;
if(!actionData || actionData.actionType !== E_ActionTypes.formdata) {
    throw manageGeneralError(
        overideObj(ERRORSMG.VALIDATION_ERROR, {
            message: "Action not found"
            })
    );          
}


if (actionData.config.type === "formdata") {
        let schemaGen = validateActionSchema(actionData.config.fields);
    let   validated =  await validateInput({
            input: data,
            schema: schemaGen,
            // async: true
        });

        let fields = actionData.config.fields
      const uniqueFields = fields.filter((f: any) => f.isUnique);

 
// console.log(validated,"validated data in performFormAction")
  const uniqueEntries = uniqueFields.map((f: any) => ({
    action: new Types.ObjectId(resouceActionData._id?.toString()),
    field: f.name,
    value: validated[f.name], // 🔥 REAL VALUE (IMPORTANT FIX)
    compositeKey: `${resouceActionData._id}:${f.name}:${validated[f.name]}`,
  }));

  if (uniqueEntries.length > 0) {
    await ActionUniqueFieldModel.insertMany(uniqueEntries);
  }

    const response = await ActionsResponseModel.create({
    action: actionData._id,
    resourceAction:new Types.ObjectId(resouceActionData._id?.toString()),
    // userId: user?._id,
    responseType: E_ActionTypes.formdata,
    responsePayload: validated,
  });

    }

return {success:true}


}

static performResouceAction = async (data:any,resourceActionId:string,user?:IUser) =>{
    try{

        let resouceActionData = await ResouceActionModel.findById(resourceActionId).populate("action");
        // let actionOwner = await User.findOne({_id:(resouceActionData?.action as IActions)?.user as Types.ObjectId})
    
        if(!resouceActionData) {
            throw manageGeneralError(
                overideObj(ERRORSMG.VALIDATION_ERROR, {
                    message: "Resource action not found"
                    })
            );          
        }
    
        let action = await this.performAction(data,resouceActionData,user);
    
        return await this.getDataForActionResponse(resouceActionData?.resource?.toString()??"",resouceActionData.resourceType,{_id:(resouceActionData?.action as IActions)?.user as Types.ObjectId} as any);
        // if( action?.success)
        // {
        // }
    // throw manageGeneralError(
    //     overideObj(ERRORSMG.VALIDATION_ERROR, {
    //         message: "Action execution failed",
    //         // details: action?.message
    //         })
    // );  
    }catch(e){
        console.log(e,"error in performResouceAction")
        manageGeneralError(e, ERRORSMG.SOMETHING_WENT_WRONG_ERROR); 
    }


}

static getResouceActionResponses = async ({
  actionId,
  page = 1,
  user,
  resourceType
}:{actionId:string,page?:number,user:IUser,resourceType:String}) => {
  try {
    const limit = 100;

    page = Math.max(Number(page) || 1, 1);

    const offset = (page - 1) * limit;

    const data = await ResouceActionModel.find({
      action: new Types.ObjectId(actionId),resourceType
    })
      .skip(offset)
      .limit(limit);

    return {
      data,
      nextPage: page + 1,
      page,
      hasMore: data.length === limit,
    };
  } catch (e) {
    throw e;
  }
};

static getDataForActionResponse = async (resourceId:string,resourceType:E_RESOURCE_LEVELS,user:IUser) =>{
let data:any = null;
    switch(resourceType){
        case E_RESOURCE_LEVELS.NODE:{
            // get node id from resource action id

          data=  await   LinkNodeService.getNode({
                node: resourceId,
                user
                // user: {_id:new Types.ObjectId("69d72a82d4f9030e39d8ab71")} as any
            },{includeActions:true,actionNoGuide:true})
            break
        
        }
            case E_RESOURCE_LEVELS.LINK:{

                data =await  LinkNodeService.getLink({
                    id: resourceId,
                    user
                    // user: {_id:new Types.ObjectId("69d72a82d4f9030e39d8ab71")} as any
                },{includeActions:true,actionNoGuide:true})    
                break
            }
            case E_RESOURCE_LEVELS.GROUP:{
              // console.log("resourceIdresourceId",resourceId)
                data = await LinkNodeService.getGroupLinks({
                    groupId: resourceId,
                    user
                    // user: {_id:new Types.ObjectId("69d72a82d4f9030e39d8ab71")} as any
                },{includeActions:true})    
                // console.log("resourceIdresourceId",resourceId,data)
                break
            }
            default:{
             throw manageGeneralError(
                    overideObj(ERRORSMG.VALIDATION_ERROR, {
                        message: "Invalid resource type"
                        })
                ); 
                // break
            }   

            

            
        }
        // if(!data){
   
        // }
         return {data,resourceType}
}










static addActionToResource = async (
{  actionId,
  resourceId,
  resourceType,applyToDescendants}:{  actionId: string,
  resourceId: string,
  resourceType: E_RESOURCE_LEVELS,
applyToDescendants?:boolean 
},
  user:IUser
) => {
  if (!mongoose.Types.ObjectId.isValid(actionId)) {
    throw manageGeneralError(
      overideObj(ERRORSMG.VALIDATION_ERROR, {
        message: "Invalid action id",
      })
    );
  }

  if (!mongoose.Types.ObjectId.isValid(resourceId)) {
    throw manageGeneralError(
      overideObj(ERRORSMG.VALIDATION_ERROR, {
        message: "Invalid resource id",
      })
    );
  }

  const action = await ActionsModel.findOne({_id:new Types.ObjectId(actionId),

    //  user: new Types.ObjectId("69d72a82d4f9030e39d8ab71"),
         user: new Types.ObjectId(user?._id?.toString()),
  });

  if (!action) {
    throw manageGeneralError(
      overideObj(ERRORSMG.VALIDATION_ERROR, {
        message: "Action not found",
      })
    );
  } 

  const existing = await ResouceActionModel.findOne({
  resource: resourceId,
        user: new Types.ObjectId(user?._id?.toString()),
  // action: action._id,
  resourceType,
});

let num = 1
if (existing) {
   num = 0
  // return existing
}


   if (resourceType === E_RESOURCE_LEVELS.NODE) {
    const node = await NodesModel.findOne({_id:new Types.ObjectId(resourceId),
      //  user: new Types.ObjectId("69d72a82d4f9030e39d8ab71"),
            user: new Types.ObjectId(user?._id?.toString()),

    });

    if (!node) {
      throw manageGeneralError(
        overideObj(ERRORSMG.VALIDATION_ERROR, {
          message: "Node not found",
        })
      );
    }

 

let resource;

let uniqueGroupId = new mongoose.Types.ObjectId(); 
 if (applyToDescendants) {
  const descendants = await NodesModel.find(
    {
      user: node.user,
      path: { $regex: `^${escapeRegex(node.path)}` },
    },
    { _id: 1 }
  ).lean();

  const descendantIds = descendants.map((d) => d._id);

  await ResouceActionModel.bulkWrite(
    descendantIds.map((descendantId) => ({
      updateOne: {
        filter: {
          resource: descendantId,
                user: new Types.ObjectId(user?._id?.toString()),
          // action: action._id,
          resourceType: E_RESOURCE_LEVELS.NODE,
          
        },
        update: {
          $set: {
                  user: new Types.ObjectId(user?._id?.toString()),
            resource: descendantId,
            action: action._id,
            resourceType: E_RESOURCE_LEVELS.NODE,
            uniqueGroupId
          },
        },
        upsert: true,
      },
    }))
  );

  const descendantResources = await ResouceActionModel.find(
    {
      resource: { $in: descendantIds },
      action: action._id,
      resourceType: E_RESOURCE_LEVELS.NODE,
    },
    { _id: 1, resource: 1 }
  ).lean();

  const resourceMap = new Map(
    descendantResources.map((r) => [r.resource?.toString(), r._id])
  );

  await NodesModel.bulkWrite(
    descendantIds.map((descendantId) => ({
      updateOne: {
        filter: { _id: descendantId },
        update: {
          $inc: { actions: num },
          $set: { action: resourceMap.get(descendantId.toString()) },
        },
      },
    }))
  );

  // ✅ Pull the main node's resource from the map
  resource = descendantResources.find(
    (r) => r.resource?.toString() === node._id.toString()
  );
} else {
  resource = await ResouceActionModel.findOneAndUpdate(
    {
      resource: node._id,
            user: new Types.ObjectId(user?._id?.toString()),
      // action: action._id,
      resourceType: E_RESOURCE_LEVELS.NODE,
    },
    {
      $set: {
              user: new Types.ObjectId(user?._id?.toString()),
        resource: node._id,
        action: action._id,
        resourceType: E_RESOURCE_LEVELS.NODE,
        uniqueGroupId
      },
    },
    { upsert: true, new: true }
  );

  await NodesModel.updateOne(
    { _id: node._id },
    { $inc: { actions: num }, $set: { action: resource._id } }
  );
}

return resource; // same shape regardless of which branch ran
  }
    if (resourceType === E_RESOURCE_LEVELS.LINK) {
    const link = await LinksModel.findOne({_id:new Types.ObjectId(resourceId), 
      // user: new Types.ObjectId("69d72a82d4f9030e39d8ab71"),
           user: new Types.ObjectId(user?._id?.toString()),

    });

    if (!link) {
      throw manageGeneralError(
        overideObj(ERRORSMG.VALIDATION_ERROR, {
          message: "Link not found",
        })
      );
    }

      let resource  = await ResouceActionModel.findOneAndUpdate(
      {
        resource: link._id,
              user: new Types.ObjectId(user?._id?.toString()),
        // action: action._id,
        resourceType: E_RESOURCE_LEVELS.LINK,
      },
      {
        $set: {
          resource: link._id,
                user: new Types.ObjectId(user?._id?.toString()),
          action: action._id,
          resourceType: E_RESOURCE_LEVELS.LINK,
        },
      },
      { upsert: true, new: true }
    );

    await LinksModel.updateOne(
      { _id: link._id },
      { $inc: { actions: num } ,action:resource._id }
    );

    return  resource;
  }
    if (resourceType === E_RESOURCE_LEVELS.GROUP) {
    const linkGroup = await LinkGroupModel.findOne({_id:new Types.ObjectId(resourceId), 
      // user: new Types.ObjectId("69d72a82d4f9030e39d8ab71"),
           user: new Types.ObjectId(user?._id?.toString()),

    });

    if (!linkGroup) {
      throw manageGeneralError(
        overideObj(ERRORSMG.VALIDATION_ERROR, {
          message: "Link group not found",
        })
      );
    }

    let resource =   await ResouceActionModel.findOneAndUpdate(
      {
        resource: linkGroup._id,
              user: new Types.ObjectId(user?._id?.toString()),
        // action: action._id,
        resourceType: E_RESOURCE_LEVELS.GROUP,
      },
      {
        $set: {
                user: new Types.ObjectId(user?._id?.toString()),
          resource: linkGroup._id,
          action: action._id,
          resourceType: E_RESOURCE_LEVELS.GROUP,
        },
      },
      { upsert: true, new: true }
    );

    await LinkGroupModel.updateOne(
      { _id: linkGroup._id },
      { $inc: { actions: num },$set:{action:resource._id } }
    );

    return resource;
  }
    throw manageGeneralError(
    overideObj(ERRORSMG.VALIDATION_ERROR, {
      message: "Invalid resource type",
    })
  );
};







static getResourceAction = async (resourceId:string) =>{
  // let resouceData =
  return ResouceActionModel.findOne({resource:resourceId}).populate("action");
}

static removeActionFromResource = async (
{ 
  //  actionId,
  resourceId,
  applyToDescendants,
  resourceType}:{  actionId: string,
  resourceId: string,
  resourceType: E_RESOURCE_LEVELS,
applyToDescendants?:boolean},
  user:IUser
) => {
  // if (!mongoose.Types.ObjectId.isValid(actionId)) {
  //   throw manageGeneralError(
  //     overideObj(ERRORSMG.VALIDATION_ERROR, {
  //       message: "Invalid action idd",
  //     })
  //   );
  // }

  if (!mongoose.Types.ObjectId.isValid(resourceId)) {
    throw manageGeneralError(
      overideObj(ERRORSMG.VALIDATION_ERROR, {
        message: "Invalid resource id",
      })
    );
  }

  // const action = await ActionsModel.findById(actionId);

  // if (!action) {
  //   throw manageGeneralError(
  //     overideObj(ERRORSMG.VALIDATION_ERROR, {
  //       message: "Action not found",
  //     })
  //   );
  // }
  //   if (resourceType === E_RESOURCE_LEVELS.NODE) {
  //   const node = await NodesModel.findById(resourceId);

  //   if (!node) {
  //     throw manageGeneralError(
  //       overideObj(ERRORSMG.VALIDATION_ERROR, {
  //         message: "Node not found",
  //       })
  //     );
  //   }

  //   const removed = await ResouceActionModel.findOneAndDelete({
  //     // resource: node._id,
  //     _id: node.action,
  //     resourceType: E_RESOURCE_LEVELS.NODE,
  //   });

  //   if (!removed) {
  //     return { success: true, message: "Already removed" };
  //   }

  //   if(applyToDescendants){
  //         const removeds = await ResouceActionModel.findOneAndDelete({
  //     // resource: node._id,
  //  unqiueGroupId: removed.unqiueGroupId,
  //     resourceType: E_RESOURCE_LEVELS.NODE,
  //   });
  //   }else{

  //   }

  //   await NodesModel.updateOne(
  //     { _id: node._id },
  //     { $inc: { actions: -1 } ,$set:{action:null} }
  //   );

  //   return { success: true };
  // }

  if (resourceType === E_RESOURCE_LEVELS.NODE) {
  const node = await NodesModel.findOne({
          user: new Types.ObjectId(user?._id?.toString()),
          _id: new Types.ObjectId(resourceId),

    
    }, { _id: 1, action: 1, path: 1 ,user:1 }).lean();

  if (!node) {
    throw manageGeneralError(
      overideObj(ERRORSMG.VALIDATION_ERROR, { message: "Node not found" })
    );
  }

  const removed = await ResouceActionModel.findOneAndDelete({
    _id: node.action,
          user: new Types.ObjectId(user?._id?.toString()),
    resourceType: E_RESOURCE_LEVELS.NODE,
  });

  if (!removed) {
    return { success: true, message: "Already removed" };
  }

  if (applyToDescendants && removed.uniqueGroupId) {
    // Delete all resource actions sharing the same group in one shot
    await ResouceActionModel.deleteMany({
      uniqueGroupId: removed.uniqueGroupId,
            user: new Types.ObjectId(user?._id?.toString()),
      resourceType: E_RESOURCE_LEVELS.NODE,
    });

    // Get all descendant node IDs via path prefix
    const descendants = await NodesModel.find(
      {
        user: node.user,
        path: { $regex: `^${escapeRegex(node.path)}` },
      },
      { _id: 1 }
    ).lean();

    const descendantIds = descendants.map((d) => d._id);
// console.log(descendantIds,"descendantIdsdd to clear action from",node)
    // Clear action field and decrement counter on all descendants + node itself
    await NodesModel.bulkWrite(
      descendantIds.map((descendantId) => ({
        updateOne: {
          filter: { _id: descendantId },
          update: {
            $inc: { actions: -1 },
            $set: { action: null },
          },
        },
      }))
    );
  } else {
    // Single node only
    await NodesModel.updateOne(
      { _id: node._id },
      { $inc: { actions: -1 }, $set: { action: null } }
    );
  }

  return { success: true };
}

    if (resourceType === E_RESOURCE_LEVELS.LINK) {
    const link = await LinksModel.findOne({ 
       user: new Types.ObjectId(user?._id?.toString()),
       _id: new Types.ObjectId(resourceId)
      
      });

    if (!link) {
      throw manageGeneralError(
        overideObj(ERRORSMG.VALIDATION_ERROR, {
          message: "Link not found",
        })
      );
    }

    const removed = await ResouceActionModel.findOneAndDelete({
      // resource: link._id,
        user: new Types.ObjectId(user?._id?.toString()),
      _id: link.action,
      resourceType: E_RESOURCE_LEVELS.LINK,
    });

    // if (!removed) {
    //   return { success: true, message: "Already removed" };
    // }

    await LinksModel.updateOne(
      { _id: link._id,  user: new Types.ObjectId(user?._id?.toString()), },
      {
        $inc: {
          actions: -1 < 0 ? 0 : -1, // safety guard
          
        },
        $set:{action:null}
      }
    );

    return { success: true };
  }
    if (resourceType === E_RESOURCE_LEVELS.GROUP) {
    const group = await LinkGroupModel.findOne({
        user: new Types.ObjectId(user?._id?.toString()),
        _id: new Types.ObjectId(resourceId),
    });

    if (!group) {
      throw manageGeneralError(
        overideObj(ERRORSMG.VALIDATION_ERROR, {
          message: "Link group not found",
        })
      );
    }

    const removed = await ResouceActionModel.findOneAndDelete({
      // resource: group._id,
        user: new Types.ObjectId(user?._id?.toString()),
      _id: group.action,
      resourceType: E_RESOURCE_LEVELS.GROUP,
    });

    if (!removed) {
      return { success: true, message: "Already removed" };
    }

    await LinkGroupModel.updateOne(
      { _id: group._id,  user: new Types.ObjectId(user?._id?.toString()), },
      {
        $inc: {
          actions: -1 < 0 ? 0 : -1,
        },
        $set:{action:null}
      }
    );

    return { success: true };
  }
    throw manageGeneralError(
    overideObj(ERRORSMG.VALIDATION_ERROR, {
      message: "Invalid resource type",
    })
  );
};














}






