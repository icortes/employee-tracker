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

//promisify db.query
const queryPromise = util.promisify(db.query).bind(db);

//function that executes when starting app
function init() {
    //ask the user what they'd like to do
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
            //store the response in a variable
            const option = response.option;
            //switch statement for all the available options the user has
            switch (option) {
                case "view all departments":
                    viewAllDepartments();
                    break;
                case "view all roles":
                    viewAllRoles();
                    break;
                case "view all employees":
                    viewAllEmployees();
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

//helper function for viewAllRoles
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
    //console.table(roles);
    const departments = await getAllDepartments();
    //console.log(departments);
    roles.forEach((element) => {
        //console.log(element);
        for (let i = 0; i < departments.length; i++) {
            if (departments[i].id === element.department) {
                element.department = departments[i].department;
                //console.log(element.department);
            }
        }
        //console.log(element.department);
    });
    console.table(roles);
}

//helper function for viewAllEmployees
async function getRoles() {
    const allRoles = `SELECT role.id, role.title, role.department_id AS department
                        FROM role 
                        JOIN department ON role.department_id = department.id ORDER BY department.name`;
    const roles = await queryPromise(allRoles);
    // helper promise function to get names of departments
    const departments = await getAllDepartments();
    // for every element replace the integer to its corresponding department name
    roles.forEach((element) => {
        // for every element find the matching department.id and replace it with the string name
        for (let i = 0; i < departments.length; i++) {
            if (departments[i].id === element.department) {
                element.department = departments[i].department;
                //console.log(element.department);
            }
        }
        //console.log(element.department);
    });
    return roles;
}

//logs a table with all employees and their information
async function viewAllEmployees() {
    // command to get all of the employee info
    const allEmployees = `SELECT employee.id, employee.first_name, employee.last_name, employee.role_id AS title, role.department_id AS department, role.salary, employee.manager_id
                            FROM employee
                            JOIN role WHERE employee.role_id = role.id ORDER BY employee.id`;
    // promisify-ed version of db.query
    const employees = await queryPromise(allEmployees);
    // helper promise function to get role.id, role.title, and role.department_id
    const roles = await getRoles();
    // for every element replace the integer values of title and department with their string names
    employees.forEach((element) => {
        for (let i = 0; i < roles.length; i++) {
            if (roles[i].id === element.title) {
                element.title = roles[i].title;
                element.department = roles[i].department;
            }
        }
    });
    // for every element replace manager_id value to its string value of manager first and last name
    employees.forEach((element) => {
        for (let i = 0; i < employees.length; i++) {
            if (employees[i].id === element.manager_id) {
                element.manager_id = `${employees[i].first_name} ${employees[i].last_name}`
            }
        }
    })
    console.table(employees);
}

init();