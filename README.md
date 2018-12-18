# Coursera
Query your Coursera courses in the console with nodejs.

## Installation and configuration
* Install nodejs
* Download this package
* Login on Coursera and copy the cookies to the **config.js** file

## Usage
### Fetch resources
node coursera.js course-slug fetch [type=video/subtitles/all] [start=1]
#### Options 
##### type [video]
Type of resource to download.
* video
* subtitles
* all
##### start [1]
Index of the item to start from.

## Example
```bash
# download all videos from course neural-networks
node coursera.js neural-networks fetch
```
## Config options
#### timeBetween [30 secs]
Time to wait between downloads to prevent a server timeout 
#### userAgent [Mozilla/5.0]
User agent header
#### timeout [2 mins]
HTTP Request default timeout
#### dataPath [./]
Path where the videos will be downloaded to
#### cookies [none]
Session cookies
