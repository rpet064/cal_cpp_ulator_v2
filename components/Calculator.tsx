import styles from '../styles/Home.module.css';
import { useState, useEffect } from 'react';

const numArray = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
const operatorArray = ["+", "-", "×", "÷"];

export default function Calculator(){
  const [firstCalculatorInput, setFirstCalculatorInput] = useState<string[]>([]);
  const [secondCalculatorInput, setSecondCalculatorInput] = useState<string[]>([]);
  const [operator, setOperator] = useState('');
  const [postResponse, setPostResponse] = useState({"answer": "placeholder"});
  const [isLoading, setIsLoading] = useState(false);
  const [err, setErr] = useState('');
  const [btnData, setBtnData] = useState([]);

  // useEffect fetch btn data to be displayed on calculator keys
  useEffect(() => {
    fetch(`/api/calculatorData`)
    .then(response => response.json())
      .then((usefulData) => {
        setIsLoading(false);
        setBtnData(usefulData.btnData);
      })
      .catch((e) => {
        console.error(`An error occurred: ${e}`)
      });
  }, []);

  // useEffect takes number arrays & symbol to be calculated to post to sever
    const solveEquation = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/calculatorData', {
        method: 'POST',
        body: JSON.stringify({
          firstNumber: firstCalculatorInput,
          operator: operator,
          secondNumber: secondCalculatorInput
        }),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error! status: ${response.status}`);
      }

      const result = await response.json();
      setPostResponse(result);
    } catch (err: any) {
      setErr(err.message);
    } finally {
      setIsLoading(false);
    }
    clearNumbers();
  };

  // clear calculator input arrays
  const clearNumbers = () => {
    setFirstCalculatorInput([]);
    setOperator('');
    setSecondCalculatorInput([]);
  }

  // handle number input logic - this function checks if the first or second number is currently
  // being inputted, then adds to array accordingly
  const onInputNumber = (userInput: string) => {
    if (operator === ''){
      setFirstCalculatorInput(firstCalculatorInput => [...firstCalculatorInput, userInput]);
    } else {
      setSecondCalculatorInput(secondCalculatorInput => [...secondCalculatorInput, userInput]);
    }      
  }

  // handle change to % input logic - this function checks if the first or second number is currently
  // inputted, then changes the array to a number string, divides, then puts back into array
  const changeToPercentage = () => {
    let originalNumber = 0;
    let dividedNumberString = '';
    if (operator === ''){
      if (firstCalculatorInput.length){
        originalNumber = parseInt(firstCalculatorInput.toString().replaceAll(',', ''));
        dividedNumberString = (originalNumber / 100).toString()
        setFirstCalculatorInput([dividedNumberString]);

      // This function will return 0 if user hasn't inputted numbers in first (current) array
      } else { setFirstCalculatorInput(['0']);}
    } else {
      if (secondCalculatorInput.length){
      originalNumber = parseInt(secondCalculatorInput.toString().replaceAll(',', ''));
      setSecondCalculatorInput([dividedNumberString]);

      // This function will return 0 if user hasn't inputted numbers in second (current) array
      } else { setSecondCalculatorInput(['0']);
    }
  }
}

  // handle number input logic - this function checks if the first or second number is currently
  // being inputted, then checks if array is empty
  const onInputDecimal = (userInput: string) => {
    if (operator === ''){
      if (firstCalculatorInput.length){
        
        // add decimal like normal to first array
        onInputNumber(userInput)
      } else {

        // add 0. to first array (as it's empty)
        setFirstCalculatorInput(['0.'])
      }
    } else {
      if (secondCalculatorInput.length){

        // add decimal like normal to second array
        onInputNumber(userInput)
      } else {
        
        // add 0. to second array (as it's empty)
        setSecondCalculatorInput(['0.'])
      }
    }      
  }

  // handle operator input logic
  const onInputOperator = (userInput: string) => {
    if (operator === ''){
      if (firstCalculatorInput.length === 0){
        alert('please enter a number first')
      } else {
      setOperator(userInput);
    }
    } else {  
      alert('Submit for solving')
      clearNumbers();
    }      
  }

  // handle sign change logic - checks if currently first or second array, then checks
  // the sign at the front of the array (if the number is positive or negative) - the values
  //  are taken from the hook and then added back in as useState hooks are immutable
  const changeSign = () => {
    if (operator === ''){
      var originalArray = firstCalculatorInput;
      if (firstCalculatorInput[0] === "-"){

        // remove "-" from front of first array making it "positive"
        originalArray = originalArray.slice(1);
        setFirstCalculatorInput([...originalArray]);
      } else {

        // add "-" to front of first array making it "negative"
        originalArray.unshift("-");
        setFirstCalculatorInput([...originalArray]);
      }
    } else {
      var originalArray = secondCalculatorInput;
      if (secondCalculatorInput[0] === "-"){

        // remove "-" from front of second array making it "positive"
        originalArray = originalArray.slice(1);
        setSecondCalculatorInput([...originalArray]);
      } else {

        // add "-" to front of second array making it "negative"
        originalArray.unshift("-");
        setSecondCalculatorInput([...originalArray]);
    }     
  }
}

  // this const catches userinput from button and triggers correct function accordingly
  const handleUserInput = (userInput: string) => {

    // clears answer from post request (so user can input another equation) 
    setPostResponse({"answer": "placeholder"});

    // checks that the equation isn't too big (max length excluding operator is 16)
    if (firstCalculatorInput.length +  secondCalculatorInput.length < 16){

      if (numArray.includes(userInput)){
        onInputNumber(userInput);
      } else if (operatorArray.includes(userInput)){
      onInputOperator(userInput);
      } else if (userInput === "AC") {
        clearNumbers();
      } else if (userInput === "+/-") {
        changeSign();
      } else if (userInput === "%") {
        changeToPercentage();
      } else if (userInput === ".") {
        onInputDecimal(".");
      } else if (userInput === "=") {
        solveEquation();
      }
  } else {

    // clears screen when is full
    if (userInput === "AC") {
      clearNumbers();
    } else {

      // will trigger alert if user tries to add more numbers
      alert("More integers cannot be added to calculator");
      }
    }
  }

    return (
        <div className={styles.calculator}>
          <div>
            <div className={styles.calculatorScreen}>     
            {(postResponse.answer === "placeholder") && !isLoading && <span>{firstCalculatorInput} {operator} {secondCalculatorInput}</span>}
            {!(postResponse.answer === "placeholder") && !isLoading && <span>{postResponse.answer}</span>}
            </div>
            <div className={styles.calculatorKeypad}>
            {btnData.map((symbol, index) => {
              return (
              <button onClick={() => handleUserInput(symbol)} key={index} className={styles.calcBtn}>{symbol}</button>
              )
            })
            }
            </div>
          </div>
        </div>
    )
}