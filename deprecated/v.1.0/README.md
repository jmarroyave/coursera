# Coursera Multidownload
Perform a multiple download on a course you are following

##Usage
* Open your browser and navigate to the course you want to download
* Navigate to the week that you want to download. The script will start downloading the videos in the selected week until reach the end of the course.
* Open the browser's **developer tools** (pressing F12 in firefox, and i think in chrome too) and click in the console tab.
* Locate the textbox with this symbol **(>>)** in the tab's bottom
* Open the document with notepad or other text editor and select all, copy it and paste it in the >> textbox
* Now press enter and wait.

##Options
###loadingTime
Time aprox. to wait for a page to load, in seconds.

##Methods
###downloadVideos(*[includeSubtitles = false]*)
Download all videos from the current week until reach the end of the course.
  
###downloadWeekVideos(*[includeSubtitles = false]*)
Download all videos from the current week.

##Example
```javascript
// Time aprox. to wait for a page to load, in seconds
var loadingTime = 45;

// Log into coursera and navigate to the week that you want to download
var coursera = new _Coursera(loadingTime);
coursera.downloadVideos();
```
