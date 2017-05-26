(function() {

  const stop = document.querySelector(".stop"),
        clock = document.querySelector(".time"),
        input = document.querySelector("input"),
        ul = document.querySelector("ul"),
        start = document.querySelector(".start"),
        puzzleCont = document.querySelector(".puzzle-container"),
        solvedBG = document.querySelector(".unsolved");
  let hints = document.querySelector(".hints-left");

  const timer = num => {
    const chosenTime = num,
          currMin = new Date().getMinutes(),
          endTime = new Date().setMinutes(currMin + chosenTime);

    const timeRemaining = stopTime => {
      const ms = endTime - Date.parse(new Date());
      const seconds = Math.floor((ms/1000) % 60);
      const minutes = Math.floor((ms/1000/60) % 60);
      // console.log(minutes, seconds);
      return {
        total: ms,
        minutes: minutes,
        seconds: seconds
      };
    };

    const startTimer = (el, stopTime) => {
      const runTime = () => {
        const time = timeRemaining(endTime);
        const min = ("0" + time.minutes).slice(-2);
        const sec = ("0" + time.seconds).slice(-2);
        clock.innerHTML = `${min}:${sec}`;
        if(time.total-1000 <= 0){
          clearInterval(updateClock);
        }
      };
      runTime();
      const updateClock = setInterval(runTime, 1000);
      Window.updateClock = updateClock;
    };
    startTimer(".time", endTime);
  };

  const showHint = () => {
    let hintsLeft,
        hintsLeftText = document.querySelector(".hint-details");

    document.body.addEventListener("keypress", (e) => {
      if (e.keyCode === 104 || e.keyCode === 72) {
        hintsLeft = parseInt(hints.innerText);
        if (hintsLeft > 0) {
          hints.innerText = hintsLeft - 1;
        } else {
          hintsLeftText.innerHTML = "Oops, no more hints.";
        }
      }
      hints = hints;
    });
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
      selected = "No Hassel";
    }

    // NOTE: Get the range value and use it as the list's index to grab each li's minutes for timer preview
    input.addEventListener("input", function (e) {
      const val = li[e.target.value-1],
            minutesDisplay = val.dataset.level;
      clock.innerHTML = `0${minutesDisplay}:00`;
    });

    return selected;
  };

  const initiateTimer = () => {
    start.addEventListener("click",initialize);
    function initialize () {
      const level = selectLevel();
      if (!isNaN(parseInt(level))) {
        timer(parseInt(level));
      }
      if (level === "No Hassel") {
        hasselbrate(level);
      }
      input.setAttribute("disabled","disabled");
      ul.classList.add("class","disabled");
    }
    endGame();
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

  const hasselbrate = (type) => {
    const hassel = document.querySelector(".hassel"),
    audio = new Audio('audio/krtheme.wav');
    let audioTimer;
    // if (type === "No Hassel") {
    //
    // }
    hassel.classList.remove("hide-bg");
    solvedBG.classList.add("hide-bg");
    puzzleCont.classList.add("flash");
    audio.play();
    function stopAudio () {
      audio.pause();
      window.clearTimeout(audioTimer);
      hassel.classList.add("hide-bg");
      solvedBG.classList.remove("hide-bg");
      puzzleCont.classList.remove("flash");
    }
    audioTimer = setTimeout(stopAudio,10000);
    stop.addEventListener("click",stopAudio);
  };

  showHint();
  initiateTimer();
  selectLevel();


}());
