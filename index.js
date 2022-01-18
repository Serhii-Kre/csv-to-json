const AdmZip = require("adm-zip");
const path = require("path");
const fs = require('fs');
const csv=require('csvtojson')
const {phone} = require('phone');
var format = require('date-format');

async function extractArchive(filepath) {
 try {
    const zip = new AdmZip(filepath);
    const outputDir = `${path.dirname(filepath)}/csv/`;
    const outputFile = path.join(__dirname,'./output/','users.json');   
    var jsonArray =[];
    const rq = (s) => s.replace(/['"]+/g, '')    
    const save_json_func = (json) => {
     fs.appendFileSync(outputFile, json, function(err) {
        if (err) {
            return console.log(err);
        }
        console.log("The file was saved!");       
      }); 
    }
    
    zip.extractAllTo(outputDir);
    fs.readdir(outputDir, (err, files) => {
        let file_path;
        let obj_array = []
        let final_obj = {}
        let _line = [];
        let parts;
        let mydate;
        let filesCount = 0;   
        
        files.forEach(file => {
          file_path = path.join(__dirname, outputDir, path.basename(file));
          csv({ output: "csv" })
            .fromFile(file_path)
            .then((jsonObj) => {
              jsonObj.forEach(line => {
                if (line[0]) {
                  _line = line[0].split('||')
                }
                final_obj["name"] = rq(_line[0]) + ' ' + rq(_line[1])
                final_obj["phone"] = phone(_line[5], { country: null, validateMobilePrefix: false }).phoneNumber
                final_obj["person"] = {
                  "firstName": rq(_line[0]),
                  "lastName": rq(_line[1])
                }
                final_obj["amount"] = _line[7]
                parts = rq(_line[8]).split('/');
                mydate = new Date(parts[0], parts[1] - 1, parts[2]);
                final_obj["date"] = format.asString('yyyy-mm-dd', mydate);
                final_obj["costCenterNum"] = rq(_line[6]).substr(3)
                obj_array.push(final_obj);
                final_obj = {}
              })

              filesCount++;
              if (filesCount == files.length) {
                save_json_func(JSON.stringify(obj_array));
              }
            })      
        });  
      });

  } catch (e) {
    console.log(`Something went wrong. ${e}`);
  }
}
extractArchive("./input/Test data.zip");