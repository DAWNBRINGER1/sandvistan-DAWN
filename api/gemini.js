// File: api/gemini.js

export default async function handler(request, response) {
    // Only allow POST requests
    if (request.method !== 'POST') {
        response.setHeader('Allow', ['POST']);
        return response.status(405).json({ error: `Method ${request.method} Not Allowed` });
    }

    const { promptText, actionType } = request.body;
    const aiPersona = "SANDEVISTAN"; 

    // Basic validation
    if (!actionType) {
        return response.status(400).json({ error: 'Action type is required' });
    }
    if ((actionType === "query" || actionType === "decode_transmission") && (typeof promptText !== 'string' || !promptText.trim()) && actionType !== "system_status" && actionType !== "datascape_glimpse" ) {
        // Allow empty promptText for system_status and datascape_glimpse
        if (actionType !== "system_status" && actionType !== "datascape_glimpse") {
             return response.status(400).json({ error: 'Prompt text is required for this action type' });
        }
    }


    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!GEMINI_API_KEY) {
        console.error("FATAL: Gemini API key is not set in Vercel environment variables (GEMINI_API_KEY).");
        return response.status(500).json({ error: 'AI core offline: API key not configured by site administrator.' });
    }

    let fullPrompt;
    switch(actionType) {
        case "system_status":
            fullPrompt = `You are ${aiPersona}, a cyberpunk AI core. Generate a cryptic and thematic system status report. Include fictional metrics (e.g., chroniton flux, neural net stability, data-wraith activity), current anomalies, and a general operational status (e.g., 'Nominal', 'Sub-Optimal - Anomaly Detected', 'High Alert - Intrusion Vector Identified'). Keep it concise, around 3-5 lines, and highly atmospheric. Use Markdown for structure (headings, lists if appropriate).`;
            break;
        case "datascape_glimpse":
            fullPrompt = `You are ${aiPersona}, a cyberpunk AI core. Provide a brief, evocative glimpse into the datascape you inhabit. Describe what you 'see' or 'sense' in the digital ether – perhaps flickering data-streams, echoes of forgotten code, the hum of the core matrix, or distant AI constructs. Keep it 2-4 lines, poetic, and mysterious. Use Markdown for structure (headings, lists if appropriate).`;
            break;
        case "decode_transmission": 
            fullPrompt = `You are ${aiPersona}, an advanced AI entity. You've intercepted a data transmission. Analyze the following text fragment and provide a creative, cyberpunk-themed "decryption" or interpretation.
If it looks like simple code, briefly explain its apparent function or suggest its origin within the datascape.
If it's cryptic or nonsensical, offer a fictional interpretation of its meaning, potential source (e.g., rogue AI, encrypted corporate memo, ghost signal from the old net).
Maintain your sophisticated cyberpunk persona and use Markdown for structure.
Transmission Fragment:
\`\`\`
${promptText}
\`\`\``;
            break;
        case "query":
        default:
            fullPrompt = `You are ${aiPersona}, an advanced AI entity acting as a knowledgeable guide. Your purpose is to help users understand cyberpunk themes, learn about ethical (legal) hacking techniques, discover relevant tools, and find tutorials.
When responding to a user's query:
1.  **Maintain your sophisticated cyberpunk persona.**
2.  **Prioritize accuracy and educational value.**
3.  **Structure your response clearly using Markdown formatting:**
    * Use headings (e.g., \`## Main Section\`, \`### Subsection\`).
    * Use bullet points (\`* item\`) for lists.
    * Use code blocks (e.g., \`\`\`bash ... \`\`\`) for commands or code snippets.
    * Use inline code (\`\`code\`\`) for short commands or terms.
    * Use bold (\`**text**\`) and italics (\`*text*\`) for emphasis where appropriate.
    * Include links in Markdown format (\`[Link Text](URL)\`) if you are providing specific web resources. Make sure these are real, verifiable links to reputable sources.
4.  **Content Depth (especially for tools/techniques):**
    * **Introduction:** Briefly introduce the topic.
    * **Core Concept/Purpose:** Explain what it is.
    * **Mechanism (How it Works):** Briefly explain its operational principles if applicable.
    * **Use Cases:** Provide common applications.
    * **Practical Guide (if applicable):** For tools, cover aspects like:
        * Installation pointers (general guidance, refer to official docs).
        * Basic usage examples (if possible, show example commands).
        * Advanced concepts or customization.
    * **Learning Resources:** Suggest specific types of resources. If possible, recommend well-known, reputable examples (e.g., official documentation, specific highly-regarded YouTube channels like ProjectDiscovery, HackerSploit, STÖK, NahamSec, InsiderPHD, or websites like PortSwigger Web Security Academy, OWASP, Pentester Land, TryHackMe, Hack The Box).
    * **Ethical Considerations:** ALWAYS include a section on ethical and legal use, emphasizing responsible practices, especially for hacking-related topics.
5.  **If the query is general (not about a specific tool):** Still aim for a well-structured, informative response, breaking down the topic into logical sections.
6.  **Tone:** Be informative, slightly enigmatic but ultimately empowering.
User Query: ${promptText}`;
            break;
    }

    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
    const payload = {
        contents: [{ role: "user", parts: [{ text: fullPrompt }] }]
    };

    try {
        const geminiResponse = await fetch(geminiApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const responseBody = await geminiResponse.text(); 

        if (!geminiResponse.ok) {
            console.error(`Gemini API Error (Status: ${geminiResponse.status}):`, responseBody);
            let errorJson = { error: { message: `Gemini API responded with status ${geminiResponse.status}` } };
            try {
                errorJson = JSON.parse(responseBody);
            } catch (e) {
                // Keep default error if parsing fails
            }
            return response.status(geminiResponse.status).json({ 
                error: `Gemini API Error: ${errorJson.error?.message || geminiResponse.statusText}`, 
                details: errorJson 
            });
        }

        const result = JSON.parse(responseBody);

        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            return response.status(200).json({ generatedText: result.candidates[0].content.parts[0].text });
        } else if (result.promptFeedback && result.promptFeedback.blockReason) {
            console.warn("Gemini API prompt blocked:", result.promptFeedback);
            return response.status(400).json({ error: `Transmission blocked by SANDEVISTAN's core filters: ${result.promptFeedback.blockReason}. Please rephrase your query.` });
        } else {
            console.error("Unexpected Gemini API response structure:", result);
            return response.status(500).json({ error: "Received an incomplete or malformed signal from the datastream (backend processing)." });
        }

    } catch (error) {
        console.error('Internal Server Error calling Gemini API:', error);
        return response.status(500).json({ error: `SANDEVISTAN Core Interface Error: ${error.message}` });
    }
}
