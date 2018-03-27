(function () {
  // define variables
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');
  var player = {};
  var bigfoot = {};
  var ground = [];
  var platformWidth = 32;
  var platformHeight = canvas.height - platformWidth * 4;

  /**
   * Asset pre-loader object. Loads all images
   */
  var assetLoader = (function() {
    // images dictionary
    this.imgs        = {
      'bg'            : 'img/bigfoot/bg.png',
      'sky'           : 'img/bigfoot/sky.png',
      'backdrop'      : 'img/bigfoot/mtns-mid.png',
      'backdrop2'     : 'img/bigfoot/mtns-foreground.png',
      'backdrop3'     : 'img/bigfoot/trees.png',
      'backdrop4'     : 'img/bigfoot/brush.png',
      'grass'         : 'img/bigfoot/grass.png'
    };
    
    // sounds dictionary
    this.sounds      = {
      'bg'            : 'sounds/bg.mp3',
      'gameOver'      : 'sounds/gameOver.mp3',
      'gameOver2'     : 'sounds/gameOver2.mp3',
    };

    var assetsLoaded = 0;                                // how many assets have been loaded
    var numImgs      = Object.keys(this.imgs).length;    // total number of image assets
    var numSounds    = Object.keys(this.sounds).length;  // total number of sound assets
    this.totalAssest = numImgs;                          // total number of assets
    
    function _checkAudioState(sound) {
      if (this.sounds[sound].status === 'loading' && this.sounds[sound].readyState === 4) {
        assetLoaded.call(this, 'sounds', sound);
      }
    }

    /**
     * Ensure all assets are loaded before using them
     * @param {number} dic  - Dictionary name ('imgs', 'sounds', 'fonts')
     * @param {number} name - Asset name in the dictionary
     */
    function assetLoaded(dic, name) {
      // don't count assets that have already loaded
      if (this[dic][name].status !== 'loading') {
        return;
      }

      this[dic][name].status = 'loaded';
      assetsLoaded++;

      // finished callback
      if (assetsLoaded === this.totalAssest && typeof this.finished === 'function') {
        this.finished();
      }
    }

    /**
     * Create assets, set callback for asset loading, set asset source
     */
    this.downloadAll = function() {
      var _this = this;
      var src;

      // load images
      for (var img in this.imgs) {
        if (this.imgs.hasOwnProperty(img)) {
          src = this.imgs[img];

          // create a closure for event binding
          (function(_this, img) {
            _this.imgs[img] = new Image();
            _this.imgs[img].status = 'loading';
            _this.imgs[img].name = img;
            _this.imgs[img].onload = function() { assetLoaded.call(_this, 'imgs', img) };
            _this.imgs[img].src = src;
          })(_this, img);
        }
      }
       // load sounds
      for (var sound in this.sounds) {
        if (this.sounds.hasOwnProperty(sound)) {
          src = this.sounds[sound];
          // create a closure for event binding
          (function(_this, sound) {
            _this.sounds[sound] = new Audio();
            _this.sounds[sound].status = 'loading';
            _this.sounds[sound].name = sound;
            _this.sounds[sound].addEventListener('canplay', function() {
              _checkAudioState.call(_this, sound);
            });
            _this.sounds[sound].src = src;
            _this.sounds[sound].preload = 'auto';
            _this.sounds[sound].load();
          })(_this, sound);
        }
      }
    }

    return {
      imgs: this.imgs,
      sounds: this.sounds,
      totalAssest: this.totalAssest,
      downloadAll: this.downloadAll
    };
  })();
 
  /*  Starts the Game, when button is clicked. */
  $('.play').click(function() {
    $('#menu').hide();
    startGame();
  });
  
    /*  Starts the Game, when button is clicked. */
  $('.restart').click(function() {
    location.reload();
  });
  
    /**
   * Keep track of the spacebar events
   */
  var KEY_CODES = {
    32: "space"
  };
  var KEY_STATUS = {};
  //counter to track key repeat - 
  var SB_COUNT = 0;
  for (var code in KEY_CODES) {
    if (KEY_CODES.hasOwnProperty(code)) {
       KEY_STATUS[KEY_CODES[code]] = false;
    }
  }
  document.onkeydown = function(e) {
    var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
    if (KEY_CODES[keyCode]) {
      e.preventDefault();
      //if the key has repeated without a keyup event, set keycode statuw to false
      if(SB_COUNT > 0) {
        KEY_STATUS[KEY_CODES[keyCode]] = false;
      } else {
        KEY_STATUS[KEY_CODES[keyCode]] = true;
      }
      SB_COUNT++;
    }
  };
  document.onkeyup = function(e) {
    var keyCode = (e.keyCode) ? e.keyCode : e.charCode;
    if (KEY_CODES[keyCode]) {
      e.preventDefault();
      //clear counter
      SB_COUNT = 0;
      KEY_STATUS[KEY_CODES[keyCode]] = false;
    }
  };

  /**
   * Creates a Spritesheet
   * @param {string} - Path to the image.
   * @param {number} - Width (in px) of each frame.
   * @param {number} - Height (in px) of each frame.
   */
  function SpriteSheet(path, frameWidth, frameHeight) {
    this.image = new Image();
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;

    // calculate the number of frames in a row after the image loads
    var self = this;
    this.image.onload = function() {
      self.framesPerRow = Math.floor(self.image.width / self.frameWidth);
    };

    this.image.src = path;
  }

  /**
   * Creates an animation from a spritesheet.
   * @param {SpriteSheet} - The spritesheet used to create the animation.
   * @param {number}      - Number of frames to wait for before transitioning the animation.
   * @param {array}       - Range or sequence of frame numbers for the animation.
   * @param {boolean}     - Repeat the animation once completed.
   */
  function Animation(spritesheet, frameSpeed, startFrame, endFrame) {

    var animationSequence = [];  // array holding the order of the animation
    var currentFrame = 0;        // the current frame to draw
    var counter = 0;             // keep track of frame rate

    // start and end range for frames
    for (var frameNumber = startFrame; frameNumber <= endFrame; frameNumber++)
      animationSequence.push(frameNumber);

    /**
     * Update the animation
     */
    this.update = function() {

      // update to the next frame if it is time
      if (counter == (frameSpeed - 1))
        currentFrame = (currentFrame + 1) % animationSequence.length;

      // update the counter
      counter = (counter + 1) % frameSpeed;
    };

    /**
     * Draw the current frame
     * @param {integer} x - X position to draw
     * @param {integer} y - Y position to draw
     */
    this.draw = function(x, y) {
      // get the row and col of the frame
      var row = Math.floor(animationSequence[currentFrame] / spritesheet.framesPerRow);
      var col = Math.floor(animationSequence[currentFrame] % spritesheet.framesPerRow);

      ctx.drawImage(
        spritesheet.image,
        col * spritesheet.frameWidth, row * spritesheet.frameHeight,
        spritesheet.frameWidth, spritesheet.frameHeight,
        x, y,
        spritesheet.frameWidth, spritesheet.frameHeight);
    };
  }

  /**
   * Create a parallax background
   */
  var background = (function() {
    var sky   = {};
    var backdrop = {};
    var backdrop2 = {};
    var backdrop3 = {};
    var backdrop4 = {};

    /**
     * Draw the backgrounds to the screen at different speeds
     */
    this.draw = function() {
      ctx.drawImage(assetLoader.imgs.bg, 0, 0);

      // Pan background
      sky.x -= sky.speed;
      backdrop.x -= backdrop.speed;
      backdrop2.x -= backdrop2.speed;
      backdrop3.x -= backdrop3.speed;
      backdrop4.x -= backdrop4.speed;

      // draw images side by side to loop
      ctx.drawImage(assetLoader.imgs.sky, sky.x, sky.y);
      ctx.drawImage(assetLoader.imgs.sky, sky.x + canvas.width, sky.y);

      ctx.drawImage(assetLoader.imgs.backdrop, backdrop.x, backdrop.y);
      ctx.drawImage(assetLoader.imgs.backdrop, backdrop.x + canvas.width, backdrop.y);

      ctx.drawImage(assetLoader.imgs.backdrop2, backdrop2.x, backdrop2.y);
      ctx.drawImage(assetLoader.imgs.backdrop2, backdrop2.x + canvas.width, backdrop2.y);
      
      ctx.drawImage(assetLoader.imgs.backdrop3, backdrop3.x, backdrop3.y);
      ctx.drawImage(assetLoader.imgs.backdrop3, backdrop3.x + canvas.width, backdrop3.y);
      
      ctx.drawImage(assetLoader.imgs.backdrop4, backdrop4.x, backdrop4.y);
      ctx.drawImage(assetLoader.imgs.backdrop4, backdrop4.x + canvas.width, backdrop4.y);

      // If the image scrolled off the screen, reset
      if (sky.x + assetLoader.imgs.sky.width <= 0)
        sky.x = 0;
      if (backdrop.x + assetLoader.imgs.backdrop.width <= 0)
        backdrop.x = 0;
      if (backdrop2.x + assetLoader.imgs.backdrop2.width <= 0)
        backdrop2.x = 0;
      if (backdrop3.x + assetLoader.imgs.backdrop3.width <= 0)
        backdrop3.x = 0;
      if (backdrop4.x + assetLoader.imgs.backdrop4.width <= 0)
        backdrop4.x = 0;
    };

    /**
     * Reset background to zero
     */
    this.reset = function()  {
      sky.x = 0;
      sky.y = 0;
      sky.speed = 0.2;

      backdrop.x = 0;
      backdrop.y = 0;
      backdrop.speed = 0.4;

      backdrop2.x = 0;
      backdrop2.y = 0;
      backdrop2.speed = 0.6;
      backdrop3.x = 0;
      backdrop3.y = 0;
      backdrop3.speed = 0.9;
      backdrop4.x = 0;
      backdrop4.y = 0;
      backdrop4.speed = 1.2;
    }

    return {
      draw: this.draw,
      reset: this.reset
    };
  })();

  /**
   * Game loop
   */
  function animate() {
    if (stop == false) {
      score = score + 0.01666666666666;
      
      requestAnimFrame( animate );
  
      background.draw();
      
      // draw the score
      ctx.font="20px Impact";
      ctx.fillText('Score: ' + Math.floor(score) + ' sec', canvas.width - 150, 30);
      
  
      for (i = 0; i < ground.length; i++) {
        ground[i].x -= player.speed;
        ctx.drawImage(assetLoader.imgs.grass, ground[i].x, ground[i].y);
      }
  
      if (ground[0].x <= -platformWidth) {
        ground.shift();
        ground.push({'x': ground[ground.length-1].x + platformWidth, 'y': platformHeight});
      }
      
      player.anim.update();
      player.anim.draw(player.distance, player.y); //Draws the player at x, y
      
      backward = 2;
      forward = 2;
      
      // Alters difficulty based on score
      if(score < 15) {
        backward = 2;
        forward = 2;
      } else if (score < 30) {
        backward = 3;
        forward = 1.75;
      } else if (score < 40) {
        backward = 3.5;
        forward = 1.5;
      } else if (score < 50) {
        backward = 4;
        forward = 1.25;
      } else if (score < 60) {
        backward = 4.5;
        forward = 1;
      }else if (score >= 60) {
        backward = 5;
        forward = .75;
      }
      
      // Events for space bar.
      if (KEY_STATUS.space & player.distance <= 750) {
        player.anim.update();
        player.distance += forward;
        player.anim.draw(player.distance, player.y); //Draws the player at x, y
      } else {
        if (player.distance >= 80) {
          player.anim.update();
          player.distance -= backward;
          player.anim.draw(player.distance, player.y); //Draws the player at x, y
        }
      }
      
      // Result in Game Over
      if (player.distance <= 155) {
        stop = true;
        assetLoader.sounds.bg.pause();
        assetLoader.sounds.gameOver.currentTime = 0;
        assetLoader.sounds.gameOver2.currentTime = 0;
        assetLoader.sounds.gameOver.play();
        assetLoader.sounds.gameOver2.play();
        
        $('#score').html(Math.floor(score));
        $('#gameOver').show();
      }
      
      bigfoot.anim.update();
      bigfoot.anim.draw(60, 230); //Draws the bigfoot at x, y
    }

  }

  /**
   * Request Animation Polyfill
   */
  var requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function(callback, element){
              window.setTimeout(callback, 1000 / 60);
            };
  })();

  /**
   * Start the game - reset all variables and entities, spawn platforms and water.
   */
  function startGame() {
    assetLoader.sounds.gameOver.pause();
    assetLoader.sounds.bg.currentTime = 0;
    assetLoader.sounds.bg.loop = true;
    assetLoader.sounds.bg.play();
    
    // reset score
    score = 0;
    // when to stop game
    stop = false;
    
    // setup the player
    
    // Solid Snake Sprite
    player.width  = 52;
    player.height = 81;
    player.speed  = 6;
    player.distance = 600;
    player.y = 275;
    player.sheet  = new SpriteSheet('/img/bigfoot/snake-running.png', player.width, player.height);
    player.anim   = new Animation(player.sheet, 8, 0, 5);
    
    // setup the bigfoot
    bigfoot.width  = 172;
    bigfoot.height = 138;
    bigfoot.speed  = 3;
    bigfoot.sheet  = new SpriteSheet('/img/bigfoot/bigfoot-sheet.png', bigfoot.width, bigfoot.height);
    bigfoot.anim   = new Animation(bigfoot.sheet, 4, 0, 6);
  
  
    // create the ground tiles
    for (i = 0, length = Math.floor(canvas.width / platformWidth) + 2; i < length; i++) {
      ground[i] = {'x': i * platformWidth, 'y': platformHeight};
    }

    background.reset();

    animate();
  }

  assetLoader.downloadAll();
})();