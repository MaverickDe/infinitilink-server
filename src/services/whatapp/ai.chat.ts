import { createMessage } from "./twilio";

// --- DUMMY REGISTRY DATA (Mirroring your dashboard) ---
const dummyTransactions = [
  { bankName: "OPay", amount: 500000, type: "INCOMING" },
  { bankName: "Zenith Node", amount: 250000, type: "OUTGOING" },
  { bankName: "OPay", amount: 150000, type: "INCOMING" },
];

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const incomingMsg = formData.get("Body")?.toString().toLowerCase() || "";
    const senderNumber = formData.get("From")?.toString().replace("whatsapp:", "") || "";

    console.log(`[WhatsApp] Received from ${senderNumber}: ${incomingMsg}`);

    let aiResponse = "";

    // --- AI LOGIC (Matches your Dashboard AI) ---
    if (incomingMsg.includes("opay") || incomingMsg.includes("zenith")) {
      const bank = incomingMsg.includes("opay") ? "OPay" : "Zenith Node";
      const total = dummyTransactions
        .filter(t => t.bankName.toLowerCase().includes(bank.toLowerCase()))
        .reduce((sum, t) => sum + t.amount, 0);
      
      aiResponse = `📊 [STEMGATE_INSIGHT]\nBank: ${bank}\nTotal Volume: ₦${total.toLocaleString()}\nStatus: SECURE_NODE`;
    } 
    else if (incomingMsg.includes("hi") || incomingMsg.includes("hello") || incomingMsg.includes("stemgate")) {
      aiResponse = "🤖 *STEMGATE_AI ONLINE*\n\nI am your WhatsApp registry assistant. You can ask me about:\n- Bank performance (e.g., 'OPay volume')\n- System status\n- FAQs";
    } 
    else if (incomingMsg.includes("trend")) {
      aiResponse = "📈 *CURRENT_TREND*: Network is 70% Inflow heavy today. High density from OPay nodes.";
    } 
    else {
      aiResponse = "⚠️ Command not recognized. Reply with 'Hello' for system options.";
    }

    // --- SEND REPLY VIA TWILIO ---
    await createMessage({
      body: aiResponse,
      to: senderNumber, // Sends it back to the person who messaged
    });

    return  { success: true };
  } catch (error) {
    console.error("Twilio Webhook Error:", error);
    return { error: "Webhook failed",status: 500 };
  }
}