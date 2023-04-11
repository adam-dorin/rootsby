#! /usr/bin/env node

const fs = require('fs-extra');
const path = require('path');

console.log('Creating new project at: ' + process.cwd());

try{
    
fs.copySync(path.join(__dirname,'src'), path.join(process.cwd(),'src'));
fs.copySync(path.join(__dirname,'package.json'), path.join(process.cwd(),'package.json'));
fs.copySync(path.join(__dirname,'content'), path.join(process.cwd(),'content'));
fs.copySync(path.join(__dirname,'server.js'), path.join(process.cwd(),'server.js'));
fs.copySync(path.join(__dirname,'ecosystem.config.js'), path.join(process.cwd(),'ecosystem.config.js'));
fs.writeFileSync(path.join(process.cwd(),'.gitignore'), `node_modules`)

console.log('Done. now run: npm install');
}catch(e){
    console.log('There was an error creating the project');
    console.log('Error: ' + e);
}