
import express from "express"
import { RefController } from "../controllers/ref.controller"
import { PaymentController } from "../controllers/payment.controller"
// import { NotificationController } from "../controllers/notification.controller"
// import { Notcontroller } from "server/controllers/not.controller"

export class PaymentRoute{
  router: express.Router
  private paymentcontroller: PaymentController

  constructor() {
    this.router = express.Router()
    this.paymentcontroller = new PaymentController()
    this.initializeRoutes()
  }

  initializeRoutes() {
    // this.router.get("/admin", this.notcontroller.getAdminNotification.bind(this.notcontroller))
    this.router.get("/plans", this.paymentcontroller.getplans.bind(this.paymentcontroller))
    // this.router.post("/suscribe", this.paymentcontroller.suscribe.bind(this.paymentcontroller))
    // this.router.get("/current-subscription", this.paymentcontroller.currentSubscription.bind(this.paymentcontroller))
    // this.router.get("/transactions", this.paymentcontroller.transactions.bind(this.paymentcontroller))

  }


}