const video = document.getElementById('video'); // Access the video element
const canvas = document.getElementById('canvas'); // Access the canvas element
const ctx = canvas.getContext('2d');

// Set the width and height of the canvas
const canvasWidth = 640;
const canvasHeight = 480;
canvas.width = canvasWidth;
canvas.height = canvasHeight;

let handposeModel;
let videoStream;
let lastChangeTime = 0;
const changeInterval = 2000; // Minimum time between quote changes (milliseconds)

// Image and its new placement (middle of the left side of the canvas)
const targetImage = new Image();
targetImage.src = 'target.png'; // Image to be placed on screen
const imageX = 50; // X position of the image (left side of the canvas)
const imageY = canvasHeight / 2 - 50; // Y position to center the image vertically
const imageWidth = 152; // Width of the image
const imageHeight = 205; // Height of the image

// Audio element for playing the Māori phrase
const audioElement = new Audio();
let isAudioPlaying = false; // Flag to track if audio is currently playing
let handDetected = false; // Flag to track if a hand is currently detected

const phrases = [
  { text: "Ata mārie", english: "Good Morning", audio: "audio/Ata marie 2 1.m4a" },
  { text: "Homai", english: "To give", audio: "audio/Homai 1.m4a" },
  { text: "Aroha au ki a koe", english: "I love you", audio: "audio/I love you 1.m4a" },
  { text: "Kia kaha", english: "Be strong", audio: "audio/Kia kaha (1).m4a" },
  { text: "Whāi tō te rangi", english: "Seek the highest", audio: "audio/Whaia to te rangi 1.m4a" },
  { text: "Tino pai", english: "Very good", audio: "audio/Tino pai 1.m4a" },
  { text: "Ka kite anō", english: "See you later", audio: "audio/Ka kite 1.m4a" },
  { text: "Ka pai", english: "Good job", audio: "audio/Ka pai 1.m4a" },
  { text: "Kia toa", english: "Be determined", audio: "audio/Kia toa 1.m4a" },
  { text: "Whare karakia", english: "Church", audio: "audio/Whare karakia 1.m4a" },
  { text: "Hoki mai", english: "Come back", audio: "audio/Hoki mai 1.m4a" },
  { text: "Whakarongo", english: "Listen", audio: "audio/Whakarongo 1.m4a" },
  { text: "Ka mau te wehi", english: "That's amazing", audio: "audio/Ka mau te wehi 1.m4a" },
  { text: "Āe", english: "Yes", audio: "audio/Ae 1.m4a" },
  { text: "Kāore", english: "No", audio: "audio/Kaore 1.m4a" },
  { text: "Wehi nā", english: "Oh my gosh", audio: "audio/Wehi na 1.m4a" },
  { text: "Kia ora", english: "Hello/Thank you", audio: "audio/Kia ora 1 1.m4a" },
  { text: "Rangi Ruru ", english: "Wide Sky Shelter", audio: "audio/Rangi Ruru 1.m4a" },
  { text: "He tumaki a Ms Herft", english: "Ms Herft is our principal", audio: "audio/He tumuaki 1.m4a" },
  { text: "Tarau", english: "Pants", audio: "audio/Tarau 1.m4a" },
  { text: "Waiata", english: "Song", audio: "audio/Waiata 1.m4a" },
  { text: "Ākonga", english: "Students", audio: "audio/Akonga 1.m4a" },
  { text: "Kaiako", english: "Teacher", audio: "audio/Kaiako 1.m4a" },
  { text: "Akomanga", english: "Classroom", audio: "audio/Akomanga 1.m4a" },
  { text: "Hū ", english: "Shoes", audio: "audio/Hu 1.m4a" },
  { text: "Tau ke", english: "Wicked", audio: "audio/Tau ke 1.m4a" },
  { text: "E hea o tau? ", english: "How old are you?", audio: "audio/E hia o tau 1.m4a" },
  { text: "Ko wai tō ingoa?", english: "What is your name?", audio: "audio/Ko wai to ingoa 1.m4a" },
  { text: "Ko Amelie tōku ingoa", english: "My name is Amelie", audio: "audio/Ko toku ingoa 1.m4a" },
  { text: "Mana wāhine", english: "Strong women", audio: "audio/Mana waahine 1.m4a" },
  { text: "Tāniko", english: "embroider, finger weaving", audio: "" },
  { text: "Atawhai", english: "Kindness (and name of Elizabeth Reid Gym :))", audio: "audio/Atawhai 1.m4a" },
  { text: "Te Koraha", english: "Wilderness", audio: "audio/Te koraha 1.m4a" },
  { text: "Aroha mai ", english: "I’m sorry", audio: "audio/Aroha mai 1.m4a" },
  { text: "Ōtautahi", english: "Christchurch", audio: "audio/Chch 1.m4a" },
  { text: "Mātua", english: "Male figure, Dad, Uncle, Mr", audio: "" },
  { text: "Kia tau", english: "Stop", audio: "" },
  { text: "Nau mai haere mai", english: "Welcome", audio: "audio/Nau mai 1.m4a" },
  { text: "Kei te pēhea koe?", english: "How are you?", audio: "audio/Kei te peehea 1.m4a" },
  { text: "Aua", english: "I don’t know", audio: "audio/Aua 1.m4a" },
  { text: "He aha hoki", english: "Whatever", audio: "audio/He aha hoki (1).m4a" },
  { text: "Ka mutu pea", english: "Mean", audio: "audio/Ka mutual o 1.m4a" },
  { text: "Ehara i te ti", english: "Yolo", audio: "audio/Ehara i te ti 1.m4a" },
  { text: "Kaha te kata", english: "Lol", audio: "" },
  { text: "Waitaha", english: "Canterbury", audio: "audio/Waitaha 1.m4a" },
  { text: "Roro hiko", english: "Laptop", audio: "" },
  { text: "Aotearoa", english: "Land of the Long White Cloud - New Zealand", audio: "" },
  { text: "Te Waipounamu", english: "The South Island", audio: "audio/Te waipounamu 1.m4a" },
  { text: "Kāinga", english: "Home", audio: "audio/Kainga 1.m4a" },
  { text: "Taihoa", english: "Wait", audio: "audio/Taihoa 1.m4a" },
  { text: "Te Whare Aroha", english: "Our boarding house, the house of love", audio: "audio/Te whare aroha 1.m4a" }
];

async function setupCamera() {
    try {
        videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = videoStream; // Set the video source to the camera stream
        console.log("Camera stream started");
        return new Promise((resolve) => {
            video.onloadedmetadata = () => {
                resolve(video);
                console.log("Camera metadata loaded");
                console.log(`Video dimensions: width=${video.videoWidth}, height=${video.videoHeight}`);
            };
        });
    } catch (error) {
        console.error("Error accessing camera: ", error);
    }
}

async function loadHandposeModel() {
    try {
        handposeModel = await handpose.load();
        console.log('Handpose model loaded');
    } catch (error) {
        console.error("Error loading Handpose model: ", error);
    }
}

// Function to calculate distance between two points
function calculateDistance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

async function detectHands() {
    try {
        const predictions = await handposeModel.estimateHands(video, true);

        if (predictions.length > 0) {
            const landmarks = predictions[0].landmarks;
            const handX = landmarks[9][0]; // X position of the hand in video coordinates (center of the palm)
            const handY = landmarks[9][1]; // Y position of the hand in video coordinates (center of the palm)

            // Correct the hand coordinates to the canvas coordinates
            const videoWidth = video.videoWidth;
            const videoHeight = video.videoHeight;

            // Ensure we maintain the aspect ratio
            const aspectRatioX = canvasWidth / videoWidth;
            const aspectRatioY = canvasHeight / videoHeight;

            // Map hand coordinates directly to the canvas size using aspect ratios
            const mappedHandX = handX * aspectRatioX;
            const mappedHandY = handY * aspectRatioY;

            // Calculate the center of the hand box
            const handCenterX = mappedHandX;
            const handCenterY = mappedHandY;

            // Calculate the center of the image
            const imageCenterX = imageX + imageWidth / 2;
            const imageCenterY = imageY + imageHeight / 2;

            // Calculate distance between the hand center and image center
            const distance = calculateDistance(handCenterX, handCenterY, imageCenterX, imageCenterY);

            // Trigger phrase if the hand is within 200px of the image
            if (distance <= 200) {
                // Check if enough time has passed since the last phrase change
                const now = Date.now();
                if (now - lastChangeTime > changeInterval && !isAudioPlaying) {
                    showRandomPhrase();
                    lastChangeTime = now;
                }
            }
        }
    } catch (error) {
        console.error("Error in hand detection: ", error);
    }

    requestAnimationFrame(detectHands);
}

function showRandomPhrase() {
    const randomIndex = Math.floor(Math.random() * phrases.length);
    const phrase = phrases[randomIndex];
    document.getElementById('quote').textContent = phrase.text;
    document.getElementById('quote-english').textContent = phrase.english;

    if (phrase.audio) {
        isAudioPlaying = true;
        audioElement.src = phrase.audio;
        audioElement.play().then(() => {
            audioElement.onended = () => {
                isAudioPlaying = false;
            };
        }).catch(error => {
            console.error("Error playing audio:", error);
            isAudioPlaying = false;
        });
    } else {
        isAudioPlaying = false; // No audio to play, so allow new detections
    }
}

function drawVideoAndImage() {
    // Draw the video feed on the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas first
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Ensure the image is loaded before drawing
    if (targetImage.complete) {
        ctx.drawImage(targetImage, imageX, imageY, imageWidth, imageHeight); // Draw the image
    }

    requestAnimationFrame(drawVideoAndImage); // Continuously update the canvas
}

async function main() {
    await setupCamera();
    await loadHandposeModel();

    video.play(); // Play the hidden video
    detectHands(); // Start hand detection
    drawVideoAndImage(); // Start drawing the video and image on the canvas
}

main();
