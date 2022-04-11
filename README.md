 
# SPACE GAME - GA Project One - 7 Days 
 
This game was created for General Assembly’s project one. It was a solo project where we were tasked to build a game using what we have learned so far. I decided to build a Pacman clone first, hence the layout of the game. Once the pacman MVP was met, I realized I had more time to challenge myself even further. I decided Pacman could shoot bullets in different directions instead of just moving around the map, which led to me adding more enemies on the board to balance against Pacman’s new found ability! That's how SPACE GAME was born!
![The Game](https://i.imgur.com/zCwc8KC.png)
In this game the player controls a spaceship and is tasked with collecting 5 orbs, while shooting their way through hordes of enemy spaceships.
# Features
* Background music and randomized sound effects for shooting missiles and destroying enemies.
* Highscore tracking using the browser's local storage.
* Different pop ups depending on whether you win or lose.
* Death animation when the player is defeated.
 
## Demo
 
SPACE GAME can be experienced [here](https://bit.ly/3t9OQh1).
 
## Brief 
* The player should be able to clear at least one board.
* The player's score should be displayed at the end of the game.
 
## Skills
JavaScript, HTML, CSS.
 
 
##  Building Process
For this project I decided to create a wireframe using a pen and paper to roughly figure out the layout my page and game should have. Multiple times during development I would search the web for free sprites I could use for my player, enemies and UI.
 ![Wireframe](https://i.imgur.com/HvHxn6M.jpg)
### The Board
 
First thing I needed for this game was a grid to represent a level,I decided to go with a 18x18 grid.
```javascript
const grid = document.querySelector('#grid')
const width = 18
const cellCount = width * width
const cells = []
 
```
 
I created an object `levelBuildingBlock` where every value corresponds to a CSS class in the main.css folder. The idea here is to make it easier for me to keep track of variables I used to build the level.
 
```javascript
const levelBuildingBlock = {
   barrier: 'wall',
   projectile: 'missile',
   explosion: 'explosion',
   enemy: [],
   collectable: 'collectable'
 }
```
To save on time whenever I decided to add a new enemy sprite in CSS, I created this for-loop to populate the enemy array.
 
```javascript
for (let i = 1; i <= 5; i++) {
   const enemyCssClass = `enemy${i}`
   levelBuildingBlock.enemy.push(enemyCssClass)
 }
```
 
To represent the board's layout of walls and paths, I created a level array. `0` represents a wall and `null` represents a path.
 
```javascript
class Level {
   constructor(id, levelArray) {
     this.id = id
     this.levelArray = levelArray
   }
 }
 
const levelOne = new Level(1, [
   0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,null,null,null,null,null,null,null,0,0,null, ... ])
```
 
`createGrid(levelArray)` function allowed me to both populate the grid with walls (space) , rotate each wall sprite to a random position and give the illusion of a random sky.
 
 
```javascript
const createGrid = (levelArray) => {
   for (let i = 0; i < cellCount; i++) {
     const cell = document.createElement('div')
    
     const rotationArr = ['0', '90', '180', '270']
    
     //create a random star cluster
     const randomIndex = Math.floor(Math.random() * rotationArr.length)
 
     if (levelArray[i] === 0) {
       cell.classList.add(levelBuildingBlock.barrier)
       cell.style.transform = `rotate(${rotationArr[randomIndex]}deg)`
     }
 
     grid.appendChild(cell)
     cells.push(cell)
   }
 }
```
 
 
 
 
### Characters
 
I created a single Class for both the player and the enemy sprites. Looking back at it, creating a base class then extending it to both an enemy class and a player class would have been cleaner.
```javascript
class Character {
    constructor(
      id,
      cssClass,
      startingPosition,
      currentPosition,
      previousPosition,
      isFacing
    ) {
      this.id = id
      this.cssClass = cssClass
      this.startingPosition = startingPosition
      this.currentPosition = currentPosition
      this.previousPosition = previousPosition
      this.isFacing = isFacing
      this.speed = 0.75
      this.pickDirectionSpeed = 2
      this.pickDirectionInterval
      this.movementpatternInterval
      this.indexToMoveInto
      this.directionIndex
      this.directions = [
        {position: -width, direction: 'up', rotate: 'rotate(90deg) scaleX(-1)'},
        {position: +1, direction: 'right', rotate: 'rotate(0deg)'},
        {position: +width, direction: 'down', rotate: 'rotate(90deg)'},
        {position: -1, direction: 'left', rotate: 'scaleX(-1)'}
      ]
    }
    movnemtPattern() {...}
 
    pickDirection() {...}
    startPickDirection() {...}
    startMovnemtPattern() {...}
    stopPickDirection() {...}
    stopMovmentPattern() {...}
    disableMovment() {...}
  }
``` 
#### Enemies
 
At the start of the game, 6 enemies are spawned on random locations of the grid, as long as this location doesn't already include a wall, another enemy, the player or be within two blocks from the player.
Whenever an enemy is destroyed by a player's missile, two new enemies spawn.
```javascript
const startingEnemyCount = 6
let updatedNumberOfEnemies = startingEnemyCount
let enemies = []
 
const createEnemies = () => {
   // controls max number of enemies on the board - everytime an enemy is killed two spawn in its place
   while (enemies.length < updatedNumberOfEnemies) {
     const enemiesArr = levelBuildingBlock.enemy
     const randomEnemyIndex = Math.floor(Math.random() * enemiesArr.length)
     const enemyCssClass = enemiesArr[randomEnemyIndex]
     let randomPositionIndex = Math.floor(Math.random() * cells.length)
 
     // enemies don't spawn within walls, in the same location as other enemies or players location (as well as within two blocks near the player)
     while (
       cells[randomPositionIndex].classList.contains(
         levelBuildingBlock.barrier
       ) ||
       levelBuildingBlock.enemy.some((enemy) =>
         cells[randomPositionIndex].classList.contains(enemy)
       ) ||
       cells[randomPositionIndex].classList.contains(player.cssClass) ||
       randomPositionIndex === player.currentPosition - width ||
       randomPositionIndex === player.currentPosition - width * 2 ||
       randomPositionIndex === player.currentPosition + width ||
       randomPositionIndex === player.currentPosition - width * 2 ||
       randomPositionIndex === player.currentPosition + 1 ||
       randomPositionIndex === player.currentPosition + 2 ||
       randomPositionIndex === player.currentPosition - 1 ||
       randomPositionIndex === player.currentPosition - 2
     ) {
       randomPositionIndex = Math.floor(Math.random() * cells.length)
     }
 
     const enemy = new Character(
       id,
       enemyCssClass,
       randomPositionIndex,
       randomPositionIndex,
       randomPositionIndex,
       facing[1]
     )
     id++
     enemies.push(enemy)
     addToGrid(enemy.startingPosition, enemyCssClass)
     enemy.pickDirection()
     enemy.movnemtPattern()
     enemy.startPickDirection()
     enemy.startMovnemtPattern()
   }
 }
 
```
 
##### Enemy Movement
The random movement of the enemies is determined by two time intervals that are built into the character class, `startMovnmentPattern()` moves the enemy in the direction it’s facing every 0.75 of a second, `startPickDirection()` picks one of 4 directions for the enemy to face every 2 seconds.
Enemies can't move into a block that contains a wall or another enemy.
 
 
 
#### The Player
 
The player is the larger spaceship on the board and is controlled by keys pressed on the keyboard.
 
##### Player Movement
Created an event listener that handled keyboard presses. Whenever an arrow key is pressed `playerActions()` is called, the player will only move in the direction pressed if there is no wall adjacent to the player in that direction. `playerFacing(key)` will be called and updates the player's sprite to face the desired direction.
 
```javascript
// Key codes
const up = 38
const right = 39
const down = 40
const left = 37
const fire = 83
 
const playerActions = (key) => {
   if (
     // * Up *
     key === up &&
     !cells[player.currentPosition - width].classList.contains(
       levelBuildingBlock.barrier
     )
   ) {...} else if (
     // * Right *
     (key === right &&
       !cells[player.currentPosition + 1].classList.contains(
         levelBuildingBlock.barrier
       )) ||
     (key === right && player.currentPosition % width === width - 1)
   ) {...} else if (
     // * Down *
     key === down &&
     !cells[player.currentPosition + width].classList.contains(
       levelBuildingBlock.barrier
     )
   ) {...} else if (
     // * Left *
     (key === left &&
       !cells[player.currentPosition - 1].classList.contains(
         levelBuildingBlock.barrier
       )) ||
     (key === left && player.currentPosition % width === 0)
   ) {...} else if (key === fire) {
     const missile = new Missile(
       player.currentPosition,
       player.isFacing.direction,
       levelBuildingBlock.projectile
     )
     missiles.push(missile)
     missile.shoot()
     // shotsAudio.src = ''
   }
   playerFacing(key)
 }
 ```
 
 ##### Shooting
 
 The `playerActions()` function also checks if the key pressed corresponds to `fire`. Whenever the `fire` key is pressed, a new missile is created from the Missile Class.
 
 ```javascript
   class Missile {
   constructor(playerPosition, playerFacingDirection, cssClass) {
     this.playerPosition = playerPosition
     this.playerFacingDirection = playerFacingDirection
     this.position
     this.cssClass = cssClass
     this.speed = 0.1
     this.movementInterval
   }
   shoot() {...}
   movement() {...}
   startMovment() {...}
   stopMovment() {...}
 }
 ```
 
Based on the direction the player sprite is facing when the `fire` key is pressed, a missile will appear on the block adjacent to the player's ship's nose, if there isn't a wall occupying this block. The missile will continue on the same trajectory until it occupies the same block as a wall or an enemy.
 
 
 
 
#### Collectible
A collectible is created in the middle of the board at the start of the game. Whenever the player collects it, a new one is created at a random location for the player to collect.
```javascript
class Collectable {
       constructor(cssClass, position) {
           this.cssClass = cssClass
           this.position = position
       }
       remove() {
           removeFromGrid(this.position, this.cssClass)
           const i = collectables.indexOf(this)
           collectables.splice(i, 1)
       }
   }
```
 
 
### Interactions
 
At the start of the game, an interval is set to run `playerIneractions()` every millisecond. The function checks:
* If the player and a collectible occupy the same block, it removes the collectible and spawns a new one, but ends the game if it's the 5th collectible.
* If the missile occupies the same block as an enemy, it removes both.
* If the player occupies the same block as an enemy, the game ends.
 
## Known Errors and Bugs
 
With the limited time, I had prioritized functionality over page responsiveness.
* Game best viewed in full screen. Screen might scroll up and down when pressing these buttons for movement.
* Enemy sprites and bullets can't wrap around the map like the player can.
 
### Challenges
Some of the interesting challenges I faced during development:
* Creating a system that rotates sprites correctly when a character moves around the board.
* Stopping enemy movement intervals after they've been destroyed.
 
### Wins
My biggest wins:
* Using player `isFacing` information, feeding that into the missile class to determine in which direction the missile should go.
* The amount of features I was able to implement into the project in such a short time was a great confidence booster.
 
### Key Learnings
* I improved my understanding on how classes and their methods can be used in a real project.
* Solidified DOM manipulation using vanilla JavaScript.
* Seeing the value of clean DRY Code.
 
 
 
## Future Improvements
 
* Better responsiveness on smaller screens
* A system where the player has a limited number of bullets and needs to pick up ammunition from locations on the board.
* Better enemy AI that can follow the player and shoot missiles.
 
 

