// import { Types } from "mongoose";
// import { ProjectCollaborator } from "src/models/collaborators";
// import { Product } from "src/models/projects";

// class TeamServices{


//    static createCollaborator=async ({
//     userId,
//     projectId,
//     teamId,
//    })=>{

//     let product = await Product.find({_id:new Types.ObjectId(projectId),userId})
//     if(!product){
//         throw({message:"This project does not exist"})
//     }
//          let colab =  await  ProjectCollaborator.create({
//             user:teamId,
//             project:product._id,
//             key:productData.hashedKey.ciphertext,iv:productData.hashedKey.iv,salt:productData.hashedKey.salt,authTag:productData.hashedKey.authTag})
        
//             return await ProjectCollaborator.findById(colab._id).populate(
//               this.productpopulate
//             );
//     }
// }