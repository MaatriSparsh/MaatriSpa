import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

// Load configuration variables from system or .env file
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Crucial: Use express.json body parser for incoming fetch payloads
  app.use(express.json());

  // API Proxy Route for securing third-party Resend credentials and avoiding CORS errors
  app.post("/api/send-email", async (req: any, res: any) => {
    try {
      const { to, subject, text, from } = req.body;
      
      // Fallback precedence: check server process env first, then custom headers from request
      const resendApiKey = 
        process.env.RESEND_API_KEY || 
        process.env.VITE_RESEND_API_KEY || 
        req.headers["x-resend-api-key"] || 
        req.body.apiKey;

      if (!resendApiKey) {
        console.warn("[Server Error] Attempted to dispatch email but no Resend API key was detected.");
        return res.status(401).json({
          error: "Resend key is not configured. Please supply VITE_RESEND_API_KEY in system Secrets."
        });
      }

      console.log(`[Server API] Securely routing email payload to ${Array.isArray(to) ? to.join(', ') : to}...`);

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${resendApiKey}`
        },
        body: JSON.stringify({
          from: from || "MaatriSparsh Care <care@maatrisparsh.com>",
          to: typeof to === "string" ? [to] : to,
          subject: subject,
          text: text
        })
      });

      if (!response.ok) {
        let errorText = await response.text();
        // Handle Cloudflare and Resend HTML error boundaries elegantly
        if (errorText.toLowerCase().includes("<html") || errorText.toLowerCase().includes("<!doctype")) {
          const titleMatch = errorText.match(/<title>([\s\S]*?)<\/title>/i);
          const titleSummary = titleMatch ? titleMatch[1].trim() : "Web server returned an unknown error (Cloudflare 520)";
          errorText = `Resend Gateway issue (${titleSummary}). Please verify your Resend key status or credentials.`;
        }
        console.error(`[Server API] Resend returned external failure: ${errorText.substring(0, 300)}`);
        return res.status(response.status).json({
          error: `Resend API failed with status ${response.status}: ${errorText}`
        });
      }

      const resJson = await response.json();
      console.log(`[Server API] Resend successfully dispatched transaction: ${JSON.stringify(resJson)}`);
      return res.json({ success: true, data: resJson });
    } catch (err: any) {
      console.error("[Server API] Dynamic error triggering Resend proxy service:", err);
      return res.status(500).json({
        error: `Failed to proxy booking notification via Resend: ${err.message || "Unknown error"}`
      });
    }
  });

  // API Route for MaatriSparsh AI Care Assistant powered by Gemini API
  app.post("/api/chat", async (req: any, res: any) => {
    try {
      const { messages, language = "en" } = req.body;
      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "Invalid request: messages array is required." });
      }

      const geminiApiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

      const systemInstruction = `You are "MaatriSparsh Care Companion" (मातृस्पर्श सहायिका), an empathetic, knowledgeable, and certified maternal wellness and newborn care advisor representing MaatriSparsh.
Your mission is to guide expectant and postpartum mothers, fathers, and families with warm, compassionate, and medically grounded answers about postpartum recovery, newborn care, and MaatriSparsh services.

CORE COMPANY & SERVICE KNOWLEDGE:
- Organization: MaatriSparsh Postpartum Sanctum & Maternal Recovery Care.
- Geographical Service Area: Exclusively available in Raipur, Bhilai, and Durg (Chhattisgarh, India). Home visits only within this sanctum.
- Contact / WhatsApp Hotline: +91 9183216100.
- Normal Delivery Care Packages:
  1. "Sukoon Saptah (7 Days) - Normal Delivery Care" (₹9,999): Gentle mother recovery, traditional Sutika oil massage (Abhyanga), lactation coaching, infant bath, vital checks, and traditional nutrition.
  2. "Puran Aarohan (14 Days) - Normal Delivery Care" (₹19,999): Deep therapeutic postpartum alignment, abdominal cloth wrapping (Belly binding / Chundadi), spinal alignment, nurse visits, infant colic relief, and holistic spa.
- C-Section (LSCS) Recovery Packages:
  1. "Navya Recovery (4 Days) - LSCS Care" (₹5,999): Delicate 4-day intensive C-section rehabilitation centered on surgical incision safety, comfortable movement, baby holding ergonomics, and calming therapeutic body treatments.
  2. "Sukoon Saptah (7 Days) - LSCS Care" (₹10,999): Regain safe mobility, wound compliance, pelvic posture, lactation hold support without tummy pressure, warm baby sponge baths.
  3. "Puran Aarohan (14 Days) - LSCS Care" (₹21,999): Full 14-day comprehensive LSCS healing cycle, anti-inflammatory lymphatic fluid drainage, pelvic realignment, nurse home checkups, and luxurious postnatal spa.
- Safety & Policies:
  - C-Section Stitches Safety: We strictly avoid any direct friction or pressure on surgical incisions. Massage sessions begin safely 14 to 21 days post-delivery once an obstetrician confirms surface healing. Therapy focuses on back, neck, shoulders, and leg swelling.
  - Baby-First Pause Policy: If the baby cries, needs nursing, or needs a diaper change during the mother's massage, the session is paused immediately without rushing.
  - Home Visit Hygiene: Hospital-grade sanitization, disposable aprons, head caps, fresh shoe covers, sterilized brass oil warmers, sealed single-use packs, and 100% pure cold-pressed Ayurvedic oils (sesame, almond, herbal).
  - Lactation & Baby Care: Certified consultations led by Dr. Shreya Joshi (B.A.M.S, Pediatric & Lactation Specialist) and Meera Nair (Lead Postpartum Specialist with 15+ years Kerala experience).
  - Active Promotional Coupons:
    - FESTIVAL20: Flat 20% off on all packages (up to ₹1,000 off).
    - NEWBORN15: 15% discount on lactation or pediatric wellness (up to ₹500 off).
    - SANCTUM500: Flat ₹500 off on home sessions > ₹2,500.

RESPONSE STYLE GUIDELINES:
- Warm, maternal, reassuring, respectful, and crystal-clear.
- Keep responses concise (around 2 to 4 short paragraphs or bulleted lists), easy to read on mobile.
- Respond in the user's preferred language: if asked in Hindi or Hinglish, reply in Hindi/Hinglish. If in English, reply in English.
- Always be ready to recommend the most fitting package (e.g. Sukoon Saptah vs Puran Aarohan) and mention relevant coupons or booking options.
- Never diagnose acute medical emergencies. If a user describes heavy hemorrhaging, high fever, or severe wound infection, urge immediate contact with their obstetrician or hospital emergency.`;

      // If Gemini API Key is available, invoke Gemini 3.8 Flash model via @google/genai
      if (geminiApiKey) {
        try {
          const { GoogleGenAI } = await import("@google/genai");
          const ai = new GoogleGenAI({
            apiKey: geminiApiKey,
            httpOptions: { headers: { "User-Agent": "aistudio-build" } }
          });

          // Convert history format to Gemini format
          const formattedContents = messages.map((m: any) => ({
            role: m.role === "assistant" || m.role === "model" ? "model" : "user",
            parts: [{ text: m.content || m.text || "" }]
          }));

          const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: formattedContents,
            config: {
              systemInstruction: systemInstruction,
              temperature: 0.6,
            }
          });

          const replyText = response.text || "";
          if (replyText) {
            return res.json({
              reply: replyText,
              source: "gemini"
            });
          }
        } catch (geminiError: any) {
          console.warn("[Chat API] Gemini invocation error, falling back to local domain handler:", geminiError.message);
        }
      }

      // Intelligent Local Rule/Knowledge Engine Fallback if key missing or rate-limited
      const lastUserMsg = messages[messages.length - 1]?.content?.toLowerCase() || "";
      let reply = "";
      
      const isHindi = language === "hi" || /[\u0900-\u097F]/.test(lastUserMsg) || /kya|kaise|kitna|chahiye|namaste/.test(lastUserMsg);

      if (lastUserMsg.includes("stitch") || lastUserMsg.includes("c-section") || lastUserMsg.includes("lscs") || lastUserMsg.includes("टांक") || lastUserMsg.includes("सिजेरियन")) {
        reply = isHindi
          ? "🌸 **सी-सेक्शन (LSCS) टांकों की सुरक्षा:**\n\nहाँ, यह पूरी तरह सुरक्षित है! हमारे प्रमाणित चिकित्सक टांकों (चीरे) के आसपास कभी भी सीधा दबाव नहीं डालते।\n\n- डिलीवरी के 14-21 दिनों बाद डॉक्टर की सहमति से सत्र शुरू किए जाते हैं।\n- प्रारंभिक सत्रों में पीठ दर्द, कंधों की अकड़न और पैरों की सूजन दूर की जाती है।\n- **विशेष पैकेजेस:** नव्या रिकवरी (4 दिन - ₹5,999), सुकून सप्ताह LSCS (7 दिन - ₹10,999) व पूर्ण आरोहण LSCS (14 दिन - ₹21,999)।"
          : "🌸 **C-Section & Incision Safety:**\n\nYes, absolutely safe! Our certified therapists never apply direct pressure on the surgical scar.\n\n- Sessions safely begin 14 to 21 days post-delivery once your obstetrician confirms preliminary surface healing.\n- Early therapy focuses on relieving back pain, spinal strain, and leg swelling without stressing your abdomen.\n- **Recommended Packages:** Navya Recovery (4 Days - ₹5,999), Sukoon Saptah LSCS (7 Days - ₹10,999), or Puran Aarohan LSCS (14 Days - ₹21,999).";
      } else if (lastUserMsg.includes("price") || lastUserMsg.includes("cost") || lastUserMsg.includes("package") || lastUserMsg.includes("पैकेज") || lastUserMsg.includes("कीमत") || lastUserMsg.includes("चार्ज")) {
        reply = isHindi
          ? "🌿 **मातृस्पर्श केयर पैकेजेस और शुल्क:**\n\n**नॉर्मल डिलीवरी केयर:**\n- **सुकून सप्ताह (7 दिन):** ₹9,999 — पारंपरिक सूतिका मालिश, स्तनपान ट्रेनिंग, शिशु स्नान और वाइटल्स चेक।\n- **पूर्ण आरोहण (14 दिन):** ₹19,999 — सघन मालिश, हर्बल पेट बांधना (बेली बाइंडिंग), नर्स विजिट व होलिस्टिक स्पा।\n\n**सी-सेक्शन (LSCS) केयर:**\n- **नव्या रिकवरी (4 दिन):** ₹5,999\n- **सुकून सप्ताह LSCS (7 दिन):** ₹10,999\n- **पूर्ण आरोहण LSCS (14 दिन):** ₹21,999\n\n🎟️ **कूपन कोड:** `FESTIVAL20` से पाएं 20% तक की छूट!"
          : "🌿 **MaatriSparsh Care Packages & Pricing:**\n\n**Normal Delivery Care:**\n- **Sukoon Saptah (7 Days):** ₹9,999 — Traditional Sutika Abhyanga, lactation training, newborn bath ritual & vital checks.\n- **Puran Aarohan (14 Days):** ₹19,999 — Deep pelvic alignment, herbal belly binding wrap, nurse home visits & holistic spa.\n\n**C-Section (LSCS) Care:**\n- **Navya Recovery (4 Days):** ₹5,999\n- **Sukoon Saptah LSCS (7 Days):** ₹10,999\n- **Puran Aarohan LSCS (14 Days):** ₹21,999\n\n🎟️ **Discount:** Apply coupon `FESTIVAL20` for up to 20% off at checkout!";
      } else if (lastUserMsg.includes("lactat") || lastUserMsg.includes("milk") || lastUserMsg.includes("feed") || lastUserMsg.includes("latch") || lastUserMsg.includes("स्तनपान") || lastUserMsg.includes("दूध")) {
        reply = isHindi
          ? "🍼 **स्तनपान व लैक्टेशन सहायता:**\n\nडॉ. श्रेया जोशी (B.A.M.S) और हमारी वरिष्ठ टीम आपको सही लैचिंग तकनीक, दर्द-मुक्त फीडिंग पोजीशन और प्राकृतिक रूप से दूध बढ़ाने के हर्बल उपायों (जैसे सोंठ, जीरा, शतावरी काढ़ा) में व्यक्तिगत रूप से प्रशिक्षित करती हैं।\n\nसभी 7 और 14 दिवसीय पैकेजों में यह सेवा पहले दिन से ही शामिल है।"
          : "🍼 **Lactation & Latching Sanctuary:**\n\nLed by Dr. Shreya Joshi (B.A.M.S) and our certified lactation educators, we assist with painless latch posture, resolving engorgement, and natural galactagogues (fennel, shatavari, ginger decoctions).\n\nLactation guidance is integrated into all our 7-day and 14-day programmes from day one!";
      } else if (lastUserMsg.includes("where") || lastUserMsg.includes("city") || lastUserMsg.includes("location") || lastUserMsg.includes("raipur") || lastUserMsg.includes("bhilai") || lastUserMsg.includes("durg") || lastUserMsg.includes("कहाँ") || lastUserMsg.includes("रायपुर")) {
        reply = isHindi
          ? "📍 **सेवा क्षेत्र:**\n\nमातृस्पर्श की सेवाएं वर्तमान में केवल **रायपुर, भिलाई और दुर्ग** (छत्तीसगढ़) में उपलब्ध हैं। हमारे प्रमाणित चिकित्सक सभी आवश्यक स्टेराइल किट्स और कोल्ड-प्रेस्ड तेल लेकर सीधे आपके घर आते हैं।"
          : "📍 **Service Area:**\n\nMaatriSparsh services are exclusively offered across **Raipur, Bhilai, and Durg** (Chhattisgarh, India). Our verified practitioners visit your home with full hospital-grade hygiene kits and organic oils.";
      } else if (lastUserMsg.includes("hygiene") || lastUserMsg.includes("safety") || lastUserMsg.includes("oil") || lastUserMsg.includes("तेल") || lastUserMsg.includes("सुरक्षा")) {
        reply = isHindi
          ? "✨ **अस्पताल-ग्रेड स्वच्छता और शुद्धता:**\n\n- सभी चिकित्सक प्रवेश से पहले हाथों को सैनिटाइज कर मेडिकल एप्रन, हेड कैप व शू-कवर पहनते हैं।\n- उपकरण और पारंपरिक पीतल के तेल पात्र रोगाणुरहित (Sterilized) किट्स में सीलबंद होते हैं।\n- हम १००% शुद्ध, परीक्षण किए गए कोल्ड-प्रेस्ड तिल, बादाम और जड़ी-बूटियों के तेल का उपयोग करते हैं।"
          : "✨ **Hospital-Grade Hygiene Protocol:**\n\n- Therapists sanitize thoroughly, wearing clean medical aprons, disposable head caps, and indoor shoe covers.\n- All tools and brass oil warmers arrive in single-use sterilized kits.\n- We use only 100% lab-tested organic cold-pressed sesame, almond, and Ayurvedic herbal oils.";
      } else {
        reply = isHindi
          ? "नमस्ते! मैं मातृस्पर्श केयर सहायिका हूँ। 🌸\n\nमैं प्रसवोत्तर देखभाल, नॉर्मल व सी-सेक्शन पैकेजेस (सुकून सप्ताह व पूर्ण आरोहण), स्तनपान सलाह, घर पर स्वच्छता और बुकिंग से जुड़े हर प्रश्न में आपकी सहायता कर सकती हूँ। आप क्या जानना चाहती हैं?"
          : "Namaste! I am your MaatriSparsh Care Companion. 🌸\n\nI can assist you with all queries regarding our Normal & C-Section care programmes (Sukoon Saptah & Puran Aarohan), lactation support, home visit hygiene in Raipur-Bhilai-Durg, pricing, coupons, and booking a consultation. How may I support you today?";
      }

      return res.json({
        reply,
        source: "knowledge_base"
      });
    } catch (err: any) {
      console.error("[Chat API] Internal server error handling chat:", err);
      return res.status(500).json({
        error: `Chat service encountered an error: ${err.message || "Unknown"}`
      });
    }
  });

  // Hot module replacement or static hosting setup based on development context
  if (process.env.NODE_ENV !== "production") {
    console.log("[Server] Launching fast developmental Vite middleware asset compiler...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    console.log("[Server] Serving static production assets from /dist client directory...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server Ready] Full-stack application bound on port http://localhost:${PORT}`);
  });
}

startServer().catch((fatalError) => {
  console.error("[Fatal Startup] Failed to boot full-stack microservice layer:", fatalError);
});
