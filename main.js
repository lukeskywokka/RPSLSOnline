// Globals
var myUsername = "b"
var myHand, getFirebaseOpp;
var getGame = "b";
var getOppStatus, getMyStatus, getOppHand;
var myOpponent;
var gameCount = 0;
var wins = 0;
var losses = 0;
var ties = 0;
var interval;

var clickEnabled = 0;
var errorCounter = 0;
var bothP = 0;
firebase.database().ref("/Active/" + myUsername).set(null);
// firebase.database().ref("Game/").set(null);

function enableImageClick()
{
    console.log("Enabling Image clicks...");
    document.getElementById('rock').style.pointerEvents = 'auto'; 
    document.getElementById('paper').style.pointerEvents = 'auto';
    document.getElementById('scissors').style.pointerEvents = 'auto';
    document.getElementById('lizard').style.pointerEvents = 'auto';
    document.getElementById('spock').style.pointerEvents = 'auto'; 
    gameCount += 1;
    errorCounter = 0;
    logIt("Game " + gameCount + " has begun!");
    clickEnabled = 1;
}

// a useless function
function sleep(milliseconds) 
{
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) 
    {
        if ((new Date().getTime() - start) > milliseconds)
        {
            break;
        }
    }
  }

function enterUsername()
{
    var usernameInput = document.getElementById('username').value;
    myUsername = String(usernameInput);
    console.log("Your username is " + usernameInput);
    firebase.database().ref("/Active/" + myUsername).set({
        username: myUsername,
        status: "np",
        hand: null
    });
    logIt("Hi " + myUsername + "!");
    enableImageClick();
}

function makeid(length) 
{
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) 
    {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

// link: https://stackoverflow.com/questions/18982642/how-to-disable-and-then-enable-onclick-event-on-div-with-javascript
function disableImageClick()
{
    console.log("Disabling Image clicks...");
    document.getElementById('rock').style.pointerEvents = 'none'; 
    document.getElementById('paper').style.pointerEvents = 'none';
    document.getElementById('scissors').style.pointerEvents = 'none';
    document.getElementById('lizard').style.pointerEvents = 'none';
    document.getElementById('spock').style.pointerEvents = 'none'; 
    clickEnabled = 0;
}
disableImageClick();
 
function playAudio(a) 
{ 
    var x = document.getElementById(a + "fx");
    x.play(); 
} 

function pauseAudio() 
{ 
    x.pause(); 
}

function pickImage(aHand)
{
    disableImageClick();
    console.log("You clicked " + aHand);
    myHand = aHand;
    logIt("You picked " + aHand + "!");
    playAudio(myHand);

    if (getGame == "b")
    {
        // get the game if you were invited
        firebase.database().ref("Active/" + myUsername).on("value", function(snapshot) {
            var snapVal = snapshot.val();
            getGame = snapVal.gameRoom;
            myOpponent = snapVal.opponent;
            
            // update the db with your hand
            firebase.database().ref("Game/" + getGame + "/" + myUsername).update({
                hand : aHand,
                status : "p",
            });
        });
    }

    else
    {
        // update the db with your hand
        firebase.database().ref("Game/" + getGame + "/" + myUsername).update({
            hand : aHand,
            status : "p",
        });
    } 

    // now begin to look at firebase every 5s
    interval = setInterval(checkForUpdates, 2000);
}

function pickOpponent()
{
    // get the input from the html
    myOpponent = document.getElementById('opponent').value;
    console.log("you picked " + myOpponent);

    // make a random game ID
    getGame = makeid(5);
    firebase.database().ref("Game/" + getGame).update({
        gameOn : "y"
    });

    // add the game ID to my name
    firebase.database().ref("Active/" + myUsername).update({
        gameOn : "y",
        gameRoom : getGame,
        opponent : myOpponent
    });

    // add game ID to opponent
    firebase.database().ref("Active/" + myOpponent).update({
        gameOn : "y",
        gameRoom : getGame,
        opponent : myUsername
    });

    // update the opponent's opponent
    firebase.database().ref("Game/" + getGame + "/" + myOpponent).update({
        opponent : myUsername,
        username : myOpponent,
        status : "np"
    });

    // update my opponent
    firebase.database().ref("Game/" + getGame + "/" + myUsername).update({
        opponent : myOpponent,
        username : myUsername,
        status : "np"
    });
    logIt(myUsername + " wants to play with " + myOpponent);
}

var lastMsg = "";
var winnerQ = 0;
var snaps = "e";
function checkForUpdates()
{
    
    // console.log("Checking for updates...");
    firebase.database().ref("Game/" + getGame + "/" + myUsername + "/msgBoard/message").on("value", function(snapshot){
        
        snaps = snapshot.val();
        console.log(myUsername + " " + snaps);

        // winner is available
        if (snaps.includes("Winner"))
        {
            winnerQ = 1;
        }
    });

    if (winnerQ && !clickEnabled)
    {
        winnerQ = 0;

        // no longer check for firebase updates
        clearInterval(interval);

        // change status back to np
        firebase.database().ref("Game/" + getGame + "/" + myUsername).update({
            status : "np"
        });
        
        if (snaps.includes(myHand))
        {
            wins += 1;
            document.getElementById("wins").innerHTML = "Wins: " + wins;
            logIt("You won!")
            playAudio("win");
        }
        else if (snaps.includes("tie"))
        {
            ties += 1;
            document.getElementById("ties").innerHTML = "Ties: " + ties;
            logIt("You tied!");
        }
        else
        {
            losses += 1;
            document.getElementById("losses").innerHTML = "Losses: " + losses;
            logIt("You lost!");
            playAudio("lose");
        }
        enableImageClick();    
    }
    errorCounter += 1;

    // both are stuck on p
    if (errorCounter >= 5)
    {
        console.log("inside error fixer!")
        
        // change to error, but it will fix itself
        firebase.database().ref("Game/" + getGame + "/" + myOpponent).update({
            status : "e"
        });
    }
}

// messages
function logIt(msg)
{
    var newLog = document.createElement("li");       // Create a <li> node
    var txt = document.createTextNode(msg);
    newLog.appendChild(txt);                    // Append the text to <li>
    var list = document.getElementById("myLog");    // Get the <ul> element to insert a new node
    list.insertBefore(newLog, list.childNodes[0]);  // Insert <li> before the first child of <ul>
}

// unused
function uncheckBoxes()
{
    var radios = document.getElementsByName('hand');
    for (var i = 0, length = radios.length; i < length; i++)
    {
        radios[i].disabled = false;
    }
    document.getElementById('pickButton').disabled = false;
}