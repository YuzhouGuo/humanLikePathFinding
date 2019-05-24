//load in the map in txt form
//we will set the canvas to X8 for the huge 
//chossing "den312d.txt" map
//add extra cost to smooth the path
//start/end node near the wall????
function preload(){
  gameMap = loadStrings("den312d.txt");
  //gameMap = loadStrings("rmtst01.txt");
  //gameMap = loadStrings("isound1.txt");
  //gameMap = loadStrings("ost102d.txt");
  //gameMap = loadStrings("brc000d.txt");
}

// How many columns and rows?
var scal = 5;
var cols;
var rows;
var gameMap;

// This will be the 2D array, 1D for now
var grid;

// Open and closed set
var openSet = [];
var closedSet = [];
var ava = [];

// Start and end
var start;
var end;
var current;

// Width and height of each cell of grid
var w, h;

// The road taken
var path = [];

// The total length of path so far
var pLength;

// var dia = dist(1, 1, 0, 0);
// var straight = dist(1, 1, 0, 1);

function Spot(i, j) {

  // Location
  this.i = i;
  this.j = j;

  // f, g, and h values for A*
  this.f = 0;
  this.g = 0;
  this.h = 0;

  // Neighbors array
  this.neighbors = [];

  // the parent of this current Spot
  this.previous = undefined;

  var splitString = split(gameMap[this.j+4], "");
  //console.log(splitString);
  
  if(splitString[this.i] == '.'){
    this.wall = false;
  }
  else{
    this.wall = true;
  }

  // Display me
  this.show = function(color) {
    if (this.wall) {
      fill(50);
      noStroke();
      //ellipseMode(CORNER);
      // //draw the walls as little black dots
      ellipse
      (this.i * w + w / 1.5, this.j * h + h / 1.5, w / 1.5, h / 1.5);
    } 
    else if (color){
      fill(color);
      //draw the normal Spots as white boxes
      // rect(this.i * w, this.j * h, w, h,30);
      //ellipseMode(CORNER);
      ellipse
      (this.i * w + w / 1.5, this.j * h + h / 1.5, w / 1.5, h / 1.5);
    }
    
  }

  // Figure out who my neighbors are and then add to the array
  // cases to consider from eight directions
  this.addNeighbors = function(grid) {
    var i = this.i;
    var j = this.j;
    if (i < rows - 1) {
      this.neighbors.push(grid[i + 1][j]);
    }
    if (i > 0) {
      this.neighbors.push(grid[i - 1][j]);
    }
    if (j < cols - 1) {
      this.neighbors.push(grid[i][j + 1]);
    }
    if (j > 0) {
      this.neighbors.push(grid[i][j - 1]);
    }
    //we can also go diagonal
    if (i > 0 && j > 0) {
      this.neighbors.push(grid[i - 1][j - 1]);
    }
    if (i < rows - 1 && j > 0) {
      this.neighbors.push(grid[i + 1][j - 1]);
    }
    if (i > 0 && j < cols - 1) {
      this.neighbors.push(grid[i - 1][j + 1]);
    }
    if (i < rows - 1 && j < cols - 1) {
      this.neighbors.push(grid[i + 1][j + 1]);
    }
  } 
}

/*
 * Calculates the angle ABC (in radians) 
 *
 * A first point, ex: {x: 0, y: 0}
 * C second point
 * B center point
 */
function find_angle(A,B,C) {
  var AB = Math.sqrt(Math.pow(B.i-A.i,2)+ Math.pow(B.j-A.j,2)); 
  var BC = Math.sqrt(Math.pow(B.i-C.i,2)+ Math.pow(B.j-C.j,2)); 
  var AC = Math.sqrt(Math.pow(C.i-A.i,2)+ Math.pow(C.j-A.j,2));
  return Math.acos((BC*BC+AB*AB-AC*AC)/(2*BC*AB));
}

function getLastTwoNum(line){
  var arr = splitTokens(line, " ");
  var temp = arr[1];
  return temp;
}

// Function to delete element from the array
function removeFromArray(arr, elt) {
  // from the end of the array so that we won't miss one
  for (var i = arr.length - 1; i >= 0; i--) {
    if (arr[i] == elt) {
      arr.splice(i, 1);
    }
  }
}

// An educated guess of how far it is between two points
function heuristic(a, b) {
  var d = dist(a.i, a.j, b.i, b.j);
   //var d = abs(a.i - b.i) + abs(a.j - b.j); //optional to use
  
  return d;
}

function findLength(path){
  for (var k = 0; k < path.length-1; k++){
      pLength += 
        dist(path[k].i, path[k].j, path[k+1].i, path[k+1].j);
  }
  return pLength;
}

function setup() {
  //So they are now finally integers
  cols = parseInt(getLastTwoNum(gameMap[1]));
  rows = parseInt(getLastTwoNum(gameMap[2]));
  
  var colDisplay = cols*scal;
  var rowDisplay = rows*scal;
  
  createCanvas(rowDisplay, colDisplay);
  // createCanvas(rowDisplay, colDisplay, WEBGL);
  // bezierDetail(1);
  
  console.log('A* running...');

  // Grid cell size
  w = width / rows;
  h = height / cols;
  
  pLength = 0;

  grid = new Array(rows);
  // Making a 2D array
  for (var i = 0; i < rows; i++) {
    grid[i] = new Array(cols);
  }
  
  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < cols; j++) {
      //using the gameMap we just read to initialize the Spot
      grid[i][j] = new Spot(i, j);
      if(grid[i][j].wall == false){
        //console.log("Even here???");
        ava.push(grid[i][j]);
      }
    }
  }
  // All the neighbors
  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < cols; j++) {
      grid[i][j].addNeighbors(grid);
    }
  }

  // Start and end
  start = random(ava); //very top-left node
  end = random(ava); //very down-right node
  // start = grid[20][20];
  // end = grid[71][135];
  // start = grid[7][7];
  // end = grid[7][70];
  
  // openSet starts with beginning only
  openSet.push(start);
}

function draw() {
  // Am I still searching?
  if (openSet.length > 0) {
    // Best next option
    var winner = 0;
    for (var i = 0; i < openSet.length; i++) {
      if (openSet[i].f < openSet[winner].f) {
        winner = i;
      }
    }
    current = openSet[winner];

    // Best option moves from openSet to closedSet
    removeFromArray(openSet, current);
    closedSet.push(current);

    // Check all the neighbors
    var neighbors = current.neighbors;
    for (var i = 0; i < neighbors.length; i++) {
      var neighbor = neighbors[i]; 
     // we will go through them one by one
     // say we go for the first neighbour
      var wallPenal = 0;
      var goThrough = neighbor.neighbors;
      for (var p = 0; p < goThrough.length; p++) {
        if(goThrough[p].wall === true){
          wallPenal = wallPenal + 0.4;
        }
        var neis = goThrough[p].neighbors;
        for (var q = 0; q < neis.length; q++) {
          if(neis[q].wall === true){
            wallPenal = wallPenal + 0.1;
          }
        }
      }

      // Valid next spot? -- if not the case then just skip
      if (!closedSet.includes(neighbor) && !neighbor.wall) {
        //temp f just testing for now
        var tempG = current.g + heuristic(current, neighbor);
        var parent;
        if(current === start){
          parent = current; // in this case equal to itself
        }
        else{
          parent = current.previous;
        }
        
        var result = find_angle(neighbor, current, parent);
        result = (result * 180) / Math.PI;
        if(result <= 90){ 
          tempG = tempG + 3;
        }   
        tempG = tempG + wallPenal;
          
        // Is this a better path than before?
        var newPath = false;
        if (openSet.includes(neighbor)) {
          if (tempG < neighbor.g) {
            neighbor.g = tempG;
            newPath = true;
          }
        } 
        else { //say that we don't have it in the open set
          neighbor.g = tempG;
          newPath = true;
          openSet.push(neighbor);
        }

        // Yes, it's a better path
        if (newPath) {        
          neighbor.h = heuristic(neighbor, end);
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.previous = current;
        }
      }
    }
    // finishing?
    if (current === end) {
      noLoop();
      clear(); //clear the canvas
      background(255); //draw the map again
      for (var i = 0; i < rows; i++) {
        for (var j = 0; j < cols; j++) {
          if(grid[i][j]==start || grid[i][j]==end){
            grid[i][j].show(color(255, 0, 50, 50));
          }
          else{
            grid[i][j].show(); //normal nodes in white color
          }
        }
      }
      
      for (var i = 0; i < closedSet.length; i++) {
        closedSet[i].show(color(200, 0, 50, 50)); 
        //closedSet nodes in red color
      }

      for (var i = 0; i < openSet.length; i++) {
        openSet[i].show(color(0, 20, 250, 50));
        //openSet nodes in blue/purple color
      }
      
      path = [];
      var temp = current;
      path.push(temp);
      while (temp.previous) {
        path.push(temp.previous);
        temp = temp.previous;
      }
      // Drawing path as continuous line 
      noFill();
      stroke(50, 30, 100, 220); // path in blue/purpleish color
      strokeWeight(w/1.5);
      var len = ((path.length / 3) - 1)*3;
      var a;
      for (a = 0; a < len; a+=3) {
        bezier
        (path[a].i*scal+ w / 1.5, path[a].j*scal+ h / 1.5, 
         path[a+1].i*scal+ w / 1.5, path[a+1].j*scal+ h / 1.5, 
         path[a+2].i*scal+ w / 1.5, path[a+2].j*scal+ h / 1.5, 
         path[a+3].i*scal+ w / 1.5, path[a+3].j*scal+ h / 1.5);
      }
      // draw a line if we are missing steps
      if(path[a] !== path[path.length-1]){
        // stroke(255, 102, 0); //orange
        line
        (path[a].i*scal+ w/1.5, 
         path[a].j*scal+ h/1.5,
        path[path.length-1].i*scal+ w/1.5, 
         path[path.length-1].j*scal+ h/1.5);
      }
      
      console.log("DONE!");
      var pathLength = findLength(path);
      console.log
      ("The total length of the path is " + nf(pathLength, 0, 2) + " units");
      var t = millis()/1000;
      console.log("Total: " + nf(t, 0, 2) + " seconds");
      var explore = 
          ((openSet.length + closedSet.length)/ava.length)*100;
      console.log
      ("The exlopration percentage is: "+nf(explore, 0, 2)+"%");
      
      var walls = 0;
      var sharp = 0;
      for (var p = 0; p < path.length; p++) {
        if((p!=0) && (p!=path.length-1)){
          var res = find_angle(path[p-1], path[p], path[p+1]);
          res = (res * 180) / Math.PI;
          if(res <= 90){ 
            sharp = sharp + 1;
          }  
        }
        
        if(path[p] === start || path[p]===end){
          continue;
        }
        var nei = path[p].neighbors;
        for(var q = 0; q < nei.length; q++){
          if(nei[q].wall == true){
            walls = walls + 1;
            break;
          }
        }
      }
      var wa = walls/path.length*100;
      console.log("sharp turns: "+sharp);
      console.log
      ("This time, we have "+nf(wa, 0, 2)+"% of the nodes near wall");
      
    }
  } 
  else {
    console.log('no solution');
    noLoop();
    return;
  }

  if(current === end){
    console.log("Here is the path after Bezier curving!");
  }
  else{
  // Draw current state of everything
  background(255);

  for (var i = 0; i < rows; i++) {
    for (var j = 0; j < cols; j++) {
      if(grid[i][j]==start || grid[i][j]==end){
        grid[i][j].show(color(255, 0, 50, 50));
      }
      else{
        grid[i][j].show(); //normal nodes in white color
      }
    }
  }

  for (var i = 0; i < closedSet.length; i++) {
    closedSet[i].show(color(200, 0, 50, 50)); 
    //closedSet nodes in red color
  }

  for (var i = 0; i < openSet.length; i++) {
    openSet[i].show(color(0, 20, 250, 50));
    //openSet nodes in blue/purple color
  }

  // Find the path by working backwards
  // trace back everybody's parents to get a full path
  path = [];
  var tempp = current;
  path.push(tempp);
  while (tempp.previous) {
    path.push(tempp.previous);
    tempp = tempp.previous;
  }

  // Drawing path as continuous line by writing this in draw() method
  noFill();
  stroke(50, 30, 100, 220); // path in blue/purpleish color
  strokeWeight(w / 1.5);
  beginShape();
  for (var i = 0; i < path.length; i++) {
    vertex(path[i].i * w + w / 2, path[i].j * h + h / 2);
  }
  endShape();
 }
}
