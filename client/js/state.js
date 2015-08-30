'use strict';

var gameLoop = require('./game_loop');
var levels = require('./levels');
var processLevel = require('./process_level');
var setupControls = require('./setup_controls');
var storage = require('./storage');
var { $ } = require('./utils');


var playing = false;
var currentLevel;

function controlsStateChanged(controlsState) {
  if (!playing) {
    return;
  }

  if (controlsState.special === 'undo') {
    state.undo();
  } else {
    currentLevel.move(controlsState);
  }
}

function gameFinished() {
  $('#start-screen')[0].classList.remove('hidden');
}

var state = {

  desktopDetected() {
    setupControls({
      isKeyboard: true,
      callback: controlsStateChanged,
    });
  },

  mobileDetected() {
    setupControls({
      isMouse: true,
      callback: controlsStateChanged,
    });
  },

  get playing() {
    return playing;
  },

  startLevel(which) {
    if (process.env.NODE_ENV !== 'production' && playing) {
      throw new Error('Already playing');
    }

    playing = true;
    currentLevel = processLevel(levels[which], state);
    storage.pushState(currentLevel);
    gameLoop.start(currentLevel);
    $('#start-screen')[0].classList.add('hidden');
  },

  stopLevel() {
    if (process.env.NODE_ENV !== 'prodcution' && !playing) {
      throw new Error('Already stopped');
    }

    playing = false;
    storage.resetUndo();
    gameLoop.stop();
  },

  moveFinished() {
    if (playing) {
      storage.pushState(currentLevel);
    }
  },

  undo() {
    var isMoving = currentLevel.currentState.direction;

    currentLevel.undo();
    storage[isMoving ? 'restoreState' : 'popState'](currentLevel);
    gameLoop.scheduleRedraw();
  },

  boxesLeftChanged(boxesLeft) {
    if (boxesLeft !== 0) {
      // TODO: Change some counter
      return;
    }

    state.stopLevel();

    setTimeout(gameFinished, 1000);
  },

};

window.q = state.stopLevel;

module.exports = state;
