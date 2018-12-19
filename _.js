const fs = require('fs');
const mkdirp = require('mkdirp');
const { exec } = require('child_process')
 
class _{
	constructor(){
	}

	setDataPath(path){
		this.dataPath = path;
	}

	getDataPath(){
		return this.dataPath;
	}

	saveResult(name, path, data){
		var fpath = `${this.dataPath}/${path}/`;
		mkdirp(fpath, function(err){
			if(err) console.log(err);
			fpath += `${name}`;
    		fs.writeFileSync(fpath, data);
		})
	}

	exec(name, command){
		return new Promise((resolve, reject) => {
			exec(command, (err, stdout, stderr) => {
				if(err)	{
					reject();
					return;
				}
				resolve(stdout);			
				this.saveResult(name, stdout);
			});
		});
	}
}

const exported = new _();
module.exports = exported;