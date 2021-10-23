//import dependencies
const inquirer = require("inquirer");
const mysql = require("mysql2");

function init() {
    inquirer.prompt([{
        type: "list",
        name: "option",
        message: "What would you like to do?",
        choices: [
            "view all departments",
            "view all roles",
            "view all employees",
            "add a department",
            "add a role",
            "add an employee",
            "update an employee role"
        ]
    }])
    .then(response => {

        const option = response.option;
        //console.log(option);
        switch(option) {
            case "view all departments":
                //do some work
                break;
            case "view all roles":
                //do some work
                break;
            case "view all employees":
                //do some work
                break;
            case "add a department":
                // do some work
                break;
            case "add a role":
                //do some work
                break;
            case "add an employee":
                //dp some work
                break;
            case "update an employee role":
                //so some work
            default:
                console.log("this is not an option");
                break;

        }
    })
    .catch((error) => {
        error ? console.log(error) : null;
    });
}

init();