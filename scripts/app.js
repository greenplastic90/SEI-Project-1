/* eslint-disable object-curly-spacing */
/* eslint-disable no-dupe-class-members */
const init = () => {
  // * Variables
  const grid = document.querySelector('#grid')
  const htmlScore = document.querySelectorAll('.score')
  const htmlHighScore = document.querySelectorAll('.high-score')
  const htmlNumberOfCollectables = document.querySelectorAll('.collectables')
  const htmlCollectablesToWin = document.querySelectorAll('.to-win')
  const startBtn = document.querySelector('#start-btn')
  const exitBtn = document.querySelector('.exit-btn')
  const popupDiv = document.querySelector('.popup')
  const winLoseImage = document.querySelector('.win-lose-img')
  const shotsAudio = document.querySelector('#shots')
  const lose = document.querySelector('#lose')
  const collectAudio = document.querySelector('#collect')
  const explosionAudio = document.querySelector('#explosion')
  const victoryAudio = document.querySelector('#victory')
  const backgroundAudio = document.querySelector('#background-music')
  const allAudioTags = document.querySelectorAll('audio')
  allAudioTags.forEach((audioTag) => (audioTag.volume = 0.05))

  // console.log('score ->', htmlTime)
  let animateSky
  let player //created in startGame
  let isWinner // popup div is updated based on this boolean value
  let id = 2
  const startingEnemyCount = 6
  let updatedNumberOfEnemies = startingEnemyCount
  let enemies = []
  const missiles = []
  let collectables = []
  const numberOfCollectablesToWin = 5 // winning condition // create a dom elemt to update
  let collectablesCollected = 0 // create DOM element to update
  let firstCollectable = true // helps me put the first collectable in the middle of the board

  const width = 18
  const cellCount = width * width
  const cells = []

  const levelBuildingBlock = {
    barrier: 'wall',
    projectile: 'missile',
    explosion: 'explosion',
    enemy: [],
    collectable: 'collectable'
  }

  // populate levelbuldingblocks[3] with enemy css classes i've create in main.css
  for (let i = 1; i <= 5; i++) {
    const enemyCssClass = `enemy${i}`
    levelBuildingBlock.enemy.push(enemyCssClass)
  }

  const facing = [
    {rotate: 'rotate(90deg) scaleX(-1)', direction: 'up'},
    {rotate: 'rotate(0deg)', direction: 'right'},
    {rotate: 'rotate(90deg)', direction: 'down'},
    {rotate: 'scaleX(-1)', direction: 'left'}
  ]
  const returnDivToDefaultOrientation = 'rotate(0deg) scaleX(1)'

  // interval variables.. located in startGame()
  let spawnCollectableIfNeeded
  let spawnEnemyIfNeeded
  let interactionsInterval

  // Key codes
  const up = 38
  const right = 39 // d
  const down = 40 // s
  const left = 37 // a
  const fire = 83 // m

  let highScore = window.localStorage.getItem('high-score')
  let score = 0
  highScore ? null : (highScore = 0)

  // * Update DOM variables
  const updateDOM = () => {
    htmlScore.forEach((item) => (item.innerText = score))
    htmlHighScore.forEach((item) => (item.innerText = highScore))
    htmlNumberOfCollectables.forEach(
      (item) => (item.innerText = collectablesCollected)
    )
    htmlCollectablesToWin.forEach(
      (item) => (item.innerText = numberOfCollectablesToWin)
    )
  }
  updateDOM()

  // * Classes

  class Missile {
    constructor(playerPosition, playerFacingDirection, cssClass) {
      this.playerPosition = playerPosition
      this.playerFacingDirection = playerFacingDirection
      this.position
      this.cssClass = cssClass
      this.speed = 0.1
      this.movementInterval
    }
    shoot() {
      // checks if a missile is already on the board, I don't want the player to be able to have more than one missile deployed
      const isMissileAlreadyDeployed = cells.some((cell) =>
        cell.classList.contains(levelBuildingBlock.projectile)
      )
      if (isMissileAlreadyDeployed) {
        // don't shoot!
      } else {
        const randomSound = Math.floor(Math.random() * 4)
        shotsAudio.src = `audio/shoot/Laser_Shoot${randomSound}.wav`
        shotsAudio.play()
        if (
          this.playerFacingDirection === 'up' &&
          !cells[player.currentPosition - width].classList.contains(
            levelBuildingBlock.barrier
          )
        ) {
          this.position = this.playerPosition - width
          addToGrid(this.position, this.cssClass)
          this.startMovment()
        } else if (
          this.playerFacingDirection === 'right' &&
          !cells[player.currentPosition + 1].classList.contains(
            levelBuildingBlock.barrier
          )
        ) {
          this.position = this.playerPosition + 1
          addToGrid(this.position, this.cssClass)
          this.startMovment()
        } else if (
          this.playerFacingDirection === 'down' &&
          !cells[player.currentPosition + width].classList.contains(
            levelBuildingBlock.barrier
          )
        ) {
          this.position = this.playerPosition + width
          addToGrid(this.position, this.cssClass)
          this.startMovment()
        } else if (
          this.playerFacingDirection === 'left' &&
          !cells[player.currentPosition - 1].classList.contains(
            levelBuildingBlock.barrier
          )
        ) {
          this.position = this.playerPosition - 1
          addToGrid(this.position, this.cssClass)
          this.startMovment()
        }
      }
    }
    movement() {
      if (
        this.playerFacingDirection === 'up' &&
        !cells[this.position - width].classList.contains(
          levelBuildingBlock.barrier
        )
      ) {
        removeFromGrid(this.position, this.cssClass)
        this.position -= width
        addToGrid(this.position, this.cssClass)
      } else if (
        this.playerFacingDirection === 'right' &&
        !cells[this.position + 1].classList.contains(levelBuildingBlock.barrier)
      ) {
        removeFromGrid(this.position, this.cssClass)
        this.position += 1
        addToGrid(this.position, this.cssClass)
      } else if (
        this.playerFacingDirection === 'down' &&
        !cells[this.position + width].classList.contains(
          levelBuildingBlock.barrier
        )
      ) {
        removeFromGrid(this.position, this.cssClass)
        this.position += width
        addToGrid(this.position, this.cssClass)
      } else if (
        this.playerFacingDirection === 'left' &&
        !cells[this.position - 1].classList.contains(levelBuildingBlock.barrier)
      ) {
        removeFromGrid(this.position, this.cssClass)
        this.position -= 1
        addToGrid(this.position, this.cssClass)
      } else {
        this.stopMovment()
      }
    }
    startMovment() {
      this.movementInterval = setInterval(
        () => this.movement(),
        1000 * this.speed
      )
    }
    stopMovment() {
      clearInterval(this.movementInterval)
      removeFromGrid(this.position, this.cssClass)
      const missileIndex = missiles.indexOf(this)
      missiles.splice(missileIndex, 1)
    }
  }
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
    movnemtPattern() {
      if (
        this.directions[this.directionIndex].direction === 'up' &&
        !cells[this.indexToMoveInto].classList.contains(
          levelBuildingBlock.barrier
        ) &&
        !levelBuildingBlock.enemy.some((cssClass) => {
          cells[this.indexToMoveInto].classList.contains(cssClass)
        }) &&
        !cells[this.indexToMoveInto].classList.contains(
          levelBuildingBlock.collectable
        )
      ) {
        this.previousPosition = this.currentPosition
        removeFromGrid(this.currentPosition, this.cssClass)
        this.currentPosition = this.indexToMoveInto
        addToGrid(this.currentPosition, this.cssClass)
        this.indexToMoveInto -= width
      } else if (
        this.directions[this.directionIndex].direction === 'right' &&
        !cells[this.indexToMoveInto].classList.contains(
          levelBuildingBlock.barrier
        ) &&
        !levelBuildingBlock.enemy.some((cssClass) =>
          cells[this.indexToMoveInto].classList.contains(cssClass)
        ) &&
        !cells[this.indexToMoveInto].classList.contains(
          levelBuildingBlock.collectable
        )
      ) {
        this.previousPosition = this.currentPosition
        removeFromGrid(this.currentPosition, this.cssClass)
        this.currentPosition = this.indexToMoveInto
        addToGrid(this.currentPosition, this.cssClass)
        this.indexToMoveInto += 1
      } else if (
        this.directions[this.directionIndex].direction === 'down' &&
        !cells[this.indexToMoveInto].classList.contains(
          levelBuildingBlock.barrier
        ) &&
        !levelBuildingBlock.enemy.some((cssClass) =>
          cells[this.indexToMoveInto].classList.contains(cssClass)
        ) &&
        !cells[this.indexToMoveInto].classList.contains(
          levelBuildingBlock.collectable
        )
      ) {
        this.previousPosition = this.currentPosition
        removeFromGrid(this.currentPosition, this.cssClass)
        this.currentPosition = this.indexToMoveInto
        addToGrid(this.currentPosition, this.cssClass)
        this.indexToMoveInto += width
      } else if (
        this.directions[this.directionIndex].direction === 'left' &&
        !cells[this.indexToMoveInto].classList.contains(
          levelBuildingBlock.barrier
        ) &&
        !levelBuildingBlock.enemy.some((cssClass) =>
          cells[this.indexToMoveInto].classList.contains(cssClass)
        ) &&
        !cells[this.indexToMoveInto].classList.contains(
          levelBuildingBlock.collectable
        )
      ) {
        this.previousPosition = this.currentPosition
        removeFromGrid(this.currentPosition, this.cssClass)
        this.currentPosition = this.indexToMoveInto
        addToGrid(this.currentPosition, this.cssClass)
        this.indexToMoveInto -= 1
      }
      cells[this.currentPosition].style.transform =
        this.directions[this.directionIndex].rotate
      cells[this.previousPosition].style.transform =
        returnDivToDefaultOrientation
    }

    pickDirection() {
      this.directionIndex = Math.floor(Math.random() * this.directions.length)
      this.indexToMoveInto =
        this.currentPosition + this.directions[this.directionIndex].position

      // check that the box picked to move into isn't a wall
      while (
        cells[this.indexToMoveInto].classList.contains(
          levelBuildingBlock.barrier
        )
      ) {
        this.directionIndex = Math.floor(Math.random() * this.directions.length)
        this.indexToMoveInto =
          this.currentPosition + this.directions[this.directionIndex].position
      }
    }
    startPickDirection() {
      this.pickDirectionInterval = setInterval(
        () => this.pickDirection(),
        1000 * this.pickDirectionSpeed
      )
    }
    startMovnemtPattern() {
      this.movementpatternInterval = setInterval(
        () => this.movnemtPattern(),
        1000 * this.speed
      )
    }
    stopPickDirection() {
      clearInterval(this.pickDirectionInterval)
    }
    stopMovmentPattern() {
      clearInterval(this.movementpatternInterval)
    }
    disableMovment() {
      this.stopPickDirection()
      this.stopMovmentPattern()
      removeFromGrid(this.currentPosition, this.cssClass)
      const enemyIndex = enemies.indexOf(this)
      // enemies.splice(enemyIndex, 1)
      enemies = enemies
        .slice(0, enemyIndex)
        .concat(enemies.slice(enemyIndex + 1))
    }
  }
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

  class Level {
    constructor(id, levelArray) {
      this.id = id
      this.levelArray = levelArray
    }
  }

  // * Player and NPCs

  // * Levels

  const levelOne = new Level(1, [
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    0,
    0,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    0,
    0,
    null,
    0,
    0,
    0,
    0,
    0,
    null,
    0,
    0,
    null,
    0,
    0,
    0,
    0,
    0,
    null,
    0,
    0,
    null,
    0,
    0,
    0,
    0,
    0,
    null,
    0,
    0,
    null,
    0,
    0,
    0,
    0,
    0,
    null,
    0,
    0,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    0,
    0,
    null,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    null,
    0,
    0,
    null,
    null,
    null,
    null,
    null,
    0,
    null,
    null,
    null,
    null,
    0,
    null,
    null,
    null,
    null,
    null,
    0,
    0,
    0,
    0,
    0,
    0,
    null,
    0,
    null,
    0,
    0,
    null,
    0,
    null,
    0,
    0,
    0,
    0,
    0,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    0,
    0,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    0,
    0,
    0,
    0,
    0,
    null,
    0,
    null,
    null,
    null,
    null,
    0,
    null,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    null,
    0,
    0,
    0,
    0,
    0,
    0,
    null,
    0,
    0,
    0,
    0,
    0,
    0,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    0,
    0,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    0,
    0,
    null,
    0,
    0,
    0,
    null,
    0,
    null,
    0,
    0,
    null,
    0,
    null,
    0,
    0,
    0,
    null,
    0,
    0,
    null,
    0,
    0,
    0,
    null,
    0,
    null,
    null,
    null,
    null,
    0,
    null,
    0,
    0,
    0,
    null,
    0,
    0,
    null,
    null,
    null,
    null,
    null,
    0,
    0,
    0,
    0,
    0,
    0,
    null,
    null,
    null,
    null,
    null,
    0,
    0,
    null,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    null,
    0,
    0,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0
  ])

  // * Functions

  const animateExplosion = (position) => {
    const randomSound = Math.floor(Math.random() * 5)

    explosionAudio.src = `audio/explosions/Explosion${randomSound}.wav`
    // explosionAudio.volume = 0.3
    explosionAudio.play()

    addToGrid(position, levelBuildingBlock.explosion)
    setTimeout(
      () => removeFromGrid(position, levelBuildingBlock.explosion),
      1000 * 0.75
    )
  }
  const hidePopupDiv = () => {
    popupDiv.style.display = 'none'
    startBtn.style.pointerEvents = 'all'
    grid.style.display = 'grid'
  }
  const victory = () => {
    victoryAudio.src = 'audio/cheer.wav'
    victoryAudio.play()
    popupDiv.style.display = 'flex'
    removeFromGrid(player.currentPosition, player.cssClass)
    grid.style.display = 'none'
    player = null
  }
  const deathAnimation = () => {
    lose.src = 'audio/piano-gameover.wav'
    lose.play()
    setTimeout(() => (popupDiv.style.display = 'flex'), 1000 * 1.5)
    //set a rotation animation on every cell that doesn't have a wall

    cells.forEach((cell) =>
      cell.classList.contains(levelBuildingBlock.barrier)
        ? null
        : (cell.style.animation = 'rotation 1s infinite linear')
    )
    //remove animation from all cells
    setTimeout(
      () => cells.forEach((cell) => (cell.style.animation = 'none')),
      1000 * 1.5
    )

    setTimeout(
      () => removeFromGrid(player.currentPosition, player.cssClass),
      1000 * 2
    )
    setTimeout(() => (player = null), 1000 * 2)
    setTimeout(() => (grid.style.display = 'none'), 1000 * 1.5)
  }
  const runAnimateSky = () => {
    animateSky = setInterval(() => {
      const rotationArr = ['0', '90', '180', '270']
      cells.forEach((cell) => {
        if (cell.classList.contains(levelBuildingBlock.barrier)) {
          const randomIndex = Math.floor(Math.random() * rotationArr.length)
          cell.style.transform = `rotate(${rotationArr[randomIndex]}deg)`
        }
      })
    }, 1000 * 0.1)
  }

  const startGame = () => {
    // runAnimateSky()
    player = new Character(1, 'player', 297, 297, 297, facing[1])
    addToGrid(player.startingPosition, player.cssClass)
    updatedNumberOfEnemies = startingEnemyCount
    grid.style.display = 'grid'
    setTimeout(() => createCollectables(), 1000 / 2)
    setTimeout(() => createEnemies(), 1000)

    spawnCollectableIfNeeded = setInterval(createCollectables, 1000 * 2)
    spawnEnemyIfNeeded = setInterval(createEnemies, 1000 * 3)
    interactionsInterval = setInterval(playerInteraction, 1)
    startBtn.style.pointerEvents = 'none'
    updateDOM()
  }
  const gameOverCleanup = () => {
    clearInterval(animateSky)
    score > highScore && isWinner
      ? window.localStorage.setItem('high-score', score)
      : null
    updateDOM()
    score = 0
    clearInterval(spawnCollectableIfNeeded)
    clearInterval(spawnEnemyIfNeeded)
    clearInterval(interactionsInterval)

    // also empties enemies array
    enemies.forEach((enemy) => {
      enemy.disableMovment()
    })

    collectables.forEach((collectable) => collectable.remove())
    collectables = []
    collectablesCollected = 0
    firstCollectable = true
    isWinner
      ? (winLoseImage.style.backgroundImage =
          'url(images/UI-elements/popup/You-Win.png)')
      : (winLoseImage.style.backgroundImage =
          'url(images/UI-elements/popup/You-Lose.png)')
    isWinner ? victory() : deathAnimation()
  }
  const createCollectables = () => {
    if (!collectables.length) {
      let randomPositionIndex
      // if this is the first collectable put it in a certain location
      firstCollectable
        ? (randomPositionIndex = 117)
        : (randomPositionIndex = Math.floor(Math.random() * cells.length))
      firstCollectable ? (firstCollectable = false) : null

      // dont spawn a collectable on walls, player, enemies or collectables

      while (
        cells[randomPositionIndex].classList.contains(
          levelBuildingBlock.barrier
        ) ||
        cells[randomPositionIndex].classList.contains(player.cssClass) ||
        cells[randomPositionIndex].classList.contains(
          levelBuildingBlock.collectable
        ) ||
        levelBuildingBlock.enemy.some((enemy) =>
          cells[randomPositionIndex].classList.contains(enemy)
        )
      ) {
        randomPositionIndex = Math.floor(Math.random() * cells.length)
      }
      const collectable = new Collectable(
        levelBuildingBlock.collectable,
        randomPositionIndex
      )
      collectables.push(collectable)
      addToGrid(collectable.position, levelBuildingBlock.collectable)
      // check winning condition
    }
  }
  const createEnemies = () => {
    // controls max number of enimes on the board - everytime an enemy is killed two spawns in its place
    while (enemies.length < updatedNumberOfEnemies) {
      const enemiesArr = levelBuildingBlock.enemy
      const randomEnemyIndex = Math.floor(Math.random() * enemiesArr.length)
      const enemyCssClass = enemiesArr[randomEnemyIndex]
      let randomPositionIndex = Math.floor(Math.random() * cells.length)

      // enemies don't spawn within walls, in the same location as other enimes or players location (as well as withing two blocks near the player)
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

  const createGrid = (levelArray) => {
    for (let i = 0; i < cellCount; i++) {
      const cell = document.createElement('div')
      // cell.innerText = i
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

  const addToGrid = (position, cssClass) => {
    cells[position].classList.add(cssClass)
  }
  const removeFromGrid = (postion, cssClass) => {
    cells[postion].classList.remove(cssClass)
  }
  const playerFacing = (key) => {
    if (key === up) {
      player.isFacing = facing[0]
      //playerDOM.style.transform = 'rotate(270deg)'
    } else if (key === right) {
      player.isFacing = facing[1]
      //playerDOM.style.transform = 'rotate(0deg)'
    } else if (key === down) {
      player.isFacing = facing[2]
      //playerDOM.style.transform = 'rotate(90deg)'
    } else if (key === left) {
      player.isFacing = facing[3]
      //playerDOM.style.transform = 'rotate(180deg)'
    }
    console.log(player)
    cells[player.currentPosition].style.transform = player.isFacing.rotate
    cells[player.previousPosition].style.transform =
      returnDivToDefaultOrientation
  }

  const playerActions = (key) => {
    if (
      // * Up *
      key === up &&
      !cells[player.currentPosition - width].classList.contains(
        levelBuildingBlock.barrier
      )
    ) {
      removeFromGrid(player.currentPosition, player.cssClass)
      player.previousPosition = player.currentPosition
      player.currentPosition -= width
      addToGrid(player.currentPosition, player.cssClass)
    } else if (
      // * Right *
      (key === right &&
        !cells[player.currentPosition + 1].classList.contains(
          levelBuildingBlock.barrier
        )) ||
      (key === right && player.currentPosition % width === width - 1)
    ) {
      removeFromGrid(player.currentPosition, player.cssClass)
      player.previousPosition = player.currentPosition
      player.currentPosition % width !== width - 1
        ? player.currentPosition++
        : (player.currentPosition -= 17)
      addToGrid(player.currentPosition, player.cssClass)
    } else if (
      // * Down *
      key === down &&
      !cells[player.currentPosition + width].classList.contains(
        levelBuildingBlock.barrier
      )
    ) {
      removeFromGrid(player.currentPosition, player.cssClass)
      player.previousPosition = player.currentPosition
      player.currentPosition += width
      addToGrid(player.currentPosition, player.cssClass)
    } else if (
      // * Left *
      (key === left &&
        !cells[player.currentPosition - 1].classList.contains(
          levelBuildingBlock.barrier
        )) ||
      (key === left && player.currentPosition % width === 0)
    ) {
      removeFromGrid(player.currentPosition, player.cssClass)
      player.previousPosition = player.currentPosition
      player.currentPosition % width !== 0
        ? player.currentPosition--
        : (player.currentPosition += 17)
      addToGrid(player.currentPosition, player.cssClass)
    } else if (key === fire) {
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

  const playerInteraction = () => {
    if (
      cells[player.currentPosition].classList.contains(
        levelBuildingBlock.collectable
      )
    ) {
      removeFromGrid(player.currentPosition, levelBuildingBlock.collectable)
      collectAudio.src = 'audio/collect.wav'
      collectAudio.play()
      collectables.pop(0)
      collectablesCollected++
      score += 1000
      updateDOM()
      if (collectablesCollected === numberOfCollectablesToWin) {
        // end game
        isWinner = true
        gameOverCleanup()

        // show Game Over Div
      }
    }

    // if missile and enemy interact
    // loop throught cells and find ones that have both the .missile and one of the enemy classes
    // go through both enemy and missile arrays and find and enemy and missile that have the same position
    // remove them from their arrays and disable their intervals
    // as i type this.. I'm thinking maybe the loop though the cells part is redundent and i could just keep checking if at any point both enemy position and class postion are same. (will fix during refactoring)
    cells.filter((cell) => {
      if (
        cell.classList.contains(levelBuildingBlock.projectile) &&
        levelBuildingBlock.enemy.some((cssClass) =>
          cell.classList.contains(cssClass)
        )
      ) {
        enemies.forEach((enemy) => {
          missiles.forEach((missile) => {
            if (enemy.currentPosition === missile.position) {
              addToGrid(enemy.currentPosition, levelBuildingBlock.explosion)
              setTimeout(
                () =>
                  removeFromGrid(
                    enemy.currentPosition,
                    levelBuildingBlock.explosion
                  ),
                1000
              )

              missile.stopMovment()
              enemy.disableMovment()
              animateExplosion(enemy.currentPosition)
              updatedNumberOfEnemies++
              score += 500
              updateDOM()
            }
          })
        })
      }
    })

    // when player and enemy share a spot
    enemies.forEach((enemy) => {
      if (enemy.currentPosition === player.currentPosition) {
        isWinner = false
        gameOverCleanup()
      }
    })
  }

  const handelKeyDown = (e) => {
    const key = e.keyCode
    // stop player from passing through walls and wrap around map
    playerActions(key)
    // check interaction with other items and NPCs then run appropriate function

    // change player facing direction
  }

  const backgroundMusic = () => {
    // hard coding src into html made it so that it doesn't start over every time I hit start
    // backgroundAudio.src = 'audio/RhytmicBounceA.mp3'

    // backgroundAudio.volume = 0.05
    backgroundAudio.loop = true
    backgroundAudio.play()
  }
  // * Start Game
  createGrid(levelOne.levelArray)

  // * Event Listeners
  startBtn.addEventListener('click', backgroundMusic)
  startBtn.addEventListener('click', startGame)
  exitBtn.addEventListener('click', hidePopupDiv)
  document.addEventListener('keydown', handelKeyDown)
}

window.addEventListener('DOMContentLoaded', init)
