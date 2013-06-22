//console.log("starting app...");

var pixelRatio          = 1 // kuku
,   mouseX              = 0
,   mouseY              = 0
,   canvas              = document.getElementById('canvas')
,   ctx                 = "none"
,   horizontalCount     = 10
,   verticalCount       = 10
,   blockWidth          = 15
,   blockHeight         = 15
,   food                = []
,   initialFoodCount    = 10
,   snake               = []
,   snake2              = []
,   snakeLength         = 1
,   snakeX              = 0
,   snakeY              = 0
,   snake2X             = 0
,   snake2Y             = 0
,   snakeDirection      = 0
,   state               = -1  //-1 - loading; 0 - main menu; 1 - plaing; 2 - game over
,   borderSpacing       = 10
,   touchStartState     = 0
,   touchStartX         = 0   // touch sceen variables |
,   touchStartY         = 0   //                       |
,   touchEndedX         = 0   //                       |
,   touchEndedY         = 0   //                       v
,   lastFrameDraw       = 0
,   lastTimeMovedThere  = 0
,   autoMoveInterval    = 200
,   playX               = 0
,   playY               = 0
,   longIphone          = 0
,   longIphone2         = 0
,   pixelRatio2         = 0
,   TTDF                = 0   // Time To Draw Frame
,   TTDFarray           = []
;

var picturesToLoad = [];
var loadedPictures = {};
var loadedPicturesCounter = 0;

var mouseX = 0, mouseY = 0;

function init2() {
   //console.log("init2()");
   canvas = document.getElementById('canvas');
   ctx = canvas.getContext("2d");
   
   pixelRatio = window.devicePixelRatio || 1;
   
   // choosing the right food image size
   if (pixelRatio > 1) {
      //blockWidth = blockWidth / pixelRatio;
      //blockHeight = blockHeight / pixelRatio;
   }
   
   //console.log("init2() trying to set canvas width and height");
   //console.log("init2() canvas.width before: " + canvas.width);
   
   canvas.style.width  = document.body.clientWidth;
   canvas.style.height = document.body.clientHeight;
   canvas.width        = document.body.clientWidth;
   canvas.height       = document.body.clientHeight;
   
   //console.log("init2() canvas.width after: " + canvas.width);
   //console.log("init2() document.body.clientWidth: " + document.body.clientWidth);
   //console.log("init2() document.body.clientHeight: " + document.body.clientHeight);

   if (pixelRatio > 1) {
      canvas.setAttribute('width', canvas.width * pixelRatio);
      canvas.setAttribute('height', canvas.height * pixelRatio);
      ctx.scale(pixelRatio, pixelRatio);
   }
   
   borderSpacing = borderSpacing / pixelRatio;
   
   init3();
}

if (navigator.userAgent.search("Android") == -1) { 
	//console.log("Running on not Android");

	var canvas = document.getElementById('canvas');
	ctx = canvas.getContext("2d");

	//ctx.imageSmoothingEnabled = true;

	init3();
}

// http://creativejs.com/resources/requestanimationframe/
// https://gist.github.com/paulirish/1579671
// https://gist.github.com/rma4ok/3371337
// requestAnimationFrame polyfill by @rma4ok
!function (window) {
   var
      equestAnimationFrame = 'equestAnimationFrame',
      requestAnimationFrame = 'r' + equestAnimationFrame,
 
      ancelAnimationFrame = 'ancelAnimationFrame',
      cancelAnimationFrame = 'c' + ancelAnimationFrame,
 
      expectedTime = 0,
      vendors = ['moz', 'ms', 'o', 'webkit'],
      vendor;
 
      while (!window[requestAnimationFrame] && (vendor = vendors.pop())) {
         window[requestAnimationFrame] = window[vendor + 'R' + equestAnimationFrame];
         window[cancelAnimationFrame] =
         window[vendor + 'C' + ancelAnimationFrame] ||
         window[vendor + 'CancelR' + equestAnimationFrame];
      }
 
      if (!window[requestAnimationFrame]) {
         window[requestAnimationFrame] = function (callback) {
            var
               currentTime = +new Date,
               adjustedDelay = 16 - (currentTime - expectedTime),
               delay = adjustedDelay > 0 ? adjustedDelay : 0;
 
               expectedTime = currentTime + delay;
 
            return setTimeout(function () {
               callback(expectedTime);
            }, delay);
      };
 
      window[cancelAnimationFrame] = clearTimeout;
   }
}(this);


// -------------------------------------------------------------------------------------

function startLoadingImages() {
   for (var i=0; i<picturesToLoad.length; i++) {
      var img = new Image();
      img.src = picturesToLoad[i].picture;
      
      img.onload = function() {
         loadedPicturesCounter++;
      };
      
      loadedPictures[picturesToLoad[i].name] = img;
   }
}

function moveUp() {
   if (snakeDirection != 2 && snakeDirection != 4) {
      snakeDirection = 4;
      moveThere(snakeY - 1, snakeX, 1);
   }
}

function moveDown() {
   if (snakeDirection != 4 && snakeDirection != 2) {
      snakeDirection = 2;
      moveThere(snakeY + 1, snakeX, 1);
   }
}

function moveRight() {
   if (snakeDirection != 1 && snakeDirection != 3) {
      snakeDirection = 3;
      moveThere(snakeY, snakeX + 1, 1);
   }
}

function moveLeft() {
   if (snakeDirection != 3 && snakeDirection != 1) {
      snakeDirection = 1;
      moveThere(snakeY, snakeX - 1, 1);
   }
}

function moveThere(toY, toX, human) {
   if (+new Date - lastTimeMovedThere < autoMoveInterval && !human) {
      return;
   }

   //console.log('this part works');
   if (canSnakeMoveThere(snakeY, snakeX, toY, toX)) {

      // eating tail so that it turns in to apples 
      if(snake[toY][toX] > 0) {
         var cellThatWeAreStepingOn = snake[toY][toX];

         //console.log('stepping on ' + cellThatWeAreStepingOn  + ' tail cell');
         for(var y = 0; y < verticalCount; y++) {
            for(var x = 0; x < horizontalCount; x++) {
               if(snake[y][x] > cellThatWeAreStepingOn){
                  snake[y][x] = 0;
                  food[y][x] = 1;
               }
            }
         }

         // making the snakeLenght variable to the correct number
         snakeLength = cellThatWeAreStepingOn-1;
      }

      // moving the head to the next block
      snake[toY][toX] = 1;

      if(snakeLength == 1) {
         // cheking if where we are steping has food. if yes, we are making snake longer
         // and if not, we just swithing off where we used to be.
         if (food[toY][toX] != 1) {
            snake[snakeY][snakeX] = 0;
         } else {
            snake[snakeY][snakeX] = 2;
            //snakeLength = 2;
         }
      } else {
         // looking for the tail
         var largest = 0;
         var largestY = -1;
         var largestX = -1;

         for (var y=0; y<verticalCount; y++) {
            for (var x=0; x<horizontalCount; x++) {
               if(snake[y][x] > largest) {
                  largest = snake[y][x];
                  largestY = y;
                  largestX = x;
                  //console.log('found tail at y:' + y + '| x:' + x + '| largest:' + largest);
               }
            }
         }

         // turning the tail off
         if (food[toY][toX] != 1) {
            snake[largestY][largestX] = 0;
         } else {
            snake[largestY][largestX] = snakeLength;
         }

         // re-numbering the snake, every thing exept the head
         for (var y=0; y<verticalCount; y++) {
            for (var x=0; x<horizontalCount; x++) {
               if(snake[y][x] > 0) {
                  if (y == toY && x == toX) {
                     //console.log('this is head, we are skipping');
                  } else {
                     snake[y][x]++;
                     //console.log('re-numbering at y:' + y + '| x:' + x);
                  }
               }
            }
         }
      }

      snakeY = toY;
      snakeX = toX;

      // cheking if we are eating the food, if yes, then generate a new spot for the cherry
      if(food[snakeY][snakeX] == 1) {
         food[snakeY][snakeX] = 0;

         // putting new food on the field when eaten
         var foodPlaced = 0;
         for(var x=0; x<10 && foodPlaced == 0; x++) {
            var cordY = Math.floor(Math.random() * verticalCount);
            var cordX = Math.floor(Math.random() * horizontalCount);

            if(snake[cordY][cordX] && snake[cordY][cordX] > 0) {
               //console.log("can't place food at cordY: " + cordY + "| cordX: " + cordX + " will try again");
            } else {
               food[cordY][cordX] = 1;
               foodPlaced = 1;
            }
         }
         snakeLength++;
      }
   }
   
   
   
   lastTimeMovedThere = +new Date;
}

function canSnakeMoveThere(fromY, fromX, toY, toX) {
   if (state == 1) {
      if(toX > horizontalCount-1 || toX < 0 || toY < 0 || toY > verticalCount-1) {
         state = 2; // game over
                  
         return false;
      } else {
         return true;
      }
   }
}

function auto_move() {
   if (state == 1) {
      if(snakeDirection == 4) {
         // moving up
         moveThere(snakeY-1, snakeX, 0);
      } else if(snakeDirection == 3) {
         // moving right
         moveThere(snakeY, snakeX+1, 0);
      } else if(snakeDirection == 2) {
         // moving down
         moveThere(snakeY+1, snakeX, 0);
      } else if(snakeDirection == 1) {
         // moving left
         moveThere(snakeY, snakeX-1, 0);
      } else if(snakeDirection == 0) {
      
      }
   }
}

function init3() {
   
   
   if (navigator.userAgent.search("Android")) {
            
      if (canvas.width < 1000) {
         if (pixelRatio == 1) {
            picturesToLoad.push({ name: "food",     picture: "food-01.png" });
            picturesToLoad.push({ name: "play",     picture: "play-iphone.png"        });
            picturesToLoad.push({ name: "snake",    picture: "snake-iphone.png"       });
            picturesToLoad.push({ name: "logo",     picture: "logo-iphone.png"        });
            picturesToLoad.push({ name: "gameover", picture: "gameover-iphone.png"    });
         } else {
            picturesToLoad.push({ name: "food",     picture: "food-01@2x.png" });  
            picturesToLoad.push({ name: "play",     picture: "play-iphone@2x.png"        });
            picturesToLoad.push({ name: "snake",    picture: "snake-iphone@2x.png"       });
            picturesToLoad.push({ name: "logo",     picture: "logo-iphone@2x.png"        });
            picturesToLoad.push({ name: "gameover", picture: "gameover-iphone@2x.png"    });
         }
      } else {
         initialFoodCount = initialFoodCount + 20;
         picturesToLoad.push({ name: "play",     picture: "play-ipad.png"          });
         picturesToLoad.push({ name: "snake",    picture: "snake-ipad.png"         });
         picturesToLoad.push({ name: "logo",     picture: "logo-ipad.png"          });
         picturesToLoad.push({ name: "gameover", picture: "gameover-ipad.png"      });
      }
   } else {
      picturesToLoad.push({ name: "food", picture: "food-01.png" });
      var searchIphone = navigator.userAgent.search("iPhone");
      
      if (searchIphone > 0) {
         picturesToLoad.push({ name: "play",     picture: "play-iphone.png"        });
         picturesToLoad.push({ name: "snake",    picture: "snake-iphone.png"       });
         picturesToLoad.push({ name: "logo",     picture: "logo-iphone.png"        });
         picturesToLoad.push({ name: "gameover", picture: "gameover-iphone.png"    });
      }
      
      var searchIpad = navigator.userAgent.search("iPad");
      
      if (searchIpad > 0) {
         initialFoodCount = initialFoodCount + 20;
         picturesToLoad.push({ name: "play",     picture: "play-ipad.png"          });
         picturesToLoad.push({ name: "snake",    picture: "snake-ipad.png"         });
         picturesToLoad.push({ name: "logo",     picture: "logo-ipad.png"          });
         picturesToLoad.push({ name: "gameover", picture: "gameover-ipad.png"      });
      }
   }

   //canvas.addEventListener('mousemove', function (e) {
   //   mouseX = e.pageX - canvas.offsetLeft;
   //   mouseY = e.pageY - canvas.offsetTop;
   //   console.log("mousemove()");
   //}, 0);
   
   ctx.font = "11pt Calibri";
   ctx.strokeStyle = "red";
   
   canvas.addEventListener('touchstart', function(e) {
      //console.log("moving - touchstart()");
      touchStartState = state;
      touchStartX = e.touches[0].pageX;
      touchStartY = e.touches[0].pageY;
      mouseX = touchStartX;
      mouseY = touchStartY;
   }, 0);
   
   canvas.addEventListener('touchmove', function(e) {
      
      touchEndedX = e.touches[0].pageX;
      touchEndedY = e.touches[0].pageY;
   
      mouseX = touchEndedX;
      mouseY = touchEndedY;
   
      var xDiff = touchStartX - touchEndedX
      ,   yDiff = touchStartY - touchEndedY
      ;
      
      //console.log("moving touchmove() : touchStartX - " + touchStartX + ", touchEndedX - " + touchEndedX + ", touchStartY - " + touchStartY + ", touchEndedY - " + touchEndedY +", xDiff=" + xDiff + ', yDiff=' + yDiff);
   
      if (Math.abs(xDiff) > 20 || Math.abs(yDiff) > 20) {
         if (Math.abs(xDiff) > Math.abs(yDiff)) {
            if (xDiff < 0) {
               moveRight();
               //console.log('moving Right xDiff=' + xDiff + ' yDiff=' + yDiff);
            } else {
               moveLeft();
               //console.log('moving Left xDiff=' + xDiff + ' yDiff=' + yDiff);
            }
         } else {
            if (yDiff < 0) {
               moveDown();
               //console.log('moving Down xDiff=' + xDiff + ' yDiff=' + yDiff);
            } else {
               moveUp();
               //console.log('moving Up xDiff=' + xDiff + ' yDiff=' + yDiff);
            }
         }
            
         touchStartX = touchEndedX;
         touchStartY = touchEndedY;
      } else {
         //console.log("ignoring gesture because it is too small");
      }
            
      //console.log('touch move at ' + touchX + ' x ' + touchY);
   }, 0);
   
   canvas.addEventListener('touchend', function(e) {
      //console.log("moving - touchend()");
      var xDiff = touchStartX - touchEndedX
      ,   yDiff = touchStartY - touchEndedY
      ;
         
      if (state == 0) {
         // we are in a main menu
         //console.log('reached this point');
         if (mouseX > playX && mouseY > playY + longIphone2 && mouseX < playX + loadedPictures.play.width + longIphone2 && mouseY < playY + loadedPictures.play.height + longIphone2) {
            newGame();
            state = 1;
         } else {
            //console.log('mouseX ' + mouseX + ' playX ' + playX + ' mouseY ' + mouseY + ' playY ' + playY);
         }
      } else if (state == 1) {
         if (Math.abs(xDiff) > 10 || Math.abs(yDiff) > 10) {
            if (Math.abs(xDiff) > Math.abs(yDiff)) {
               if (xDiff < 0) {
                  moveRight();
               } else {
                  moveLeft();
               }
            } else {
               if (yDiff < 0) {
                  moveDown();
               } else {
                  moveUp();
               }
            }
         } else {
            //console.log("ignoring gesture because it is too small");
         }
      } else if (state == 2) {
         // we are in the game over screen
         
         // we want touch event to work only if it was started when game over screen was active 
         if (touchStartState == 2) {
            snakeDirection = 0;
            snakeLength = 1;
            state = 0;
            newGame();
         }
      }
         
      //console.log("touchended, processing... (xDiff:" + xDiff + ", yDiff:" + yDiff + ")");
   }, 0);
   
   draw();
   setInterval(auto_move, autoMoveInterval);

   startLoadingImages();
   
   horizontalCount = Math.floor((canvas.width / pixelRatio - (borderSpacing*2)) / blockWidth);
   verticalCount = Math.floor((canvas.height / pixelRatio - (borderSpacing*2)) / blockHeight);
}

function draw() {
   var drawStart = +new Date;
   window.requestAnimationFrame(draw);
   
   //ctx.clearRect(0, 0, canvas.width, canvas.height);
   ctx.fillStyle = 'white';
   ctx.fillRect(0, 0, canvas.width, canvas.height);
   
   if (state == -1) {      
      if (loadedPicturesCounter < picturesToLoad.length) {
         // draw loading screen
         ctx.fillStyle = "white";
         ctx.font = "20pt Calibri";
         ctx.fillText('Pocket Snake is loading...', (canvas.width / 2) - 50, (canvas.height / 2) - 25);
      } else {
         // decide where to draw Play button
         playX = ((canvas.width/pixelRatio) - (loadedPictures.play.width/pixelRatio))/2;
         playY =  35 + loadedPictures.logo.height/pixelRatio + loadedPictures.snake.height/pixelRatio;
         
         state = 0;
      }
   } else if (state == 0) {
      // draw main menu
      if (canvas.height > 1100) {
         longIphone = 100;
         longIphone2 = 20;
      }
      
      //ctx.fillStyle = "black";
      //ctx.fillText("playX: " + playX + ", playY: " + playY, 5, 15);
      //ctx.fillText("logoX: " + ((canvas.width - loadedPictures.logo.width)/2)/pixelRatio, 5, 25);
      
      ctx.drawImage(loadedPictures.logo, ((canvas.width/pixelRatio - loadedPictures.logo.width/pixelRatio)/2), 20, loadedPictures.logo.width / pixelRatio, loadedPictures.logo.height / pixelRatio);
      ctx.drawImage(loadedPictures.snake, ((canvas.width/pixelRatio - loadedPictures.snake.width/pixelRatio)/2), 30 + loadedPictures.logo.height/pixelRatio, loadedPictures.snake.width / pixelRatio, loadedPictures.snake.height / pixelRatio);
      ctx.drawImage(loadedPictures.play, playX, playY + longIphone2 - 5, loadedPictures.play.width / pixelRatio, loadedPictures.play.height / pixelRatio);
      
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, 3, 0, 6.28);
      ctx.strokeStyle = "red";
      ctx.stroke();
      ctx.closePath();
      
   } else if (state == 1) {
      // playing
      ctx.fillStyle = "#2cba30";
      ctx.fillRect(0, 0, canvas.width/pixelRatio, canvas.height/pixelRatio);

      ctx.fillStyle = "#79d87b";
      ctx.fillRect(borderSpacing, borderSpacing, canvas.width/pixelRatio-borderSpacing*2, canvas.height/pixelRatio-borderSpacing*3);

      // drawing the snake
      for (var y=0; y<verticalCount; y++) {
         for (var x=0; x<horizontalCount; x++) {
            
            if(snake[y][x]) {
               // calculate block coordinates
               var rectX = (Math.ceil(x*blockWidth)+0.5);
               var rectY = (Math.ceil(y*blockHeight)+0.5);
               //var fill = "none";
               
               // only if this is a head we draw eyes, nose and toung
               if (snake[y][x] == 1) {
                  ctx.beginPath();
                  ctx.strokeStyle = "black";
            
                  ctx.moveTo((rectX+borderSpacing) + blockWidth/2, (rectY+borderSpacing) + blockHeight/2);
                  
                  if (snakeDirection == 4 || snakeDirection == 0) { // up
                     ctx.lineTo((rectX+borderSpacing) + blockWidth/2, (rectY+borderSpacing) + blockHeight/2 - 10);
                     
                     ctx.lineTo((rectX+borderSpacing) + blockWidth/2 + 5, (rectY+borderSpacing) + blockHeight/2 - 15);
                     ctx.moveTo((rectX+borderSpacing) + blockWidth/2, (rectY+borderSpacing) + blockHeight/2 - 10);
                     ctx.lineTo((rectX+borderSpacing) + blockWidth/2 - 5, (rectY+borderSpacing) + blockHeight/2 - 15);
                  } else if (snakeDirection == 3) { // right
                     ctx.lineTo(((rectX+borderSpacing) + blockWidth/2) + 10, (rectY+borderSpacing) + blockHeight/2);
                     ctx.lineTo((rectX+borderSpacing) + blockWidth/2 + 5, (rectY+borderSpacing) + blockHeight/2 + 15);
//
//                  ctx.moveTo((rectX+borderSpacing) + blockWidth/2, (rectY+borderSpacing) + blockHeight/2 + 20);
//                   ctx.lineTo((rectX+borderSpacing) + blockWidth/2 - 10, (rectY+borderSpacing) + blockHeight/2 + 30);
               } // else if (snakeDirection == 2) {
//                   ctx.lineTo((rectX+borderSpacing) + blockWidth/2, (rectY+borderSpacing) + blockHeight/2 + 20);
//                   ctx.lineTo((rectX+borderSpacing) + blockWidth/2 + 10, (rectY+borderSpacing) + blockHeight/2 + 30);
// 
//                   ctx.moveTo((rectX+borderSpacing) + blockWidth/2, (rectY+borderSpacing) + blockHeight/2 + 20);
//                   ctx.lineTo((rectX+borderSpacing) + blockWidth/2 - 10, (rectY+borderSpacing) + blockHeight/2 + 30);
//                } else if (snakeDirection == 1) {
//                   ctx.lineTo((rectX+borderSpacing) + blockWidth/2, (rectY+borderSpacing) + blockHeight/2 + 20);
//                   ctx.lineTo((rectX+borderSpacing) + blockWidth/2 + 10, (rectY+borderSpacing) + blockHeight/2 + 30);
// 
//                   ctx.moveTo((rectX+borderSpacing) + blockWidth/2, (rectY+borderSpacing) + blockHeight/2 + 20);
//                   ctx.lineTo((rectX+borderSpacing) + blockWidth/2 - 10, (rectY+borderSpacing) + blockHeight/2 + 30);
//                }
               
                  ctx.stroke();
                  ctx.closePath();
               }
               
               ctx.beginPath();
               
               //ctx.rect(rectX+borderSpacing, rectY+borderSpacing, blockWidth, blockHeight);
               //ctx.fillStyle = "Red";
               
               if (snake[y][x] == 1) {
                  ctx.fillStyle = "white";
               } else {
                  ctx.fillStyle = "red";
               }
               
               ctx.arc((rectX+borderSpacing) + blockWidth/2, (rectY+borderSpacing) + blockHeight/2, blockWidth/2, 0, 2 * Math.PI);
               //ctx.fill();
               ctx.stroke();
               ctx.closePath();
               
            } else {
               //ctx.strokeStyle = "#79d87b";
            }

         }
      }
      
      // drawing food
      for (var y=0; y<verticalCount; y++) {
         for (var x=0; x<horizontalCount; x++) {
            if(food[y][x]) {
               ctx.drawImage(loadedPictures.food, Math.ceil(x*blockWidth)+borderSpacing, Math.ceil(y*blockHeight)+borderSpacing, blockWidth, blockHeight);
            }
         }
      }
      
      ctx.fillStyle = "white";
      ctx.font = "8pt Calibri";
      ctx.fillText('Length: ' + snakeLength, 10/pixelRatio, canvas.height/pixelRatio-3);

       //display frame frate in the corner
       //ctx.fillStyle = "white";
       //ctx.font = "10pt Calibri";
       //ctx.fillText('fps: ' + Math.floor(1000 / ((+new Date) - lastFrameDraw)), canvas.width - 50, canvas.height-5);


      if ( pixelRatio > 1) {
         pixelRatio2 = 1;
      } else {
         pixelRatio2 = 2;
      }
      
   } else if (state == 2) {
      ctx.drawImage(loadedPictures.gameover, ((canvas.width/pixelRatio - loadedPictures.gameover.width/pixelRatio)/2) , 20, loadedPictures.gameover.width / pixelRatio, loadedPictures.gameover.height / pixelRatio);

   
   } else {
      // strange, unknown state
      //console.log('strange, unknown state, the state is:' + state);
   }
   
   lastFrameDraw = +new Date;

   TTDFarray.push(+new Date - drawStart);
   
   var TTDFAA = 0; // ?
   
   for(var i = 0; i < TTDFarray.length; i++) {
      TTDFAA = TTDFarray[i] + TTDFAA;
   }
   
   if (TTDFarray.length > 100) {
      TTDFarray.shift();
   }
   
   //ctx.font = "8pt Calibri";
   //ctx.fillText(Math.floor(TTDFAA/TTDFarray.length) + " ms", canvas.width - 30, 5);
}

function newGame() {
   // filling the field with random food
   for (var y=0; y<verticalCount; y++) {
      food[y] = new Array(horizontalCount);
   }
   for (var y=0; y<verticalCount; y++) {
      snake[y] = new Array(horizontalCount);
   }

   for (var i=0;i<initialFoodCount; i++) {
      food[Math.floor(Math.random() * verticalCount)][Math.floor(Math.random() * horizontalCount)] = 1;
   }

   // init snake
   //
   var snakePlaced = 0;
   for(var x=0; x<10 && snakePlaced == 0; x++) {
      snakeY = Math.floor(Math.random() * verticalCount);
      snakeX = Math.floor(Math.random() * horizontalCount);

      if(food[snakeY][snakeX] && food[snakeY][snakeX] > 0) {
         //console.log("can't place snake at cordY: " + cordY + "| cordX: " + cordX + " will try again");
      } else {
         snake[snakeY][snakeX] = 1;
         snakePlaced = 1;
      }
   }

   snakeDirection = 0;
}