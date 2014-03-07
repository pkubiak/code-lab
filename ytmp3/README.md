# ytmp3.sh #

Simple script to extract mp3 audio from youtube clips. 
It depends on youtube-dl (http://rg3.github.io/youtube-dl/).

#### Options ####

* --coverart - enable taking snapshot of following links (single png will be created containing snapshot of 30's frame of clip)
* --nocoverart - disible taking snapshots for following links


### Logging ###
Script logs errors/messages to ./.ytmp3.log

### Usage ###
```
> bash ytmp3.sh --coverart "http://youtube.com/asdasda"
```

