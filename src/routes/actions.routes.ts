
import express from "express"


import { ActionController } from "../controllers/actions.controller"
// import { NotificationController } from "../controllers/notification.controller"
// import { Notcontroller } from "server/controllers/not.controller"

export class Actionroute{
  router: express.Router
  private actionController: ActionController

  constructor() {
    this.router = express.Router()
    this.actionController = new ActionController()
    this.initializeRoutes()
  }

  initializeRoutes() {
    this.router.post("/create", this.actionController.createAction.bind(this.actionController))
    this.router.delete("/", this.actionController.deleteAction.bind(this.actionController))
    this.router.get("/all", this.actionController.getUserActions.bind(this.actionController))
    this.router.get("/resource-action", this.actionController.getResourceAction.bind(this.actionController))
    this.router.post("/resource", this.actionController.addActionToResource.bind(this.actionController))
    this.router.post("/resource-perform", this.actionController.performResouceAction.bind(this.actionController))
    this.router.get("/resource-data", this.actionController.getResouceActionResponses.bind(this.actionController))
    this.router.delete("/resource", this.actionController.removeActionFromResource.bind(this.actionController))
   
   
  }


}