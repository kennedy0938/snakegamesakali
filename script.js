// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
let gridSize = 20; // Size of each grid cell, to be updated later
let gameSpeed = 400; // Initial game speed, reduced
// Set initial canvas size
let canvasWidth = canvas.width;
let canvasHeight = canvas.height;


// Initial snake and food positions
let snake = [{ x: 10, y: 10 }];
let food = { x: 15, y: 15, item: 'Communication and collaboration' };
let distractor = null; // Initial distractor position
let direction = 'right';

//Score and Level tracking
let score = 0;
let currentItem = 'Communication and collaboration';

//Game loop setup
let gameRunning = false; // Game starts paused
let gameLoop;
let backgroundAudioPlaying = false; // Track if background music is playing
let startTime; //timer variable

// Enums for stages
const GameStage = {
    COMPETENCIES: 0,
    VALUES: 1,
    GRADES: 2,
    PATHWAY_SELECTION: 3,
    SUBJECTS: 4
};

let currentStage = GameStage.COMPETENCIES;
let currentPathway = null; //Track pathway selected

//Data for all game items
const competencies = [
    'Communication and collaboration',
    'Self-efficacy',
    'Critical thinking and problem solving',
    'Creativity and imagination',
    'Citizenship',
    'Learning to learn',
    'Digital literacy'
];

const values = [
    'Love',
    'Responsibility',
    'Respect',
    'Unity',
    'Peace',
    'Patriotism',
    'Integrity'
];


// Distractors for each competency and value
const distractorMapping = {
    'Communication and collaboration': 'Miscommunication',
    'Self-efficacy': 'Self-doubt',
    'Critical thinking and problem solving': 'Impulsive Thinking',
    'Creativity and imagination': 'Conformity',
    'Citizenship': 'Nationalism',
    'Learning to learn': 'Memorization',
    'Digital literacy': 'Digital illiteracy',
    'Love': 'Hatred',
    'Responsibility': 'Negligence',
    'Respect': 'Disrespect',
    'Unity': 'Division',
    'Peace': 'Conflict',
    'Patriotism': 'Jingoism',
    'Integrity': 'Dishonesty'
};


const allGrades = [
    'Pre-Primary 1',
    'Pre-Primary 2',
    'Grade 1',
    'Grade 2',
    'Grade 3',
    'Grade 4',
    'Grade 5',
    'Grade 6',
    'KPSEA',
    'Grade 7',
    'Grade 8',
    'Grade 9',
    'KJSEA',
    'Science, Technology, Engineering & Mathematics (STEM)',
    'Social Sciences',
    'Arts & Sports Science'
];


//Pathways with related subjects
const pathways = {
      'Science, Technology, Engineering & Mathematics (STEM)': [
          'Mathematics', 'Advanced Mathematics','Biology', 'Chemistry', 'Physics', 'General Science', 'Agriculture', 'Computer Studies', 'Home Science', 'Drawing and Design', 'Aviation Technology', 'Building and Construction', 'Electrical Technology', 'Metal Technology', 'Power Mechanics', 'Wood Technology','Media Technology', 'Marine and Fisheries Technology'
      ],
     'Social Sciences': [
         'Advanced English', 'Literature in English', 'Indigenous Language', 'Kiswahili Kipevu/Kenya Sign Language', 'Fasihi ya Kiswahili', 'Sign Language', 'Arabic', 'French', 'German', 'Mandarin Chinese', 'History and Citizenship', 'Geography', 'Christian Religious Education', 'Islamic Religious Education', 'Hindu Religious Education', 'Business Studies'
     ],
    'Arts & Sports Science': [
      'Sports and Recreation', 'Physical Education', 'Music and Dance', 'Theatre and Film', 'Fine Arts'
    ]
};

const allSubjects = Object.values(pathways).flat();
//Learning areas for each stage
const learningAreas = {
   'Pre-Primary 1': "Learning Areas: Language Activities, Mathematical Activities, Creative Activities, Environmental Activities, Religious Activities, Pastoral Instruction Programme",
   'Pre-Primary 2': "Learning Areas: Language Activities, Mathematical Activities, Creative Activities, Environmental Activities, Religious Activities, Pastoral Instruction Programme",
   'Grade 1': "Learning Areas from Grade 1 to 3: Indigenous Language Activities, Kiswahili Language Activities/Kenya Sign Language Activities, English Language Activities, Mathematical Activities, Religious Education Activities, Environmental Activities, Creative Activities, Pastoral Instruction Programme",
   'Grade 4': "Learning Areas from Grade 4 to 6: English, Kiswahili/Kenya Sign Language, Mathematics, Religious Education, Science & Technology, Agriculture and Nutrition, Social Studies, Creative Arts, Pastoral Instruction Programme",
   'Grade 7': "Learning Areas from Grade 7 to 9: English, Kiswahili/Kenya Sign Language, Mathematics, Religious Education, Social Studies, Integrated Science, Pre-Technical Studies, Agriculture, Creative Arts and Sports, Pastoral Religious Education"
}


// Function to get the next item
function getNextItem(currentStage, currentItem) {
  let items;
    switch (currentStage) {
        case GameStage.COMPETENCIES:
            items = competencies;
            break;
        case GameStage.VALUES:
            items = values;
            break;
        case GameStage.GRADES:
             items = allGrades;
             break;
         case GameStage.PATHWAY_SELECTION:
             items = allGrades.filter(grade => Object.keys(pathways).includes(grade));
            break;
        case GameStage.SUBJECTS:
             items = pathways[currentPathway]
            break;
        default:
            return null;
    }

    const currentIndex = items.indexOf(currentItem);
    if (currentIndex < items.length - 1 ) {
       return items[currentIndex + 1];
    } else{
        return null;
    }
}


//Main Game Loop
function game() {
    if (!gameRunning) return; //Stop game if not running
    setTimeout(() => {
      clearCanvas();
      moveSnake();
      drawFood();
      drawSnake();
      checkCollision();
      updateScoreDisplay();
      if(gameRunning) {
         updateTimer();
      }
      gameLoop = requestAnimationFrame(game); //Request next frame in game loop
    }, gameSpeed);
  }

    function startGame() {
       // Set canvas size for each device
         canvasWidth = canvas.offsetWidth;
         canvasHeight = canvas.offsetHeight;

         canvas.width = canvasWidth;
         canvas.height = canvasHeight;

          gridSize = Math.floor(canvasWidth / 30)

      showInstructions();
         startTime = new Date().getTime(); //Set game start time

          //touch event listeners
        let startX, startY, endX, endY;

           canvas.addEventListener('touchstart', (e) => {
               startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
            }, {passive:true});

           canvas.addEventListener('touchend', (e) => {
                endX = e.changedTouches[0].clientX;
                endY = e.changedTouches[0].clientY;

                handleSwipe(startX, startY, endX, endY)
           }, {passive:true});
    }

   function startPlaying() {
    if(!backgroundAudioPlaying) {
      const backgroundAudio = document.getElementById('background-audio');
      backgroundAudio.volume = 0.2;
         backgroundAudio.play().catch(error => {
            console.error("Autoplay prevented:", error);
          });
      backgroundAudioPlaying = true; // Set flag that music has started
      }

       gameRunning = true;
      game();
    }

  function pauseGame() {
    gameRunning = false;
    cancelAnimationFrame(gameLoop);
  }

  function resetGame() {
      snake = [{ x: 10, y: 10 }];
      direction = 'right';
      food = {x:15,y:15,item: 'Communication and collaboration'};
      distractor = null;
      score = 0;
      currentItem = 'Communication and collaboration';
      currentStage = GameStage.COMPETENCIES;
      currentPathway = null;
       document.getElementById('message-box').style.display = 'none'; // Hide message box
      gameRunning = false;
      backgroundAudioPlaying = false; //Reset background audio state
      document.getElementById('timer').innerText = '00:00';

     }


//Functions for game
function clearCanvas() {
  ctx.fillStyle = 'lightgreen';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function moveSnake() {
    const head = { ...snake[0] };
    switch (direction) {
      case 'up':
        head.y -= 1;
        break;
      case 'down':
        head.y += 1;
        break;
      case 'left':
        head.x -= 1;
        break;
      case 'right':
        head.x += 1;
        break;
    }

    snake.unshift(head);

    //Handle food eating
    if(head.x == food.x && head.y == food.y) {
        handleEatFood();
    } else if (distractor && head.x == distractor.x && head.y == distractor.y){
      handleEatDistractor();
    } else{
        snake.pop();
    }

}

function drawSnake() {
  let snakeColor = 'green';
    switch(currentStage) {
        case GameStage.VALUES:
            snakeColor = 'orange';
            break;
        case GameStage.GRADES:
            if(currentItem == 'Grade 10' || allGrades.indexOf(currentItem) > allGrades.indexOf('Grade 10')) {
                snakeColor = 'blue';
            } else {
                snakeColor = 'red';
            }
            break;
        case GameStage.SUBJECTS:
           snakeColor = 'purple';
            break;
    }
  ctx.fillStyle = snakeColor;
  snake.forEach(segment => {
      ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
    });
}

function drawFood() {
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
    ctx.fillStyle = 'black'
    ctx.font = "10px Arial";
    ctx.textAlign = "center";
    ctx.fillText(food.item,food.x * gridSize + gridSize/2,food.y * gridSize+ gridSize/1.5)

    if(distractor){
        ctx.fillStyle = 'red'; //same colour
        ctx.fillRect(distractor.x * gridSize, distractor.y * gridSize, gridSize, gridSize);
        ctx.fillStyle = 'black'
        ctx.font = "10px Arial";
        ctx.textAlign = "center";
        ctx.fillText(distractor.item,distractor.x * gridSize + gridSize/2,distractor.y * gridSize+ gridSize/1.5)
    }

}


function checkCollision() {
    const head = snake[0];
    // Check wall collision
    if (head.x < 0 || head.x >= canvas.width / gridSize || head.y < 0 || head.y >= canvas.height / gridSize) {
      gameOver();
      return;
    }

      // Check for distractor collision
    if (distractor && head.x === distractor.x && head.y === distractor.y){
      handleEatDistractor();
      return;
    }

    // Check self-collision
    for (let i = 1; i < snake.length; i++) {
      if (head.x === snake[i].x && head.y === snake[i].y) {
        gameOver();
        return;
      }
    }
     // Check for pathway collision
     if (currentStage === GameStage.SUBJECTS && !pathways[currentPathway].includes(food.item) && food.item){
           handleEatDistractor();
         return;
     }
}


function handleEatFood() {
    const eatAudio = document.getElementById('eat-audio');
        eatAudio.play();
    score++;
    updateItem();
    generateFood();


    //Adjust game speed based on score or grade
     gameSpeed = 400 - (score * 5); // You can change multiplier
     gameSpeed = Math.max(100, gameSpeed); //Set a limit so it doesnt become too fast
}

function handleEatDistractor() {
   const failAudio = document.getElementById('fail-audio');
    failAudio.play();
   gameOver();
}

function generateFood() {
    let nextItem = getNextItem(currentStage, currentItem);
  let newFood;

   if(nextItem){

        do {
            newFood = {
              x: Math.floor(Math.random() * (canvas.width / gridSize)),
              y: Math.floor(Math.random() * (canvas.height / gridSize)),
              item: nextItem,
            }
        } while(snake.some(segment => segment.x === newFood.x && segment.y === newFood.y))

          food = newFood;
          distractor = null;

          if (currentStage !== GameStage.GRADES && currentStage !== GameStage.SUBJECTS) {

              do {
                  distractor = {
                    x: Math.floor(Math.random() * (canvas.width / gridSize)),
                    y: Math.floor(Math.random() * (canvas.height / gridSize)),
                    item: distractorMapping[nextItem],
                  };
                } while (snake.some(segment => segment.x === distractor.x && segment.y === distractor.y) || (food.x === distractor.x && food.y === distractor.y)) // Ensure distractor not in snake or the food
         } else if (currentStage === GameStage.SUBJECTS){
            let availableDistractors = allSubjects.filter(subject => !pathways[currentPathway].includes(subject));

           if(availableDistractors.length > 0){
              do {
                    distractor = {
                        x: Math.floor(Math.random() * (canvas.width / gridSize)),
                        y: Math.floor(Math.random() * (canvas.height / gridSize)),
                        item: availableDistractors[Math.floor(Math.random() * availableDistractors.length)]
                     };
                  } while (snake.some(segment => segment.x === distractor.x && segment.y === distractor.y) || (food.x === distractor.x && food.y === distractor.y))
           }
            else {
              distractor = null;
            }
         }

      } else {
          //End game with congratulation message.
           if (currentStage === GameStage.SUBJECTS) {
               showCongratulationMessage();
                pauseGame();
                return;
            }

             gameRunning = false;  //Pause before transition
             //Call update item to transition to the next stage, but ensure we don't proceed if game has finished
            updateItem();
             if (gameRunning) {
                generateFood();
            }

             return;
      }
}

function updateItem() {
    const nextItem = getNextItem(currentStage, currentItem);

    if(nextItem){
       currentItem = nextItem;
    } else {
          let stageMessage = null;
           if (currentStage === GameStage.COMPETENCIES) {
                 stageMessage = `Congratulations! You've completed the competencies stage. Get ready for Values! \n\n ${learningAreas['Pre-Primary 1']}`;
              currentStage = GameStage.VALUES;
              currentItem = values[0];
               food.item = currentItem; // Set the initial food to the new currentItem

        } else if (currentStage === GameStage.VALUES) {
               stageMessage = `Congratulations! You've completed the values stage. Get ready for grades! \n\n ${learningAreas['Grade 1']}`;
            currentStage = GameStage.GRADES;
            currentItem = allGrades[0];
             food.item = currentItem; // Set the initial food to the new currentItem


        } else if (currentStage === GameStage.GRADES && currentItem === 'Grade 3'){
               stageMessage = `Get Ready for Grades 4 to 6! \n\n ${learningAreas['Grade 4']}`;
               showStageMessage(stageMessage);
               currentItem = allGrades[allGrades.indexOf(currentItem) + 1];
               food.item = currentItem;

        } else if (currentStage === GameStage.GRADES && currentItem === 'Grade 6'){
            stageMessage = `Get Ready for Grades 7 to 9! \n\n ${learningAreas['Grade 7']}`;
            showStageMessage(stageMessage);
             currentItem = allGrades[allGrades.indexOf(currentItem) + 1];
            food.item = currentItem;

        } else if (currentStage === GameStage.GRADES && currentItem === 'KJSEA'){
               stageMessage = `Congratulations! You've completed the grades stage. Get ready to select a pathway!`;
             currentStage = GameStage.PATHWAY_SELECTION;
             currentItem = allGrades.filter(grade => Object.keys(pathways).includes(grade))[0]; //First pathway
              food.item = currentItem; // Set the initial food to the new currentItem



         } else if (currentStage === GameStage.PATHWAY_SELECTION) {
            stageMessage = `Congratulations! You have selected " + currentItem + " pathway. Now eat related subjects`;
            currentPathway = currentItem;
            currentStage = GameStage.SUBJECTS;
             currentItem = pathways[currentPathway][0];
             food.item = currentItem; // Set the initial food to the new currentItem

         }
       if (stageMessage){
           showStageMessage(stageMessage);
        }
    }

}

function updateScoreDisplay() {
    document.getElementById('score').innerText = score;
    let stageString;
    switch(currentStage){
      case GameStage.COMPETENCIES:
        stageString = "Competencies";
        break;
      case GameStage.VALUES:
          stageString = "Values";
           break;
      case GameStage.GRADES:
        stageString = "Grades";
         break;
        case GameStage.PATHWAY_SELECTION:
            stageString = 'Pathway Selection';
            break;
        case GameStage.SUBJECTS:
           stageString = 'Subjects';
           break;
        default:
            stageString = "Unknown Stage";
    }
    document.getElementById('grade').innerText = `${currentItem} (${stageString})`;
}

function updateTimer() {
    if(gameRunning){
         const currentTime = new Date().getTime();
        const elapsedTime = Math.floor((currentTime - startTime)/1000); //Seconds
        const minutes = Math.floor(elapsedTime / 60).toString().padStart(2, '0');
        const seconds = (elapsedTime % 60).toString().padStart(2, '0');

        document.getElementById('timer').innerText = `${minutes}:${seconds}`;
    }
}


function showInstructions() {
    const messageBox = document.getElementById('message-box');
    const messageText = document.getElementById('message-text');
    messageText.innerText = "Welcome to the CBC Snake Adventure!\n\nUse the arrow keys to control the snake. Eat the competencies, values and grades in order. Avoid eating distractors which are closely related to the food item.\n\nAfter KJSEA select a pathway then eat subjects related to that pathway. \n\n Good luck!";
     messageBox.style.display = 'block';
    document.getElementById('close-button').onclick = function(){
         messageBox.style.display = 'none';
        startPlaying();

    }
}

function showStageMessage(message){
    const messageBox = document.getElementById('message-box');
    const messageText = document.getElementById('message-text');
     messageText.innerText = message;
     messageBox.style.display = 'block';
      document.getElementById('close-button').onclick = function(){
        messageBox.style.display = 'none';
         if(gameRunning === false) {
            startPlaying();
        }
    }
}

function showCongratulationMessage() {
     const messageBox = document.getElementById('message-box');
    const messageText = document.getElementById('message-text');
     messageText.innerText = "Congratulations! You have completed all the stages!";
     messageBox.style.display = 'block';
      document.getElementById('close-button').onclick = function(){
          resetGame();
          messageBox.style.display = 'none';
    }
}


function gameOver() {
    const failAudio = document.getElementById('fail-audio');
     failAudio.play();
  pauseGame();
    const messageBox = document.getElementById('message-box');
    const messageText = document.getElementById('message-text');
     messageText.innerText = "Game Over! Your final score is " + score;
     messageBox.style.display = 'block';
       document.getElementById('close-button').onclick = function(){
          resetGame();
           messageBox.style.display = 'none';
    }

}
 function handleSwipe(startX, startY, endX, endY){
    const distX = endX - startX;
    const distY = endY - startY;

    if (Math.abs(distX) > Math.abs(distY)) {
        // Horizontal swipe
        if (distX > 0 && direction !== 'left') {
            direction = 'right';
        } else if (distX < 0 && direction !== 'right') {
            direction = 'left';
        }
    } else {
        // Vertical swipe
        if (distY > 0 && direction !== 'up') {
            direction = 'down';
        } else if (distY < 0 && direction !== 'down') {
            direction = 'up';
        }
    }
}


// Event listeners
document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowUp':
      if (direction !== 'down') direction = 'up';
      break;
    case 'ArrowDown':
      if (direction !== 'up') direction = 'down';
      break;
    case 'ArrowLeft':
      if (direction !== 'right') direction = 'left';
      break;
    case 'ArrowRight':
      if (direction !== 'left') direction = 'right';
      break;
   case ' ': //Space bar
         if(gameRunning) {
            pauseGame();
        } else if(document.getElementById('message-box').style.display == 'none') {
             startPlaying();
        }

      break;
  }
});

startGame();