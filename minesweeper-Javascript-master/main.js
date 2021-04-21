// game constants
let width = 10; // number of boxes per row.
let numBombs = 10;
const box_width = 40; // height and width of a box.

const container = document.querySelector(".container");
const form = document.getElementById("config-form");

const animationPos = ["top", "bottom", "right", "left"];

let board = [];
let bombs = [];
let flags = [];

const colorThemes = {
    green: {
        bodyBackground: "#C9F2C7",
        headingColor: "#243119",
        formShadowColor: "#ACECA1",
        formBackgroundColor: "#96BE8C",
        boxColor: "#243119",
        boxEmptyColor: "#629460",
    },
    blue: {
        bodyBackground: "#D8E1E9",
        headingColor: "#0b3149",
        formShadowColor: "#B3C5D7",
        formBackgroundColor: "#8fa7c3",
        boxColor: "#0b3149",
        boxEmptyColor: "#96b0d1",
    },
    orange: {
        bodyBackground: "#f3ddac",
        headingColor: "#FFA500",
        formShadowColor: "#F4AC32",
        formBackgroundColor: "#FFD131",
        boxColor: "#F4AC32",
        boxEmptyColor: "#FACC6B",
    },
};

const generateBoard = () => {
    const widthInput = document.getElementById("side-length");
    const numBombsInput = document.getElementById("num-bombs");

    width = +widthInput.value;
    numBombs = +numBombsInput.value;

    if (numBombs >= width * width) {
        alert("Number of bombs have to be less than total boxes (side*2).");
        numBombsInput.value = 10;
        main();
        return;
    }

    for (let i = 0; i < width * width; i++) {
        const box = document.createElement("div");
        box.classList.add("box");
        box.classList.add(animationPos[Math.floor(Math.random() * animationPos.length)])
        if (i < numBombs) {
            box.classList.add("bomb");
            bombs.push(box);
        } else {
            box.classList.add("safe");
        }
        board.push(box);
    }
};

const shuffleBoard = () => {
    for (let i = board.length - 1; i > 0; i--) {
        const newPosition = Math.floor(Math.random() * (i + 1));
        const temp = board[i];
        board[i] = board[newPosition];
        board[newPosition] = temp;
    }
    // index each box in the board.
    for (let j = 0; j < width * width; j++) {
        board[j].setAttribute("id", j);
    }
    return board;
};

const displayBoard = () => {
    container.style.width = width * box_width + "px";
    container.style.height = width * box_width + "px";
    board.forEach((box) => {
        container.appendChild(box);
        box.addEventListener("click", (e) => {
            onBoxClick(e.target);
        });
        box.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            onLeftClick(e.target);
        });
    });
};

const onLeftClick = (box) => {
    if (box.classList.contains("checked")) return;
    if (box.classList.contains("flag")) {
        box.classList.remove("flag");
        box.innerText = "";
        flags.splice(flags.indexOf(box), 1);
        return;
    }
    box.classList.add("flag");
    box.innerText = "📌";
    flags.push(box);
    console.log(flags.map((box) => +box.id));
    console.log(bombs.map((box) => +box.id));
    console.log(
        flags
        .map((box) => +box.id)
        .every((val) => bombs.map((box) => +box.id).includes(val))
    );
    if (
        flags.length === bombs.length &&
        flags
        .map((box) => +box.id)
        .every((val) => bombs.map((box) => +box.id).includes(val))
    ) {
        {
            gameOver(true);
        }
    }
};

const onBoxClick = (box) => {
    if (box.classList.contains("bomb")) {
        gameOver();
        return;
    }
    if (box.classList.contains("checked")) return;

    // calculate number of bombs around the box.
    const totalBombs = calcBombs(box);
    if (totalBombs != 0) {
        box.classList.add("checked");
        box.innerText = totalBombs;
        return;
    }
    // check if adjacent boxes have bomb number = 0 and display them if true.
    box.classList.add("empty");
    checkAdjacentBoxes(box);
    box.classList.add("checked");
};

const calcBombs = (box) => {
    const boxID = +box.id;
    const isLeftMost = boxID % width === 0;
    const isRightMost = (boxID + 1) % width === 0;
    let totalBombs = 0;

    if (
        boxID < width * (width - 1) &&
        board[width + boxID].classList.contains("bomb")
    )
        totalBombs++;

    if (boxID > width - 1 && board[boxID - width].classList.contains("bomb"))
        totalBombs++;

    if (isLeftMost && board[boxID + 1].classList.contains("bomb")) totalBombs++;

    if (isRightMost && board[boxID - 1].classList.contains("bomb"))
        totalBombs++;

    if (!isRightMost && !isLeftMost) {
        if (board[boxID + 1].classList.contains("bomb")) totalBombs++;
        if (board[boxID - 1].classList.contains("bomb")) totalBombs++;
    }

    // north-east
    if (!isRightMost &&
        boxID > width - 1 &&
        board[boxID - width + 1].classList.contains("bomb")
    )
        totalBombs++;

    // north-west
    if (!isLeftMost &&
        boxID > width - 1 &&
        board[boxID - width - 1].classList.contains("bomb")
    )
        totalBombs++;

    // south-east
    if (!isRightMost &&
        boxID < width * (width - 1) &&
        board[boxID + width + 1].classList.contains("bomb")
    )
        totalBombs++;

    // south-west
    if (!isLeftMost &&
        boxID < width * (width - 1) &&
        board[boxID + width - 1].classList.contains("bomb")
    )
        totalBombs++;

    return totalBombs;
};

const checkAdjacentBoxes = (box) => {
    // south
    const boxID = +box.id;
    const isLeftMost = boxID % width === 0;
    const isRightMost = (boxID + 1) % width === 0;
    setTimeout(() => {
        if (boxID < width * (width - 1)) {
            const newID = board[width + boxID].id;
            const adjacentBox = document.getElementById(newID);
            onBoxClick(adjacentBox);
        }
        // north
        if (boxID > width - 1) {
            const newID = board[boxID - width].id;
            const adjacentBox = document.getElementById(newID);
            onBoxClick(adjacentBox);
        }

        // east exclusive to leftmost
        if (isLeftMost) {
            const newID = board[boxID + 1].id;
            const adjacentBox = document.getElementById(newID);
            onBoxClick(adjacentBox);
        }

        // west exclusive to rightmost
        if (isRightMost) {
            const newID = board[boxID - 1].id;
            const adjacentBox = document.getElementById(newID);
            onBoxClick(adjacentBox);
        }

        // east and west
        if (!isRightMost && !isLeftMost) {
            let newID = board[boxID + 1].id;
            let adjacentBox = document.getElementById(newID);
            onBoxClick(adjacentBox);

            newID = board[boxID - 1].id;
            adjacentBox = document.getElementById(newID);
            onBoxClick(adjacentBox);
        }

        // north-east
        if (!isRightMost && boxID > width - 1) {
            const newID = board[boxID - width + 1].id;
            const adjacentBox = document.getElementById(newID);
            onBoxClick(adjacentBox);
        }

        // north-west
        if (!isLeftMost && boxID > width - 1) {
            const newID = board[boxID - width - 1].id;
            const adjacentBox = document.getElementById(newID);
            onBoxClick(adjacentBox);
        }

        // south-east
        if (!isRightMost && boxID < width * (width - 1)) {
            const newID = board[boxID + width + 1].id;
            const adjacentBox = document.getElementById(newID);
            onBoxClick(adjacentBox);
        }

        // south-west
        if (!isLeftMost && boxID < width * (width - 1)) {
            const newID = board[boxID + width - 1].id;
            const adjacentBox = document.getElementById(newID);
            onBoxClick(adjacentBox);
        }
    }, 10);
};

const gameOver = (win = false) => {
    if (win) {
        alert("You win!");
    } else {
        bombs.forEach((bomb) => {
            bomb.innerText = "💣";
        });
        alert("Game over !");
    }

    main();
};

const resetBoard = () => {
    container.innerHTML = "";
    board = [];
    bombs = [];
    flags = [];
};

const styleBoard = () => {};

function main() {
    // reset board
    resetBoard();

    // generate game board.
    generateBoard();

    // shuffle board (shuffling bomb boxes and non-bomb boxes).
    shuffleBoard();

    // display board on screen.
    displayBoard();
}
main();

form.addEventListener("submit", (e) => {
    e.preventDefault();
    main();
});

const colorThemesDiv = document.querySelector(".color-themes");
Array.from(colorThemesDiv.children).forEach((themeDiv) => {
    themeDiv.addEventListener("click", (e) => {
        color = e.target.getAttribute("data-color");
        colorTheme = colorThemes[color];

        let root = document.documentElement;
        root.style.setProperty("--body-background", colorTheme.bodyBackground);
        root.style.setProperty("--heading-color", colorTheme.headingColor);
        root.style.setProperty(
            "--form-shadow-color",
            colorTheme.formShadowColor
        );
        root.style.setProperty(
            "--form-background-color",
            colorTheme.formBackgroundColor
        );
        root.style.setProperty("--box-color", colorTheme.boxColor);
        root.style.setProperty("--box-empty-color", colorTheme.boxEmptyColor);
    });
});