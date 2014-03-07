tmp=`mktemp -u`
echo $tmp

for var in "$@"
do
    format=`youtube-dl -F "$var" | grep best | cut -d" " -f1`
	mp3=`youtube-dl --get-filename --output "%(title)s-%(id)s.mp3" "$var"`	

	echo $format
	echo $mp3
	
	if [[  -n "$format" &&   -n "$mp3" ]]
	then
		youtube-dl -o "$tmp" -f "$format" "$var"
		ffmpeg -i "$tmp" -acodec libmp3lame -ac 2 -ab 192k -vn -y "$mp3"
	fi
	rm "$tmp"
done




#rm "$tmp"
