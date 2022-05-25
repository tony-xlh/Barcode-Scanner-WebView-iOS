var barcodeReader;
var decoding = false;
var localStream;
var interval;
var scannerContainer = document.querySelector(".scanner");
var home = document.querySelector(".home");
var timeoutAfterScan = 100;
document.getElementsByClassName("camera")[0].addEventListener('loadeddata',onPlayed, false);

init();

async function init(){
  console.log("init");
  Dynamsoft.DBR.BarcodeReader.license = "DLS2eyJoYW5kc2hha2VDb2RlIjoiMjAwMDAxLTE2NDk4Mjk3OTI2MzUiLCJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSIsInNlc3Npb25QYXNzd29yZCI6IndTcGR6Vm05WDJrcEQ5YUoifQ==";
  barcodeReader = await Dynamsoft.DBR.BarcodeReader.createInstance();
  document.getElementById("status").innerHTML = "";
}

function resumeScan(){
  if (localStream) {
    var camera = document.getElementsByClassName("camera")[0];
    camera.play();
    startDecodingLoop();
  }
}

function pauseScan(){
  if (localStream) {
    clearInterval(interval);
    var camera = document.getElementsByClassName("camera")[0];
    camera.pause();
  }
}

function isCameraOpened(){
  if (localStream) {
    return "yes";
  }else{
    return "no";
  }
}

function startScan(){
  console.log("start scan");
  decoding = false;
  scannerContainer.style.display = "";
  home.style.display = "none";
  play(true);
}

function play(faceBack) {
  stop();
  var constraints = {};

  if (faceBack === true){
    constraints = {
        video: {facingMode: { exact: "environment" }},
        audio: false
    }
  }else{
    constraints = {
        video: true,
        audio: false
    }
  }

  navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
    localStream = stream;
    var camera = document.getElementsByClassName("camera")[0];
    // Attach local stream to video element
    camera.srcObject = stream;
  }).catch(function(err) {
      console.error('getUserMediaError', err, err.stack);
      alert(err.message);
      if (faceBack === true) { //for pc devices
        play(false);
      }
  });
}

function stop(){
  clearInterval(interval);
  try{
      if (localStream){
          localStream.getTracks().forEach(track => track.stop());
      }
  } catch (e){
      alert(e.message);
  }
}

function onPlayed() {
  updateSVGViewBoxBasedOnVideoSize();
  startDecodingLoop();
}

function updateSVGViewBoxBasedOnVideoSize(){
  var camera = document.getElementsByClassName("camera")[0];
  var svg = document.getElementsByTagName("svg")[0];
  svg.setAttribute("viewBox","0 0 "+camera.videoWidth+" "+camera.videoHeight);
}

function startDecodingLoop(){
  decoding = false;
  var svg = document.getElementsByTagName("svg")[0];
  svg.innerHTML = "";

  clearInterval(interval);
  //1000/25=40
  interval = setInterval(decode, 40);
}

async function decode(){
  if (decoding === false && barcodeReader) {
    var video = document.getElementsByClassName("camera")[0];
    decoding = true;
    var barcodes = await barcodeReader.decode(video);
    drawOverlay(barcodes);
    if (barcodes.length > 0) {
      setTimeout(function(){
        pauseScan();
          
        try {
             webkit.messageHandlers.onScanned.postMessage(barcodes[0].barcodeText);
         } catch(err) {
             console.log('The native context does not exist yet');
         }

      },timeoutAfterScan);
      return;
    }
    decoding = false;
  }
}

function drawOverlay(barcodes){
  var svg = document.getElementsByTagName("svg")[0];
  svg.innerHTML = "";
  for (var i=0;i<barcodes.length;i++) {
    var barcode = barcodes[i];
    console.log(barcode);
    var lr = barcode.localizationResult;
    var points = getPointsData(lr);
    var polygon = document.createElementNS("http://www.w3.org/2000/svg","polygon");
    polygon.setAttribute("points",points);
    polygon.setAttribute("class","barcode-polygon");
    var text = document.createElementNS("http://www.w3.org/2000/svg","text");
    text.innerHTML = barcode.barcodeText;
    text.setAttribute("x",lr.x1);
    text.setAttribute("y",lr.y1);
    text.setAttribute("fill","red");
    text.setAttribute("font-size","20");
    svg.append(polygon);
    svg.append(text);
  }
}

function getPointsData(lr){
  var pointsData = lr.x1+","+lr.y1 + " ";
  pointsData = pointsData+ lr.x2+","+lr.y2 + " ";
  pointsData = pointsData+ lr.x3+","+lr.y3 + " ";
  pointsData = pointsData+ lr.x4+","+lr.y4;
  return pointsData;
}
