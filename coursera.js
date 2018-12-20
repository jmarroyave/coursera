'use strict';
const config = require('./config');
const request = require('request');
const parseArgs = require('minimist')
const _ = require('./_');
const headers = { 
	'Host': 'www.coursera.org',
	'User-Agent': config.userAgent,
	'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
	'Accept-Language': 'en-US,en;q=0.5',
	//'Accept-Encoding': 'gzip, deflate, br',
	'Cookie': config.cookies,
	'Connection': 'keep-alive',
	'Upgrade-Insecure-Requests': '1',
	'Cache-Control': 'max-age=0',
	'TE': 'Trailers',
};

_.setDataPath(config.dataPath);

function download (options) {
	var url = options.url;
	return new Promise((resolve, reject) => {
 		request.get(url, {timeout : config.timeout}, (err, response, payload) => {
			if(err){
				console.log(err)			
			}
			resolve(payload);
		});
	})
};


function get (options) {
	var url = options.url;
	return new Promise((resolve, reject) => {
		request.get(url, {timeout : config.timeout, headers : headers, json: true}, (err, response, body) => {
			if(err){
				console.log(err);
			}
			resolve(body);
		});
	})
};

function showMenu(){
	console.log("Coursera resources downloader");
	console.log("Author: jmarroyave.compsci@gmail.com");
	console.log("Current saving path:", _.getDataPath());	
	console.log("Usage:");
	console.log("  ", "node coursera.js [operation] [parameters]");
	console.log("Operations:");
	console.log('  ', "--index", '\t', "show the current structure of a course");
	console.log('\t\t', "node coursera.js --index --course=course-slug");
	console.log('  ', "--fetch|-f", '\t', "download resources from a course");
	console.log("\t\t", "node coursera.js --fetch --course=course-slug [--type=video*|subtitles|all] [--start=1*]");
}

function fetchCourseInfo(slug){
	const url = `https://www.coursera.org/api/onDemandCourseMaterials.v2/?q=slug&slug=${slug}&includes=modules%2Clessons%2CpassableItemGroups%2CpassableItemGroupChoices%2CpassableLessonElements%2Citems%2Ctracks%2CgradePolicy&fields=moduleIds%2ConDemandCourseMaterialModules.v1(name%2Cslug%2Cdescription%2CtimeCommitment%2ClessonIds%2Coptional%2ClearningObjectives)%2ConDemandCourseMaterialLessons.v1(name%2Cslug%2CtimeCommitment%2CelementIds%2Coptional%2CtrackId)%2ConDemandCourseMaterialPassableItemGroups.v1(requiredPassedCount%2CpassableItemGroupChoiceIds%2CtrackId)%2ConDemandCourseMaterialPassableItemGroupChoices.v1(name%2Cdescription%2CitemIds)%2ConDemandCourseMaterialPassableLessonElements.v1(gradingWeight%2CisRequiredForPassing)%2ConDemandCourseMaterialItems.v2(name%2Cslug%2CtimeCommitment%2CcontentSummary%2CisLocked%2ClockableByItem%2CitemLockedReasonCode%2CtrackId%2ClockedStatus%2CitemLockSummary)%2ConDemandCourseMaterialTracks.v1(passablesCount)&showLockedItems=true`;
	return new Promise((resolve, reject) => {
		get({url : url }).then((results) => {
			if(results.errorCode){
				console.error("Error: terminating");
				console.error(results);
				process.exit(0);
			}

			var modIds = results['elements'][0]['moduleIds'];
			var onDemandCourseMaterialModules_v1 = results['linked']['onDemandCourseMaterialModules.v1'];
			var onDemandCourseMaterialLessons_v1 = results['linked']['onDemandCourseMaterialLessons.v1'];
			var onDemandCourseMaterialItems_v2 = results['linked']['onDemandCourseMaterialItems.v2'];
			var modules = [];
			var lessonsCounter = 0;
			var itemsCounter = 1;
			for(var i = 0; i < modIds.length; i++){
				var mod = {
					idx: i + 1, 
					id: modIds[i], 
					name: onDemandCourseMaterialModules_v1[i].name,
					description: onDemandCourseMaterialModules_v1[i].description,
					lessons : []
				};
				
				for(var j = lessonsCounter; j < onDemandCourseMaterialLessons_v1.length; j++){
					var l = onDemandCourseMaterialLessons_v1[j];

					if(l.moduleId != mod.id) {
						lessonsCounter = j;
						break;
					}

					var lesson = {
						idx: mod.lessons.length + 1,
						id: l.id,
						name: l.name, 
						items: []
					};

					for(var k = 0; k < l.itemIds.length; k++){
						var sitem = onDemandCourseMaterialItems_v2.find((item) => {return item.id == l.itemIds[k]});
						var item = {
							idx: lesson.items.length + 1,
							itemIdx: itemsCounter,
							id : l.itemIds[k],
							name: sitem.name,
							type: sitem.contentSummary.typeName, 
							fname: (mod.idx) + "-" + (lesson.idx) + "-" + (k+1) + "-" + sitem.slug + ".mp4",
						}
						itemsCounter++;
						lesson.items.push(item);
					}

					mod.lessons.push(lesson);
				}		

				modules.push(mod);
			}

			resolve({modules: modules, courseId: results['elements'][0]['id']});
		})
		.catch((err) =>{
			console.error("Error: terminating");
			console.error(err);
			process.exit(0);
		});	
	});
}

function getIndex(slug){
	fetchCourseInfo(slug)
	.then((results) => {
		results.modules.map((mod)=>{
			console.log("Module", mod.idx, ":", mod.name);
			mod.lessons.map((lesson)=>{
				console.log(" ", "Lesson", lesson.idx, ":", lesson.name);
				lesson.items.map((item) =>{
					console.log("  ", item.itemIdx, '\t', item.type.substring(0,4), "  ", item.name);
				})
			})
		})
	})
	.catch((err) =>{
		console.log("ERR", err);
	});	
}

function donwloadMaterial(slug, type, start){
	var i = 0;
	fetchCourseInfo(slug)
	.then((results) => {
		results.modules.map((mod)=>{
			mod.lessons.map((lesson)=>{
				lesson.items.map((item) =>{
					const urlItem = `https://www.coursera.org/api/onDemandLectureVideos.v1/${results.courseId}~${item.id}?includes=video&fields=onDemandVideos.v1(sources)`;
					if(item.itemIdx < start) return;
					if(item.type != "lecture") return;
					get({url : urlItem})
					.then((resp) => {
						if(!resp['linked']) {
							console.debug("-", "Not video item", item.fname);
							return;
						}
						const vlink = resp['linked']['onDemandVideos.v1'][0]['sources']['byResolution']['360p']['mp4VideoUrl'];
						item.vlink = vlink;
					});
				})
			})
		});

		console.debug("Fetching information about course resources");

		setTimeout(function(){
			_donwloadMaterial(slug, type, start, results)
		}.bind(null), 10000);		
	})
	.catch((err) =>{
		console.log("ERR", err);
	});	

}

function _donwloadMaterial(slug, type, start, results){
	for(var i = 0; i < results.modules.length; i++){
		for(var j = 0; j < results.modules[i].lessons.length; j++){
			for(var k = 0; k < results.modules[i].lessons[j].items.length; k++){
				var item = results.modules[i].lessons[j].items[k];
				if(item.itemIdx < start) continue;
				if(!item.vlink) continue;

				console.log("Start downloading:", item.fname);
				download({url : item.vlink}).then((video) => {
					_.saveResult(item.fname, slug, video);
					console.log("Downloaded");
					setTimeout(function(){
						_donwloadMaterial(slug, type, item.itemIdx + 1, results);
					}.bind(null, item), config.timeBetween);
				})
				return;				
			}
		}
	}
}





var opt = {
	string: [
		'type',
		'course',
		'start',
	],
	boolean: [
		'fetch',
		'index',
	],
	alias: [
		['course', 'c'],
		['type', 't'],
		['start', 's'],
		['fetch', 'f'],
	],
	default: {
		start : 1,
		type: 'video',
	}
};
var argv = parseArgs(process.argv, opt);

if(!argv.course || process.argv == 2){
	showMenu();
	process.exit();
}

if(argv.fetch){
	console.log("Coursera", "download", `[${argv.course}]`,"type:", `[${argv.type}]`, "start from: ", `[${argv.start}]`);
	donwloadMaterial(argv.course, argv.type, argv.start);
} else if(argv.index){
	console.log("Coursera", "index", `[${argv.course}]`);
	getIndex(argv.course);
} else {
	console.log("Coursera", "index", `[${argv.course}]`);
	getIndex(argv.course);
}