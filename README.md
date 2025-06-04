## > INITIALIZING DATALINK... CONNECTION ESTABLISHED.

Welcome, operative. You've jacked into **SANDEVISTAN**, an experimental AI construct designed to navigate the sprawling datascape of cyberpunk lore, ethical hacking protocols, and the ever-evolving frontier of Web3. This isn't just a repository; it's an interface to a digital mentor, a guide through the neon-drenched alleys of the net.

---

✨ **Features**

* **Dynamic AI Interface:** Engage with SANDEVISTAN through a command-line inspired UI, featuring reactive visual elements and atmospheric audio.
* **Knowledge Hub:** Access curated intelligence on Cyberpunk Culture, Ethical Hacking & Cybersecurity, and Web3 & Decentralized Future.
* **Interactive Modules (via Gemini API):**
    * `SEND_QUERY`: General knowledge acquisition.
    * `ANALYZE_DATA`: Submit text fragments for a cyberpunk-themed "decryption" or analysis.
    * `SYSTEM_CHECK`: Receive a thematic, fictional status report from the SANDEVISTAN core.
    * `EXPLORE_NET`: Get an evocative, AI-generated glimpse of the digital datascape.
    * `WEB3_LEARN_PATH`: Access a guided learning protocol for Web3 concepts.
    * `MY_NETWORK_ECHO`: (Client-side) Display your public network information.
    * `URL_INTEL_BRIEF`: (Educational) Enter a URL for an OSINT-style briefing on what *could* be found.
* **Immersive Aesthetics:** Cyberpunk-themed font, dynamic 3D background, typing animations, reactive page border, and atmospheric BGM with mute/unmute controls.
* **Multi-language Support:** Interface elements and AI responses primarily in English, with potential for future localization.

---

💻 **System Support**

| Operating System | Architecture         | Supported |
| :--------------- | :------------------- | :-------: |
| Windows          | x64, x86             |     ✅    |
| macOS            | Intel, Apple Silicon |     ✅    |
| Linux            | x64, x86, ARM64      |     ✅    |

*SANDEVISTAN is a web application and runs in any modern web browser on the above systems.*

---

👀 **How to Use**

1.  **Clone Repository:**
    ```bash
    git clone [https://github.com/DAWNBRINGER1/sandevistan-DAWN.git](https://github.com/DAWNBRINGER1/sandevistan-DAWN.git)
    ```
2.  **Navigate to Directory:**
    ```bash
    cd sandevistan-DAWN
    ```
3.  **Local Instance (Testing):**
    * Open `index.html` directly in your web browser.
    * *Note: For local testing, AI features rely on the Canvas environment's API access. Direct Gemini API calls from a local file might be restricted by browser security policies without a local development server or specific browser flags.*

4.  **Live Deployment (Vercel Recommended):**
    * Push the project (including `index.html`, `style.css`, `script.js`, and the `api/gemini.js` function) to your connected GitHub repository.
    * Ensure your `GEMINI_API_KEY` is set as an environment variable in your Vercel project settings. (See "Configuration" below).
    * Vercel will automatically build and deploy. Access via your Vercel domain.

---

📝 **Configuration**

* **API Key (Crucial for Live Deployment):**
    * For live deployment on platforms like Vercel, the Gemini API key **must** be configured as an environment variable named `GEMINI_API_KEY` in your Vercel project settings. This is handled by the `api/gemini.js` serverless function for security.
    * **Path to Serverless Function:** `api/gemini.js` (This path is standard for Vercel to recognize it as a serverless function).
* **No local `config.ini` is used by this web application.** All configurations are within the code or server environment variables.

---

❗ **Important Notes**

* For optimal performance and to enable all features (like BGM and secure API calls), deployment to a platform like Vercel is recommended.
* Ensure your browser supports modern JavaScript (ES Modules), WebGL (for Three.js), and Web Audio API (for Tone.js).
* This tool is for educational and research purposes. Please support the original creators of any tools or concepts discussed.
* This tool will not generate any fake email accounts or unauthorized OAuth access.

---

🚨 **Common Issues**

* **AI Features Not Working on Live Site:**
    * **Symptom:** API calls fail, error messages like "AI core offline" or "Connection to SANDEVISTAN core unstable."
    * **Cause:** The `GEMINI_API_KEY` environment variable is likely not set correctly in your Vercel project settings, or the serverless function (`api/gemini.js`) was not deployed correctly.
    * **Solution:** Verify the environment variable name and value in Vercel. Check Vercel deployment logs for errors related to the `api/gemini.js` function. Ensure the `api` folder and `gemini.js` file are correctly pushed to your GitHub repository.
* **Visuals/Animations Not Working:**
    * **Cause:** Browser might be old, or WebGL might be disabled. JavaScript errors could also prevent initialization.
    * **Solution:** Check the browser's developer console (F12) for errors. Ensure you're using a modern browser.
* **Audio (BGM) Not Playing:**
    * **Cause:** Browser autoplay policies often require user interaction (a click) before audio can start.
    * **Solution:** Click the "ACCESS SANDEVISTAN_CORE" button or the mute/unmute button; this interaction should enable the audio context.

---

🤩 **Contribution**

Feel free to submit Issues and Pull Requests! Your contributions to enhance SANDEVISTAN's capabilities are welcome.

---

📩 **Disclaimer**

This tool is only for learning and research purposes, and any consequences arising from the use of this tool are borne by the user. Please comply with the relevant software usage terms and all applicable laws when using this tool or the knowledge gained from it.

---

💰 **Support the Construct**

If you find SANDEVISTAN useful or intriguing, consider showing your support.
(Placeholder for "Buy Me a Coffee" or similar links if you wish to add them)

---

⭐ **Star History**

(You can embed a star history chart here if you like, e.g., using `[![Star History Chart](https://api.star-history.com/svg?repos=DAWNBRINGER1/sandevistan-DAWN&type=Date)](https://star-history.com/#DAWNBRINGER1/sandevistan-DAWN&Date)`)

---

📝 **License**

This project is an experimental interface. Core functionalities rely on external libraries and APIs, each with their own licenses (Three.js: MIT, Tone.js: MIT, Gemini API: Google's Terms of Service). The specific code for SANDEVISTAN provided here is for educational and demonstration purposes.
Please refer to the `LICENSE` file if you add one for your specific contributions. (Currently, no `LICENSE` file is included in this project by default).

---

> CONNECTION_TERMINATED.
</markdown>
