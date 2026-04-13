
import express from "express"
import { RefController } from "../controllers/ref.controller"
// import { NotificationController } from "../controllers/notification.controller"
// import { Notcontroller } from "server/controllers/not.controller"

export class Refsroute{
  router: express.Router
  private refcontroller: RefController

  constructor() {
    this.router = express.Router()
    this.refcontroller = new RefController()
    this.initializeRoutes()
  }

  initializeRoutes() {
    // this.router.get("/admin", this.notcontroller.getAdminNotification.bind(this.notcontroller))
    // this.router.get("/stats", this.refcontroller.refstats.bind(this.refcontroller))
    // this.router.get("/updatelastread", this.notcontroller.updateLastRead.bind(this.notcontroller))
    // this.router.get("/", this.notcontroller.notifications.bind(this.notcontroller))
    // this.router.get("/:id", this.notcontroller.notification.bind(this.notcontroller))
   
  }


}