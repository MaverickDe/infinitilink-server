import axios from "axios";
import { Invoices, Payments, Plans, Subscriptions } from "../models/plans";
import { IUser } from "../models/user";
const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET!;

const currency ="NGN"
let plans  = [
    {
        name:"professional monthly",
        title:"professional",
        nickName:"professional_monthly",
        amount:1000,
        interval:"monthly"
    },
    {
        name:"professional annually",
        nickName:"professional_annually",
        amount:5000,
           title:"professional",
        interval:"annually"
    },
    {
        name:"enterprise monthly",
        nickName:"enterprise_monthly",
            title:"enterprise",
        amount:7000,
        interval:"monthly"
    },
        {
        name:"enterprise annually",
            title:"enterprise",
        nickName:"enterprise_annually",
        amount:10000,
        interval:"annually"
    },
]
export class PaymentService{
    // server/paystack.ts

// "daily"|"weekly"|"monthly"|"annually"
 static async  createPlan(name: string,nickName:string, amount: number, interval: string,title:string) {
  try {
    const response = await axios.post(
      "https://api.paystack.co/plan",
      {
        name,
        amount: amount * 100, // Paystack uses kobo (NGN) or cents
        interval, // e.g. "monthly"
        currency:currency // or "NGN"
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(response.data)
    if(response.data.success || response.data.status){

        await Plans.create({...response.data.data,name,amount,interval,currency:"NGN",nickName,title})
    }else{
        throw(response.data)
    }
    return response.data; // contains plan_code
  } catch (err: any) {
    console.log(err)
    console.error("Paystack Plan Error:", err.response?.data || err.message);
    throw err;
  }
}


static async  seedPlans (){
    console.log("seeding plans")
    try{

        for (let val of plans){

            try{

                let  existingPlan =   await Plans.findOne({nickName:val.nickName})
                if(existingPlan){
                   console.log(`${val.nickName} already seeded`)
                   continue
                }
           
                await this.createPlan(val.name,val.nickName,val.amount,val.interval,val.title)
             console.log(`${val.nickName} successfully seeded`)
            }catch(e:any){
                console.log(e)
                console.log(e.message||`an error occured with plan ${val.nickName}`)
            }
    
        }
    }catch(e:any){
                console.log(e.message||`an error occured with plan`)
    }
}


static async getplans(){
    return await  Plans.find()
}
// server/transaction.ts


 static  async    initializeTransaction(user: IUser, planCode: string) {
  try {
    console.log(planCode,"planCodeplanCode")

    let plan = await Plans.findOne({plan_code:planCode})
    if(!plan){
        throw ("plan does not exist")
    }
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email:user.email,
        plan: planCode ,
        amount: plan.amount * 100, // amount comes from plan, so set 0
        // currency:currency, // or "NGN"
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET}`,
          "Content-Type": "application/json",
        },
      }
    );
console.log(response.data,"dataaaaaaaa")
    return response.data.data; // contains authorization_url
  } catch (err: any) {
    console.error("Paystack Init Error:", err.response?.data || err.message);
    throw err;
  }
}
 static  async    currentSubscription(user: IUser) {
  try {
   const subscription = await Subscriptions.findOne({status:"active",email:user.email})
   if(!subscription){
    throw("")
   }
   const plan = await Plans.findOne({plan_code:subscription?.planCode})
   if(!plan){
    throw("")
   }
    return {...subscription.toObject(),...plan.toObject()} // contains authorization_url
  } catch (err: any) {
    console.error("Paystack Init Error:", err.response?.data || err.message);
    throw err;
  }

  
}


 static  async    transactions(user: IUser) {
  try {
   const transaction = await Payments.find({customerEmail:user.email}).limit(20)
 
    return transaction// contains authorization_url
  } catch (err: any) {
    console.error("Paystack Init Error:", err.response?.data || err.message);
    throw err;
  }

  
}



static async webhook (event:any,data:any) {

    // const event = req.body.event;
  switch (event) {
      case "subscription.create":
        // console.log("New subscription created:", data);

        await Subscriptions.create({
          subscriptionCode: data.subscription_code,
          email: data.customer.email,
          planCode: data.plan.plan_code,
          status: data.status, // active
          startDate: data.start,
          nextPayment: data.next_payment_date,
          amount: data.amount / 100,
          currency: data.currency,
        });
        break;

      case "invoice.create":
        console.log("Invoice created:", data);

        await Invoices.create({
          invoiceId: data.id,
          customerEmail: data.customer.email,
          subscriptionCode: data.subscription.subscription_code,
          amount: data.amount / 100,
          status: data.status,
          dueDate: data.due_date,
        });
        break;

      case "charge.success":
        // console.log("Payment successful:", data);

        await Payments.create({
          reference: data.reference,
          amount: data.amount / 100,
          currency: data.currency,
          status: data.status, // "success"
          customerEmail: data.customer.email,
          paidAt: data.paid_at,
          plan:data.plan.plan_code
        });
        break;

      case "subscription.not_renew":
      case "subscription.disable":
        console.log("Subscription ended or not renewed:", data);

        await Subscriptions.findOneAndUpdate(
          { subscriptionCode: data.subscription_code },
          { status: "ended" }
        );
        break;

      default:
        console.log("Unhandled event:", event);
    }




};




}