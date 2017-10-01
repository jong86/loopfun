 /*

CURRENT TO DO LIST:
-Switch to Web Audio API for sounds
-implement note lengths

-highlight row that mouse is hovering over

-stop all oscillator sounds when stop or pause is pressed

-mouse click to make notes
-mouse drag to make long notes

-undo history (all cell states stored in array)

-stutter effect (on master)
-filter effect  (on master)

-add audio visualization

-add key change, and one more note to the instruments to include octave note (and loose
coupling of relevant code to allow for additional changes)

-color the note rows different according to scale of user's choosing (pentatonic is default)
>> make constants for each color, drumReg, drumShaded, bassReg, bassShade etc.

*/

var numBars = 2;
var numGridCols = numBars * 16; // offer option to link each bar to make it easier to do loops, or make simple/expert versions
var bpm = 120; // 120 bpm * 4 = 480 1/16th per minute / 60 = 8 1/16th notes per second
var timePerTile;
function resetTiming() {
  timePerTile = 15000 / bpm; // 15000 / bpm is length of time before moving to the next time, according to the current bpm
}
resetTiming();

window.onload = function() {
  var bpmSlider = document.createElement("INPUT");
  bpmSlider.setAttribute("type", "range");
  bpmSlider.setAttribute("min", 70);
  bpmSlider.setAttribute("max", 180);
  bpmSlider.defaultValue = bpm;
  bpmSlider.oninput = function() {
    bpm = bpmSlider.value;
    transportPause();
    transportPlay();
    document.getElementById("bpmValue").innerHTML = bpm;
  }
  document.getElementById("bpmSlider").appendChild(bpmSlider);

  document.getElementById("bpmValue").innerHTML = bpm;
}


// Begins AudioContext for Web Audio API:
var audioContext = new AudioContext();

var bufferSize = 2 * audioContext.sampleRate; // Creates noise buffer to use for percussion
var noiseBuffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
var output = noiseBuffer.getChannelData(0);
for (var i = 0; i < bufferSize; i++) {
  output[i] = Math.random() * 2 - 1;
}

var oscBass = audioContext.createOscillator(); // Create oscillator (i.e. 'bass guitar')
var oscBassGain = audioContext.createGain(); // Create gain node (i.e. 'gain pedal')
var oscBassFilter = audioContext.createBiquadFilter();
oscBassFilter.type = "lowpass";
oscBassFilter.frequency.value = 1200;
var oscBassPan = audioContext.createStereoPanner();
var isOscBassPlaying = false;

var sounds = {
  playKick: function() {
    // Kick osc part:
    var osc = audioContext.createOscillator(); // Create oscillator (i.e. 'bass guitar')

    osc.type = "triangle";
    osc.frequency.value = 120;
    osc.frequency.exponentialRampToValueAtTime(40, audioContext.currentTime + 0.1);

    var oscGain = audioContext.createGain(); // Create gain node (i.e. 'gain pedal')
    //oscGain.gain.value = 0.5; // set gain node to 30%
    oscGain.gain.setValueAtTime(0.1, audioContext.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.8, audioContext.currentTime + 0.1);

    osc.connect(oscGain); // Connect osc to gain pedal
    oscGain.connect(audioContext.destination); // Connect gain pedal to speakers (just like a device chain)

    osc.start(); // Generate sound instantly
    osc.stop(audioContext.currentTime + 0.1);

    // Kick noise part:

    var noise = audioContext.createBufferSource();

    noise.buffer = noiseBuffer;
    noise.loop = true;

    var noiseFilter = audioContext.createBiquadFilter();
    noiseFilter.type = "lowpass";

    noiseFilter.frequency.setValueAtTime(1000, audioContext.currentTime);
    noiseFilter.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 0.1);

    var noiseGain = audioContext.createGain();
    noiseGain.gain.value = 0.4;

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioContext.destination);

    noise.start();
    noise.stop(audioContext.currentTime + 0.1);
  },

  playSnare: function() {
    // Snare osc part:
    var osc = audioContext.createOscillator(); // Create oscillator (i.e. 'bass guitar')

    osc.type = "triangle";
    osc.frequency.value = 300;
    osc.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.1);

    var oscGain = audioContext.createGain(); // Create gain node (i.e. 'gain pedal')
    //oscGain.gain.value = 0.5; // set gain node to 30%
    oscGain.gain.setValueAtTime(0.1, audioContext.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.4, audioContext.currentTime + 0.1);

    osc.connect(oscGain); // Connect osc to gain pedal
    oscGain.connect(audioContext.destination); // Connect gain pedal to speakers (just like a device chain)

    osc.start(); // Generate sound instantly
    osc.stop(audioContext.currentTime + 0.07);

    // Snare noise part:

    var noise = audioContext.createBufferSource();

    noise.buffer = noiseBuffer;
    noise.loop = true;

    var noiseFilter = audioContext.createBiquadFilter();
    noiseFilter.type = "lowpass";

    noiseFilter.frequency.setValueAtTime(12000, audioContext.currentTime);
    noiseFilter.frequency.exponentialRampToValueAtTime(220, audioContext.currentTime + 0.1);

    var noiseGain = audioContext.createGain();
    noiseGain.gain.value = 0.2;

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioContext.destination);

    noise.start();
    noise.stop(audioContext.currentTime + 0.1);
  },

  playCHat: function() {
    // Closed hat noise part:

    var noise = audioContext.createBufferSource();

    noise.buffer = noiseBuffer;
    noise.loop = true;

    var noiseFilter = audioContext.createBiquadFilter();
    noiseFilter.type = "highpass";

    noiseFilter.frequency.setValueAtTime(1000, audioContext.currentTime);
    noiseFilter.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 0.1);

    var noiseGain = audioContext.createGain();
    noiseGain.gain.value = 0.2;

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioContext.destination);

    noise.start();
    noise.stop(audioContext.currentTime + 0.03);
  },

  playOHat: function() {
    // Closed hat noise part:

    var noise = audioContext.createBufferSource();

    noise.buffer = noiseBuffer;
    noise.loop = true;

    var noiseFilter = audioContext.createBiquadFilter();
    noiseFilter.type = "highpass";

    noiseFilter.frequency.setValueAtTime(1000, audioContext.currentTime);
    noiseFilter.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 0.1);

    var noiseGain = audioContext.createGain();
    noiseGain.gain.value = 0.2;
    noiseGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioContext.destination);

    noise.start();
    noise.stop(audioContext.currentTime + 0.03);
  },

  playCymbal: function() {
    // Closed hat noise part:

    var noise = audioContext.createBufferSource();

    noise.buffer = noiseBuffer;
    noise.loop = true;

    var noiseFilter = audioContext.createBiquadFilter();
    noiseFilter.type = "highpass";

    noiseFilter.frequency.setValueAtTime(1000, audioContext.currentTime);
    noiseFilter.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 0.1);

    var noiseGain = audioContext.createGain();
    noiseGain.gain.value = 0.2;
    noiseGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioContext.destination);

    noise.start();
    noise.stop(audioContext.currentTime + 0.03);
  },

  playCowbell: function() {
    // Closed hat noise part:

    var noise = audioContext.createBufferSource();

    noise.buffer = noiseBuffer;
    noise.loop = true;

    var noiseFilter = audioContext.createBiquadFilter();
    noiseFilter.type = "highpass";

    noiseFilter.frequency.setValueAtTime(1000, audioContext.currentTime);
    noiseFilter.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 0.1);

    var noiseGain = audioContext.createGain();
    noiseGain.gain.value = 0.2;
    noiseGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioContext.destination);

    noise.start();
    noise.stop(audioContext.currentTime + 0.03);
  },

  playBass: function(note, length) {
    if (isOscBassPlaying === false) {
      isOscBassPlaying = true;

      var freq = notesFreqs[note] / 2;
      var length = length / 1000;

      oscBass.type = "sawtooth";
      oscBass.frequency.value = freq;

      oscBassGain.gain.value = 0.5; // set gain node to 30%

      oscBassPan.pan.value = 0.6;

      oscBass.connect(oscBassGain); // Connect osc to gain pedal
      oscBassGain.connect(oscBassFilter);
      oscBassFilter.connect(oscBassPan); // Connect gain pedal to speakers (just like a device chain)
      oscBassPan.connect(audioContext.destination);

      oscBass.start(); // Generate sound instantly
      oscBass.stop(audioContext.currentTime + length);

      oscBass.onended = function() {
        isOscBassPlaying = false;
        oscBass = audioContext.createOscillator(); // Create oscillator (i.e. 'bass guitar')
        oscBassGain = audioContext.createGain(); // Create gain node (i.e. 'gain pedal')
      }



    }
  },


  playLead: function(note, length) {

  },
}


var instDrums = [
  "bd",
  "sn",
  "ch",
  "oh",
  "cy",
  "cb"
];

var instBass = [
  "c#", // "sh" used instead of "#" because # was causing errors with file name
  "c",
  "b",
  "a#",
  "a",
  "g#",
  "g",
  "f#",
  "f",
  "e",
  "d#",
  "d",
];


var notesFreqs = {
  "c#": 277.18,
  "c": 261.63,
  "b": 246.94,
  "a#": 233.08,
  "a": 220,
  "g#": 207.65,
  "g": 196,
  "f#": 185,
  "f": 174.61,
  "e": 164.81,
  "d#": 155.56,
  "d": 146.83
};

var instLead = instBass;



var id = 0;
var col;
var row = 0;
function populateRow(rowName, inst) {
  //var tdString = "";
  var barPos = 0;
  var bgColor;

  var rowDiv = document.createElement("div");
  rowDiv.className = inst;
  var rowIdentifier = document.createElement("div");
  rowIdentifier.className = "rowIdentifier";
  rowIdentifier.innerText = rowName;
  rowDiv.appendChild(rowIdentifier);

  for (col = 0; col < numGridCols; col++) {
    // Drum tile colors:
    if (barPos === 0 && id < (numGridCols * 6)) {
      bgColor = "#1E3B32";
    }
    else if (barPos === 4 && id < (numGridCols * 6)) {
      bgColor = "#275445";
    }
    else if (barPos === 8 && id < (numGridCols * 6)) {
      bgColor = "#2D725C";
    }
    else if (barPos === 12 && id < (numGridCols * 6)) {
      bgColor = "#318B6D";
    }

    // Bass tile colors:
    else if (barPos === 0 && (id >= (numGridCols * 6) && id < (numGridCols * 18))) {
      bgColor = "#522933";
    }
    else if (barPos === 4 && (id >= (numGridCols * 6) && id < (numGridCols * 18))) {
      bgColor = "#733645";
    }
    else if (barPos === 8 && (id >= (numGridCols * 6) && id < (numGridCols * 18))) {
      bgColor = "#9E3F55";
    }
    else if (barPos === 12 && (id >= (numGridCols * 6) && id < (numGridCols * 18))) {
      bgColor = "#BF4360";
    }

    // Lead tile colors:
    else if (barPos === 0 && (id >= (numGridCols * 18) && id <= (numGridCols * 30))) {
      bgColor = "#4C552B";
    }
    else if (barPos === 4 && (id >= (numGridCols * 18) && id <= (numGridCols * 30))) {
      bgColor = "#6B7839";
    }
    else if (barPos === 8 && (id >= (numGridCols * 18) && id <= (numGridCols * 30))) {
      bgColor = "#8FA441";
    }
    else if (barPos === 12 && (id >= (numGridCols * 18) && id <= (numGridCols * 30))) {
      bgColor = "#ACC846";
    }

    var newCell = document.createElement("div");
    newCell.className = "noteGrid";
    newCell.id = id;
    newCell.style.backgroundColor = bgColor;
    newCell.dataset.xpos = col;
    newCell.dataset.ypos = row;
    newCell.dataset.note = rowName;
    rowDiv.appendChild(newCell);

    id++;

    barPos++;
    if (barPos > 15) barPos = 0; // for color scheme
  };
  row++;
  document.getElementById("mainTable").appendChild(rowDiv);
};

// Creates table of instrument labels and note grid
for (rowName of instDrums) {
  populateRow(rowName, "rowDrums");
};
for (rowName of instBass) {
  populateRow(rowName, "rowBass");
};
for (rowName of instLead) {
  populateRow(rowName, "rowLead");
};

var trackerY;
var noteCatalogue = [];
// Note catalogue's lowest sub-array goes like this: 0 = filepath; 1 = active status; 2 = previous color; 3 = cell ID; 4 = isLong; 5 = isSustainTile; 6 = belongsTo; 7 = length; 8 = note
function createNoteCatalogue() {
  var previousColor;
  function insertTile(inst) {
    var sndFolder = inst;
    id = getID(x, trackerY);
    previousColor = document.getElementById(id).style.backgroundColor;
    filepath = "assets/sounds/" + sndFolder + "/" + row + ".wav";

    if (id < numGridCols) {
      var func = "sounds.playKick()";
    }
    else if (id < (numGridCols * 2) && id >= numGridCols) {
      var func = "sounds.playSnare()";
    }
    else if (id < (numGridCols * 3) && id >= (numGridCols * 2)) {
      var func = "sounds.playCHat()";
    }
    else if (id < (numGridCols * 4) && id >= (numGridCols * 3)) {
      var func = "sounds.playOHat()";
    }
    else if (id < (numGridCols * 5) && id >= (numGridCols * 4)) {
      var func = "sounds.playCymbal()";
    }
    else if (id < (numGridCols * 6) && id >= (numGridCols * 5)) {
      var func = "sounds.playCowbell()";
    }

    else if (id < (numGridCols * 18) && id >= (numGridCols * 6)) {
      var func = "playBass";
    }
    else if (id < (numGridCols * 30) && id >= (numGridCols * 18)) {
      var func = "playLead";
    }

    //noteArray = [func, false, previousColor, id, false, false, null, 0, row];
    var tileObj = {
      soundFunction: func,
      status: false,
      previousColor: previousColor,
      id: id,
      isLong: false,
      isSustainTile: false,
      belongsTo: null,
      length: 0,
      note: row
    };

    noteCatalogue[x].push(tileObj);
    trackerY++;
  }
  for (x = 0; x < numGridCols; x++) { // This creates/initializes the Note Catalogue (which is where all tile information is stored)
    noteCatalogue.push([]);
    trackerY = 0;
    for (row of instDrums) {
      insertTile("drums");
    }
    for (row of instBass) {
      insertTile("bass");
    }
    for (row of instLead) {
      insertTile("lead");
    }
  }
}
createNoteCatalogue();

var amtTilesDrums = 0;
var maxTilesDrums = 3; // Sets max # of drums allowed to be played for each column
var amtTilesBass = 0;
var maxTilesBass = 1;
var amtTilesLead = 0;
var maxTilesLead = 1;

const color_ON = "#00FF99";
function updateNoteCatalogue(id, isLong, isSustainTile, belongsTo, length) { // isLong is bollean operator for notes that are longer than one tile, isSustainTile is for tiles that are sustained long notes
  var x = getCol(id);
  var y = getRow(id);
  var cell = document.getElementById(id);
  var previousColor = cell.style.backgroundColor;
  var belongsToCellData = noteCatalogue[getCol(belongsTo)][getRow(belongsTo)];
  var isLastSustain = (belongsToCellData.length / timePerTile) + belongsTo - 1 === id ? true : false;
  //console.log(belongsToCellData.length, timePerTile, belongsTo, id, isSustainTile, isLastSustain);

  if (isSustainTile && isLastSustain) {
    cell.style.borderLeft = "2px solid " + color_ON;
  }
  else if (isSustainTile && isLastSustain === false) {
    cell.style.borderLeft = "2px solid " + color_ON;
    cell.style.borderRight = "2px solid " + color_ON;
  }
  else if (isLong) {
    cell.style.borderRight = "2px solid " + color_ON;
  }

/*
  var cellsList = [];

  if ((isSustainTile || isLastSustain) && noteCatalogue[x][y].status === true) { // Catches overwriting of long notes in order to reset color of all tiles of overwritten notes
    console.log("attempting deletion of overwritten note");
  }
*/


  if (noteCatalogue[x][y].status === false) {
    noteCatalogue[x][y].status = true;
    cell.style.backgroundColor = color_ON;
  }
  else if (noteCatalogue[x][y].status === true) {
    noteCatalogue[x][y].status = false;
    cell.style.backgroundColor = noteCatalogue[x][y].previousColor; // reverts back to original color
    cell.style.border = "";
  }
  noteCatalogue[x][y].previousColor = previousColor;
  noteCatalogue[x][y].isLong = isLong;
  noteCatalogue[x][y].isSustainTile = isSustainTile;
  noteCatalogue[x][y].belongsTo = belongsTo;
  noteCatalogue[x][y].length = length;
  //console.log("Updated tile: " + noteCatalogue[x][y]);
}


/*
// Set which tiles are active on startup: (OLD)
var activeTilesByDefault = [0, 4, 8, 12, 68, 76, 130, 134, 138, 142, 898, 902, 906, 910];
function setStartupTiles() {
  var length = timePerTile * 1;
  for (i = 0; i < activeTilesByDefault.length; i++) {
    id = activeTilesByDefault[i];
    updateNoteCatalogue(id, false, false, null, length);
  }
}
*/

var defaultBeat = [
  //DRUMS:
  "1000100010001000", // bd
  "0000100000001000", // sn
  "0010001000100010", // ch
  "0000000000000000", // oh
  "1000000010000000", // cy
  "0000000000000000", // cb

  //BASS:
  "0000000000000000", // C#
  "0000000000000000", // C
  "0000000000000000", // B
  "0000000000000000", // A#
  "0000000000000010", // A
  "0000000000000000", // G#
  "0000000000100000", // G
  "0000000000000000", // F#
  "0000000000000000", // F
  "1000100000000000", // E
  "0000000000000000", // D#
  "0000000000000000", // D

  // LEAD:
  "0000000000000000", // C#
  "0000000000000000", // C
  "0000000000000000", // B
  "0000000000000000", // A#
  "0000000000000000", // A
  "0000000000000000", // G#
  "0000000000000000", // G
  "0000000000000000", // F#
  "0000000000000000", // F
  "0000000000000000", // E
  "0000000000000000", // D#
  "0000000000000000", // D
];
function setDefaultTiles() {
  var len = timePerTile * 1;
  for (var i = 0; i < defaultBeat.length; i++) {
    var array = defaultBeat[i].split("");
    var n16th = 0;
    for (var j = 0; j < numGridCols; j++) {
      if (array[n16th] === "1") {
        id = (i * numGridCols) + j;
        //console.log(id);
        updateNoteCatalogue(id, false, false, null, len);
      }
      n16th++;
      if (n16th > 15) n16th = 0;
    }
  }
}

function getCol(id) {
  col = id - (getRow(id) * numGridCols);
  return col;
}
function getRow(id) {
  row = Math.floor(id / numGridCols);
  return row;
}
function getID(col, row) {
  a = col;
  b = row * numGridCols;
  return a + b;
}




var noteGridObj = { // thought this would make creating the playheadLine easier but not sure if necessary
  edgeLeft: 0,
  edgeRight: 0,
  edgeTop: document.getElementById("0").offsetTop + document.getElementById("0").offsetHeight / 2,
  edgeBottom: 0,
  topLeftCell: {
    topSide: document.getElementById("0").offsetTop,
    leftSide: document.getElementById("0").offsetLeft,
  },
  bottomLeftCell: {
    bottomSide: document.getElementById(numGridCols * 29).offsetTop + document.getElementById(numGridCols * 29).offsetHeight,
  },
  topRightCell: document.getElementById("\"" + numGridCols - 1 + "\""),
  bottomRightCell: document.getElementById("\"" + ((numGridCols * 30) - 1) + "\"")
};

var cell0 = document.getElementById("0");
var cell0Position = cell0.getBoundingClientRect();


playheadLine = document.getElementById("playheadLine");
playheadLine.style.height = (noteGridObj.bottomLeftCell.bottomSide - noteGridObj.topLeftCell.topSide) + 5;
playheadLine.style.top = cell0Position.top + 6 + "px";

var playheadPos;
function resetPlayheadToZero() {
  playheadPos = parseInt(noteGridObj.topLeftCell.leftSide) ;
  playheadLine.style.left = playheadPos;
}
resetPlayheadToZero();

var timeline = {
  start: document.getElementById("0").offsetLeft,
  end: document.getElementById((numGridCols * 30) - 1).offsetLeft + document.getElementById((numGridCols * 30) - 1).style.width,
}



window.addEventListener("resize", windowResize);
function windowResize() { // handles everything needed when window is resized
  resetPlayheadToZero();
}


// *****************
// MOUSE CONTROLS:
var cellDownData, cellUpData, cellDownTileY;
var mainTable = document.getElementById("mainTable");
var mouseIsDown = false;
var pendingTiles = [];

var sBox = document.createElement("div"); // Selection box indicator
sBox.id = "sBox";
sBox.style.position = "absolute";
sBox.style.border = "2px solid yellow";
sBox.style.width = "0px";
sBox.style.height = "0px";
sBox.style.pointerEvents = "none";
mainTable.addEventListener("mousemove", mouseMove);
function mouseMove(event) {
  var x = event.clientX;
  var y = event.clientY;
  var cellOver = document.elementFromPoint(x, y);
  //console.log("cellOver: " + cellOver);
  //console.log("cellOver.style.left: " + cellOver.style.left);
  if (cellOver !== null && cellOver.className === "noteGrid") {
    sBox.style.left = cellOver.offsetLeft;
    sBox.style.top = cellOver.offsetTop;
    sBox.style.width = cellOver.clientWidth;
    sBox.style.height = cellOver.clientHeight;
    document.getElementById("mainTable").appendChild(sBox);
    //console.log("cellOver.id: " + cellOver.id);
  }

  if (mainTable.contains(sBox) && cellOver !== null && cellOver.className !== "noteGrid") {
    document.getElementById("mainTable").removeChild(sBox);
  }

}

mainTable.addEventListener("mousedown", mouseDown);
function mouseDown(event) {
  mouseIsDown = true;
  var targ = event.srcElement;
  if (mainTable.contains(targ)) {
    event.preventDefault();
  }
  if (targ.className === "noteGrid") {
    cellDownData = noteCatalogue[getCol(targ.id)][getRow(targ.id)];
    cellDownTileY = targ.clientY;
  }
  var canUpdate = []; // create array of tiles that you can update (all the ones in front of first one)
  if (targ.className === "noteGrid") {
    for (var i = 0; i < (numGridCols - (targ.dataset.xpos)); i++) {
      canUpdate.push(Number(cellDownData.id) + i);
    }
  }
  if (cellDownData !== null) {
    mainTable.addEventListener("mousemove", mouseDrag);
  }

  sBox.style.border = "2px solid red";
  mainTable.removeEventListener("mousemove", mouseMove);

  mainTable.addEventListener("mouseout", mouseOutOfTable);

}

function mouseOutOfTable(event) {
  console.log("Mouse out from table registered.");
  // Need to get this to save the last tile the mouse was over, and to use that onmouseup in case mouse goes outside table

}



mainTable.addEventListener("mouseup", mouseUp);
function mouseUp(event) {
  var targ = event.srcElement;
  if (targ.className === "noteGrid") {
    cellUpData = noteCatalogue[getCol(targ.id)][getRow(targ.id)];
    if (cellDownData !== null && cellDownData.status === true || cellDownData.id < (numGridCols * 6) || pendingTiles.length <= 1) { // deals with single tiles and drums
      if (cellDownData.isSustainTile === true || cellDownData.isLong === true) {
        var firstCellData = noteCatalogue[getCol(cellDownData.belongsTo)][getRow(cellDownData.belongsTo)];
        var lastCell = firstCellData.id + (firstCellData.length / timePerTile);
        for (var i = firstCellData.id; i < lastCell; i++) { // deletes all tiles from end to beginning of long notes
          updateNoteCatalogue(i, false, false, null, null);
        }
      }
      else {
        updateNoteCatalogue(cellDownData.id, false, false, Number(cellDownData.id), timePerTile); // simply updates single-tile-length notes
      }
    }

    else if (cellDownData.id >= (numGridCols * 6) && pendingTiles.length > 1) {
      for (var i = 0; i < pendingTiles.length; i++) { // this loop disallows janky overwriting behavior by deactivating all tiles under selection before activating them
        var thisCell = noteCatalogue[getCol(pendingTiles[i])][getRow(pendingTiles[i])];
        if (thisCell.isLong === true) { // If it's a long note being overwritten, use this loop to deact. all of it's tiles
          var thisCellsLastNoteTile = thisCell.id + (thisCell.length / timePerTile);
          for (var j = thisCell.id; j < thisCellsLastNoteTile; j++) {
            updateNoteCatalogue(j, false, false, null, null);
          }
          break;
        }
        else if (thisCell.status === true) { // this is for overwriting of single notes
          updateNoteCatalogue(thisCell.id, false, false, null, null);
        }
      }

      for (var i = 0; i < pendingTiles.length; i++) { // this loop activates all tiles in a long note
        if (i === 0) {
          updateNoteCatalogue(pendingTiles[0], true, false, pendingTiles[0], pendingTiles.length * timePerTile); // (id, isLong, isSustainTile, belongsTo, length)
        }
        else if (i > 0) {
          //console.log(pendingTiles[0]);
          updateNoteCatalogue(pendingTiles[i], false, true, pendingTiles[0], null);
        }
      }
    }
  }


  // Selection box stuff:
  sBox.style.border = "2px solid yellow";
  mainTable.addEventListener("mousemove", mouseMove);
  var x = event.clientX;
  var y = event.clientY;
  var cellOver = document.elementFromPoint(x, y);
  if (cellOver !== null && cellOver.className === "noteGrid") {
    sBox.style.left = cellOver.offsetLeft;
    sBox.style.top = cellOver.offsetTop;
    sBox.style.width = cellOver.clientWidth;
    sBox.style.height = cellOver.clientHeight;
  }
  else mainTable.removeChild(sBox);

  // Cell updating stuff:
  //console.log(cellDownData);
  mainTable.removeEventListener("mousemove", mouseDrag);
  mouseIsDown = false;
  pendingTiles = [];
  cellDownData = null;
  cellUpData = null;

  mainTable.removeEventListener("mouseout", mouseOutOfTable);
}

function mouseDrag(event) {
  pendingTiles = [];
  var x = event.clientX;
  var y = document.getElementById(cellDownData.id).getBoundingClientRect().top;
  var cellOverData = document.elementFromPoint(x, y);
  for (var i = Number(cellDownData.id); i <= cellOverData.id; i++) {
    pendingTiles.push(Number(i));
  }

  var downElmt = document.getElementById(cellDownData.id);

  if (Number(cellOverData.id) !== Number(cellDownData.id) && cellOverData.className === "noteGrid" && cellOverData.id >= numGridCols * 6) {
    // elongate selection box:
    sBox.style.width = (pendingTiles.length * downElmt.getBoundingClientRect().width) - 4;
  }

  if (Number(cellOverData.id) === Number(cellDownData.id)) {
    sBox.style.width = downElmt.getBoundingClientRect().width - 4;
  }
}


/*
var oldTile = 0;
var currentTile = 0;
var mv = 0;
function moveTile(mv) {
  oldTile = currentTile;
  currentTile += mv;
  document.getElementById(oldTile).style.borderColor = "#595337";
  document.getElementById(currentTile).style.borderColor = "#FFFF00";
}
moveTile(0);
*/

var tilesToUpdate = [];
var isLongToggle = false;
var isSustainToggle = false;
// KEYBOARD CONTROLS:
window.onkeydown = function(e) {

  var key = e.keyCode ? e.keyCode : e.which;
  if (key === 32 && alreadyPlaying === false) { // 32 = space
    e.preventDefault();
    transportPlay();
  }
  else if (key === 32 && alreadyPlaying === true) {
    e.preventDefault();
    transportStop();
  }
  /*
  else if (key === 16) { // 16 = shift for activating/deactivating tiles
    e.preventDefault();
    if (currentTile >= 384) { // for bass/lead -- slightly different mechanism
      tilesToUpdate.push(currentTile);
    }
    else {
      e.preventDefault;
    }
  }
  else if (key === 39) { // 39 = arrow right
    e.preventDefault();
    if (e.ctrlKey && currentTile < 384){ // if ctrl held w/ right arrow and it's drums -- no mvmt allowed
      e.preventDefault();
    }
    else if (((currentTile + 1) % numGridCols !== 0 || (currentTile !== 1919 && currentTile > 1856)) && e.ctrlKey && currentTile >= 384) { // if not at boundary & ctrl held & bass/lead tile
      moveTile(1);
      tilesToUpdate.push(currentTile);
    }
    else if ((currentTile + 1) % numGridCols !== 0 || (currentTile !== 1919 && currentTile > 1856)) { // if not at boundary, normal mvmt
      moveTile(1);
    }
  }
  else if (key === 40) { // 40 = arrow down
    e.preventDefault();
    if (e.ctrlKey) { // if holding ctrl -- no mvmt
      e.preventDefault();
    }
    else if (currentTile < 1856) { // if not at down boundary
      moveTile(numGridCols);
    }
  }
  else if (key === 37) { // 37 = arrow left
    e.preventDefault();
    if (e.ctrlKey) { // if holding ctrl -- no mvmt
      e.preventDefault;
    }
    else if (currentTile % numGridCols !== 0 || (currentTile !== 0 && currentTile < (numGridCols-1))) { // if not at left boundary
      moveTile(-1);
    }
  }
  else if (key === 38) { // 38 = arrow up
    e.preventDefault();
    if (e.ctrlKey) { // if holding ctrl -- no mvmt
      e.preventDefault();
    }
    else if (currentTile > (numGridCols-1)) { // if not at up boundary
      moveTile(-numGridCols);
    }
  }
  */

  else if (key === 83) {
    sounds.playSnare();
  }
  else if (key === 65) {
    sounds.playKick();
  }
  else if (key === 68) {
    sounds.playCHat();
  }
}

// TO DO: Implement sustained notes for bass/lead (tiles >= (numGridCols * 6)) -- maybe start with the note length mechanism
// TO DO: IF selected tile isSustainTile or isLong -- you cannot move the selector... and onkeyup of control deletes entire note (prevents janky behavior)
// TO DO: (for drums): IF user tries to put a note in a column where there's already a note it, and that column would exceed max notes, deletes the oldest note put there
// TO DO: (for bass/lead): IF user tries to put a note in a column where there's already a note, it will delete the old note
// TO DO: (for bass/lead): IF user tries to put a note in a column where there's already a SUSTAINED note, it will shorten the sustained note where the new note was placed


// updateNoteCatalogue(id, isLong, isSustainTile, belongsTo)

/* OLD:
window.onkeyup = function(e) {
  var key = e.keyCode ? e.keyCode : e.which;
  if (key === 16 && currentTile < (numGridCols * 6)) { // for drum section tile activation (only one at a time)
    updateNoteCatalogue(currentTile, false, false);
  }
  else if (key === 16) { // for bass/lead, once ctrl is released
    var origTile = tilesToUpdate[0]; // is used to know which tiles to deactivate when deactivating a long note
    var length = timePerTile * tilesToUpdate.length;
    for (i = 0; i < tilesToUpdate.length; i++) {
      if (i === 0 && tilesToUpdate.length === 1) { // for notes of only 1 tile long
        updateNoteCatalogue(tilesToUpdate[i], false, false, origTile, length);
      }
      if (i === 0 && tilesToUpdate.length > 1) { // for the first tile of a long note
        updateNoteCatalogue(tilesToUpdate[i], true, false, origTile, length);
      }
      else if (i > 0) { // for all remaining 'sustain tiles' of a long note
        updateNoteCatalogue(tilesToUpdate[i], false, true, origTile); // sustain tiles
        console.log("First tile this belongs to: " + origTile);
      }
    }
    tilesToUpdate = [];
  }
}
*/




var isPlaying;
var alreadyPlaying = false;
var clock = 0;
function transportPlay() {
  if (alreadyPlaying === false) {
    resetTiming();
    isPlaying = setInterval(playLoop, timePerTile);
    alreadyPlaying = true;
  }
}

function transportPause() {
  clearInterval(isPlaying);
  alreadyPlaying = false;

}

function transportStop() {
  for (i = 0; i < audioArray.length; i++) {
    audioArray[i].pause();
  }

  clearInterval(isPlaying);
  resetPlayheadToZero();
  alreadyPlaying = false;
}

var playheadMoveAmount = parseInt(document.getElementById("1").offsetLeft - document.getElementById("0").offsetLeft);
var lastTile = numGridCols - 1;
var playheadMax = document.getElementById(lastTile).offsetLeft + document.getElementById(lastTile).offsetWidth;
var playheadColumn = 0; // out of 0-(numGridCols-1)
var n = playheadPos;
function playLoop() {
  playheadColumn = (playheadPos - n) / playheadMoveAmount;
  playheadPos += playheadMoveAmount;
  playheadLine.style.left = playheadPos;
  if (playheadPos >= playheadMax) {
    resetPlayheadToZero();
  }
  playFilesAtColumn(playheadColumn);

}

var voicesDrums = 0;
var voicesBass = false;
var voicesLead = false;
var audioArray = [];
function playFilesAtColumn(col) {
  function playSound(col, row) {
    if (noteCatalogue[col][row].status !== false) {
      if (row < 6) {
        eval(noteCatalogue[col][row].soundFunction);
      }
      else if (row >= 6) {
        //console.log("sounds." + noteCatalogue[col][row][0] + "(\"" + noteCatalogue[col][row][8] + "\", " + noteCatalogue[col][row][7] + ")");
        eval("sounds." + noteCatalogue[col][row].soundFunction + "(\"" + noteCatalogue[col][row].note + "\", " + noteCatalogue[col][row].length + ")");
      }
    }
  }
  for (r = 0; r < 30; r++) { // each iteration of this loop plays all of the sound files associated with the activated tiles in the column specified by 'col'
      playSound(col, r);
    }
// Drums = row 0-5
// Bass = row 6-17
// Lead = row 18-29
// Note catalogue's lowest sub-array goes like this: 0 = filepath; 1 = active status; 2 = previous color; 3 = cell ID;
}

setDefaultTiles();
