const { exec } = require("child_process");
const yaml = require('js-yaml');
const fs = require('graceful-fs');

var files = 0;
var totallines = 0;
var smallest = 99999;
var largest = 0;
var ten = 0;
var hundred = 0;
var twohundred = 0;
var threehundred = 0;
var fourhundred = 0;
var fivehundred = 0;
var thousand = 0;
var fivethousand = 0;
var tenthousand = 0;
var twentythousand = 0;
var thirtythousand = 0;
var fourtythousand = 0;
var fiftythousand = 0;
var largefiftythousand = 0;

// var lineReader = require('readline').createInterface({
//     input: require('fs').createReadStream('list2.txt')
//   });
  
//   lineReader.on('line', function (line) {

//     exec("wc -l " + line + " >> noLines.txt", (error, stdout, stderr) => {
//         if (error) {
//             console.log(`error: ${error.message}`);
//             return;
//         }
//         if (stderr) {
//             console.log(`stderr: ${stderr}`);
//             return;
//         }
//     });

//     console.log('filename:', line);
// });


var lineReader = require('readline').createInterface({
    input: require('fs').createReadStream('noLines.txt')
  });
  
  lineReader.on('line', function (line) {
    const number = line.split(" ")[1];
    const filename = line.split(" ")[2];
    var currentline = parseInt(number);
    totallines += parseInt(number);

    if(smallest > currentline) {
        console.log('new smallest:', filename);
        smallest = currentline;
    }
    
    if(largest < currentline) {
        console.log('new largest:', filename);
        largest = currentline;
    }
    
    if(currentline < 10){
        ten +=1;
    }
    else if(currentline > 10 && currentline < 100){
        hundred +=1;
    }
    else if(currentline > 100 && currentline < 200){
        twohundred +=1;
    }
    else if(currentline > 200 && currentline < 300){
        threehundred +=1;
    }
    else if(currentline > 300 && currentline < 400){
        fourhundred +=1;
    }
    else if(currentline > 400 && currentline < 500){
        fivehundred +=1;
    }
    else if(currentline > 500 && currentline < 1000){
        thousand +=1;
    }
    else if(currentline > 1000 && currentline < 5000){
        fivethousand +=1;
    }
    else if(currentline > 5000 && currentline < 10000){
        tenthousand +=1;
    }
    else if(currentline > 10000 && currentline <20000){
        twentythousand +=1;
    }
    else if(currentline > 20000 && currentline <30000){
        thirtythousand +=1;
    }
    else if(currentline > 30000 && currentline <40000){
        fourtythousand +=1;
    }
    else if(currentline > 40000 && currentline <50000){
        fiftythousand +=1;
    }
    else if(currentline > 50000){
        largefiftythousand +=1;
    }

    files += 1;
    const average = totallines/files;

    console.log('files:', files);
    console.log('total lines:', totallines)
    console.log('average lines:', average);

    console.log(' < 10:', ten);
    console.log('10-100:', hundred);
    console.log('100-200:', twohundred);
    console.log('200-300:', threehundred);
    console.log('300-400:', fourhundred);
    console.log('400-500:', fivehundred);
    console.log('500-1000:', thousand);
    console.log('1000-5000:', fivethousand);
    console.log('5000-10000:', tenthousand);
    console.log('10000-20000:', twentythousand);
    console.log('20000-30000:', thirtythousand);
    console.log('30000-40000:', fourtythousand);
    console.log('40000-50000:', fiftythousand);
    console.log('more than 50000:', largefiftythousand);
    console.log('largest:', largest);
    console.log('smallest:', smallest);
});
