var text = document.getElementById("text");
var choices = document.getElementById('choices');
var input = document.getElementById('input');

input.onclick = function (event) {
    input.parentNode.removeChild(input)
    advanceTo(scenario.main)
};

var updateText = function (words) {
    text.innerHTML = words.replace("\n", "<br>")
};

var updateButtons = function (buttonList) {
    choices.innerHTML = "";
    if (buttonList !== undefined) {
        for (var i = 0; i < buttonList.length; i++) {
            choices.innerHTML += "<button onClick=" + buttonList[i][1] + ">" + buttonList[i][0] + "</button>";
        }
    }
};

var advanceTo = function (s) {
    if ("customFunc" in s) {
        s.customFunc()
    }

    if (!("block" in s)) {
        updateText(s.text)
        updateButtons(s.buttons)
    }
};

function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

var gameVars = {
    hoursWaited: 2
}

var scenario = {
    main: {
        text: "You look around you, and see nothing but darkness\nWhat do you do?",
        buttons: [
            ["Wait", "advanceTo(scenario.wait)"],
            ["Wander", "advanceTo(scenario.wander)"]
        ]
    },
    wait: {
        text: "",
        buttons: [
            ["Wait for longer", "advanceTo(scenario.wait)"],
            ["Wander", "advanceTo(scenario.wander)"]
        ],
        customFunc: function () {
            scenario.wait.text = `You wait for ${gameVars.hoursWaited} hours, but nothing happens\nWhat do you do?`;
            gameVars.hoursWaited += 1;
        }
    },
    wander: {
        text: "You wandered and got lost\nThe End!",
        buttons: [
            ["wow ok", "advanceTo(scenario.lolwat)"]
        ]
    },
    lolwat: {
        text: "no really I wasn't joking",
        buttons: [
            ["so this is really it huh?", "advanceTo(scenario.actualend)"]
        ]
    },
    actualend: {
        text: "yep and I have to sleep bye!",
        buttons: [
            ["why do you need sleep you're a website", "advanceTo(scenario.sike)"]
        ]
    },
    sike: {
        text: "what if I'm not a website",
        buttons: [
            ["ok wow bye", "advanceTo(scenario.sike)"]
        ]
    }
};