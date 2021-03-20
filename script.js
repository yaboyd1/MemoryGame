// Global constants
const cluePauseTime = 333; // How long to pause in between clues
const nextClueWaitTime = 1000; // How long to wait before starting playback of the clue sequence
const lessTimePerTurnPercent = 0.75 // User will have less time per button press

const numButtons = 6;
const maxLength = 4;

const maxTime = maxLength * 10 * 1000; 

// Global variables
var pattern = new Array(maxLength);
var progress = 0; 
var gamePlaying = false;
var tonePlaying = false;
var guessCounter = 0;
var clueHoldTime = 1000; // How long to hold each clue's light/sound
var triesLeft = 3;
var timeLeft = maxTime;
var globalTimer;

// Must be between 0.0 and 0.1
var volume = 0.5; 

function generateRandomPattern() {
  for (let i = 0; i < maxLength; ++i)
    pattern[i] = Math.floor(Math.random() * numButtons) + 1;
  console.log(pattern);
}

function decrementTimer() {
  timeLeft -= 1000;
  document.getElementById("timeRemaining").innerText = "Time Remaining: " + timeLeft / 1000 + "s";
  if (timeLeft <= 0) {
    --triesLeft;
    document.getElementById("triesRemaining").innerText = "Tries Remaining: " + triesLeft;
    if (triesLeft <= 0)
      loseGame();
    timeLeft = (maxLength + 1) * 1000;
    return;
  }
}

// Starting and stopping the game
function startGame() {
  // Initialize game variables
  triesLeft = 3;
  timeLeft = maxTime;
  clueHoldTime = 1000;
  progress = 0;
  gamePlaying = true;
  
  document.getElementById("triesRemaining").classList.remove("hidden");
  document.getElementById("triesRemaining").innerText = "Tries Remaining: " + triesLeft;
  
  document.getElementById("timeRemaining").classList.remove("hidden");
  document.getElementById("timeRemaining").innerText = "Time Remaining: " + timeLeft / 1000 + "s";
  generateRandomPattern();
  
  // Swap the Start and Stop buttons
  document.getElementById("startBtn").classList.add("hidden");
  document.getElementById("stopBtn").classList.remove("hidden");
  
  playClueSequence();
}

function stopGame() {
  // Stop the Timer
  clearInterval(globalTimer);
  
  gamePlaying = false;
  // Swap the Start and Stop buttons
  document.getElementById("startBtn").classList.remove("hidden");
  document.getElementById("stopBtn").classList.add("hidden");
  
  document.getElementById("triesRemaining").classList.add("hidden");
  document.getElementById("timeRemaining").classList.add("hidden");
}

// Lighting up a button
function lightButton(btn){
  document.getElementById("button"+btn).classList.add("lit")
}
function clearButton(btn){
  document.getElementById("button"+btn).classList.remove("lit")
}

// Light up and Play Sound for a single button
function playSingleClue(btn){
  if(gamePlaying){
    lightButton(btn);
    playTone(btn, clueHoldTime);
    setTimeout(clearButton, clueHoldTime, btn);
  }
}

function resumeTimer() {
  globalTimer = setInterval(decrementTimer, 1000);
}

// Delays playing the memory sequence
function playClueSequence(){
  // Stop timer while clue sequence is being played
  clearInterval(globalTimer);
  guessCounter = 0;
  
  clueHoldTime *= lessTimePerTurnPercent;
  console.log("Clue Hold Time:" + clueHoldTime);
  
  let delay = nextClueWaitTime; // Set delay to initial wait time
  for(let i = 0;i <= progress;i++){ // For each clue that is revealed so far
    console.log("Play Single Clue: " + pattern[i] + " in " + delay + "ms")
    setTimeout(playSingleClue, delay, pattern[i]) // Set a timeout to play that clue
    delay += clueHoldTime 
    delay += cluePauseTime;
  }
  
  // Resume timer after clue sequence is done (give user some time before countdown)
  console.log("Delay: " + delay);
  setTimeout(resumeTimer, delay - 100);
}

function guess(btn) {
  console.log("User Guessed: " + btn);
  if(!gamePlaying){
    return;
  }
  // Is the guess correct?
  if(pattern[guessCounter] == btn){
    // Is the turn over?
    if(guessCounter == progress) {
      // Is this the last turn?
      if(progress == pattern.length - 1){
        // Win if last turn
        winGame();
      }
      else {
        // If not last turn, progress further
        progress++;
        playClueSequence();
      }
    }
    else {
      // So far so good... check the next guess
      guessCounter++;
    }
  }
  else {
    // Lose if guess is wrong
    --triesLeft;
    document.getElementById("triesRemaining").innerText = "Tries Remaining: " + triesLeft;
    if (triesLeft <= 0) {
      loseGame();
      return;
    }
    playClueSequence();
  }
}

// Alerts for Game Over
function loseGame() { 
  stopGame();
  alert("Game Over. You lost.");
}
function winGame() {
  stopGame();
  alert("Game Over. You win!");
}

// Sound Synthesis Functions
const freqMap = {
  1: 250,
  2: 261.6,
  3: 329.6,
  4: 392,
  5: 466.2,
  6: 500
}

function playTone(btn, len) { 
  o.frequency.value = freqMap[btn]
  g.gain.setTargetAtTime(volume, context.currentTime + 0.05, 0.025)
  tonePlaying = true
  setTimeout(function(){
    stopTone()
  },len)
}

function startTone(btn) {
  if(!tonePlaying){
    o.frequency.value = freqMap[btn]
    g.gain.setTargetAtTime(volume, context.currentTime + 0.05, 0.025)
    tonePlaying = true
  }
}

function stopTone() {
    g.gain.setTargetAtTime(0, context.currentTime + 0.05, 0.025)
    tonePlaying = false
}

// Page Initialization
// Initialize Sound Synthesizer
var context = new AudioContext()
var o = context.createOscillator()
var g = context.createGain()
g.connect(context.destination)
g.gain.setValueAtTime(0, context.currentTime)
o.connect(g)
o.start(0)