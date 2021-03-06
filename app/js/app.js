$(document).ready(function(){
  onLoadEvent();
  $(".expanded").show("fast").delay(4000);
  $(".expanded").hide("fast");
});

$('video').resize(function() {
  resetCanvas();
});

var video = document.getElementById("vid");
var canvas = document.getElementById('myCanvas');
canvas.addEventListener("mouseover", function() {
  drawText("Draw gesture here");
});
canvas.addEventListener("mouseout", function() {
  drawText("");
});
var duration, currTime, volume, speed, timeChunk;

var timerId = window.setInterval(function(t){
  if (video.readyState > 0) {
    duration = video.duration;
    currTime = video.currentTime;
    timeChunk = duration / 20;
    if (timeChunk < 15)
      timeChunk = 15;
    volume = video.volume;
    speed = video.playbackRate;
    resetCanvas();
    clearInterval(timerId);
  }
}, 100);


if( video.hasAttribute("controls") ){
  //removes controls programmatically because of chrome screen resize problem
  video.removeAttribute("controls")
}

$(".help").on("click", function() {
  $(".expanded").toggle("fast");
});

var _isDown, _points, _r, _g, _rc;

function onLoadEvent() {
  vidSize = video.width;

  _points = new Array();
  _r = new DollarRecognizer();

  canvas.width = canvas.width;

  _g = canvas.getContext('2d');
  _g.fillStyle = "#000";
  _g.strokeStyle = "#000";
  _g.lineWidth = 3;

  resetCanvas();
}

function resetCanvas() {
  _g = canvas.getContext('2d');
  _rc = getCanvasRect(canvas); // canvas rect on page
  _g.fillStyle = "#7a9fbf";
  _g.fillRect(0, 0, _rc.width, 20);

  _isDown = false;
}

function videoControl(str) {
  $('.outline').toggleClass('outline');
  switch(str) {
    case "play":
      $('#play').toggleClass('outline');
      video.play();
      break;
    case "pause":
      $('#pause').toggleClass('outline');
      video.pause();
      break;
    case "decrease screen size":
      $('#size').toggleClass('outline');
      changeScreenSize(false);
      break;
    case "increase screen size":
      $('#size').toggleClass('outline');
      changeScreenSize(true);
      break;
    case "volume up":
      $('#volume').toggleClass('outline');
      video.muted = false;
      if (volume === 1)
        video.volume = 1;
      else
        volume = video.volume += 0.2;
      break;
    case "volume down":
      $('#volume').toggleClass('outline');
      if (volume === 0)
        video.volume = 0;
      else {
        video.muted = false;
        volume = video.volume -= 0.2;
      }
      break;
    case "rewind":
      $('#position').toggleClass('outline');
      currTime = video.currentTime - timeChunk;
      if (currTime <= 0)
        currTime = video.currentTime = 0;
      else
        video.currentTime = currTime;
      break;
    case "fast forward":
      $('#position').toggleClass('outline');
      currTime = video.currentTime + timeChunk;
      if (currTime >= duration)
        currTime = video.currentTime = duration;
      else
        video.currentTime = currTime;
      break;
    case "speed up":
      $('#speed').toggleClass('outline');
      if (speed >= 5)
        speed = video.playbackRate = 5;
      else
        speed = video.playbackRate += 0.5;
      console.log(video.playbackRate);
      break;
    case "slow down":
      $('#speed').toggleClass('outline');
      if (speed <= 0.5)
        speed = video.playbackRate = 0.5;
      else
        speed = video.playbackRate -= 0.5;
      console.log(video.playbackRate);
      break;
    case "mute":
      $('#mute').toggleClass('outline');
      video.muted = true;
      break;
    default:
      console.log("invalid control");
  }
}

function changeScreenSize(sign) {
  var screenSize = $(document).width()
  if(sign) {
    if(vidSize === screenSize)
      return;
    else
      vidSize += 50;
  }
  else {
    if(vidSize === 200)
      return;
    else
      vidSize -= 50;
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
      resetCanvas();
    }
    else // fewer than 10 points were inputted
      drawText("Try again");
  }
}

function drawText(str) {
  _g.font = "16px Arial";
  _g.fillStyle = "#7a9fbf";
  _g.fillRect(0, 0, _rc.width, 20);
  _g.fillStyle = "#000";
  _g.fillText(str, 1, 14);
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