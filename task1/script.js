// Get references to the display elements
const expressionDisplay = document.getElementById('expression');
const answerDisplay = document.getElementById('answer');

// Variables to track expression and previous answer
let expression = '';
let lastAnswer = null;

// Function to update the expression display
function updateExpression(value) {
    // Avoid adding 'null' or undefined values
    if (value === null || value === undefined) {
        return;
    }

    // Update expression and display it
    expression += value;
    expressionDisplay.innerText = expression;
}

// Function to calculate the result
function calculate() {
    try {
        // Replace x and ÷ with their valid operators for evaluation
        let formattedExpression = expression.replace('x', '*').replace('÷', '/');

        // Ensure there is something to evaluate
        if (formattedExpression.trim() === '') {
            answerDisplay.innerText = '0';
            return;
        }

        // Evaluate the expression and display the result
        let result = eval(formattedExpression);
        answerDisplay.innerText = result;
        lastAnswer = result;  // Store the result for 'Ans' button use
    } catch (error) {
        answerDisplay.innerText = 'Error';
    }
}

// Function to clear the calculator
function clearCalculator() {
    expression = '';
    expressionDisplay.innerText = '0';
    answerDisplay.innerText = '0';
}

// Function to delete the last input character
function deleteLast() {
    expression = expression.slice(0, -1);
    expressionDisplay.innerText = expression || '0';
}

// Attach event listeners to the buttons
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', () => {
        const value = button.getAttribute('data-value');

        if (value === 'ans') {
            if (lastAnswer !== null) {
                updateExpression(lastAnswer.toString());  // Append last answer to the expression
            }
        } else if (value) {
            updateExpression(value);
        }
    });
});

// Attach event listeners to functional buttons
document.getElementById('enter').addEventListener('click', calculate);
document.getElementById('clear').addEventListener('click', clearCalculator);
document.getElementById('del').addEventListener('click', deleteLast);
