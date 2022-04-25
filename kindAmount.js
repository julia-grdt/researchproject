const { exec } = require("child_process");
const yaml = require('js-yaml');
const fs = require('graceful-fs');

var kindList  = [];

var lineReader = require('readline').createInterface({
    input: require('fs').createReadStream('jsonList.txt')
});
    
lineReader.on('line', function(line) {
    var list = fs.readFile(line, 'utf8' , (err, data) => {
        if (err) {
            console.error(err)
            return;
        }
        // console.log(line);
        var json = JSON.parse(data);

        for(let i = 0; i < json.length; i++) {
            var object = json[i];
            // console.log(object);
    
            if(object != null){
                var key = object.kind;
                // console.log(key);

                if(kindList.findIndex((obj => obj.kind == key)) > -1){
                    objIndex = kindList.findIndex((obj => obj.kind == key));
                    kindList[objIndex].amount +=1;
                }
                else{
                    let keyobject = {
                        "kind": key,
                        "amount": 1,
                    };

                    kindList.push(keyobject);
                }
            }
        }

        fs.appendFile('amountCheck.txt', JSON.stringify(kindList) + "\n\n" , function (err) {
            if (err) throw err;
            console.log('added');
        });
    });
})
