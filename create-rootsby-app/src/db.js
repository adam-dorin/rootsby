const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
let dbConnection;
const openDB = async function () {
  dbConnection = await sqlite.open({
    filename: path.join(__dirname, process.env.DB),
    driver: sqlite3.Database,
  });

  return dbConnection;
};
exports.db = module.exports.db = ()=> dbConnection ? dbConnection : openDB();

const dbSeed = `
CREATE TABLE IF NOT EXISTS prompts (
    id TEXT(50),
    name TEXT(250),
    content TEXT(600), 
    model TEXT(250));
    
    -- threads definition
    CREATE TABLE threads (
    id TEXT(50),
    name TEXT(250),
    promptId TEXT(50)
    );
    
    -- messages definition
    CREATE TABLE messages (
    id TEXT(50),
    threadId TEXT(50),
    author TEXT(50),
    name TEXT(250),
    message TEXT(1000), 
    created_on INTEGER);
    
    -- scripts definition
    CREATE TABLE scripts (
    id TEXT(50),
    name TEXT(250)
    );
`
