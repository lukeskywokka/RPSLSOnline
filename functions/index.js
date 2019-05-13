const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

/*
- Params
    * a is a hand
    * b is a hand
- Objective
    * Return which hand should win

*/
// this function was more or less copied from our C++ RPS game
function getWinner(a, b)
{
    console.log("Determining Winner...");
    var winner;
    if (a == b)
    {
        // std::cout << "we found a tie" << std::endl;
        winner = "tie";
        console.log("Tie!");
        // logIt("Tie game with " + a + "and" + b + "!");
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
        // logIt("You win with " + a + " over " + b + "!");
    }
    else
    {
        console.log("You lost with " + b + " over " + a + "!");
        // logIt("You lost with " + b + " over " + a + "!");
    }
    return winner;
}

// globalWinner is unused
var globalWinner = "n";
exports.getWinner = functions.database.ref('/Game/{gameID}/{user}/status').onWrite((change, context) => {
    console.log("func triggered");
    var msg = "!";
    var msgCopy = "none";
    // get username and gameID
    const username = context.params.user;
    const getGameID = context.params.gameID;

    // if we have changed from played to not played
    /*
    if ((change.before.val() == "p") && change.after.val() == "np")
    {
        return admin.database().ref("Game/" + getGameID + "/" + username + "/msgBoard").update({
            winner : winnerName,
            winnerAvailable : winAvail,
            message : "Winner = " + globalWinner
        });
    }
    */
     
    var getOpponent = "";
    var getStatus = change.after.val();
    var getOpponentStatus = "";
    var getHand = "";
    var getOppHand = "";
    var winAvail = "n";
    
    // get my opponent and my hand
    admin.database().ref("Game/" + getGameID + "/" + username).on("value", function(snapshot) {
        const mySnap = snapshot.val();
        getOpponent = mySnap.opponent;
        getHand = mySnap.hand;
        getStatus = mySnap.status;
    });

    // get opponent's hand and status
    admin.database().ref("Game/" + getGameID + "/" + getOpponent).on("value", function(snapshot) {
        const mySnap = snapshot.val();
        getOpponentStatus = mySnap.status;
        getOppHand = mySnap.hand;
    });

    // logs to see what I am getting
    console.log("My name: " + username);
    console.log("Opp name: " + getOpponent);
    console.log("My status: " + getStatus);
    console.log("Opp status: " + getOpponentStatus);
    console.log("My hand: " + getHand);
    console.log("Opp hand: " + getOppHand);

    var winnerName = "nobody";
    if (getOpponentStatus != "np" && getStatus != "np")
    {
        winAvail = "y";

        // compute winner with the function above
        const winner = getWinner(getHand, getOppHand);
        globalWinner = winner;
        console.log("Winner is: " + winner);
        if (winner == getHand)
        {
            // then username wins
            winnerName = username;
        }
        else if (winner == getOppHand)
        {
            // opp wins
            winnerName = getOpponent;
        }
        else 
        {
            // tie
            winnerName = "tie";
        }

        msg = "Winner is " + winner + "!";
        // msgCopy = "Winner Available!";

        // update opponent with the winner message
        admin.database().ref("Game/" + getGameID + "/" + getOpponent + "/msgBoard").update({
            winner : winnerName,
            winnerAvailable : winAvail,
            message : msg
        });

        // update whoever triggered the function with the winner message
        admin.database().ref("Game/" + getGameID + "/" + username + "/msgBoard").update({
            winner : winnerName,
            winnerAvailable : winAvail,
            message : msg
        });
        
        /*
        admin.database().ref("Game/" + getGameID + "/" + getOpponent).update({
            status : "np"
        });
        
        admin.database().ref("Game/" + getGameID + "/" + username).update({
            status : "np"
        });
        */

        return 1;
    }
    else
    {
        winAvail = "n";
        msg = "!";
        msgCopy = "none";
        console.log("Both haven't played yet...");

        // if a winner is not available, the msg is '!'
        return admin.database().ref("Game/" + getGameID + "/" + username + "/msgBoard").update({
            winner : winnerName,
            winnerAvailable : winAvail,
            message : "!"
        });
    }
    // return snapshot.ref.parent.child('uppercase').set(uppercase);
});
