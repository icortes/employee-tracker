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
                    addDepartment();
                    break;
                case "add a role":
                    addRole();
                    break;
                case "add an employee":
                    addEmployee();
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
    return (employees);
}

// adds department to database
async function addDepartment() {
    inquirer.prompt([{
            type: 'input',
            name: 'newDepartment',
            message: 'Enter new department name: ',
            required: true
        }])
        .then(response => {
            const addDepartment = `INSERT INTO department (name) VALUES (?)`;
            db.query(addDepartment, response.newDepartment);
            console.log(`Added ${response.newDepartment} to the database`);
        })
}

async function getDepartmentNames() {
    const departments = await getAllDepartments();
    const departmentNameArray = [];
    departments.forEach(element => {
        departmentNameArray.push(element.department);
    })
    return departmentNameArray;

}

//adds role to the database
async function addRole() {
    let departmentArray = await getDepartmentNames();

    console.log(departmentArray);
    inquirer.prompt([{
                type: 'input',
                name: 'newRole',
                message: 'Enter new role name: ',
                required: true
            },
            {
                type: 'input',
                name: 'salary',
                message: 'Enter salary of role: ',
                required: true
            },
            {
                type: 'list',
                name: 'newRole',
                message: 'Select department for the role: ',
                choices: departmentArray,
            }
        ])
        .then(response => {
            const addRole = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;
            //db.query(addRole, [ /*title, salary, department_id*/ ]);
            console.log(`Added ${response.title} to the database`);
        })
}

async function getRoleArray() {
    const roles = await getRoles();
    let roleArray = [];
    roles.forEach(element => {
        roleArray.push(element.title);
    });
    return roleArray;
}

async function getManagerArray() {
    const employees = await viewAllEmployees();
    let managers = [];
    employees.forEach(element => {
        if (element.manager_id === null) {
            managers.push(`${element.first_name} ${element.last_name}`)
        }
    });
    return managers;
}

async function addEmployee() {
    const roles = await getRoleArray();
    const managers = await getManagerArray();
    console.log(roles);
    inquirer.prompt([{
                type: "input",
                name: "first_name",
                message: "Enter employee's first name:",
                require: true,
            },
            {
                type: "input",
                name: "last_name",
                message: "Enter employee's last name:",
                require: true,
            },
            {
                type: "list",
                name: "role",
                message: "Enter employee's role:",
                choices: roles,
                require: true,
            },
            {
                type: "list",
                name: "manager",
                message: "Enter employee's manager:",
                choices: managers,
                require: true,
            },
        ])
        .then((response) => {
        })
}

init();