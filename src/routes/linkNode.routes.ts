
import express from "express"

import { LinkNodeController } from "../controllers/linkNode.controller"
import { upload } from "../storage"
// import { NotificationController } from "../controllers/notification.controller"
// import { Notcontroller } from "server/controllers/not.controller"

export class LinkNoderoute{
  router: express.Router
  private linkNodeController: LinkNodeController

  constructor() {
    this.router = express.Router()
    this.linkNodeController = new LinkNodeController()
    this.initializeRoutes()
  }

  initializeRoutes() {
    this.router.post("/link", this.linkNodeController.createLink.bind(this.linkNodeController))
    this.router.put("/link", this.linkNodeController.updateLink.bind(this.linkNodeController))
    this.router.delete("/link", this.linkNodeController.deleteLink.bind(this.linkNodeController))
    this.router.get("/link/search", this.linkNodeController.searchLinks.bind(this.linkNodeController))
    this.router.patch("/link/reorder", this.linkNodeController.linksReorder.bind(this.linkNodeController))
    this.router.post("/node", this.linkNodeController.createNode.bind(this.linkNodeController))
    this.router.get("/node/change-node-parent-node", this.linkNodeController.changeNodeParentNode.bind(this.linkNodeController))
    this.router.post("/node/change-profile-visibility", this.linkNodeController.changeProfileVisibility.bind(this.linkNodeController))
    this.router.post("/node/logo", upload.single('image'),this.linkNodeController.uploadNodeLogo.bind(this.linkNodeController))
    this.router.put("/node", this.linkNodeController.updateNode.bind(this.linkNodeController))
    this.router.get("/node", this.linkNodeController.getNode.bind(this.linkNodeController))
    this.router.get("/node/ab", this.linkNodeController.getAbNode.bind(this.linkNodeController))
    this.router.get("/nodes", this.linkNodeController.getNodes.bind(this.linkNodeController))
    this.router.get("/nodes/pb", this.linkNodeController.getPbNodes.bind(this.linkNodeController))
    this.router.get("/link", this.linkNodeController.getLink.bind(this.linkNodeController))
    this.router.get("/link/click", this.linkNodeController.recordClick.bind(this.linkNodeController))
    this.router.get("/links", this.linkNodeController.getPbLinks.bind(this.linkNodeController))
    this.router.delete("/node", this.linkNodeController.deleteNode.bind(this.linkNodeController))
    this.router.get("/m-node", this.linkNodeController.getMyNode.bind(this.linkNodeController))
    this.router.post("/group", this.linkNodeController.createGroup.bind(this.linkNodeController))
    this.router.patch("/group/reorder", this.linkNodeController.groupsReorder.bind(this.linkNodeController))
    this.router.put("/group", this.linkNodeController.updateGroup.bind(this.linkNodeController))
    this.router.delete("/group", this.linkNodeController.deleteGroup.bind(this.linkNodeController))
    // this.router.get("/stats", this.refcontroller.refstats.bind(this.refcontroller))
    // this.router.get("/updatelastread", this.notcontroller.updateLastRead.bind(this.notcontroller))
    // this.router.get("/", this.notcontroller.notifications.bind(this.notcontroller))
    // this.router.get("/:id", this.notcontroller.notification.bind(this.notcontroller))
   
  }


}