let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

let columns = 20;
let rows = 20;
let gap = 0;
let pixelSize = canvas.getAttribute('width') / columns;
let xPos = 0;
let yPos = 0;

class Snake {
    position = [];
    positions_arr = [[1, 1]];
    current_direction = 'right';
    string = '';
    constructor(color, length, position){
        this.color = color;
        this.length = length;
        this.position = [position[0], position[1]];
        this.addPosition(position);
    }
    addPosition(position){
        let x = position[0];
        let y = position[1];
        this.positions_arr.unshift([x, y]);
    }
    eat(){
        this.length++;
    }
    move(direction, foodPos){
        let collisionData = {};
        
        if(direction === 'right'){
            if(this.current_direction === 'left'){
                this.position[0]--;
                collisionData = this.checkForCollision(foodPos);
                direction = 'left';
            }else {
                this.position[0]++;
                collisionData = this.checkForCollision(foodPos);
            }
        }else if(direction === 'left'){
            if(this.current_direction === 'right'){
                this.position[0]++;
                direction = 'right';
                collisionData = this.checkForCollision(foodPos);
            }else {
                this.position[0]--;
                collisionData = this.checkForCollision(foodPos);
            }
        }else if(direction === 'top'){
            if(this.current_direction === 'bottom'){
                this.position[1]++;
                direction = 'bottom';
                collisionData = this.checkForCollision(foodPos);
            }else {
                this.position[1]--;
                collisionData = this.checkForCollision(foodPos);
            }
        }else {
            if(this.current_direction === 'top'){ 
                this.position[1]--;
                direction = 'top';
                collisionData = this.checkForCollision(foodPos);
            }else {          
                this.position[1]++;
                collisionData = this.checkForCollision(foodPos);
            }
        }
        this.addPosition(this.position);
        this.current_direction = direction;
        return collisionData;
    }
    checkForCollision(foodPos){
        let data = {
            food: false,
            wall: false,
            self: false
        }
        if(this.position[0] === foodPos[0] && this.position[1] === foodPos[1]){
            data.food = true;
        }
        if([0, columns - 1].includes(this.position[0]) || [0, rows - 1].includes(this.position[1])){
            data.wall = true;
        }
        let snakeArr = this.positions_arr.slice(0, this.length);
        for(let i = 0; i < this.length; i++){
            if(i === 0){
                continue;
            }else {
                if(snakeArr[i][0] === this.position[0] && snakeArr[i][1] === this.position[1]){
                    data.self = true;
                }
            }
        }
        return data;
    }
}
class Food {
    constructor(color, position) {
        this.color = color;
        this.position = position;
    }
    newPosition(freeTiles){
        //TODO: Make an array of available fields so that your computer doesn't explode
        let randomPos = Math.floor(Math.random() * freeTiles.length);
        this.position = freeTiles[randomPos];
    }
}
class Game {
    constructor(score, speed){
        this.score = score;
        this.speed = speed;
    }
    increase_score(){
        this.score++;
    }
}
//Looks for an array in another array
function inArray(arr, search){
    let found = false;
    for(let x of arr){
        if(x[0] === search[0] && x[1] === search[1]){
            found = true;
        }
    }
    return found;
}

//Checks what tiles are not occupied by the snake so that food can be placed in one of them
function freeTiles(snake){
    let tiles = [];
    for(let i = 1; i < columns - 1; i++){
        for(let j = 1; j < rows - 1; j++){
            let currentTile = [i, j];
            if(inArray(snake.positions_arr.slice(0, snake.length), currentTile)){
                continue;
            }else {
                tiles.push(currentTile);
            }
        }
    }
    return tiles;
}

function start(game, snake, food){
    let direction = 'right';
    document.addEventListener('keydown', function(e){
        switch(e.key){
            case 'ArrowRight':
                direction = 'right';
                break;
            case 'ArrowLeft':
                direction = 'left';
                break;
            case 'ArrowUp':
                direction = 'top';
                break;
            case 'ArrowDown':
                direction = 'bottom';
                break;
            default:
                break;
        }
    });
    drawFrame(snake, food);
    let frameDrawing = setInterval(function(){
        let data = snake.move(direction, food.position);
        if(data.food){
            snake.eat();
            game.increase_score();
            food.newPosition(freeTiles(snake));
            document.querySelector("#score").textContent = `Score: ${game.score}`;
        }
        if(data.wall || data.self){
            clearInterval(frameDrawing);
            setTimeout(function(){
                document.querySelector("#gameover-interface").style.display = "flex";
                document.querySelector("#gameover-interface").innerHTML = `
                    <p>Game Over</p>
                    <p>Score: ${game.score}</p>
                    <button id="play-again">Play again</button>
                `;
                document.querySelector("#play-again").addEventListener('click', function(){
                    document.querySelector("#gameover-interface").style.display = "none";
                    document.querySelector("#countdown-interface").style.display = "flex";
                    countdown(3);
                });
                document.querySelector("#score").style.visibility = "hidden";
            }, 1000);
            return;
        }
        drawFrame(snake, food);
    }, game.speed);
}
function drawFrame(snake, food){
    for(let i = 0; i < columns; i++){
        for(j = 0; j < rows; j++){
            let color = '#2d2d2d';
            for(let z = 0; z < snake.length; z++){
                let curPos = snake.positions_arr[z];
                if(i === curPos[0] && j === curPos[1]){
                    color = snake.color;
                }
            }
            if(i === food.position[0] && j === food.position[1]){
                color = food.color;
            }
            if(i === 0 || j === 0 || i === columns - 1  || j === rows - 1){
                color = 'gray';
            }
            ctx.fillStyle = color;
            ctx.fillRect(i * pixelSize, j * pixelSize, pixelSize, pixelSize);
        }
    }
}

function drawFirstFrame(snake, food){
    for(let i = 0; i < columns; i++){
        for(j = 0; j < rows; j++){
            let color = '#2d2d2d';
            for(let z = 0; z < snake.length; z++){
                let curPos = snake.positions_arr[z];
                if(i === curPos[0] && j === curPos[1]){
                    color = snake.color;
                }
            }
            if(i === food.position[0] && j === food.position[1]){
                color = food.color;
            }
            if(i === 0 || j === 0 || i === columns - 1  || j === rows - 1){
                color = 'gray';
            }
            ctx.fillStyle = color;
            ctx.fillRect(i * pixelSize, j * pixelSize, pixelSize, pixelSize);
        }
    }
}

function countdown(seconds){
    let game = new Game(0, 50);
    let snake = new Snake('#61A02A', 2, [2, 1]);
    let food = new Food('#B10417', [4, 4]);
    document.querySelector("#score").textContent = `Score: ${game.score}`;
    document.querySelector("#score").style.visibility = "visible";
    drawFirstFrame(snake, food);
    document.querySelector("#countdown-interface").innerHTML = `<p class="countdown">${seconds}</p>`;
    let countdownInterval = setInterval(function(){
        seconds--;
        document.querySelector("#countdown-interface").innerHTML = `<p class="countdown">${seconds}</p>`;
        if(seconds === 0){
            clearInterval(countdownInterval);
            document.querySelector("#countdown-interface").style.display = "none";
            document.querySelector("#score").style.visibility = "visible";
            start(game, snake, food);
        }
    }, 1000);
}

document.querySelector("#start-game").addEventListener('click', function(){
    document.querySelector("#start-interface").style.display = "none";
    document.querySelector("#countdown-interface").style.display = "flex";
    countdown(3);
});