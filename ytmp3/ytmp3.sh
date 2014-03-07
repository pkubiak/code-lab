tmp=`mktemp -u`
echo $tmp
cover=""

#parse requests
for var in "$@"
do
	if [[ "$var" == "--coverart" ]]
	then
		cover="true"
	else
		echo "Downloading $var"

		format=`youtube-dl -F "$var" | grep best | cut -d" " -f1`
		if [[ "$?" == "0" ]]
		then
			echo -e "\tquality: $format"
			mp3=`youtube-dl --get-filename --output "%(title)s-%(id)s.mp3" "$var"`
		
			if [[ "$?" == "0" ]]
			then
				echo -e "\tfilename: $mp3"
				if [[ -f "$mp3" ]]
				then
					echo "Mp3 already exists: $var"
				else

					if [[  -n "$format" &&   -n "$mp3" ]]
					then
						youtube-dl -o "$tmp" -f "$format" "$var"
						if [[ "$?" == "0" ]]
						then
							ffmpeg -i "$tmp" -acodec libmp3lame -ac 2 -ab 192k -vn -y "$mp3" >> ./.ytmp3.log
							if [[ "$?" == "0" ]]
							then
								if [[ -n "$cover" ]]
								then
									mplayer -ao null -vo png:prefix="ytmp3-" -frames 1 -ss 30 "$tmp" -really-quiet >> ./.ytmp3.log
									if [[ "$?" == "0" ]]
									then
										mv "ytmp3-00000001.png" "$mp3.png"
									else
										echo "Error during generating thumbnail for: $var"
									fi
								fi
							else
								echo "Error during converting to mp3: $var"
							fi
						else
							echo "Error during downloading: $var"
						fi
					fi
				fi
			else
				echo "Error during generating filename: $var"
			fi
		else
			echo "Error during loading format info: $var"
		fi
		rm "$tmp"
	fi
done
