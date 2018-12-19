'use strict';
const config = require('./config');
const request = require('request');
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
	//console.log(url);
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


function donwloadMaterial(slug, start = 1){
	var idx = 0;
	console.log("Coursera video downloader", slug, start);
	const url = `https://www.coursera.org/api/onDemandCourseMaterials.v2/?q=slug&slug=${slug}&includes=modules%2Clessons%2CpassableItemGroups%2CpassableItemGroupChoices%2CpassableLessonElements%2Citems%2Ctracks%2CgradePolicy&fields=moduleIds%2ConDemandCourseMaterialModules.v1(name%2Cslug%2Cdescription%2CtimeCommitment%2ClessonIds%2Coptional%2ClearningObjectives)%2ConDemandCourseMaterialLessons.v1(name%2Cslug%2CtimeCommitment%2CelementIds%2Coptional%2CtrackId)%2ConDemandCourseMaterialPassableItemGroups.v1(requiredPassedCount%2CpassableItemGroupChoiceIds%2CtrackId)%2ConDemandCourseMaterialPassableItemGroupChoices.v1(name%2Cdescription%2CitemIds)%2ConDemandCourseMaterialPassableLessonElements.v1(gradingWeight%2CisRequiredForPassing)%2ConDemandCourseMaterialItems.v2(name%2Cslug%2CtimeCommitment%2CcontentSummary%2CisLocked%2ClockableByItem%2CitemLockedReasonCode%2CtrackId%2ClockedStatus%2CitemLockSummary)%2ConDemandCourseMaterialTracks.v1(passablesCount)&showLockedItems=true`;
	//console.log(url);
	get({url : url })
	.then((results) => {
		if(results.errorCode){
			console.error("Error: terminating");
			console.error(results);
			process.exit(0);
		}
		//console.log(results);
		const courseId = results['elements'][0]['id'];
		results['linked']['onDemandCourseMaterialLessons.v1'].map((item) =>{
			console.log(item.name);
			item.itemIds.map((itemId) =>{
				const urlItem = `https://www.coursera.org/api/onDemandLectureVideos.v1/${courseId}~${itemId}?includes=video&fields=onDemandVideos.v1(sources)`;
				idx++;
				const i = idx;
				const fname = `video_${i}.mp4`;
				if(i < start) return;
				//console.debug(urlItem);
				get({url : urlItem})
				.then((resp) => {
					if(!resp['linked']) {
						console.debug("-", "Not video item", fname, itemId);
						return;
					}
					console.debug("-", "Video item", fname, itemId, i, start);
					//console.debug(resp['linked']['onDemandVideos.v1']);
					const vlink = resp['linked']['onDemandVideos.v1'][0]['sources']['byResolution']['360p']['mp4VideoUrl'];
					setTimeout(function(){
						console.debug("Downloading", fname, itemId);
						download({url : vlink})
						.then((video) => {
							_.saveResult(fname, slug, video);
						})
					}.bind(null, fname), config.timeBetween * (i-start));
				});
			})

		})
	})
	.catch((err) =>{
		console.log("ERR", err);
	});	
}


var slug, start = 1;

if(process.argv.length == 2){
	console.log("Coursera resources downloader");
	console.log("Author: jmarroyave.compsci@gmail.com");
	console.log("Usage:", "node coursera.js course-slug fetch [type=video|subtitles|all] [start-from=1]");
	console.log("Saving path:", _.getDataPath());
	return;
} 

if(process.argv.length > 3){
	slug = process.argv[2];
} 

if(process.argv.length > 4){
	start = process.argv[3];
} 

donwloadMaterial(slug, start);
