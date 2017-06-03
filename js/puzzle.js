(function() {
  const clock = document.querySelector(".time"),
        input = document.querySelector("input"),
        start = document.querySelector(".start"),
        trayParent = document.querySelector(".tray"),
        puzzleCont = document.querySelector(".puzzle-container"),
        unsolvedBG = document.querySelector(".unsolved"),
        solvedBG = document.querySelector(".solved"),
        li = Array.from(document.querySelectorAll("[data-level]")),
        sealBG = document.querySelector(".seal"),
        dropSuccessAudio = document.getElementById('drop-tile-board'),
        dropFailAudio = document.getElementById('drop-tile-tray'),
        solvedAudio = document.getElementById('solved-100'),
        failAudio = document.getElementById('fail'),
        settings = document.querySelector(".level-settings");
    let hints = document.querySelector(".hints-left"),
        pieceFlipTimer,
        level;

  const createTimer = {
    init: function (num) {
      this.chosenTime = num;
      this.currMin = new Date().getMinutes();
      this.endTime = new Date().setMinutes(this.currMin + this.chosenTime);
      this.setTimerInterval();
    },
    getTimeRemaining: function (stopTime) {
      const ms = stopTime - Date.parse(new Date()),
            seconds = Math.floor((ms/1000) % 60),
            minutes = Math.floor((ms/1000/60) % 60);
      return {
        total: ms,
        minutes: minutes,
        seconds: seconds
      };
    },
    setTimerInterval: function () {
      const updateClock = setInterval(this.updateClock.bind(this), 1000);
      Window.updateClock = updateClock;
    },
    updateClock: function () {
      const time = this.getTimeRemaining(this.endTime),
            min = ("0" + time.minutes).slice(-2),
            sec = ("0" + time.seconds).slice(-2);
      clock.innerHTML = `${min}:${sec}`;
      if(time.total-1000 <= 0){
        puzzleEnd.init(true);
      }
    }
  };

  var puzzleEnd = {
    init: function (bool) {
      clearInterval(Window.updateClock);
      this.checkTray(bool);
    },
    checkTray: function (bool) {
      if (tray.children.length === 0) {
        celebrate.init();
        resetAuto(true);
      }
      if (bool) {
        failAudio.play();
        resetAuto(false);
      }
    }
  };

  var timerSelect = {
    bindEvents: function () {
      start.addEventListener("click",this.initializeTimer);
    },
    initializeTimer: function () {
      level = selectLevel();
      createTimer.init(parseInt(level));
      boardSetUp.init(level);
      startDrag.init();
      validDropZones.init();
    }
  };

  var boardSetUp = {
    init: function (level) {
      clonePuzzle.clonePuzzle();
      this.shufflePieces();
      endGame.init();
      settings.classList.add("transLeft");
      start.setAttribute("disabled","disabled");
      this.lvl = level;
      this.bindEvents();
      this.hintFired = false;
      this.hintsLeft = 0;
    },
    bindEvents: function () {
      if (this.lvl === 4 || this.lvl === 1) {
        hints.parentNode.classList.add("invisible");
        document.body.removeEventListener("keydown",this.showHint);
        document.body.removeEventListener("keyup", this.hideHint);
      } else {
        document.body.addEventListener("keydown", this.showHint.bind(this));
        document.body.addEventListener("keyup", this.hideHint.bind(this));
      }
    },
    shufflePieces: function () {
      const pieces = Array.from(document.querySelectorAll("[data-piece]"));
      for (var i = 0; i < pieces.length; i++) {
        let piece = pieces[i].children[0],
            left = Math.floor(Math.random() * (80 - 20) + 20),
            top = Math.floor(Math.random() * (50 - 1) + 1),
            zindex = Math.floor(Math.random() * (40 - 1) + 1);
        tray.appendChild(piece);
        piece.style.left = `${left}%`;
        piece.style.top = `${top}%`;
        piece.style.zIndex = zindex;
      }
    },
    showHint: function (e) {
      if (e.keyCode === 104 || e.keyCode === 72) {
        if (!this.hintFired) {
          this.hintsLeft = parseInt(hints.innerText);
          this.hintFired = true;
        }
        if (this.hintsLeft > 0) {
          hints.innerText = this.hintsLeft - 1;
          toggleBG(unsolvedBG,solvedBG);
        }
      }
      hints = hints;
    },
    hideHint: function () {
      if (this.hintsLeft >= 1) {
        this.hintFired = false;
        toggleBG(solvedBG,unsolvedBG);
      }
    }
  };

  const resetHint = () => {
    hints.innerText = 3;
    hints.parentNode.classList.remove("invisible");
  };

  const selectLevel = () => {
    let selected;

    if (input.value === "1") {
      selected = 6;
    }
    if (input.value === "2") {
      selected = 4;
    }
    if (input.value === "3") {
      selected = 1;
    }
    showTimerPreview();
    function showTimerPreview () {
      input.addEventListener("input", function (e) {
        const val = li[e.target.value-1],
              minutesDisplay = val.dataset.level;
        clock.innerHTML = `0${minutesDisplay}:00`;
      });
    }
    return selected;
  };

  const createTray = () => {
    const tray = document.createElement("div");
    tray.setAttribute("id","tray");
    trayParent.appendChild(tray);
  };

  const startDrag = {
    init: function () {
      this.cacheDOM();
      this.bindEvents();
    },
    cacheDOM: function () {
      this.puzzlePieces = document.querySelectorAll('img[src*=piece]');
    },
    bindEvents: function () {
      for (var i = 0; i < this.puzzlePieces.length; i++) {
        this.puzzlePieces[i].addEventListener("mousedown", this.applyAttr);
        this.puzzlePieces[i].addEventListener("dragstart", this.dragStart);
      }
    },
    applyAttr: function (e) {
      this.setAttribute("draggable", "true");
    },
    dragStart: function (e) {
      e.dataTransfer.setData("text/plain", e.target.id);
      e.dataTransfer.dropEffect = "move";
    }
  };

  const validDropZones = {
    init: function () {
      this.cacheDOM();
      this.bindEvents();
    },
    cacheDOM: function () {
      this.cell = document.getElementsByClassName("hc-cell");
      this.honeycomb = document.querySelector(".honeycomb");
    },
    bindEvents: function () {
      tray.addEventListener("dragover", this.dragItem);
      tray.addEventListener("drop", this.dropItem);
      this.honeycomb.addEventListener("dragover", this.dragItem.bind(this));
      this.honeycomb.addEventListener("drop", this.dropItem.bind(this));
    },
    dragItem: function (e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    },
    dropItem: function (e) {
      e.preventDefault();
      let movedPiece = e.dataTransfer.getData("text"),
          pieceID = document.getElementById(movedPiece);
      if (e.target.parentNode.id === 'tray') {
        e.target.parentNode.appendChild(pieceID);
        dropFailAudio.play();
      }
      else if (movedPiece === e.target.getAttribute("data-piece")) {
        e.target.appendChild(pieceID);
        dropSuccessAudio.play();
      }
      else {
        dropFailAudio.play();
      }
      puzzleEnd.checkTray();
    }
  };

  function toggleBG (toHide,toShow) {
    toHide.classList.add("hide-bg");
    toShow.classList.remove("hide-bg");
  }

  const clonePuzzle = {
    cacheDOM: function () {
      this.honeycomb = document.querySelector(".honeycomb");
    },
    clonePuzzle: function () {
      this.cacheDOM();
      this.saved = this.honeycomb.cloneNode(true);
      this.puzzleContainer = this.honeycomb.parentNode;
    },
    replace: function () {
      this.puzzleContainer.replaceChild(this.saved,this.honeycomb);
      this.clonePuzzle();
    }
  };

  const endGame = {
    init: function () {
      document.querySelector(".reset").addEventListener("click",this.endGame);
    },
    endGame: function () {
      clonePuzzle.replace();
      trayParent.removeChild(tray);
      createTray();
      resetHint();
      toggleBG(sealBG,unsolvedBG);
      celebrate.finish();
      resetAudio();
      clearInterval(Window.updateClock);
      clearInterval(pieceFlipTimer);
      clock.innerHTML = `0${selectLevel()}:00`;
      settings.classList.remove("transLeft");
      start.removeAttribute("disabled");
      puzzleCont.classList.remove("flash");
    }
  };

  function resetAudio () {
    var audio = document.getElementsByTagName("audio");
    for (var i = 0; i < audio.length; i++) {
      audio[i].pause();
      audio[i].currentTime = 0;
    }
  }

  function resetAuto (bool) {
    let resetAuto = bool ? window.setTimeout(endGame.endGame,9000) : window.setTimeout(endGame.endGame,5000);
  }

  const celebrate = {
    n: 0,
    init: function () {
      this.cacheDOM();
      this.initiateFun();
      this.pieceFlip();
    },
    cacheDOM: function () {
      this.puzzlePieces = document.querySelectorAll('img[src*=piece]');
    },
    initiateFun: function () {
      toggleBG(unsolvedBG,sealBG);
      puzzleCont.classList.add("flash");
      solvedAudio.play();
    },
    pieceFlip: function () {
      if (this.n < this.puzzlePieces.length) {
        pieceFlipTimer = window.setTimeout(this.celebrate.bind(this), 100);
      }
      else {
        this.finish();
      }
    },
    celebrate: function () {
      if (this.n < this.puzzlePieces.length) {
        this.puzzlePieces[this.n].setAttribute('class', 'celebrating');
        this.n++;
        this.pieceFlip();
      }
    },
    finish: function () {
      this.n = 0;
    }
  };
  // NOTE: Instant Solver! :)
  document.getElementById("magic").addEventListener("click", solveInstant);
  function solveInstant () {
    start.setAttribute("disabled","disabled");
    endGame.init();
    clonePuzzle.replace();
    trayParent.removeChild(tray);
    createTray();
    celebrate.init();
    resetAuto(true);
  }

  timerSelect.bindEvents();
  clonePuzzle.clonePuzzle();
  createTray();
  selectLevel();
}());
