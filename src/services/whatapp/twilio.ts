
// import twilio from "twilio";

// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = twilio(accountSid, authToken);
// let defaultFrom = process.env.TWILIO_DEFAULT_FROM ||"+15017122661"
// export async function createMessage({body,to,from=defaultFrom}:{body:string,from?:string,to:string}) {
//   const message = await client.messages.create({
//     body,
//     from:"whatsapp:"+from,
//     to: "whatsapp:" +to
  
//   });

//   console.log(message.body);
// }