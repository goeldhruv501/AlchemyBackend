const canvas = document.getElementById("infinitePlane");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth - 200;
canvas.height = window.innerHeight;

let offsetX = 0;
let offsetY = 0;
let isDraggingPlane = false;
let dragStartX, dragStartY;

// Adjust canvas size on window resize
window.addEventListener("resize", () => {
    canvas.width = window.innerWidth - 200;
    canvas.height = window.innerHeight;
});

// Draw the grid
function drawGrid() {
    const gridSize = 50;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 1;

    for (let x = -offsetX % gridSize; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (let y = -offsetY % gridSize; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// Handle plane dragging
canvas.addEventListener("mousedown", (e) => {
    isDraggingPlane = true;
    dragStartX = e.clientX - offsetX - document.querySelector(".columns").offsetWidth;
    dragStartY = e.clientY - offsetY;
});

canvas.addEventListener("mousemove", (e) => {
    if (isDraggingPlane) {
        offsetX = e.clientX - dragStartX - document.querySelector(".columns").offsetWidth;
        offsetY = e.clientY - dragStartY;
        drawGrid();
        drawBoxes(); // Redraw boxes
    }
});

canvas.addEventListener("mouseup", () => {
    isDraggingPlane = false;
});

canvas.addEventListener("mouseleave", () => {
    isDraggingPlane = false;
});

drawGrid();

// Boxes array
const boxes = [];
let isDraggingBox = false;
let draggedBox = null;

// Drag start event for boxes from the column
document.querySelectorAll(".box").forEach((box) => {
    box.addEventListener("dragstart", (e) => {
        const rect = box.getBoundingClientRect();
        e.dataTransfer.setData(
            "text/plain",
            JSON.stringify({ width: rect.width, height: rect.height })
        );
    });
});

// Canvas dragover and drop events
canvas.addEventListener("dragover", (e) => {
    e.preventDefault();
});

canvas.addEventListener("drop", (e) => {
    const data = JSON.parse(e.dataTransfer.getData("text/plain"));
    const boxX = e.clientX - offsetX - document.querySelector(".columns").offsetWidth - data.width / 2;
    const boxY = e.clientY - offsetY - data.height / 2;
  
    const newBox = {
      x: boxX,
      y: boxY,
      width: data.width,
      height: data.height,
      color: "#ff6f61",
      isDragging: false,
    };
  
    boxes.push(newBox);
    drawBoxes();
});

// Mouse down event for boxes on the canvas
canvas.addEventListener("mousedown", (e) => {
  for (let i = 0; i < boxes.length; i++) {
    const box = boxes[i];
    if (e.clientX > box.x + offsetX + document.querySelector(".columns").offsetWidth &&
        e.clientX < box.x + box.width + offsetX + document.querySelector(".columns").offsetWidth &&
        e.clientY > box.y + offsetY &&
        e.clientY < box.y + box.height + offsetY) {
      isDraggingBox = true;
      draggedBox = box;
      dragStartX = e.clientX - box.x - offsetX - document.querySelector(".columns").offsetWidth;
      dragStartY = e.clientY - box.y - offsetY;
      canvas.style.cursor = "grabbing";
      break;
    }
  }
});

// Mouse move event for dragging boxes
canvas.addEventListener("mousemove", (e) => {
  if (isDraggingBox && draggedBox) {
    draggedBox.x = e.clientX - dragStartX - offsetX - document.querySelector(".columns").offsetWidth;
    draggedBox.y = e.clientY - dragStartY - offsetY;
    drawGrid();
    drawBoxes();
    checkCollisions();
  }
});

// Mouse up event to stop dragging
canvas.addEventListener("mouseup", () => {
    isDraggingBox = false;
    draggedBox = null;
    canvas.style.cursor = "default";
});

canvas.addEventListener("mouseleave", () => {
    isDraggingBox = false;
    draggedBox = null;
    canvas.style.cursor = "default";
});

// Function to draw all boxes
function drawBoxes() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawGrid();

  boxes.forEach((box) => {
    ctx.fillStyle = box.color;
    ctx.fillRect(box.x, box.y, box.width, box.height);

    ctx.strokeStyle = "#333";
    ctx.strokeRect(box.x, box.y, box.width, box.height);
  });
}

// Function to check for collisions
function checkCollisions() {
    for (let i = 0; i < boxes.length; i++) {
        for (let j = i + 1; j < boxes.length; j++) {
            const box1 = boxes[i];
            const box2 = boxes[j];

            const collision = !(
                box1.x + box1.width < box2.x ||
                box1.x > box2.x + box2.width ||
                box1.y + box1.height < box2.y ||
                box1.y > box2.y + box2.height
            );

            if (collision && box1.color === "#ff6f61" && box2.color === "#ff6f61") {
                box1.color = "blue";
                box2.color = "blue";
                drawBoxes();
            }
        }
    }
}
