
import express from "express"
import { NotificationController } from "../controllers/notification.controller"
// import { Notcontroller } from "server/controllers/not.controller"

export class Notsroute{
  router: express.Router
  private notcontroller: NotificationController

  constructor() {
    this.router = express.Router()
    this.notcontroller = new NotificationController()
    this.initializeRoutes()
  }

  initializeRoutes() {
    // this.router.get("/admin", this.notcontroller.getAdminNotification.bind(this.notcontroller))
    this.router.get("/stats", this.notcontroller.notificationstats.bind(this.notcontroller))
    this.router.get("/updatelastread", this.notcontroller.updateLastRead.bind(this.notcontroller))
    this.router.get("/", this.notcontroller.notifications.bind(this.notcontroller))
    this.router.get("/:id", this.notcontroller.notification.bind(this.notcontroller))
   
  }


}