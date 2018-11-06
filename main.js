var text = document.getElementById("text");
var choices = document.getElementById('choices');
var input = document.getElementById('input');
var health = document.getElementById("playerHP");
var items = document.getElementById("playerItems");
var stats = document.getElementById("stats");

function map(num, in_min, in_max, out_min, out_max) {
    return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

input.onclick = function (event) {
    input.parentNode.removeChild(input)
    stats.style.visibility = "";
    Game.advanceTo(scenario.main)
};

var UIHandler = {
    updateStats: function () {
        health.innerText = player.health
        items.innerText = player.items.join();
    },
    updateText: function (words) {
        text.innerHTML = words.replace("\n", "<br>")
    },
    updateButtons: function (buttonList) {
        choices.innerHTML = "";
        if (buttonList !== undefined) {
            for (var i = 0; i < buttonList.length; i++) {
                choices.innerHTML += "<button onClick=" + buttonList[i][1] + ">" + buttonList[i][0] + "</button>";
            }
        }
    },

}

var Game = {
    advanceTo: function (s) {
        if (player.health != 0) {
            Game._changeLevel(s)
        }
        Game.tick();
    },
    _changeLevel: function (s) {
        if (typeof s != "undefined" && "customFunc" in s) {
            s.customFunc()
        }
		UIHandler.updateText(s.text)
        UIHandler.updateButtons(s.buttons)
    },
    tick: function () {
        if (player.health <= 0) {
            player.health = 0
            player.items = ["Hope"]
            Game._changeLevel(scenario.gameover)
        }
        UIHandler.updateStats();
    },
    restartGame: function () {
        player.items = ["Water"]
        player.health = 20;
        player.violence = 0;
        player.hoursWaited = 2;
        Game.advanceTo(scenario.main)
    },
    customDeath: function (message) {
        scenario.gameover.text = message + "\nPlay Again?"
        player.health = 0;
        Game.advanceTo(scenario.gameover)
    }
}

var player = {
    items: ["Water"],
    health: 20,
    hoursWaited: 2,
    violence: 0
}

var scenario = {
    gameover: {
        text: "You died\nPlay again?",
        buttons: [
            ["Restart", "Game.restartGame()"],
        ]
    },
    main: {
        text: "You look around you, and see nothing but darkness\nWhat do you do?",
        buttons: [
            ["Wait", "Game.advanceTo(scenario.wait)"],
            ["Wander", "Game.advanceTo(scenario.wander)"]
        ]
    },
    wait: {
        text: "",
        buttons: [
            ["Wait for longer", "Game.advanceTo(scenario.wait)"],
            ["Wander", "Game.advanceTo(scenario.wander)"]
        ],
        customFunc: function () {
            scenario.wait.text = `You wait for ${player.hoursWaited} hours, but nothing happens\nWhat do you do?`;
            player.hoursWaited += 1;
            if (player.hoursWaited > 4) {
                Game.customDeath("You died of " + ["exhaustion", "dehydration", "boredom"][Math.floor(Math.random() * 3)])
            }
        }
    },
    wander: {
        text: "You find a mysterious silent creature. You feel like it is harmless.\nWhat do you do?",
        buttons: [
            ["Wander", "Game.advanceTo(scenario.wander2)"],
            ["Approach", "Game.advanceTo()"]
        ]
    },
    wander2: {
        text: "You find a mysterious silent creature. You feel like it is harmless.\nWhat do you do?",
        buttons: [
            ["Wander", "Game.advanceTo(scenario.witch)"],
            ["Approach", "Game.advanceTo(scenario.runfrombeast)"]
        ]
    },
    runfrombeast: {
        text: "The creature has red eyes!",
        buttons: [
            ["ok", "Game.advanceTo(scenario.witch)"]
        ]
    },
    witch: {
        text: "You find out that the a witch is controlling the beast\nWhat do you do ? ",
        buttons: [
            ["Fight the Witch", "Game.restartGame()"],
            ["Fight the Beast", "Game.advanceTo(scenario.beingeaten) "],
        ]
    },
    beingeaten: {
        text: "You're being crushed in the breast's mouth!",
        buttons: [
            ["Keep calm", ""]
            ["Try to protect yourself fro"]
        ]

    },

}