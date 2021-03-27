/**
 * This function defines the algorythm for plotting city blocks maintaining the diamond shape.
 * The input is a sequential number of the block and the output are
 * the pair of cartesian coordinates to be later converted into isometric coordinates.
 *
 * @param {int} n positive integer representing the sequence number of the city block
 */
function getMapTileCoordinates(n) {
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error("We can only draw blocks with positive integer numbers");
  }

  // primary coordinate
  const primary = Math.ceil(Math.sqrt(n));

  // secondary coordinate
  const secondary = Math.ceil((n - Math.pow(Math.floor(Math.sqrt(n)), 2)) / 2);

  if (secondary === 0) {
    // center line tile
    return { x: primary, y: primary };
  } else {
    // boolean representing the side of the diamond, e.g. left (false) or right (true)
    const direction =
      Math.ceil((n - Math.pow(Math.floor(Math.sqrt(n)), 2)) / 2) -
        Math.floor((n - Math.pow(Math.floor(Math.sqrt(n)), 2)) / 2) ===
      0;

    if (direction) {
      // append to the right
      return { x: secondary, y: primary };
    } else {
      // append to the left
      return { x: primary, y: secondary };
    }
  }
}
export const generateMapHTML = function (total) {
  // scale the image if total is too high
  const tileScale = 1;

  // actual image dimensions
  const tileOriginalWidth = 200;
  const highestTileOriginalHeight = 420;
  const numberOfTileVariations = 11;

  // calculated dimensions based on scale
  const tileWidth = tileOriginalWidth * tileScale;
  const tileHeight = tileWidth / 2;
  const isometricSkew = 1.73;
  const highestTileHeight = highestTileOriginalHeight * tileScale;

  let lowestIsoX = 0;
  let highestIsoX = 0;
  let highestIsoY = 0;

  const tiles = [];

  for (let i = total; i >= 1; i--) {
    const blockCoordinates = getMapTileCoordinates(i);

    const isoX =
      (blockCoordinates.x * tileWidth) / 2 - blockCoordinates.y * tileHeight;
    const isoY =
      ((blockCoordinates.x * tileWidth) / 2 + blockCoordinates.y * tileHeight) /
      isometricSkew;

    if (lowestIsoX > isoX) {
      lowestIsoX = isoX;
    }
    if (highestIsoX < isoX) {
      highestIsoX = isoX;
    }
    if (highestIsoY < isoY) {
      highestIsoY = isoY;
    }

    const tileNumber = Math.floor(Math.random() * numberOfTileVariations) + 1;

    tiles.push({ tileNumber, isoX, isoY });
  }

  const html = tiles.reduce((html, tile) => {
    html += `<img src="images/tiles/terraprime/tiles_v2-${tile.tileNumber
      .toString()
      .padStart(2, "0")}.png" width="${tileWidth}"
          style="
            position: absolute;
            left: ${tile.isoX - lowestIsoX}px;
            bottom: ${tile.isoY - tileHeight}px;
          "/>`;
    return html;
  }, "");

  return `<html>
  <body>
  <div style="text-align:center;">
  <img itemprop="image"  style="vertical-align:middle" src="https://avatars.githubusercontent.com/u/80906958?s=200&amp;v=4" width="50" height="50" alt="@GitTerraGame">
  <span style="font-size:xx-large;vertical-align:middle;margin-bottom: 25px;">GitTerraGame</span>
  </div>
      <div style="
        position: absolute;
        width: ${highestIsoX - lowestIsoX + tileWidth}px;
        height: ${highestIsoY + highestTileHeight - tileHeight}px;
        top: 50%;
        left: 50%;
        margin-right: -50%;
        transform: translate(-50%, -50%)
      ">${html}</div>
  <div style="position: fixed; bottom:10;"><a href="https://github.com/GitTerraGame/GitTerra/issues">Please give us your feedback!</a></div>
  </body></html>`;
};
