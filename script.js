// script.js

// Ensure THREE and Tone are available (they are loaded via CDN in index.html)
if (typeof THREE === 'undefined') {
    console.error('THREE.js has not been loaded. Check the script link in index.html.');
}
if (typeof Tone === 'undefined') {
    console.error('Tone.js has not been loaded. Check the script link in index.html.');
}

let scene, camera, renderer;
const sceneContainer = document.getElementById('scene-container');
let clock; 
let hyperLinesGroup; 
const NUM_HYPER_LINES = 200; 
let starfieldPoints; 
const NUM_STARFIELD_PARTICLES = 500; 
let introDisintegrationParticles = []; 

let bgmSynth;
let bgmLoop;
let isMuted = false;
let audioStarted = false; 

function setupBGM() {
    bgmSynth = new Tone.MonoSynth({
        oscillator: { type: "sine" }, 
        envelope: { attack: 2, decay: 1, sustain: 0.8, release: 3 },
        filterEnvelope: { attack: 1, decay: 0.5, sustain: 0.5, release: 2, baseFrequency: 200, octaves: 3 },
        volume: -25 
    }).toDestination();

    const notes = ["C2", "G2", "Eb2", "Bb1"]; 
    let noteIndex = 0;

    bgmLoop = new Tone.Loop(time => {
        bgmSynth.triggerAttackRelease(notes[noteIndex % notes.length], "8n", time); 
        noteIndex++;
    }, "2n"); 

    Tone.Transport.bpm.value = 60; 
}

function startBGM() {
    if (Tone.context.state !== 'running') {
        Tone.start().catch(e => console.error("Error starting Tone.js audio context:", e));
    }
    if (bgmLoop && Tone.Transport.state !== "started") { 
         Tone.Transport.start();
         bgmLoop.start(0); 
    }
    audioStarted = true; 
}

function createHyperLines() {
    hyperLinesGroup = new THREE.Group();
    const originYBase = 2.2; 
    const originZStart = -30; 
    const forwardEndPointZ = camera.position.z + 10;

    for (let i = 0; i < NUM_HYPER_LINES; i++) {
        const streakLength = 0.4 + Math.random() * 0.8; 
        const geometry = new THREE.BufferGeometry();
        const points = new Float32Array([0, 0, 0, 0, 0, -streakLength]); 
        geometry.setAttribute('position', new THREE.BufferAttribute(points, 3));
        
        const material = new THREE.LineBasicMaterial({ 
            color: 0x00ffff, 
            transparent: true, 
            opacity: 0.2 + Math.random() * 0.5 
        });
        
        const line = new THREE.Line(geometry, material);

        line.userData = {
            origin: new THREE.Vector3(
                (Math.random() - 0.5) * 1.5,      
                originYBase + (Math.random() - 0.5) * 0.3, 
                originZStart - Math.random() * 10  
            ),
            velocity: new THREE.Vector3(),
            movingForward: true,
            speed: 0.15 + Math.random() * 0.20
        };
        line.position.copy(line.userData.origin);

        const targetX = (Math.random() - 0.5) * 30; 
        const targetY = (Math.random() - 0.5) * 30;
        line.userData.velocity.subVectors(new THREE.Vector3(targetX, targetY, forwardEndPointZ), line.position)
            .normalize()
            .multiplyScalar(line.userData.speed); 

        line.lookAt(line.position.clone().add(line.userData.velocity)); 
        
        hyperLinesGroup.add(line);
    }
    scene.add(hyperLinesGroup);
}

function createStarfield() {
    const particles = NUM_STARFIELD_PARTICLES;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particles * 3);
    const velocities = []; 
    const originZ = -80; 

    for (let i = 0; i < particles; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 100; 
        positions[i * 3 + 1] = (Math.random() - 0.5) * 100; 
        positions[i * 3 + 2] = originZ - Math.random() * 20; 

        velocities.push({
            vector: new THREE.Vector3(
                (Math.random() - 0.5) * 0.01, 
                (Math.random() - 0.5) * 0.01, 
                0.03 + Math.random() * 0.07  
            ),
            movingForward: true
        });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.userData.velocities = velocities; 

    const material = new THREE.PointsMaterial({
        color: 0x00dddd, 
        size: 0.05 + Math.random() * 0.1, 
        transparent: true,
        opacity: 0.4 + Math.random() * 0.4,
        blending: THREE.AdditiveBlending, 
        depthWrite: false 
    });

    starfieldPoints = new THREE.Points(geometry, material);
    scene.add(starfieldPoints);
}

function createIntroDisintegrationBurst() {
    const numBurstParticles = 50;
    const burstOriginY = 1.5; 
    const burstOriginZ = -2;  

    for (let i = 0; i < numBurstParticles; i++) {
        const streakLength = 0.2 + Math.random() * 0.4;
        const geometry = new THREE.BufferGeometry();
        const points = new Float32Array([0, 0, 0, 0, 0, -streakLength]);
        geometry.setAttribute('position', new THREE.BufferAttribute(points, 3));

        const material = new THREE.LineBasicMaterial({
            color: 0x00ffaa, 
            transparent: true,
            opacity: 0.8 + Math.random() * 0.2 
        });
        const particle = new THREE.Line(geometry, material);

        particle.position.set(
            (Math.random() - 0.5) * 2, 
            burstOriginY + (Math.random() - 0.5) * 1,
            burstOriginZ
        );

        particle.userData = {
            velocity: new THREE.Vector3(
                (Math.random() - 0.5) * 0.15, 
                (Math.random() - 0.5) * 0.15, 
                0.1 + Math.random() * 0.1    
            ),
            life: 1.0 
        };
        particle.lookAt(particle.position.clone().add(particle.userData.velocity));
        scene.add(particle);
        introDisintegrationParticles.push(particle);
    }
}


function initThreeJS() {
    scene = new THREE.Scene();
    clock = new THREE.Clock(); 
    camera = new THREE.PerspectiveCamera(75, sceneContainer.clientWidth / sceneContainer.clientHeight, 0.1, 100); 
    camera.position.z = 5; 

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); 
    renderer.setSize(sceneContainer.clientWidth, sceneContainer.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    sceneContainer.appendChild(renderer.domElement);

    createHyperLines(); 
    createStarfield(); 

    window.addEventListener('resize', onWindowResize, false);
    onWindowResize(); 
}

function onWindowResize() {
    if (camera && renderer && sceneContainer) {
        camera.aspect = sceneContainer.clientWidth / sceneContainer.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(sceneContainer.clientWidth, sceneContainer.clientHeight);
    }
}

function animateThreeJS() {
    requestAnimationFrame(animateThreeJS);
    const forwardEndPointZ = camera.position.z + 10; 

    for (let i = introDisintegrationParticles.length - 1; i >= 0; i--) {
        const particle = introDisintegrationParticles[i];
        particle.position.add(particle.userData.velocity);
        particle.userData.life -= 0.015; 
        particle.material.opacity = Math.max(0, particle.userData.life);

        if (particle.userData.life <= 0) {
            scene.remove(particle);
            particle.geometry.dispose();
            particle.material.dispose();
            introDisintegrationParticles.splice(i, 1);
        }
    }


    if (hyperLinesGroup) {
        hyperLinesGroup.children.forEach(line => {
            line.position.add(line.userData.velocity);

            if (line.userData.movingForward && line.position.z > forwardEndPointZ) {
                line.userData.movingForward = false;
                line.userData.velocity.subVectors(line.userData.origin, line.position)
                    .normalize()
                    .multiplyScalar(line.userData.speed * 0.7); 
                line.lookAt(line.position.clone().add(line.userData.velocity));
                line.material.opacity = 0.1 + Math.random() * 0.3; 
            } else if (!line.userData.movingForward && line.position.distanceTo(line.userData.origin) < 1.0 ) { 
                line.userData.movingForward = true;
                line.position.copy(line.userData.origin);
                const targetX = (Math.random() - 0.5) * 30;
                const targetY = (Math.random() - 0.5) * 30;
                line.userData.velocity.subVectors(new THREE.Vector3(targetX, targetY, forwardEndPointZ), line.position)
                    .normalize()
                    .multiplyScalar(line.userData.speed);
                line.lookAt(line.position.clone().add(line.userData.velocity));
                line.material.opacity = 0.2 + Math.random() * 0.5; 
            }
        });
    }

    if (starfieldPoints) {
        const positions = starfieldPoints.geometry.attributes.position.array;
        const particleData = starfieldPoints.geometry.userData.velocities; 

        for (let i = 0; i < NUM_STARFIELD_PARTICLES; i++) {
            const pData = particleData[i];
            positions[i * 3] += pData.vector.x;
            positions[i * 3 + 1] += pData.vector.y;
            positions[i * 3 + 2] += pData.vector.z;

            if (pData.movingForward && positions[i * 3 + 2] > forwardEndPointZ) {
                pData.movingForward = false;
                pData.vector.z *= -1; 
                pData.vector.x = (Math.random() - 0.5) * 0.01;
                pData.vector.y = (Math.random() - 0.5) * 0.01;
            } else if (!pData.movingForward && positions[i * 3 + 2] < -80) { 
                pData.movingForward = true;
                pData.vector.z = Math.abs(pData.vector.z); 
                positions[i * 3] = (Math.random() - 0.5) * 100;
                positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
                positions[i * 3 + 2] = -80 - Math.random() * 10; 
                 pData.vector.x = (Math.random() - 0.5) * 0.01;
                 pData.vector.y = (Math.random() - 0.5) * 0.01;
            }
        }
        starfieldPoints.geometry.attributes.position.needsUpdate = true;
    }


    if (renderer && scene && camera) {
        renderer.render(scene, camera);
    }
}

function markdownToHtml(md) {
    let html = md;
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    html = html.replace(/^\* (.*(?:\n {2,}.*)*)/gim, (match, itemContent) => {
        const processedItemContent = itemContent.replace(/\n {2,}/g, '<br>'); 
        return `<li>${processedItemContent.trim()}</li>`;
    });
    html = html.replace(/(<li>.*<\/li>\s*)+/gim, (match) => `<ul>${match.trim()}</ul>`);
    html = html.replace(/<\/ul>\s*<ul>/gim, ''); 
    html = html.replace(/```(\w*)\n([\s\S]*?)\n```/gim, (match, lang, code) => `<pre><code class="language-${lang || 'plaintext'}">${code.trim()}</code></pre>`);
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    html = html.replace(/^---$/gim, '<hr>');
    html = html.split('\n').map(line => {
        const trimmedLine = line.trim();
        if (trimmedLine === '' || 
            trimmedLine.startsWith('<h') || 
            trimmedLine.startsWith('<ul') || 
            trimmedLine.startsWith('<li') || 
            trimmedLine.startsWith('<pre') || 
            trimmedLine.startsWith('<hr')) {
            return line; 
        }
        return `<p>${line}</p>`; 
    }).join('\n');
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>\s*<\/p>/g, ''); 
    return html;
}

let currentTypingTimeouts = []; 

function clearAllTypingTimeouts() {
    currentTypingTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    currentTypingTimeouts = [];
}

function typewriterEffect(element, text, speed = 75, showCursorAfter = false, callback) {
    let i = 0;
    element.textContent = ''; 
    const cursorSpan = element.nextElementSibling; 
    
    if (cursorSpan && cursorSpan.classList.contains('blinking-cursor')) {
        if (!showCursorAfter) { 
            cursorSpan.classList.add('hidden-cursor');
        } else {
             cursorSpan.classList.remove('hidden-cursor'); 
        }
    } else if (!showCursorAfter && element.id === 'intro-text-element') {
    }

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            const timeoutId = setTimeout(type, speed);
            currentTypingTimeouts.push(timeoutId); 
        } else {
            if (cursorSpan && cursorSpan.classList.contains('blinking-cursor') && showCursorAfter) {
                cursorSpan.classList.remove('hidden-cursor'); 
            } else if (cursorSpan && cursorSpan.classList.contains('blinking-cursor') && !showCursorAfter) {
                cursorSpan.classList.add('hidden-cursor'); 
            }
            if (callback) callback();
        }
    }
    type();
}

const websiteTitleElement = document.getElementById('website-title'); 
const websiteTitleTypedText = document.getElementById('website-title-typed-text'); 
const introTextElement = document.getElementById('intro-text-element'); 

const accessCoreButton = document.getElementById('access-core-button');
const accessCoreButtonTypedText = document.getElementById('access-core-button-typed-text');

const sendQueryButton = document.getElementById('send-query-button');
const sendQueryButtonTypedText = document.getElementById('send-query-button-typed-text');

const decodeTransmissionButton = document.getElementById('decode-transmission-button'); 
const decodeTransmissionButtonTypedText = document.getElementById('decode-transmission-button-typed-text'); 

const systemStatusButton = document.getElementById('system-status-button'); 
const systemStatusButtonTypedText = document.getElementById('system-status-button-typed-text'); 

const datascapeGlimpseButton = document.getElementById('datascape-glimpse-button'); 
const datascapeGlimpseButtonTypedText = document.getElementById('datascape-glimpse-button-typed-text'); 

const interactionElementsContainer = document.getElementById('interaction-elements-container');
const promptInput = document.getElementById('prompt-input');
const responseOutput = document.getElementById('response-output');
const loadingIndicator = document.getElementById('loading-indicator');
const muteButton = document.getElementById('mute-button'); 
const unmuteIcon = document.getElementById('unmute-icon');
const muteIcon = document.getElementById('mute-icon');

const introMessages = [ 
    "You have saved a lot of time...",
    "Now it's your turn to use me as your cyberware."
];

function typeIntroSequence(index = 0, callback) {
    if (index < introMessages.length) {
        let currentText = introTextElement.textContent;
        if (index > 0) currentText += "\n"; 
        
        let i = 0;
        const message = introMessages[index];
        function typeChar() {
            if (i < message.length) {
                currentText += message.charAt(i);
                introTextElement.textContent = currentText;
                i++;
                const timeoutId = setTimeout(typeChar, 50); 
                currentTypingTimeouts.push(timeoutId);
            } else {
                typeIntroSequence(index + 1, callback); 
            }
        }
        typeChar();
    } else {
        if (callback) callback(); 
    }
}


function resetToHomePage() {
    interactionElementsContainer.style.display = 'none';
    accessCoreButton.style.visibility = 'hidden'; 
    accessCoreButton.style.display = 'inline-flex'; 
    accessCoreButton.disabled = false; 
    
    promptInput.value = ''; 
    responseOutput.innerHTML = 'Awaiting transmission...'; 
    loadingIndicator.style.display = 'none';

    const allActionButtons = [sendQueryButton, systemStatusButton, datascapeGlimpseButton, decodeTransmissionButton];
    allActionButtons.forEach(btn => btn.disabled = false);
    promptInput.disabled = false;

    clearAllTypingTimeouts(); 
    introTextElement.textContent = ''; 
    introTextElement.classList.remove('fading-out'); 
    websiteTitleTypedText.textContent = ''; 
    websiteTitleElement.classList.remove('glitch-active'); 


    setTimeout(() => { 
        typewriterEffect(websiteTitleTypedText, "SANDEVISTAN", 100, false, () => {
            websiteTitleElement.classList.add('glitch-active'); 
            websiteTitleTypedText.setAttribute('data-text', 'SANDEVISTAN'); 
            setTimeout(() => {
                websiteTitleElement.classList.remove('glitch-active');
            }, 5000); 

            typeIntroSequence(0, () => { 
                accessCoreButton.style.visibility = 'visible';
                typewriterEffect(accessCoreButtonTypedText, "ACCESS SANDEVISTAN_CORE", 75, true);
            });
        }); 
    }, 50);
}

websiteTitleElement.addEventListener('click', resetToHomePage);


window.addEventListener('load', () => {
     setupBGM(); 
     resetToHomePage(); 
     if (isMuted) {
        muteIcon.style.display = 'inline-block';
        unmuteIcon.style.display = 'none';
     } else {
        unmuteIcon.style.display = 'inline-block';
        muteIcon.style.display = 'none';
     }
});

accessCoreButton.addEventListener('click', () => {
    if (!audioStarted && Tone && Tone.context && Tone.context.state !== "running") {
        Tone.start().then(() => {
            if(bgmLoop && Tone.Transport.state !== "started") {
                Tone.Transport.start();
                bgmLoop.start(0);
            }
        }).catch(e => console.error("Error starting Tone.js context:", e));
    } else if (!audioStarted && bgmLoop && Tone.Transport.state !== "started") {
         Tone.Transport.start();
         bgmLoop.start(0);
    }
    audioStarted = true;

    clearAllTypingTimeouts(); 
    
    introTextElement.classList.add('fading-out');
    createIntroDisintegrationBurst();

    setTimeout(() => {
        interactionElementsContainer.style.display = 'block';
        responseOutput.innerHTML = "Core interface active. Awaiting command...";
        promptInput.focus(); 
        accessCoreButton.style.display = 'none'; 

        typewriterEffect(sendQueryButtonTypedText, "TRANSMIT QUERY", 75, true);
        typewriterEffect(decodeTransmissionButtonTypedText, "DECODE TRANSMISSION ✨", 75, true); 
        typewriterEffect(systemStatusButtonTypedText, "GET SYSTEM_STATUS", 75, true); 
        typewriterEffect(datascapeGlimpseButtonTypedText, "GLIMPSE DATASCAPE", 75, true); 
    }, 700); 
});

muteButton.addEventListener('click', () => {
    if (!audioStarted && Tone && Tone.context && Tone.context.state !== "running") {
        Tone.start().then(() => {
            audioStarted = true; 
            isMuted = !isMuted;
            Tone.Destination.mute = isMuted;
            muteIcon.style.display = isMuted ? 'inline-block' : 'none';
            unmuteIcon.style.display = isMuted ? 'none' : 'inline-block';
             if (!isMuted && bgmLoop && Tone.Transport.state !== "started") { 
                Tone.Transport.start();
                bgmLoop.start(0);
            }
        }).catch(e => console.error("Error starting Tone.js context via mute:", e));
    } else {
        isMuted = !isMuted;
        Tone.Destination.mute = isMuted;
        muteIcon.style.display = isMuted ? 'inline-block' : 'none';
        unmuteIcon.style.display = isMuted ? 'none' : 'inline-block';
    }
});


async function callGeminiAPI(promptText, actionType = "query") { 
    responseOutput.innerHTML = ""; 
    loadingIndicator.style.display = 'block';
    const allButtons = [sendQueryButton, systemStatusButton, datascapeGlimpseButton, decodeTransmissionButton, accessCoreButton];
    allButtons.forEach(btn => btn.disabled = true);
    promptInput.disabled = true;

    const backendApiUrl = '/api/gemini'; 

    try {
        const response = await fetch(backendApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ promptText, actionType }) 
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: "Failed to parse error response from backend." }));
            console.error("Backend API Error Data:", errorData);
            // Ensure we log the full error object if errorData.error is undefined
            throw new Error(errorData.error || `Network response from backend was not ok. Status: ${response.status}`);
        }

        const result = await response.json();

        if (result.generatedText) {
            responseOutput.innerHTML = markdownToHtml(result.generatedText);
        } else if (result.error) { 
            console.error("Error from backend API:", result.error, result.details || '');
            responseOutput.innerHTML = markdownToHtml(`Error: ${result.error}`);
        } else {
            console.error("Unexpected backend response structure:", result);
            responseOutput.innerHTML = markdownToHtml("Error: Received an incomplete or malformed signal from the SANDEVISTAN core (frontend processing).");
        }
    } catch (error) {
        console.error("Error calling backend API (catch block): Full Error Object:", error);
        responseOutput.innerHTML = markdownToHtml(`Error: Connection to SANDEVISTAN core unstable. ${error.message || 'Network error or serverless function issue.'}. Check console for details.`);
    } finally {
        loadingIndicator.style.display = 'none';
        allButtons.forEach(btn => { 
            if (btn.id !== 'access-core-button' || accessCoreButton.style.display !== 'none') {
                btn.disabled = false;
            }
        });
        promptInput.disabled = false;
    }
}

sendQueryButton.addEventListener('click', async () => {
    const prompt = promptInput.value.trim(); 
    if (!prompt) {
        responseOutput.innerHTML = markdownToHtml("Error: No query transmitted. Please enter your message to the SANDEVISTAN core.");
        return;
    }
    await callGeminiAPI(prompt, "query");
});

decodeTransmissionButton.addEventListener('click', async () => { 
    const transmissionText = promptInput.value.trim();
    if (!transmissionText) {
        responseOutput.innerHTML = markdownToHtml("Error: No transmission fragment provided. Paste data into the input field above.");
        return;
    }
    await callGeminiAPI(transmissionText, "decode_transmission");
});

systemStatusButton.addEventListener('click', async () => {
    await callGeminiAPI(null, "system_status"); 
});

datascapeGlimpseButton.addEventListener('click', async () => { 
    await callGeminiAPI(null, "datascape_glimpse");
});

try {
    initThreeJS();
    animateThreeJS();
} catch (error) {
    console.error("Error initializing Three.js scene:", error);
}
    

