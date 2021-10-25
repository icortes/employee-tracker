//import dependencies
const inquirer = require("inquirer");
const mysql = require("mysql2");
const cTable = require("console.table");
const util = require("util");

// Connect to database
const db = mysql.createConnection({
        host: 'localhost',
        // MySQL username
        user: 'root',
        // MySQL password
        password: 'password',
        database: 'company_db'
    },
    console.log(`Connected to the company_db database.`)
);

const queryPromise = util.promisify(db.query).bind(db);

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
                "update an employee role",
                "QUIT"
            ]
        }])
        .then(response => {

            const option = response.option;
            //console.log(option);
            switch (option) {
                case "view all departments":
                    viewAllDepartments();
                    break;
                case "view all roles":
                    viewAllRoles();
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
                    //do some work
                    break;
                case "update an employee role":
                    //do some work
                    break;
                case "QUIT":
                    //stop the program
                    console.log("App successfully exited");
                    process.exit();
                default:
                    console.log("this is not an option");
                    break;

            }
        })
        .catch((error) => {
            error ? console.log(error) : null;
        });
}


function viewAllDepartments() {
    const allDepartments = "SELECT id, name AS department FROM department";
    db.query(allDepartments, (error, results) => {
        console.table(results);
    });
}

async function getAllDepartments() {
    const allDepartments = "SELECT id, name AS department FROM department";
    const departments = await queryPromise(allDepartments);
    return departments;
}

async function viewAllRoles() {
    const allRoles = `SELECT role.id, role.title, role.department_id AS department, role.salary 
                        FROM role 
                        JOIN department ON role.department_id = department.id ORDER BY department.name`;
    const roles = await queryPromise(allRoles);
    console.table(roles);
    const departments = await getAllDepartments();
    console.log(departments);
    const newTable = roles.map((element) => {
        
    });
}

init();