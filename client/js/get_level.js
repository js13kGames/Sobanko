'use strict';

var assign = require('object-assign');

var {
  width: canvasWidth,
  height: canvasHeight,
  tiles,
} = require('./constants');
var levels = require('./levels');


var LevelPrototype = {

  undo() {
    this.moving = false;
  },

  get boxesLeft() {
    return this.destinations.reduce((acc, pos) => {
      var [x, y] = pos;
      var shouldCount = tiles[this.data[y][x]] === 'destination';

      return acc + (shouldCount ? 1 : 0);
    }, 0);
  },

};

function processData(level) {
  level.data = level.data.map((row, y) => {
    return row.map((value, x) => {
      switch (tiles[value]) {
        case 'destination':
        case 'boxInDestination':
          level.destinations.push([x, y]);
          break;
        case 'player':
          assign(level, {
            playerX: x,
            playerY: y,
          });
          return tiles.floor;
      }

      return value;
    });
  });
}

module.exports = function getLevel(which, uiState) {
  var data = levels[which];
  var width = data[0].length;
  var height = data.length;

  var result = assign(
    Object.create(LevelPrototype),
    {
      uiState,
      which,
      data,
      width,
      height,
      direction: null,
      pulling: false,
      moving: false,
      offsetX: (canvasWidth - width) / 2,
      offsetY: (canvasHeight - height) / 2,
      destinations: [],
    }
  );

  processData(result);

  return result;
};
