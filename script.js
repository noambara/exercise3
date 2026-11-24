// ================================================
//  Noam's Jungle - Client Side, Homework 3
// ================================================

// ----- The animals of the jungle -----
// Every animal has a name, an image, a sound, a keyboard key and an emoji
// (the emoji is shown only if the image is missing).
const animals = [
    { name: "Lion",     image: "images/lion.jpg",     sound: "sounds/lion.mp3",     key: "L", emoji: "🦁" },
    { name: "Elephant", image: "images/elephant.jpg", sound: "sounds/elephant.mp3", key: "E", emoji: "🐘" },
    { name: "Monkey",   image: "images/monkey.jpg",   sound: "sounds/monkey.mp3",   key: "M", emoji: "🐒" },
    { name: "Giraffe",  image: "images/giraffe.jpg",  sound: "sounds/giraffe.mp3",  key: "G", emoji: "🦒" },
    { name: "Bear",     image: "images/bear.jpg",     sound: "sounds/bear.mp3",     key: "B", emoji: "🐻‍❄️" },
    { name: "Dog",      image: "images/dog.jpg",      sound: "sounds/dog.mp3",      key: "D", emoji: "🐶" },
    { name: "Cow",      image: "images/cow.jpg",      sound: "sounds/cow.mp3",      key: "O", emoji: "🐄" },
    { name: "Chipmunk", image: "images/chipmunk.jpg", sound: "sounds/chipmunk.mp3", key: "C", emoji: "🐿️" }
];

// ----- Elements from the page -----
const jungle = document.getElementById("jungle");
const bgMusic = document.getElementById("bgMusic");
const musicBtn = document.getElementById("musicBtn");
const volumeSlider = document.getElementById("volume");
const randomBtn = document.getElementById("randomBtn");
const searchInput = document.getElementById("search");
const noResults = document.getElementById("noResults");
const welcome = document.getElementById("welcome");
const enterBtn = document.getElementById("enterBtn");
const totalCountEl = document.getElementById("totalCount");
const favouriteEl = document.getElementById("favourite");

// ----- Variables -----
let currentSound = null;   // the animal sound that is playing right now
let totalCount = 0;        // how many sounds were played in total
const clickCounts = {};    // how many times each animal was played

// ================================================
//  Building the cards
// ================================================

// Creates one card for one animal and returns it
function createCard(animal) {
    const card = document.createElement("article");
    card.className = "card";
    card.tabIndex = 0; // lets the user reach the card with the Tab key
    card.dataset.name = animal.name;

    const img = document.createElement("img");
    img.src = animal.image;
    img.alt = animal.name;

    // if the picture file is missing, show the emoji instead
    img.addEventListener("error", function () {
        const placeholder = document.createElement("div");
        placeholder.className = "placeholder";
        placeholder.textContent = animal.emoji;
        img.replaceWith(placeholder);
    });

    const info = document.createElement("div");
    info.className = "card-info";
    info.innerHTML = `
        <div>
            <h2>${animal.name}</h2>
            <span class="counter">Played 0 times</span>
        </div>
        <span class="key" title="Press this key">${animal.key}</span>
    `;

    card.appendChild(img);
    card.appendChild(info);

    // play the sound when the card is clicked
    card.addEventListener("click", function () {
        playAnimal(animal);
    });

    // Enter also works when the card is focused with Tab
    card.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            playAnimal(animal);
        }
    });

    return card;
}

// Creates all the cards with a loop
function buildJungle() {
    for (let i = 0; i < animals.length; i++) {
        clickCounts[animals[i].name] = 0;
        jungle.appendChild(createCard(animals[i]));
    }
}

// ================================================
//  Sounds
// ================================================

// Plays the sound of an animal and updates the page
function playAnimal(animal) {
    // stop the previous animal so sounds don't pile up
    if (currentSound !== null) {
        currentSound.pause();
        currentSound.currentTime = 0;
    }

    currentSound = new Audio(animal.sound);

    const card = findCard(animal.name);

    currentSound.play()
        .then(function () {
            updateCounters(animal.name);
            highlightCard(card);
        })
        .catch(function () {
            console.log("Could not play the sound of " + animal.name);
        });
}

// Finds the card element of an animal by its name
function findCard(name) {
    return jungle.querySelector(`[data-name="${name}"]`);
}

// Marks the card while its sound is playing and shakes it
function highlightCard(card) {
    card.classList.add("playing");

    /* ------------------------------------------------------------------
       NEW ELEMENT (not learned in class): element.animate()
       This is the Web Animations API. It runs an animation straight from
       JavaScript, without writing @keyframes in the CSS file.
       - The first argument is a list of keyframes (the states the element
         goes through, here: rotate left and right = a "shake").
       - The second argument holds the options: how long the animation
         lasts (duration, in milliseconds), how many times it repeats
         (iterations) and its speed curve (easing).
       It returns an Animation object, and its "onfinish" event tells us
       when the animation is over.
       ------------------------------------------------------------------ */
    const shake = card.animate(
        [
            { transform: "rotate(0deg) scale(1)" },
            { transform: "rotate(-4deg) scale(1.05)" },
            { transform: "rotate(4deg) scale(1.05)" },
            { transform: "rotate(-2deg) scale(1.03)" },
            { transform: "rotate(0deg) scale(1)" }
        ],
        { duration: 600, iterations: 1, easing: "ease-in-out" }
    );

    shake.onfinish = function () {
        card.classList.remove("playing");
    };
}

// Updates the counter on the card and the stats box
function updateCounters(name) {
    clickCounts[name]++;
    totalCount++;

    const counter = findCard(name).querySelector(".counter");
    const times = clickCounts[name];
    counter.textContent = "Played " + times + (times === 1 ? " time" : " times");

    totalCountEl.textContent = totalCount;
    favouriteEl.textContent = getFavourite();
}

// Returns the name of the animal that was played the most
function getFavourite() {
    let favourite = "none yet";
    let max = 0;
    for (const name in clickCounts) {
        if (clickCounts[name] > max) {
            max = clickCounts[name];
            favourite = name;
        }
    }
    return favourite;
}

// ================================================
//  Keyboard
// ================================================

document.addEventListener("keydown", function (event) {
    // don't react to keys while the user is typing in the search box
    if (event.target === searchInput) {
        return;
    }

    const pressed = event.key.toUpperCase();
    const animal = animals.find(function (a) {
        return a.key === pressed;
    });

    if (animal) {
        playAnimal(animal);
    }
});

// ================================================
//  Background music
// ================================================

function startMusic() {
    bgMusic.volume = Number(volumeSlider.value);
    return bgMusic.play();
}

function updateMusicButton() {
    if (bgMusic.paused) {
        musicBtn.textContent = "Play music";
    } else {
        musicBtn.textContent = "Pause music";
    }
}

musicBtn.addEventListener("click", function () {
    if (bgMusic.paused) {
        startMusic();
    } else {
        bgMusic.pause();
    }
});

bgMusic.addEventListener("play", updateMusicButton);
bgMusic.addEventListener("pause", updateMusicButton);

volumeSlider.addEventListener("input", function () {
    bgMusic.volume = Number(volumeSlider.value);
});

// Closes the welcome screen
function closeWelcome() {
    welcome.classList.add("fade-out");
    setTimeout(function () {
        welcome.classList.add("hidden");
    }, 500);
}

enterBtn.addEventListener("click", function () {
    startMusic();
    closeWelcome();
});

// ================================================
//  Random animal + search
// ================================================

randomBtn.addEventListener("click", function () {
    const index = Math.floor(Math.random() * animals.length);
    playAnimal(animals[index]);
});

searchInput.addEventListener("input", function () {
    const text = searchInput.value.trim().toLowerCase();
    const cards = jungle.querySelectorAll(".card");
    let visible = 0;

    cards.forEach(function (card) {
        if (card.dataset.name.toLowerCase().includes(text)) {
            card.classList.remove("hidden");
            visible++;
        } else {
            card.classList.add("hidden");
        }
    });

    if (visible === 0) {
        noResults.classList.remove("hidden");
    } else {
        noResults.classList.add("hidden");
    }
});

// ================================================
//  When the page loads
// ================================================

window.addEventListener("load", function () {
    buildJungle();
    updateMusicButton();

    // try to start the music right away; if the browser blocks it,
    // the welcome screen stays and the music starts on the first click
    startMusic()
        .then(closeWelcome)
        .catch(function () {
            console.log("Autoplay was blocked - waiting for a click");
        });
});
