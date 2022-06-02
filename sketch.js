let map,
  route,
  currentLocation,
  openNodeList = [];
const rowsCount = 20,
  colsCount = 20;
const mapWidth = 600,
  mapHeight = 600;
const perGridWidth = mapWidth / colsCount;
const perGridHeight = mapHeight / rowsCount;

const icons = ["./icons/cafe.svg", "./icons/cinema.svg", "./icons/gym.svg", "./icons/park.svg", "./icons/shop.svg", "./icons/apartment.svg", "./icons/me.svg"];

const places = [
  { x: 3, y: 4, name: "cafe", iconIndex: 0 },
  { x: 12, y: 11, name: "cafe", iconIndex: 0 },
  { x: 1, y: 12, name: "cinema", iconIndex: 1 },
  { x: 8, y: 9, name: "gym", iconIndex: 2 },
  { x: 17, y: 9, name: "gym", iconIndex: 2 },
  { x: 13, y: 2, name: "park", iconIndex: 3 },
  { x: 4, y: 9, name: "park", iconIndex: 3 },
  { x: 8, y: 5, name: "apartment", iconIndex: 5 },
  { x: 12, y: 6, name: "apartment", iconIndex: 5 },
  { x: 16, y: 17, name: "apartment", iconIndex: 5 },
  { x: 19, y: 16, name: "apartment", iconIndex: 5 },
  { x: 2, y: 17, name: "apartment", iconIndex: 5 },
  { x: 7, y: 12, name: "apartment", iconIndex: 5 },
  { x: 15, y: 2, name: "cinema", iconIndex: 1 },
  { x: 18, y: 2, name: "apartment", iconIndex: 5 },
  { xStart: 3, xEnd: 6, yStart: 8, yEnd: 11, name: "forest" },
  { xStart: 11, xEnd: 14, yStart: 3, yEnd: 5, name: "lake" },
  { xStart: 8, xEnd: 11, yStart: 14, yEnd: 18, name: "forest" },
  { xStart: 14, xEnd: 17, yStart: 10, yEnd: 12, name: "forest" },
];

function createMap(rowsCount, colsCount, places) {
  const map = [];
  for (let i = 0; i < colsCount; i++) {
    map[i] = [];
    for (let j = 0; j < rowsCount; j++) {
      const node = new Node(i, j, null);
      map[i].push(node);
      node.fillNode(250, true);
    }
  }
  return map;
}

function setPlaces(map) {
  for (let i = 0; i < places.length; i++) {
    if (places[i].x) {
      const node = map[places[i].x][places[i].y];
      node.place = places[i].name;
      node.icon = icons[places[i].iconIndex];
      createIcon(icons[places[i].iconIndex], node);
    } else {
      const temp = places[i].xStart;
      while (places[i].xStart <= places[i].xEnd) {
        const node = map[places[i].xStart][places[i].yStart];
        node.place = places[i].name;
        node.icon = undefined;
        let color;
        if (places[i].name == "forest") {
          color = "#abf5c9";
        } else if (places[i].name == "lake") {
          color = "#85e9f2";
        }
        node.fillNode(color, false);

        places[i].xStart += 1;
        if (places[i].xStart == places[i].xEnd) {
          places[i].yStart += 1;
          places[i].xStart = temp;
        }
        if (places[i].yStart == places[i].yEnd) {
          break;
        }
      }
    }
  }
}

function createIcon(icon, node) {
  image(icon, node.x * perGridWidth + (perGridWidth - 20) / 2, node.y * perGridHeight + (perGridHeight - 20) / 2, 20, 20);
}

//Nodes
class Node {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.g = Infinity;
    this.f = Infinity;
    this.h = 0;
    this.cameFrom = undefined;
    this.place = undefined;
    this.icon = undefined;
    this.neighbors = [];
    this.isInPath = false;
  }
  fillNode(color, isStroke) {
    isStroke ? stroke(245) : stroke(color);
    fill(color);
    rect(this.x * perGridWidth, this.y * perGridHeight, perGridWidth, perGridHeight);
  }
  findNeighbors() {
    if (this.x < colsCount - 1) {
      this.neighbors.push(map[this.x + 1][this.y]);
    }
    if (this.y > 0) {
      this.neighbors.push(map[this.x][this.y - 1]);
    }
    if (this.x > 0) {
      this.neighbors.push(map[this.x - 1][this.y]);
    }
    if (this.y < rowsCount - 1) {
      this.neighbors.push(map[this.x][this.y + 1]);
    }
    if (this.y > 0 && this.x > 0) {
      this.neighbors.push(map[this.x - 1][this.y - 1]);
    }
    if (this.x < colsCount - 1 && this.y < rowsCount - 1) {
      this.neighbors.push(map[this.x + 1][this.y + 1]);
    }
    if (this.y > 0 && this.x < colsCount - 1) {
      this.neighbors.push(map[this.x + 1][this.y - 1]);
    }
    if (this.x > 0 && this.y < rowsCount - 1) {
      this.neighbors.push(map[this.x - 1][this.y + 1]);
    }
    return this.neighbors;
  }

  line() {
    stroke(0);
    strokeWeight(2);
    if (this.cameFrom) {
      line(
        this.x * perGridWidth + perGridWidth / 2,
        this.y * perGridHeight + perGridHeight / 2,
        this.cameFrom.x * perGridWidth + perGridWidth / 2,
        this.cameFrom.y * perGridHeight + perGridHeight / 2
      );
    }
  }
}

function refreshMap(map) {
  for (let i = 0; i < colsCount; i++) {
    for (let j = 0; j < rowsCount; j++) {
      if (map[i][j].isInPath || !map[i][j].place || map[i][j].icon) {
        map[i][j].fillNode(250, 245);
        if (map[i][j].icon) {
          createIcon(map[i][j].icon, map[i][j]);
        }
      }

      map[i][j].g = Infinity;
      map[i][j].f = Infinity;
      map[i][j].h = 0;
      map[i][j].neighbors = [];
      map[i][j].cameFrom = undefined;
      map[i][j].isInPath = false;
    }
  }
}

function setCurrentLocation(map) {
  currentLocation = map[Math.floor(Math.random() * rowsCount)][Math.floor(Math.random() * rowsCount)];
  if (currentLocation.place) {
    return setCurrentLocation(map);
  }

  currentLocation.icon = icons[6];
  createIcon(icons[6], currentLocation);
}

class Route {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }
}

function heuristic(node, endNode) {
  return Math.sqrt(pow(endNode.x - node.x, 2) + pow(endNode.y - node.y, 2));
}

function preload() {
  for (let i = 0; i < icons.length; i++) {
    const icon = loadImage(icons[i]);
    icons[i] = icon;
  }
}

function setup() {
  createCanvas(mapWidth, mapHeight);
  map = createMap(rowsCount, colsCount, places);
  setPlaces(map);
  setCurrentLocation(map);
}

function mousePressed(event) {
  noLoop();

  if (event.path[0] == document.getElementById("defaultCanvas0")) {
    document.getElementById("loading").style.display = "block";
    refreshMap(map);

    const targetX = Math.floor(event.offsetX / perGridWidth);
    const targetY = Math.floor(event.offsetY / perGridHeight);

    route = new Route(map[currentLocation.x][currentLocation.y], map[targetX][targetY]);

    openNodeList = [];
    openNodeList.push(route.start);

    route.start.f = heuristic(route.start, route.end);
    route.start.g = 0;
    route.start.h = 0;
    loop();
  }
}

function draw() {
  if (openNodeList.length > 0) {
    let current;
    let lowestIndex = 0;

    for (let i = 0; i < openNodeList.length; i++) {
      if (openNodeList[i].f < openNodeList[lowestIndex].f) {
        lowestIndex = i;
      }
    }
    current = openNodeList[lowestIndex];
    openNodeList.splice(openNodeList.indexOf(current), 1);

    if (current == route.end) {
      while (current != route.start) {
        current.line();
        current.isInPath = true;
        current = current.cameFrom;
      }
      document.getElementById("loading").style.display = "none";
    }

    const neighbors = current.findNeighbors();

    for (let j = 0; j < neighbors.length; j++) {
      // The heuristic function give distance between current and its neighbor
      const gScore = current.g + heuristic(current, neighbors[j]);

      if (gScore < neighbors[j].g) {
        neighbors[j].g = gScore;
        neighbors[j].f = gScore + heuristic(neighbors[j], route.end);
        neighbors[j].cameFrom = current;

        if ((!openNodeList.includes(neighbors[j]) && !neighbors[j].place) || neighbors[j] == route.end) {
          openNodeList.push(neighbors[j]);
        }
      }
    }
  }
}
