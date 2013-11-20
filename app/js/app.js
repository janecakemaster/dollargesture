$(document).ready(onLoadEvent).delay(1000);

var video = document.getElementById("vid");
var canvas = document.getElementById('myCanvas');
var duration = video.duration;
var currTime = video.currentTime;
var timeChunk = duration / 20;
if (timeChunk > 15)
  timeChunk = 15;
var vidSize = video.width;
var top = 0;
var left = 0;

if( video.hasAttribute("controls") ){
  //removes controls programmatically because of chrome screen resize problem
  video.removeAttribute("controls")
}

$(".help").on("click", function() {
  $(".expanded").toggle("fast");
});

var _isDown, _points, _r, _g, _rc;

function onLoadEvent() {
  console.log("loading");
  _points = new Array();
  _r = new DollarRecognizer();

  canvas.width = canvas.width;

  _g = canvas.getContext('2d');
  _g.fillStyle = "#000";
  _g.strokeStyle = "#000";
  _g.lineWidth = 3;
  _g.font = "16px Arial";

  _rc = getCanvasRect(canvas); // canvas rect on page
  _g.fillStyle = "#7a9fbf";
  _g.fillRect(0, 0, _rc.width, 20);

  _isDown = false;
}

function videoControl(str) {
  switch(str) {
    case "play":
      video.play();
      // overlay
      break;
    case "pause":
      video.pause();
      break;
    case "decrease screen size":
      changeScreenSize(false);
      break;
    case "increase screen size":
      changeScreenSize(true);
      break;
    case "volume up":
      video.muted = false;
      video.pause();
      break;
    case "volume down":
      video.muted = false;
      video.pause();
      break;
    case "rewind":
      video.pause();
      break;
    case "fast forward":
      video.pause();
      break;
    case "speed up":
      video.pause();
      break;
    case "slow down":
      video.pause();
      break;
    case "mute":
      video.muted = true;
      break;
    default:
      console.log("invalid control");
  }
  _rc = getCanvasRect(canvas); // canvas rect on page
}

function changeScreenSize(sign) {
  var screenSize = $(document).width()
  if(sign) {
    if(vidSize === screenSize)
      return;
    else {
      vidSize += 50;
    }
  }
  else {
    if(vidSize === 200)
      return;
    else {
      vidSize -= 50;
    }
  }
  video.width = vidSize;
}

function getCanvasRect(canvas) {
  var w = canvas.width;
  var h = canvas.height;

  var cx = canvas.offsetLeft;
  var cy = canvas.offsetTop;

  while (canvas.offsetParent != null) {
    canvas = canvas.offsetParent;
    cx += canvas.offsetLeft;
    cy += canvas.offsetTop;
  }

  return {x: cx, y: cy, width: w, height: h};
}

function getScrollY() {
  var scrollY = 0;
  if (typeof(document.body.parentElement) != 'undefined')
    scrollY = document.body.parentElement.scrollTop; // IE
  else if (typeof(window.pageYOffset) != 'undefined')
    scrollY = window.pageYOffset; // FF
  return scrollY;
}

function mouseDownEvent(x, y) {
  document.onselectstart = function() { return false; } // disable drag-select
  document.onmousedown = function() { return false; } // disable drag-select

  _isDown = true;
  x -= _rc.x;
  y -= _rc.y - getScrollY();

  if (_points.length > 0)
    _g.clearRect(0, 0, _rc.width, _rc.height);

  _points.length = 1; // clear
  _points[0] = new Point(x, y);
  drawText("Draw gesture here");
  _g.fillRect(x - 4, y - 3, 9, 9);
}

function mouseMoveEvent(x, y) {
  if (_isDown) {
    x -= _rc.x;
    y -= _rc.y - getScrollY();

    _points[_points.length] = new Point(x, y); // append
    drawConnectedPoint(_points.length - 2, _points.length - 1);
  }
}

function mouseUpEvent(x, y) {
  document.onselectstart = function() { return true; } // enable drag-select
  document.onmousedown = function() { return true; } // enable drag-select

  if (_isDown) {
    _isDown = false;
    if (_points.length >= 10) {
      var result = _r.Recognize(_points, false);
      var name = result.Name;
      drawText(name);
      videoControl(name);
    }
    else // fewer than 10 points were inputted
      drawText("Too few points made. Please try again.");
  }
}

function drawText(str) {
  _g.fillStyle = "#7a9fbf";
  _g.fillRect(0, 0, _rc.width, 20);
  _g.fillStyle = "#000";
  _g.fillText(str, 1, 14);
  _g.font = "bold";
}

function drawConnectedPoint(from, to) {
  _g.beginPath();
  _g.moveTo(_points[from].X, _points[from].Y);
  _g.lineTo(_points[to].X, _points[to].Y);
  _g.closePath();
  _g.stroke();
}

// round 'n' to 'd' decimals
function round(n, d) {
  d = Math.pow(10, d);
  return Math.round(n * d) / d
}

