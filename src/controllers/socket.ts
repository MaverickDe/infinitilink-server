

// import { createServer } from "http";
// import { Types } from "mongoose";
// import { Server } from "socket.io";
// // import { httpServer } from "../app";
// import { getUserWithToken } from "../middleware/auth.middleware";
// import { ProjectCollaborator } from "../models/collaborators";
// import { config } from "../config";
// export const connectedSockets = new Map<string, any>();
// export let httpServer :any =null;
// // export const io = new Server(httpServer, {
// //   cors: { origin: "*" },
// // });

// export let io :any =null
// export const socketInit = (app)=>{
//     httpServer =   createServer(app);
//     io = new Server(httpServer, {
//         cors: { origin: "*" },
//     });
//     console.log("Dddddppppmpp")

//     io.use(async (socket, next) => {
//   const token = socket.handshake.auth.token;
//   const authKey = socket.handshake.auth.authKey;
//   console.log("Dddddddddd",socket.handshake.auth)
//   if (!token) return next(new Error("Auth token missing"));
//   let data = await  getUserWithToken({token,authKey})
//    if(!data?.authKey ){
//       next(new Error("Auth key invalid"));
//    }
//   // Validate token (e.g., JWT)
//   try {
//  if(data.user){

//    socket.data.user = data.user ; 
//    next();
//  }else{
//     next(new Error("Auth token invalid"));
//  }
//   } catch (err) {
//     next(new Error("Auth token invalid"));
//   }
// });
// httpServer.on("upgrade", (req, socket, head) => {
//   console.log("🕵️ WebSocket upgrade request detected:");
//   console.log("  URL:", req.url);
//   console.log("  From:", req.socket.remoteAddress);
//   console.log("  Headers:", req.headers);
// });

// io.engine.on("connection", (rawSocket) => {
// rawSocket.on("connect", () => {
//   console.log("[SOCKET] Connected to backend");
// }); 

// rawSocket.on("data", (chunk) => {
//   console.log("[SOCKET] Received data:", chunk.toString());
// });
 
// rawSocket.on("error", (err) => {
//   console.error("[SOCKET] Error:", err.message);
// });

// rawSocket.on("close", (hadError) => {
//   console.log("[SOCKET] Connection closed. Error occurred?", hadError,rawSocket);
// });

// rawSocket.on("end", () => {
//   console.log("[SOCKET] Remote end finished sending data");
// });

//   console.log("⚡ Socket.IO handshake detected");
//   console.log("Query:", rawSocket.request._query);
//   console.log("Headers:", rawSocket.request.headers);
// });
// io.engine.on("error", (rawSocket) => {
//   console.log("error handshake detected");

// });
// io.engine.on("close", (rawSocket) => {
//   console.log("close detected");

// });
// httpServer.on("close", (rawSocket) => {
//   console.log("close detected");

// });


// httpServer.on('clientError', (err, socket) => {
//   console.error('[SERVER] Client error before upgrade:', err.message);
// });
// httpServer.on('error', (err, socket) => {
//   console.error('[SERVER] error Client error before upgrade:', err.message);
// });
// io.on("connection", (socket) => {
//      const userId = socket.data.user._id;
//     //   connectedSockets.set(userId, socket);
//     // console.log(`Client connected: ${socket.id}`,userId);
//     //  const userId = "socket.data.user._id";
//   console.log(`Client connected:`);

//   // Listen for client messages
//   socket.on("joinproject",async  ({project}) => {
//     console.log("joining project")
//         let v = await ProjectCollaborator.findOne({project:new Types.ObjectId(project),user:socket.data.user._id});
//         console.log(v)
//         if(v){
//         socket.join(`pr_${project}`)
//         }
//     // console.log("Received from client:", msg);
//     // Broadcast to all clients
//     // io.emit("message", `Server says: ${msg}`);
//   });

//   socket.on("disconnect", () => {
//     console.log(`User disconnected: ${userId}`);
//     connectedSockets.delete(userId);
//   });
// });

// // httpServer.listen( config.port, "0.0.0.0", () => {
// //   console.log(`✅ Server running on http://0.0.0.0:${ config.port}`);
// // });

// return httpServer

// }
 
// // const class  = (app)=>{

// // }






// export const emittoproject = ({project,event,data}:{project:string,event:string,data:Record<string,any>|any[]})=>{

//     let roomId =`pr_${project}`
//     io.to(roomId).emit(event,JSON.stringify(data))

// }