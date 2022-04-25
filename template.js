const { exec } = require("child_process");

var lineReader = require('readline').createInterface({
    input: require('fs').createReadStream('list.txt')
  });
  
  lineReader.on('line', function (line) {
    const fileName = line.split(".tgz")[0];

    exec("touch " + fileName + ".yaml", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });

    exec("helm template " + line + " >> " + fileName + ".yaml", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });

    // console.log('Line from file:', line);
    console.log('filename:', fileName);
});

