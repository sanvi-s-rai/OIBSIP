
let currentExpression = "";
let calculated = false;

const expressionDisplay = document.getElementById("expression");
const resultDisplay = document.getElementById("result");


// Update calculator display
function updateDisplay(value) {
    resultDisplay.textContent = value;
}


// Clear calculator
function clearDisplay() {
    currentExpression = "";
    calculated = false;

    expressionDisplay.textContent = "";
    resultDisplay.textContent = "0";
}


// Add numbers, decimal point and percentage
function appendValue(value) {

    // Start a new calculation after pressing =
    if (calculated) {
        currentExpression = "";
        calculated = false;
        expressionDisplay.textContent = "";
    }

    // Prevent multiple decimal points in the same number
    if (value === ".") {

        const parts = currentExpression.split(/[+\-*/]/);
        const currentNumber = parts[parts.length - 1];

        if (currentNumber.includes(".")) {
            return;
        }
    }

    currentExpression += value;

    expressionDisplay.textContent = currentExpression;
    resultDisplay.textContent = currentExpression;
}


// Add operators
function appendOperator(operator) {

    if (currentExpression === "") {
        return;
    }

    calculated = false;

    const lastCharacter =
        currentExpression[currentExpression.length - 1];

    // Prevent two operators from being entered together
    if ("+-*/".includes(lastCharacter)) {

        currentExpression =
            currentExpression.slice(0, -1) +
            convertOperator(operator);

    } else {

        currentExpression += convertOperator(operator);
    }

    expressionDisplay.textContent = currentExpression;
}


// Convert calculator symbols into JavaScript operators
function convertOperator(operator) {

    switch (operator) {

        case "÷":
            return "/";

        case "×":
            return "*";

        case "−":
            return "-";

        case "+":
            return "+";

        default:
            return "";
    }
}


// Backspace
function backspace() {

    // Delete the last character from the expression
    if (currentExpression !== "") {

        currentExpression =
            currentExpression.slice(0, -1);

        expressionDisplay.textContent = currentExpression;

        if (currentExpression === "") {
            resultDisplay.textContent = "0";
        } else {
            resultDisplay.textContent = currentExpression;
        }

        calculated = false;

        return;
    }

    expressionDisplay.textContent = "";
    resultDisplay.textContent = "0";
}


// Calculate result
function calculate() {

    if (currentExpression === "") {
        return;
    }

    try {

        const expression =
            currentExpression
                .replace(/×/g, "*")
                .replace(/÷/g, "/")
                .replace(/−/g, "-")
                .replace(/%/g, "/100");

        const result = eval(expression);


        // Prevent division by zero
        if (!isFinite(result)) {

            expressionDisplay.textContent = currentExpression;
            resultDisplay.textContent = "Error";

            currentExpression = "";
            calculated = true;

            return;
        }


        // Keep original expression visible
        expressionDisplay.textContent = currentExpression;

        // Show answer below
        resultDisplay.textContent = result;

        // Keep expression for backspace
        calculated = true;

    } catch {

        expressionDisplay.textContent = currentExpression;
        resultDisplay.textContent = "Error";

        currentExpression = "";
        calculated = true;
    }
}


// Add event listeners to every button
document.querySelectorAll(".btn").forEach(button => {

    button.addEventListener("click", function () {

        // Number / decimal / percentage
        if (button.dataset.value !== undefined) {

            appendValue(button.dataset.value);

        }

        // Operators
        else if (button.dataset.operator !== undefined) {

            appendOperator(button.dataset.operator);

        }

        // Clear
        else if (button.dataset.action === "clear") {

            clearDisplay();

        }

        // Backspace
        else if (button.dataset.action === "backspace") {

            backspace();

        }

        // Calculate
        else if (button.dataset.action === "calculate") {

            calculate();

        }

    });

});
