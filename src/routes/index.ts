
import express from "express"
import { NotificationController } from "../controllers/notification.controller"
import { IndexController } from "../controllers/index.controller"
import { Refsroute } from "./ref.routes"
import { PaymentRoute } from "./payment.route"
import { Notsroute } from "./notifications.route"

import { AuthRoutes } from "./auth.routes"
import { LinkNoderoute } from "./linkNode.routes"

// import { BankConsentRoute } from "./bankConsent.route"
// import { Notcontroller } from "server/controllers/not.controller"

export class Indexroute{
  router: express.Router
  private indexController: IndexController

  constructor() {
    this.router = express.Router()
    this.indexController = new IndexController()
    this.initializeRoutes()
  }

  initializeRoutes() {
//     this.router.get("/nots/stats",(req,res)=>{

//   return res.json({"who are you":"my friendm"})
// })


this.router.use("/auth", new AuthRoutes().router)



this.router.use("/nots", new Notsroute().router)
this.router.use("/ref", new Refsroute().router)
this.router.use("/ln", new LinkNoderoute().router)
this.router.use("/payment", new PaymentRoute().router)
// this.router.use("/bank-consents", new BankConsentRoute().router)
    // this.router.get("/admin", this.notcontroller.getAdminNotification.bind(this.notcontroller))
    this.router.get("/constants", this.indexController.getConstant.bind(this.indexController))
    // this.router.get("/updatelastread", this.notcontroller.updateLastRead.bind(this.notcontroller))
    // this.router.get("/", this.notcontroller.notifications.bind(this.notcontroller))
    // this.router.get("/:id", this.notcontroller.notification.bind(this.notcontroller))
   
  }


}