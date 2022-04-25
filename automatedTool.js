const { exec } = require("child_process");
const yaml = require('js-yaml');
const fs = require('graceful-fs');
const verbs_max = 5;

const CKV_K8S_21 = ['ConfigMap', 'CronJob', 'DaemonSet', 'Deployment', 'Ingress', 'Job', 'Pod', 'ReplicaSet', 'ReplicationController', 'Role', 'RoleBinding', 'Secret', 'Service', 'ServiceAccount', 'StatefulSet'];
const CKV_K8S_38_31 = ['CronJob', 'DaemonSet', 'Deployment', 'Job', 'Pod', 'ReplicaSet', 'ReplicationController', 'StatefulSet'];
const CKV_K8S_43 = ['CronJob', 'DaemonSet', 'Deployment', 'Job', 'Pod', 'PodTemplate', 'ReplicaSet', 'ReplicationController', 'StatefulSet'];
const CKV_K8S_49 = ['Role', 'ClusterRole'];
const ADDED_CHECK = ['Role', 'ClusterRole'];


var CKV_21P = 0;
var CKV_21F = 0;
var CKV_38P = 0;
var CKV_38F = 0;
var CKV_31P = 0;
var CKV_31F = 0;
var CKV_43P = 0;
var CKV_43F = 0;
var CKV_49P = 0;
var CKV_49F = 0;
var ADDED_CHECKP = 0;
var ADDED_CHECKF = 0;
var totalP = 0;
var totalF = 0;
var string = " ";

console.log("\n\n-------------------------------- \n");

function nestedLoop(obj) {
    var imgs = [];
    var found = 0;
    const res = {};
    function recurseIMG(obj, current) {
        for (const key in obj) {
            let value = obj[key];
            if(value != undefined) {
                if(key == 'image'){
                    if(!imgs.includes(value)){
                        imgs.push(value);
                    }
                    found = 1;
                    return res;
                }
                else if (value && typeof value === 'object' && found == 0) {
                    recurseIMG(value, key);
                }
                res[key] = value;
            }
        }
    }
   
    if(CKV_K8S_43.includes(obj.kind)){
        recurseIMG(obj);
    }

    for(key in imgs){
        const image = imgs[key].split(":")[0]
        if(imgs[key].includes("@sha")){
            console.log("   PASSED CKV_K8S_43");
            CKV_43P += 1;
        }
        else{
            console.log("   FAILED CKV_K8S_43: Image should use digest - " + image);
            CKV_43F +=1;
        }
    }
    return res;
}

async function start(fileName){
    var json = yaml.loadAll(fs.readFileSync(fileName, {encoding: 'utf-8'}));
    
    for(let i = 0; i < json.length; i++) {
        var object = json[i];

        if(object != null){
            var key = object.kind;
            console.log("\n   -- " + key + " --\n");

            if(CKV_K8S_21.includes(key)){
                if('namespace' in object.metadata && object.metadata['namespace'] != 'default'){
                    console.log("   PASSED CKV_K8S_21");
                    CKV_21P +=1;
                }
                else{
                    console.log("   FAILED CKV_K8S_21: The default namespace should not be used");
                    CKV_21F +=1;
                }
            }

            if(CKV_K8S_38_31.includes(key) && object.hasOwnProperty('spec')){
                // CHECK FOR 31
                var metadata;
                var pass = 0;
                var route;

                if(key == 'Pod'){
                    route = object.spec;
                    if(route != null && route.securityContext && route.securityContext.seccompProfile && route.securityContext.seccompProfile['type'] == 'RuntimeDefault'){
                        console.log("   PASSED CKV_K8S_31");
                        CKV_31P +=1;
                        pass = 1;
                    }
                    else{
                        metadata = object['metadata'];
                    }
                }
                else if(key == 'CronJob'){
                    metadata = object.spec.jobTemplate.spec.template['metadata'];
                }
                else if(key == 'StatefulSet' || key == 'Deployment'){
                    route = object.spec.template.spec;
                    if(route != null && route.securityContext && route.securityContext.seccompProfile && route.securityContext.seccompProfile['type'] == 'RuntimeDefault'){
                        console.log("   PASSED CKV_K8S_31");
                        CKV_31P +=1;
                        pass = 1;
                    }
                    else{
                        metadata = object['metadata'];
                    }
                }
                else{
                    metadata = object['metadata'];
                }
                
                if(metadata){
                    for(key in metadata.annotations){
                        if(metadata.annotations[key] == 'seccomp.security.alpha.kubernetes.io/pod' && (metadata.annotation['seccomp.security.alpha.kubernetes.io/pod'] == 'docker/default' || metadata.annotation['seccomp.security.alpha.kubernetes.io/pod'] == 'runtime/default')){
                            console.log("   PASSED CKV_K8S_31");
                            CKV_31P +=1;
                            pass = 1;
                        }
                    }
                }
                if(pass != 1){
                    console.log("   FAILED CKV_K8S_31 : Ensure that the seccomp profile is set to docker/default or runtime/default");
                    CKV_31F +=1;
                }

                // CHECK FOR 38
                var route = null;
                if(key == 'Pod'){
                    route = object.spec;
                }
                else if(key == 'CronJob'){
                    route = object.spec.jobTemplate.spec.template.spec;
                }
                else if(object.spec.template != null){
                    route = object.spec.template.spec;
                }

                if(route != null && 'automountServiceAccountToken' in route && route['automountServiceAccountToken'] == false){
                    console.log("   PASSED CKV_K8S_38");
                    CKV_38P +=1;
                }
                else{
                    console.log("   FAILED CKV_K8S_38: Ensure that Service Account Tokens are only mounted where necessary");
                    CKV_38F +=1;
                }
            }

            // CHECK FOR 43
            nestedLoop(object);

            if(CKV_K8S_49.includes(key) && object.hasOwnProperty('rules')){
                var wildcards = [];
                if(object.rules){
                    for(num in object.rules){
                        var route = object.rules[num];
                        if(route.apiGroups && route.verbs && route.resources){
                            if(route['verbs'].includes("*")){
                                wildcards.push("VERBS");
                            }
                            if(route['resources'].includes("*")){
                                wildcards.push("RESOURCES");
                            }
                            if(route['apiGroups'].includes("*")){
                                wildcards.push("APIGROUPS");
                            }
                        }
                    }
                    
                    if(wildcards.length > 0){
                        console.log("   FAILED CKV_K8S_49: Minimize wildcard use in Roles and ClusterRoles, WILDCARD FOR " + wildcards.join(", "));
                        CKV_49F += 1;
                    }
                    else{
                        console.log("   PASSED CKV_K8S_49");
                        CKV_49P +=1;

                    }
                }
            }

            if(ADDED_CHECK.includes(key) && object.hasOwnProperty('rules')){
                var nums = [];
                if(object.rules){
                    for(num in object.rules){
                        var route = object.rules[num];
                        if(route.apiGroups && route.verbs && route.resources){
                            if(route['verbs'].length > verbs_max){
                                nums.push(num);
                            }
                        }
                    }
                    if(nums.length > 0){
                        console.log("   FAILED ADDED CHECK: Amount of verbs is more than " + verbs_max + " for verbs number(s)" + nums.join(", "));
                        ADDED_CHECKP +=1;
                    }
                    else{
                        console.log("   PASSED ADDED CHECK");
                        ADDED_CHECKF +=1;
                    }
                    
                }
            }

        }
    }
}

async function inputList(){
    var lineReader = require('readline').createInterface({
        input: require('fs').createReadStream('jsonList.txt')
      });
      
        lineReader.on('line', function (line) {
        const fileName = line.split(".json")[0];
        const fileYAML = fileName + ".yaml";

        console.log('\n -- STARTING EVALUATION OF ' + fileName + ' -- \n');
        var startTime = performance.now()
        start(fileYAML);
        var endTime = performance.now()

        var timer = endTime - startTime;

        console.log('\n \nCKV_K8S_21 Passed: ' + CKV_21P + ', CKV_K8S_21 Failed: ' + CKV_21F);
        console.log('CKV_K8S_38 Passed: ' + CKV_38P + ', CKV_K8S_38 Failed: ' + CKV_38F);
        console.log('CKV_K8S_31 Passed: ' + CKV_31P + ', CKV_K8S_31 Failed: ' + CKV_31F);
        console.log('CKV_K8S_43 Passed: ' + CKV_43P + ', CKV_K8S_43 Failed: ' + CKV_43F);
        console.log('CKV_K8S_49 Passed: ' + CKV_49P + ', CKV_K8S_49 Failed: ' + CKV_49F);
        console.log('ADDED CHECK Passed: ' + ADDED_CHECKP + ', ADDED CHECK Failed: ' + ADDED_CHECKF);
        console.log(fileName);
        totalF += CKV_49F;
        totalP += CKV_49P;
    
    });
}

async function input(){
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Input file ', function (fileName) {
            fileName = fileName.replace(/\s/g, "");
            console.log('\n -- STARTING EVALUATION OF ' + fileName + ' -- \n');
            start(fileName);
            console.log('\n \nCKV_K8S_21 Passed: ' + CKV_21P + ', CKV_K8S_21 Failed: ' + CKV_21F);
            console.log('CKV_K8S_38 Passed: ' + CKV_38P + ', CKV_K8S_38 Failed: ' + CKV_38F);
            console.log('CKV_K8S_31 Passed: ' + CKV_31P + ', CKV_K8S_31 Failed: ' + CKV_31F);
            console.log('CKV_K8S_43 Passed: ' + CKV_43P + ', CKV_K8S_43 Failed: ' + CKV_43F);
            console.log('CKV_K8S_49 Passed: ' + CKV_49P + ', CKV_K8S_49 Failed: ' + CKV_49F);
            console.log('ADDED CHECK Passed: ' + ADDED_CHECKP + ', ADDED CHECK Failed: ' + ADDED_CHECKF);
            console.log(fileName);
            process.exit(0);
    });

}

input();