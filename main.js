var myUsername, myHand, getFirebaseOpp, getGame;
var getOppStatus, getMyStatus, getOppHand;
var myOpponent = "bob";
firebase.database().ref("/Active/" + myUsername).set(null);
firebase.database().ref("Game/").set(null);

function enterUsername()
{
    var usernameInput = document.getElementById('username').value;
    myUsername = String(usernameInput);
    console.log(usernameInput);
    firebase.database().ref("/Active/" + myUsername).set({
        username: myUsername,
        status: "np",
        hand: null
    });
}

function pickOpponent()
{
    
    /*
    myOpponent = document.getElementById('opponent').value;
    console.log(myOpponent);
    firebase.database().ref("Game/" + myOpponent + "vs" + myUsername).update({
        gameOn : "y"
    });
    firebase.database().ref("Active/" + myOpponent + "/").update({
        opponent : myUsername
    });
    firebase.database().ref("Active/" + myUsername + "/").update({
        opponent : myOpponent
    });
    logIt(myUsername + " wants to play with " + myOpponent);
    */
}

function uncheckBoxes()
{
    var radios = document.getElementsByName('hand');
    for (var i = 0, length = radios.length; i < length; i++)
    {
        radios[i].disabled = false;
    }
    document.getElementById('pickButton').disabled = false;
}

function pickHand()
{
    var radios = document.getElementsByName('hand');
    for (var i = 0, length = radios.length; i < length; i++)
    {
        if (radios[i].checked)
        {
            // alert(radios[i].value);
            myHand = radios[i].value;
            console.log(radios[i].value);
            // only one radio can be logically checked, don't check the rest
            break;
        }
    }

    firebase.database().ref("Active/" + myUsername + "/").update({
        hand : myHand,
        status: "p",
        username: myUsername
    });

    firebase.database().ref("Game/" + myUsername).update({
        hand : myHand,
        status : "p",
        username : myUsername
    });
    for (var i = 0, length = radios.length; i < length; i++)
    {
        radios[i].disabled = true;
    }
    document.getElementById('pickButton').disabled = true;
    logIt(myUsername + " picked a hand!");
}

firebase.database().ref("Active/").on("child_changed", function(snapshot) {

    var snaps = snapshot.val();
    console.log("Change: " + snaps.status);
    if (snaps.username == myUsername)
    {
        console.log("It's me!");
        if (snaps.status == "p")
        {
            console.log("You played!");
        }
    }
});

setInterval(checkFirebase, 10000);
function checkFirebase()
{
    firebase.database().ref("Game/").on("value", function(snapshot) {

        var snaps = snapshot.val();
        console.log(snaps);

        // get opponent status and hand
        getOppStatus = snaps[myOpponent].status;
        getOppHand = snaps[myOpponent].hand;
        console.log("Opponent Hand: " + getOppHand);

        getMyStatus = snaps[myUsername].status;
        console.log("Bob Status: " + getOppStatus);
        if (getOppStatus == "p" && getMyStatus == "p")
        {
            console.log("You both played!");
            getWinner(myHand, getOppHand);

            // fix the page stuff
            uncheckBoxes();

            // change status
            firebase.database().ref("Game/" + myUsername).update({
                status : "np"
            });
            firebase.database().ref("Game/" + myOpponent).update({
                status : "np"
            });
        }
        else
        {
            console.log("Waiting on someone to play...");
        }
    });
}

function getWinner(a, b)
{
    var winner;
    if (a == b)
    {
        // std::cout << "we found a tie" << std::endl;
        winner = "tie";
        console.log("Tie!");
        return winner;
    }

    switch(a)
    {
        case "rock":
        {
            if (b == "scissors" || b == "lizard") { winner = a; break; }
            else { winner = b; break; }
        }
        case "paper":
        {
            if (b == "rock" || b == "spock") { winner = a; break; }
            else { winner = b; break; }
        }
        case "scissors":
        {
            if (b == "paper" || b == "lizard") { winner = a; break; }
            else { winner = b; break; }
        }
        case "lizard":
        {
            if (b == "paper" || b == "spock") { winner = a; break; }
            else { winner = b; break; }
        }
        case "spock":
        {
            if (b == "rock" || b == "scissors") { winner = a; break; }
            else { winner = b; break; }
        }
        case "tie":
        {
            break;
        }
    }
    if (winner == a) 
    {
        console.log("You win with " + a + " over " + b + "!");
        logIt("You win with " + a + " over " + b + "!");
    }
    else
    {
        console.log("You lost with " + b + " over " + a + "!");
        logIt("You lost with " + b + " over " + a + "!");
    }
    return winner;

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


    