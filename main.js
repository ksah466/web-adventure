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
            UIHandler.fadeIn().then(() => {
                input.parentNode.removeChild(input)
                stats.style.visibility = "";
                Game.hasStarted = true;
                Game.restartGame();
            })
        }
        Game.advanceTo(s)
    }
}

var UIHandler = {
    textRegex: new RegExp("\n", "g"),
    updateStats: function () {
        health.innerText = player.health
        if (player.items.length == 0) {
            items.innerText = "[Nothing]" // Place holder for empty items
        } else {
            items.innerText = player.items.join()
        }
    },
    updateText: function (words) {
        text.innerHTML = words.replace(this.textRegex, "<br>")
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
    fadeOut: function () {
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
                if (s.preProcess()) {
                    return;
                }
            }
            UIHandler.fadeIn().then(function () {
                if ("customFunc" in s) {
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
        light.approach.ignoreLevel = 0;
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
    hasStarted: false,
    endings: 0,
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
            switch (player.hoursWaited) {
                case 2:
                    scenario.wait.text = `You wait for ${player.hoursWaited} hours, but nothing happens.\nWhat do you do?`;
                    break;
                case 3:
                    scenario.wait.text = `You wait for ${player.hoursWaited} hours, and start questioning your existence.\nWhat do you do?`;
                    break;
                case 4:
                    scenario.wait.text = `You wait for ${player.hoursWaited} hours, and start wondering what's real, and what's not real.\nWhat do you do?`;
                    break;
                default:
                    scenario.wait.text = `You wait for ${player.hoursWaited} hours, and start wondering if pressing the 'Wait for longer' button is worthwhile.\nWhat do you do?`;
                    break;
            }
            player.hoursWaited += 1;

        },
        preProcess: function () {
            if (player.hoursWaited > 10) {
                Game.advanceTo(endings.longwait)
                return true
            }
        }
    },
    wander: {
        text: "You see a mysterious white glow in the distance.\nWhat do you do?",
        buttons: [
            ["Approach", "Game.advanceTo(light.approach)"],
            ["Ignore", "Game.advanceTo(scenario.ignore1)"],
        ]
    },
    ignore1: {
        text: "",
        buttons: [
            ["Approach", "Game.advanceTo(light.approach)"],
            ["Ignore", "Game.advanceTo(scenario.ignore2)"]
        ],
        direction: ["right", "left", "backwards"].pickRandom(),
        customFunc: function () {
            light.approach.ignoreLevel += 1;
            this.text = `You turn ${this.direction} to ignore the glow, but it has appeared in front of you`
        }
    },
    ignore2: {
        text: "",
        buttons: [
            ["Approach", "Game.advanceTo(light.approach)"],
            ["Ignore", "Game.advanceTo(scenario.ignore3)"]
        ],
        direction: {"right":"left this time", "left":"right this time", "backwards":"backwards again"},
        customFunc: function () {
            light.approach.ignoreLevel += 1;
            this.text = `You turn ${this.direction[scenario.ignore1.direction]}, but it has still appeared in front of you`
        }
    },
    ignore3: {
        text: "You close your eyes, hoping it will disappear",
        buttons: [
            ["[Continue]", "Game.advanceTo(endings.everyignore)"]
        ]
    }
}

var light = {
    approach: {
        text: "",
        buttons: [
            ["Look Around", "Game.advanceTo(light.lookaround)"],
            ["\'Where Am I\'", "Game.advanceTo(light.whereami)"]
        ],
        ignoreLevel: 0,
        customFunc: function () {
            if (this.ignoreLevel > 0) {
                this.text = `? : "Ignored me ${["once", "twice"][this.ignoreLevel - 1]} have you?\nHello, anyways."`
            } else {
            this.text = `? : "Hello!"`
            }
        }
    },
    lookaround: {
        text: "You looked left, looked right, infinite black in all directions.",
        buttons: [["\'Where Am I\'", "Game.advanceTo(light.whereami)"]]
    },
    whereami: {
        text: "? : You're a bit dead but everything is fine?",
        buttons: [["\'How'd that happen?\'", "Game.advanceTo(light.howdeath)"]]
    },
    howdeath: {
        text: "? : Embarrassingly? Don't worry about it.\nDo you want some kombucha tea?",
        buttons: [["\'What?\'","Game.advanceTo(light.what)"]]
    },
    what: {
        text: "? : Nah it's fine, everything's fine. You're safe here",
        buttons: [["\'What about my family?\'","Game.advanceTo(light.family)"]]
    },
    family: {
        text: "? : Yeah, let's just say Tom across the road took care of that.",
        buttons: [["\'Tom Evans? I'll kill him\'","Game.advanceTo(light.killhim)"]]
    },
    killhim: {
        text: "? : Yeah, okay. Well you can't do anything about it now.\nAnd hey! there's an after life.\nIsn't that exciting?",
        buttons: [["\'So, what happens now?\'", "Game.advanceTo(light.whattodo)"]]
    },
    whattodo: {
        text: "? : Ahh, okay. Here's what we'll do.\nSuddenly inside the sphere appeared images.\nThe days of your life in no particular order.",
        buttons: [["\'What's the point of this?\'", "Game.advanceTo(light.point)"]]
    },
    point: {
        text: "? : What was the point of life? Did you work it out?",
        buttons: [["\'I didn't have enough time\'", "Game.advanceTo(light.enoughtime)"]]
    },
    enoughtime: {
        text: "? : Oh you had time. You compeltely wasted it. Don't worry, everyone did.\nYour life was quite average, actually.",
        buttons: [["\'I think I understand\'", "Game.advanceTo(light.understand)"]]
    },
    understand: {
        text: "You : You're showing me where I went wrong.\nAnd you're going to bring me back to life and I'll finally learn from my mistakes.",
        buttons: [["[Continue]", "Game.advanceTo(endings.normal)"]]
    },


}

var endings = {
    amount: [],
    total: 5,
    allEndCheck: function () {
        if (endings.amount.length == endings.total) {
            Game.advanceTo(endings.allEndings)
            return true
        } else {
            return false
        }
    },
    longwait: {
        text: "",
        buttons: [
            ["Play Again?", "Game.restartGame()"]
        ],
        customFunc: function () {
            if (endings.amount.includes("longwait")) {
                this.text = `You already got the long wait ending...\n${endings.amount.length}/${endings.total} endings completed`
            } else {
                endings.amount.push("longwait")
                this.text = `You wait for an eternity, hoping for a change\nYou got the long wait ending!\n${endings.amount.length}/${endings.total} endings completed`
            }
        },
        preProcess: function () {
            return endings.allEndCheck()
        }
    },
    everyignore : {
        text: "",
        buttons: [
            ["Play Again?", "Game.restartGame()"]
        ],
        customFunc: function () {
            if (endings.amount.includes("everyignore")) {
                this.text = `You already got the ignore everything ending...\n${endings.amount.length}/${endings.total} endings completed`
            } else {
                endings.amount.push("everyignore")
                this.text = `You open your eyes, and find yourself stuck in eternity\nYou got the ignore everything ending!\n${endings.amount.length}/${endings.total} endings completed`
            }
        },
        preProcess: function () {
            return endings.allEndCheck()
        }
    },
    normal : {
        text: "",
        buttons: [
            ["Play Again?", "Game.restartGame()"]
        ],
        customFunc: function () {
            if (endings.amount.includes("normal")) {
                this.text = `You already got the normal ending...\n${endings.amount.length}/${endings.total} endings completed`
            } else {
                endings.amount.push("normal")
                this.text = `No you're a simulation, in the distant future\nYou got the normal ending!\n${endings.amount.length}/${endings.total} endings completed`
            }
        },
        preProcess: function () {
            return endings.allEndCheck()
        }
    },
    allEndings: {
        text: "",
        customFunc: function () {

        }
    }
} /* These are the endings. I'm making multiple endings to make it fun*/