const text = document.getElementById("text");
const choices = document.getElementById('choices');
const input = document.getElementById('input');
const health = document.getElementById("playerHP");
const items = document.getElementById("playerItems");
const stats = document.getElementById("stats");

function map(num, in_min, in_max, out_min, out_max) {
    return (num - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

Array.prototype.pickRandom = function () {
    return this[Math.floor(Math.random() * this.length)]
}

async function fetchAsync(url) {
    try {
        let response = await fetch(url);
        let data = await response.json();
        return data;
    } catch (error) {
        throw new Error(error);
    }
}

/*
fetchAsync("https://httpbin.org/ip").then((data) => {
    console.log(data.origin);
}).catch((error) => {console.log(error);})
*/

input.onclick = function () {
    UIHandler.fadeIn().then(() => {
        input.parentNode.removeChild(input)
        stats.style.visibility = "";
        Game.hasStarted = true;
        Game.restartGame();
    })
}

var debug = {
    advanceTo: function (s) {
        if (!Game.hasStarted) {
            input.parentNode.removeChild(input)
            stats.style.visibility = "";
            Game.hasStarted = true;
            Game.restartGame()
        }
        Game.advanceTo(s)
    }
}

var UIHandler = {
    updateStats: function () {
        health.innerText = player.health
        if (player.items.length == 0) {
            items.innerText = "[Nothing]"
        } else {
            items.innerText = player.items.join()
        }
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
    fadeIn: function () {
        document.getElementById("center-screen").classList.add("fade")
        return delay(350)
    },
    fadeOut: function() {
        document.getElementById("center-screen").classList.remove("fade")
    },
    fadeToggle: function () {
        document.getElementById("center-screen").classList.toggle("fade")
    }

}
var Game = {
    advanceTo: function (s) {
        Game._changeLevel(s)
    },
    _changeLevel: function (s) {
        if (typeof s != "undefined") {
            if ("preProcess" in s) {
                if(s.preProcess()) {
                    console.log("Preprocess executed");
                    return;
                }
            }
            UIHandler.fadeIn().then(function () {
                if ("customFunc" in s) {
                    console.log("CustomFunc executed");
                    s.customFunc()
                }
                console.log(`Proceeding to ${s.text}`);
                UIHandler.updateText(s.text)
                UIHandler.updateButtons(s.buttons)
                UIHandler.updateStats();
                UIHandler.fadeOut()
            })
        }

    },
    tick: function () {
        if (player.health <= 0) {
            player.health = 0
            player.items = ["Hope"]
            Game._changeLevel(scenario.gameover)
        }  
    },
    restartGame: function () {
        player = {
            items: [],
            health: 20,
            hoursWaited: 2,
            violence: 0
        }
        Game.advanceTo(scenario.main)
    },
    customDeath: function (message) {
        scenario.gameover.text = message + "\nPlay Again?"
        player.health = 0
        Game.advanceTo(scenario.gameover)
    },
    deathMessages: {
        eaten: "You were eaten by the beast.",
        panic: "You panicked to death."
    },
    hasStarted: false
}

var player;

var scenario = {
    gameover: {
        text: "You died\nPlay again?",
        buttons: [
            ["Restart", "Game.restartGame()"],
        ]
    },
    main: {
        text: "You look around you, and see nothing but darkness.\nWhat do you do?",
        buttons: [
            ["Wait", "Game.advanceTo(scenario.wait)"],
            ["Wander", "Game.advanceTo(scenario.wander)"]
        ],
    },
    wait: {
        text: "",
        buttons: [
            ["Wait for longer", "Game.advanceTo(scenario.wait)"],
            ["Wander", "Game.advanceTo(scenario.wander)"]
        ],
        customFunc: function () {
            scenario.wait.text = `You wait for ${player.hoursWaited} hours, but nothing happens.\nWhat do you do?`;
            player.hoursWaited += 1;

        },
        preProcess: function () {
            if (player.hoursWaited > 5) {
                Game.customDeath("You died of " + ["exhaustion", "dehydration", "boredom", "malnutrition"].pickRandom())
                return true
            }
        }
    },
    wander: {
        text: "You find a mysterious silent creature. You feel like it is harmless.\nWhat do you do?",
        buttons: [
            ["Wander", "Game.advanceTo(scenario.wander2)"],
            ["Approach", "Game.advanceTo(beast.approach)"]
        ]
    },
    wander2: {
        text: "",
        buttons: [
            ["", ""],
            ["", ""]
        ]
    }
}

var beast = {
    approach: {
        text: "The creature has red eyes!",
        buttons: [
            ["[>]", "Game.advanceTo(beast.beingeaten)"]
        ]
    },
    beingeaten: {
        text: "You are being crushed in the beast's mouth!",
        buttons: [
            ["Keep calm", "Game.advanceTo(beast.keepcalm)"],
            ["Struggle your way out", "Game.customDeath(Game.deathMessages.eaten)"]
        ],
    },
    wander2: {
        text: "You find a mysterious silent creature. You feel like it is harmless.\nWhat do you do?",
        buttons: [
            ["Wander", "Game.advanceTo(beast.witch)"],
            ["Approach", "Game.advanceTo(beast.approachBeast)"]
        ]
    },
    keepcalm: {
        text: "You're swallowed alive.\nYou feel a shining resonance inside the beast's stomach",
        buttons: [
            ["Check it out", "Game.advanceTo(beast.sharpknife)"],
            ["Panic", "Game.customDeath(Game.deathMessages.panic)"]
        ]
    },
    sharpknife: {
        text: "You find a sharp knife\nYou got a new item!",
        buttons: [
            ["[CONTINUE]", "Game.advanceTo(beast.whattodo)"]
        ],
        customFunc: function () {
            player.items.push("Knife")
        }
    },
    whattodo: {
        text: "You have the knife in your hands\nWhat do you do",
        buttons: [
            ["Kill it", "Game.advanceTo(beast.bile)"],
            ["Think", "Game.advanceTo(beast.)"]
        ],
    },
    bile: {
        text: "You  stabbed the beast liver and bile is penetrating the stomach !\n It's burning you ! ",
        buttons: [
            ["Cover head", "Game.advanceTo(beast.stabbing.ultracover)"],
            ["Continue stabbing", "Game.advanceTo(beast.stabbing.moveon)"]
        ],
        customFunc: () => {
            player.violence += 1;
        }
    },
    stabbing: {
        ultracover: {
            text: "What do you use as cover? \n shorts or t-shirt ? ",
            buttons: [
                ["shorts", ""],
                ["t-short", "Game.advanceTo(beast.stabbing.moveon)"]
            ],
        },
        moveon: {
            text: "You covered yourself with your t-shirts",
            buttons: [
                ["Make a plan to escape", "Game.advanceTo(beast.CheckcedricCanCount1234567890)"],
                ["", ""]
            ]
        }
    },
    new: {
        text: "",
        buttons: [
            [, ],
            [, ]

        ],
    }
}