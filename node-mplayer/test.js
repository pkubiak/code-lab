var spawn = require('child_process').spawn;
var keypress = require('keypress');
var mplayer = spawn('mplayer', ['-slave', '-idle', '-vo', 'null', '-really-quiet']);
var http = require('http');
var widget = require('./widget.js');
var signals = {
	'ANS_LENGTH': []
};

var terminal_width = 80, terminal_height = 25;

mplayer.stdout.on('data', function (data) {
	var s = data.toString();
	if(s.indexOf('ANS_LENGTH=')==0){
		var x = parseFloat(s.substr(11));
		while(c = signals['ANS_LENGTH'].shift())
			c(x);
	}else
		console.log('stdout: ' + s);
});

mplayer.stderr.on('data', function (data) {
  //console.log('stderr: ' + data);
});

function play(path){
	mplayer.stdin.write('loadfile "'+path+'"\n');
};

function pause(){
	mplayer.stdin.write('pause\n');
}

/*setTimeout(function(){
	play('/home/solmyr/Music/Illegal/The Ghost Writer OST/01 - The Ghost Writer.mp3');	
}, 1000);*/

setTimeout(function(){
	play('/home/solmyr/Music/Zaho Allo-61tGcV2sUAg.mp4');
}, 500);

function get_track_length(callback){
	signals['ANS_LENGTH'].push(callback);
	mplayer.stdin.write('get_time_length\n');
	
}

get_track_length(function(length){
	console.log('Track Length: '+length);
});


function StarBar(width){
	this.empty = '☆';
	this.full = '★';
	
	this.notlove = '♡';
	this.love = '♥';
	
	this.width = width;
	this.state = 0;
	
	this.islove = false;
	
	this.show = function(){
		var s = [];
		for(var i=0;i<this.state;i++)s.push(this.full);
		for(var i=this.state;i<this.width;i++)s.push(this.empty);
		var ile = terminal_width-15-15-1;
		var zeros = [];
		while(ile--)zeros.push(' ');
		
		process.stdout.write('\r\033[1;40m01.\033[0m\033[40m Zaho - Allô'+zeros.join('')+'[05:12] \033[1;40;31m'+(this.islove?this.love:this.notlove)+' \033[1;33m'+s.join('')+'\033[0m ');
		//process.stdout.flush();
	}
	
	this.upvote = function(){
		this.state = Math.min(this.width, this.state+1);
		this.show();
	}
	
	this.downvote = function(){
		this.state = Math.max(0, this.state-1);
		this.show();
	}
	
	this.makelove = function(){
		this.islove = !this.islove;
		this.show();
	}
	
	this.zero = function(){
		this.state = 0;
		this.show();
	}
	
	this.show();
}

var bar = new StarBar(5);

// make `process.stdin` begin emitting "keypress" events
keypress(process.stdin);

// listen for the "keypress" event
process.stdin.on('keypress', function (ch, key) {
  //console.log('got "keypress"', ch, key);
  /*if (key && key.ctrl && key.name == 'c') {
    process.stdin.pause();
  }*/
  if(ch=='0')bar.zero();
  if(ch=='-')bar.downvote();
  if(ch=='=')bar.upvote();
  if(ch=='l'||ch=='L')bar.makelove();
  if(ch=='q'){
	  mplayer.kill('SIGKILL');
	  process.exit(0);
  }
  if(ch=='g'){gridLayout.setProperty('show-grid', false);}
  if(ch=='G'){gridLayout.setProperty('show-grid', true);}
  if(ch=='p')pause();
});

process.stdin.setRawMode(true);
process.stdin.resume();

/*var url = "http://ws.audioscrobbler.com/2.0/?method=track.getTags&api_key=2a067ad58fcad43dd052b624b050c0a4&artist=Zaho&track=Allô&user=pkubiak&format=json"
http.get(url, function(res) {
	//console.log("Got response: " + res.statusCode);
	res.on('data', function(chunk){
		console.log(chunk.toString());
		var x = JSON.parse(chunk.toString());
		
		console.log(x);
		
		var tags = [];
		if(x.tags.tag){
			for(var i=0;i<x.tags.tag.length;i++){
				tags.push(x.tags.tag[i].name);
			}
			console.log(tags);
		}
	});	
}).on('error', function(e) {
  console.log("Got error: " + e.message);
});*/

process.on('SIGWINCH', function(){
	process.stdout.write('\033[18t');
});

process.stdout.write('\033[?1049h\033[?25l');

process.stdin.on('data', function(data){
	var r = /^\033\[8;([0-9]+);([0-9]+)t/;
	
	var x = r.exec(data.toString());
	if(x){
		process.stdout.write('\033[2J');
		terminal_width = parseInt(x[2]);
		terminal_height = parseInt(x[1]);
		//bar.show();
		//drawWindow(5,5,terminal_width-10, terminal_height-10, "hello World");
		drawWindow(0.1, 0.1, 0.8, 0.8, ""+terminal_width+"x"+terminal_height);
		
		gridLayout.setAllocation(parseInt(0.1*terminal_width)+2, parseInt(0.1*terminal_height)+2, parseInt(0.8*terminal_width)-2, parseInt(0.8*terminal_height)-2);
		gridLayout.redraw();
		
		////console.log('WIDTH: '+parseInt(x[2])+'; HEIGHT: '+parseInt(x[1]));
	}
});

function repeatChar(text, n){
	var t = [];
	for(var i=0;i<n;i++)t.push(text);
	return t.join('');
}

function drawWindow(x, y, width, height, title){
	x = parseInt(x*terminal_width)+1;
	y = parseInt(y*terminal_height)+1;
	width = parseInt(width*terminal_width);
	height = parseInt(height*terminal_height);
	//console.log(x,y,width,height);
	
	var col = 32;
	for(var i=y;i<y+height;i++){
		var t = [];
		t.push('\033['+i+';'+x+'H');
		if(i==y){
			t.push('\033['+col+'m╭╼\033[0m');t.push(title.substr(0,width-4));t.push('\033['+col+'m╾')
			
			t.push(repeatChar('─', width-4-title.length));t.push('╮\033[0m');
		}else
		if(i+1==y+height){
			t.push('\033['+col+'m╰');t.push(repeatChar('─', width-2));t.push('╯\033[0m');
		}else{
			t.push('\033['+col+'m│\033[0m');t.push(repeatChar(' ', width-2));t.push('\033['+col+'m│\033[0m');
		}
		process.stdout.write(t.join(''));
	}
	process.stdout.write('\n');
	
}

process.stdout.write('\033[18t');
process.on('exit', function(){
	process.stdout.write('\033[?1049l\033[?25h');
});
///API Key: 2a067ad58fcad43dd052b624b050c0a4
///Secret: is f629b8d0d948daee9136e295cfde2b01

/*tableWidget({
	columns:{
		'positions':{},
		'title': {
			align: 'left',
			fill: true,
			overflow: 'hidden'
		},
		'grades': {
			overflow: '
		}
	}
});*/

//drawWindow(5,1,50,10,' Lyric: Zaho - Allô ');


var list = new Widget.ItemList('int', 'string', 'time', 'boolean');
list.setProperty('show-header', true);

list.setHeader(['no', 'title', 'duration', 'love']);

//list.setColumnColor(1, 'blue');


list.append([1, 'Zaho - Allô', 123, true]);
list.append([2, 'Nightwish - Nemo', 306, false]);
for(var i=3;i<30;i++)
	list.append([i, 'Nightcore - Mortal Kombat', parseInt(Math.random()*10000), true]);
	
list.setAligment(['right', 'left', 'center', 'center']);

/*list.setAligment(0, 'right');
list.setAligment(2, 'center');
list.setAligment(3, 'center');*/

//list.setProperty('fill-space', 'equal');
list.setProperty('fill-space', 1);

list.getRenderer(3).setProperty('true-value', 'TAK');
list.getRenderer(3).setProperty('false-value', 'NIE');

list.getRenderer(3).setProperty('true-value', '✔');
list.getRenderer(3).setProperty('false-value', '✘');
list.getRenderer(3).setProperty('wrong-value', '---');

var scrollArea = new Widget.ScrollArea();

var textArea = new Widget.TextArea();
scrollArea.pack(textArea);
textArea.setText("I got chills, they're multiplyin', and I'm losin' control\nCause the power you're supplyin', it's electrifyin'\n\nYou better shape up, cause I need a man,\nand my heart is set on you\nYou better shape up, you better understand,\nto my heart I must be true\nNothing left, nothing left for me to do\n\nYou're the one that I want (you are the one I want),\nooh ooh ooh, honey\nThe one that I want (you are the one I want),\nooh ooh ooh, honey\nThe one that I want (you are the one I want),\nooh ooh ooh\nThe one I need (the one I need),\noh yes indeed (yes indeed)\n\nIf you're filled with affection,\nYou're too shy to convey\nMeditate my direction, feel your way\n\nI better shape up,\ncause you need a man\nI need a man,\nWho can keep me satisfied\nI better shape up, if I'm gonna prove\nYou better prove, that my fate is justified\nAre you sure?\nYes I'm sure down deep inside\n\nYou're the one that I want (you are the one I want),\nooh ooh ooh, honey\nThe one that I want (you are the one I want),\nooh ooh ooh, honey\nThe one that I want (you are the one I want),\nooh ooh ooh\nThe one I need (the one I need),\noh yes indeed (yes indeed)\n\nYou're the one that I want (you are the one I want),\nooh ooh ooh, honey\nThe one that I want (you are the one I want),\nooh ooh ooh, honey\nThe one that I want (you are the one I want),\nooh ooh ooh\nThe one I need (the one I need),\noh yes indeed (yes indeed)\n\nYou're the one that I want (you are the one I want),\nooh ooh ooh, honey\nThe one that I want (you are the one I want),\nooh ooh ooh, honey\nThe one that I want (you are the one I want),\nooh ooh ooh\nThe one I need (the one I need),\noh yes indeed (yes indeed)");

var gridLayout = new Widget.GridLayout(5, 4);

gridLayout.pack(list, 1, 1, 2, 2);
gridLayout.pack(scrollArea, 3, 0, 2, 2);

