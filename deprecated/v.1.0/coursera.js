function _Coursera(loadingTime){

	this.loadingTime = loadingTime;

	var _i = 0;                    
	var _w = 0;
	var _l = 0;
	var _a = null;
	var _includeSubtitles = false;
	var _untilEndOfCourse = false;
	
	this.downloadVideos = function(includeSubtitles = false){
		_untilEndOfCourse = true;
		console.log("Downloading course videos");
		_includeSubtitles = includeSubtitles;
		_downloadCourse();			
	}

	this.downloadWeekVideos = function(includeSubtitles = false){
		_untilEndOfCourse = false;
		console.log("Downloading week's course videos");
		_includeSubtitles = includeSubtitles;
		_downloadCourse();
	}

	var _downloadCourse = function(){
		_w = 0;
		_nextWeek();
	}

	var _nextWeek = function(){
		if(_w > 0 && !_untilEndOfCourse){
			console.log("Download finish");
			return;
		}
		_w++;
		console.log("Starting week " + _w);
		_l = 0;
		var l = document.getElementsByClassName('rc-ItemLink nostyle');
		l[0].click();
		setTimeout(_nextLesson, this.loadingTime * 1000);
	}

	var _nextLesson = function() {
		_l++;
		console.log("Starting lesson " + _l);
		_i=0;
		_a = document.getElementsByClassName('item-name inline-child caption-text');	
		console.log("Total lectures in lesson " + _a.length);
		_nextLecture();
	}

	var _nextLecture = function() {
		var elem = document.getElementsByClassName('item-name inline-child caption-text')[_i];
	
		console.log("Lecture " + _l + "-" + (_i + 1) + ":"  + elem.childNodes[1].innerHTML);

		if(_isVideo(elem)){
  			var b = document.getElementsByClassName('resource-link nostyle')
   			if (b.length > 0){
				if(b[0].childNodes[0].innerHTML == "Lecture Video"){
					console.log("Downloading video lecture " + _l + "-" + (_i + 1));
	    				b[0].click()
					if(_includeSubtitles && b.length > 1){
						console.log("Downloading subtitles for video lecture " + _l + "-" + (_i + 1));
		    				b[1].click()
					}
   				}		
			}   
		} 

		_click_next();
	}


	var _click_next = function(){
	        _i++;
             
		if (_i < _a.length) {
			var elem = document.getElementsByClassName('item-name inline-child caption-text')[_i];
			if(_isVideo(elem)){
				elem.click();
				setTimeout(_nextLecture, this.loadingTime * 1000);
			} else {
				_nextLecture();
			}
			return;            
		}

		console.log("Lesson over");
		var b = document.getElementsByClassName('rc-SectionButton nostyle flex-1')[1];
	
		switch(b.childNodes[0].innerHTML){
			case "Next Lesson":
				b.click();
	    			setTimeout(_nextLesson , this.loadingTime * 1000);
				return;
	   		case "Next Week":
				console.log("Week over");
				b.click()
	   			setTimeout(_nextWeek , this.loadingTime * 1000);
				return;
	   		case "Course Home":
				console.log("Download finish");
				b.click()
				return;
		}
	}


	var _isVideo = function(elem){
		return hasClass(elem.parentNode.parentNode.childNodes[0].childNodes[0], "cif-item-video");
	}

	var hasClass = function(element, cls) {
	    return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
	}

}


// Time aprox. to wait for a page to load, in seconds
var loadingTime = 45;


// Log into coursera and navigate to the week that you want to download
var coursera = new _Coursera(loadingTime);
coursera.downloadWeekVideos(true);
