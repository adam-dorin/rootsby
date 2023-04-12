// eslint-disable-next-line @typescript-eslint/no-var-requires,no-undef
const fs = require("fs")
// eslint-disable-next-line @typescript-eslint/no-var-requires,no-undef
const path = require("path")

const getAllFiles = function (dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath)

    arrayOfFiles = arrayOfFiles || []

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
        } else {
            // eslint-disable-next-line no-undef
            arrayOfFiles.push(path.join(__dirname, dirPath, "/", file))
        }
    })

    return arrayOfFiles
}

const fileList = getAllFiles('./src').map(p => './src' + p.split('src')[1].replace(/\\/gi, "/")).filter(f => f.indexOf('.ts') > -1);
// eslint-disable-next-line @typescript-eslint/no-var-requires,no-undef
const config = {
    entryPoints: [],
    out: "documentation"
}

config.entryPoints = fileList;

fs.writeFileSync('./typedoc.json', JSON.stringify(config, null, 3));

