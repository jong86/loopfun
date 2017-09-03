var instDrums = [
  "bd",
  "sn",
  "ch",
  "oh",
  "cy",
  "cb"
];

var instBass = [
  "c#",
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

var instLead = instBass;

var numGridCols = 64; // offer option to link each bar to make it easier to do loops, or make simple/expert versions

var noteMatrix = [];
numGridRows = instDrums.length + instBass.length + instLead.length;
for (r = 0; r < numGridRows; r++) {
  for (c = 0; c < numGridCols; c++) {
    noteMatrix.push([r, c]);
  };
};

var cellIdent = 0;
var currentY = 0;
var state = 0;
var noteCatalogue = [];
for (i = 0; i < numGridCols; i++) {
  noteCatalogue.push([]);
  for (row of instDrums) {
    var previous_color = "none";
    filepath = "assets/sounds/drums/" + row + ".wav";
    noteArray = [filepath, false, previous_color];
    noteCatalogue[i].push(noteArray);
  }
  for (row of instBass) {
    var previous_color = "none";
    filepath = "assets/sounds/bass/" + row + ".wav";
    noteArray = [filepath, false, previous_color];
    noteCatalogue[i].push(noteArray);
  }
  for (row of instLead) {
    var previous_color = "none";
    filepath = "assets/sounds/lead/" + row + ".wav";
    noteArray = [filepath, false, previous_color];
    noteCatalogue[i].push(noteArray);
  }
}

console.log(noteCatalogue[0][0][0]);

function updateNoteCatalogue(x, y, note, cellIdent) {
  cell = document.getElementById(cellIdent);
  previous_color = cell.style.backgroundColor;
  if (noteCatalogue[x][y][1] === false) {
    noteCatalogue[x][y][1] = true;
    cell.style.backgroundColor = "#00FF99";
  } else {
    noteCatalogue[x][y][1] = false;
    cell.style.backgroundColor = noteCatalogue[x][y][2];
  }
  noteCatalogue[x][y][2] = previous_color;
  console.log(noteCatalogue[x][y]);
}

function populateRow(row, inst) {
  var i;
  var tdString = "";
  var barPos = 0;
  var bgColor;
  for (i = 0; i < numGridCols; i++) {
    var tdAddStyle = "";
    if (barPos === 0) {
      bgColor = "#F63D2F";
    }
    if (barPos === 4) {
      bgColor = "#F69A2F";
    }
    if (barPos === 8) {
      bgColor = "#F6C72F";
    }
    if (barPos === 12) {
      bgColor = "#DECB8D";
    }
    tdAddStyle += "background-color: " + bgColor + ";";
    tdString += "<td class=\'noteGrid\' id=\'" + cellIdent + "\' style=\'" + tdAddStyle + "\' data-xpos=\'" + i + "\' data-ypos=\'" + currentY + "\' data-note=\'" + row + "\' onclick=\'updateNoteCatalogue(" + i + ", " + currentY + ", \"" + row + "\", " + cellIdent + ")'></td>";
    cellIdent++;
    barPos++;
    if (barPos > 15) {
      barPos = 0;
    }
  };
  var rowString;
  rowString = "<tr class=" + inst + "><td id=rowIdentifier>" + row + "</td>" + tdString + "</tr>";
  currentY++;
  return rowString;
};

// Creates table of instrument labels and note grid
var b = document.getElementById("tableBody");
for (row of instDrums) {
  b.innerHTML += populateRow(row, "rowDrums");
};
for (row of instBass) {
  b.innerHTML += populateRow(row, "rowBass");
};
for (row of instLead) {
  b.innerHTML += populateRow(row, "rowLead");
};

var noteGridObj = { // thought this would make creating the playheadLine easier but not sure if necessary
  edgeLeft: 0,
  edgeRight: 0,
  edgeTop: document.getElementById("tableHeading").offsetHeight + 2,
  edgeBottom: 0,
  topLeftCell: {
    topSide: document.getElementById("0").offsetTop,
    leftSide: document.getElementById("0").offsetLeft,
  },
  bottomLeftCell: {
    bottomSide: document.getElementById("1856").offsetTop + document.getElementById("1856").offsetHeight,
  },
  topRightCell: document.getElementById("63"),
  bottomRightCell: document.getElementById("1919"),
};

playheadLine = document.getElementById("playheadLine");
playheadLine.style.position = "absolute";
playheadLine.style.width = "3px";
playheadLine.style.height = (noteGridObj.bottomLeftCell.bottomSide - noteGridObj.topLeftCell.topSide) + 5;
playheadLine.style.backgroundColor = "#00FF00";
playheadLine.style.top = noteGridObj.edgeTop;

var playheadPos;
function resetPlayheadToZero() {
  playheadPos = parseInt(noteGridObj.topLeftCell.leftSide) ;
  playheadLine.style.left = playheadPos;
}
resetPlayheadToZero();

var timeline = {
  start: document.getElementById("0").offsetLeft,
  end: document.getElementById("1919").offsetLeft + document.getElementById("1919").style.width,
}
var bpm = 120; // 120 bpm * 4 = 480 1/16th per minute / 60 = 8 1/16th notes per second


var playheadMoveAmount = parseInt(document.getElementById("1").offsetLeft - document.getElementById("0").offsetLeft);

//console.log(parseInt(document.getElementById("mainTable").style.borderSpacing));

window.addEventListener("resize", windowResize);
function windowResize() { // handles everything needed when window is resized
  resetPlayheadToZero();
}

var isPlaying;
var clock = 0;
function transportPlay() {
  isPlaying = setInterval(playLoop, 15000 / bpm);
}

function transportPause() {
  clearInterval(isPlaying);

}

function transportStop() {
  clearInterval(isPlaying);
  resetPlayheadToZero();
}

playheadMax = document.getElementById("63").offsetLeft + document.getElementById("63").offsetWidth;
playheadColumn = 0; // out of 0-63
n = playheadPos;
function playLoop() {
  playheadColumn = (playheadPos - n) / playheadMoveAmount;
  playheadPos += playheadMoveAmount;
  playheadLine.style.left = playheadPos;
  if (playheadPos >= playheadMax) {
    resetPlayheadToZero();
  }
  console.log(playheadColumn);
  playFilesAtColumn(playheadColumn);
}

function playFilesAtColumn(col) {
  for (i = 0; i < 30; i++) { // each iteration of this loop plays all of the sound files associated with the activated tiles in the column specified by 'col'
    if (noteCatalogue[col][i][1] !== false) {
      var sound = new Audio(noteCatalogue[col][i][0]);
      sound.play();
    }
  }
}

console.log(noteCatalogue.length);
