(function() {
  const stop = document.querySelector(".stop"),
        clock = document.querySelector(".time"),
        input = document.querySelector("input"),
        ul = document.querySelector("ul"),
        start = document.querySelector(".start"),
        puzzleCont = document.querySelector(".puzzle-container"),
        unsolvedBG = document.querySelector(".unsolved"),
        solvedBG = document.querySelector(".solved"),
        dropTileBoard = document.getElementById('drop-tile-board'),
        dropTileTray = document.getElementById('drop-tile-tray'),
        puzzleSolvedSound = document.getElementById('solved-100');
    let hints = document.querySelector(".hints-left");


  const createTimer = num => {
    const chosenTime = num,
          currMin = new Date().getMinutes(),
          endTime = new Date().setMinutes(currMin + chosenTime);

    const getTimeRemaining = stopTime => {
      const ms = endTime - Date.parse(new Date()),
            seconds = Math.floor((ms/1000) % 60),
            minutes = Math.floor((ms/1000/60) % 60);
      return {
        total: ms,
        minutes: minutes,
        seconds: seconds
      };
    };

    const updateTimer = (el, stopTime) => {
      const runTime = () => {
        const time = getTimeRemaining(endTime),
              min = ("0" + time.minutes).slice(-2),
              sec = ("0" + time.seconds).slice(-2);
        clock.innerHTML = `${min}:${sec}`;
        if(time.total-1000 <= 0){
          clearInterval(updateClock);
        }
      };
      const updateClock = setInterval(runTime, 1000);
      Window.updateClock = updateClock;
    };
    updateTimer(".time", endTime);
  };



  const initiateTimer = () => {
    start.addEventListener("click",initialize);
    function initialize () {
      const level = selectLevel();
      if (!isNaN(parseInt(level))) {
        shufflePieces();
        createTimer(parseInt(level));
      }
      // if (level === "No Hassel") {
      //   celebrate(".hassel");
      // }
      input.setAttribute("disabled","disabled");
      ul.classList.add("class","disabled");
    }
    endGame();
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



  var validDropZones = {
    init: function () {
      this.cacheDOM();
      this.bindEvents();
    },
    cacheDOM: function () {
      this.tray = document.querySelector(".tray");
      this.cell = document.getElementsByClassName("hc-cell");
    },
    bindEvents: function () {
      this.tray.addEventListener("dragover", this.dragItem);
      this.tray.addEventListener("drop", this.dropItem);
      for (var i = 0; i < this.cell.length; i++) {
        this.cell[i].addEventListener("dragover", this.dragItem);
        this.cell[i].addEventListener("drop", this.dropItem);
      }
    },
    dragItem: function (e) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    },
    dropItem: function (e) {
      e.preventDefault();
      var movedPiece = e.dataTransfer.getData("text");
      if (e.target.parentNode.id === 'tray') {
        e.target.parentNode.appendChild(document.getElementById(movedPiece));
        dropTileTray.play();
      }
      else if (movedPiece === e.target.getAttribute("data-piece")) {
        e.target.appendChild(document.getElementById(movedPiece));
        dropTileBoard.play();
      }
      else {
        dropTileTray.play();
      }
      // check if the tray is empty
      // check.checkTray();
    }
  };



  const getHint = () => {
    let hintsLeft,
        hintsLeftText = document.querySelector(".hint-details"),
        fired = false;

    document.body.addEventListener("keydown", (e) => {
      if (e.keyCode === 104 || e.keyCode === 72) {
        if (!fired) {
          fired = true;
          hintsLeft = parseInt(hints.innerText);
          if (hintsLeft > 0) {
            hints.innerText = hintsLeft - 1;
            solvedBG.classList.remove("hide-bg");
            unsolvedBG.classList.add("hide-bg");
          } else {
            hintsLeftText.innerHTML = "Oops, no more hints.";
          }
        }
      }
      hints = hints;
    });

    document.body.addEventListener("keyup", hideHint);

    function hideHint () {
      if (hintsLeft >= 1) {
        fired = false;
        solvedBG.classList.add("hide-bg");
        unsolvedBG.classList.remove("hide-bg");
      }
    }
  };



  const selectLevel = () => {
    const li = Array.from(document.querySelectorAll("[data-level]"));
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



  const shufflePieces = () => {
    const pieces = Array.from(document.querySelectorAll("[data-piece]")),
          tray = document.querySelector(".tray");

    for (var i = 0; i < pieces.length; i++) {
      let piece = pieces[i].children[0],
          left = Math.floor(Math.random() * (80 - 20) + 20),
          top = Math.floor(Math.random() * (50 - 1) + 1);
      tray.appendChild(piece);
      piece.style.left = `${left}%`;
      piece.style.top = `${top}%`;
    }
  };



  const endGame = () => {
    stop.addEventListener("click",endGame);
    function endGame () {
      clearInterval(Window.updateClock);
      clock.innerHTML = `00:00`;
      input.removeAttribute("disabled");
      hints.innerText = 3;
      ul.classList.remove("class","disabled");
    }
  };



  const celebrate = (className) => {
    const image = document.querySelector(className),
          audio = new Audio('audio/krtheme.wav');
    let audioTimer;
    initiateFun();
    function initiateFun () {
      image.classList.remove("hide-bg");
      unsolvedBG.classList.add("hide-bg");
      puzzleCont.classList.add("flash");
      audio.play();
    }
    function endFun() {
      audio.pause();
      window.clearTimeout(audioTimer);
      image.classList.add("hide-bg");
      unsolvedBG.classList.remove("hide-bg");
      puzzleCont.classList.remove("flash");
    }
    audioTimer = setTimeout(endFun,20000);
    stop.addEventListener("click",endFun);
  };



  getHint();
  initiateTimer();
  selectLevel();
  startDrag.init();
  validDropZones.init();
}());
