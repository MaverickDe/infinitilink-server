const nodemailer = require('nodemailer');
class MailService {
transporter;

    constructor(){

this.transporter = nodemailer.createTransport({
  host: 'smtp-relay.sendinblue.com',
  port: 587, // Or 465 for SSL
  secure: false, // Use true for SSL, false for TLS
  auth: {
    user: 'your-brevo-username',
    pass: 'your-brevo-smtp-password',
  },
});





    }
    



    async sendmail(){
        const mailOptions = {
            from: 'your-zoho-email@example.com', // This is what you want to show
            to: 'recipient@example.com',
            subject: 'Test email',
            text: 'Hello, this is a test email.',
          };
        this.transporter.sendMail(mailOptions, function (error:any, info:any) {
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
    }

}