// ==UserScript==
// @name        satori
// @namespace   http://userscripts.org/users/useridnumber
// @include     http://satori.tcs.uj.edu.pl/contest/*/results/*
// @version     1
// ==/UserScript==

//alert('hello');

function slowCallback(n, callback){
	var x = n;
	function _callback(){
		x--;
		if(x==0)callback();
	}
	return _callback;
}

function $(query){
	var obj = document.querySelectorAll(query);
	obj.forEach = function(fn){ 
		for(var i=0;i<this.length;i++){ 
			fn(this[i],i,this); 
		}
	}
	return obj;
}

function copyCode(){
	console.log('Trying select source code');
	var range = document.createRange();
    range.selectNodeContents(sourceCode);
    
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}

var lang, theme = 'navy', p = new RegExp('download/Submit/[0-9]+/data/content/[0-9]+\.(.+)$'), exts, lang, sourceCode;


$('a').forEach(function(a){
	if(p.test(a.href)){
		var sep = document.createTextNode(' &currren; '), item = document.createElement('a');
		ext = p.exec(a.href)[1];
		
		item.innerHTML = 'select';
		item.href = 'javascript:void(null)';
		item.className = 'stdlink';
		item.addEventListener('click', copyCode, false);
		
		a.insertAdjacentElement('afterend', item);
		a.insertAdjacentHTML('afterend', ' &curren; ');
		//a.insertAdjacentElement('afterend', sep);
	}	
});

exts = {
	'py'	: 'python',
	'cs'	: 'csharp',
	'js'	: 'javascript_dom',
	'pas'	: 'pascal',
	'pl'	: 'perl',
	'rb'	: 'ruby',
	'c' 	: 'c',
	'cpp'	: 'cpp',
	'css'	: 'css',
	'html'	: 'html',
	'htm'	: 'html',
	'java'	: 'java',
	'tex'	: 'latex',
	'ocaml'	: 'caml',
	'pqsql' : 'sql',
	'sql'	: 'sql',
	'py3'	: 'python',
	'php'	: 'php',
	'sh'	: 'sh',
	'xml'	: 'xml',
	'h'		: 'cpp'
};

lang = (ext in exts? exts[ext]: '');
console.log('Using: '+lang);

if(lang!=''){
	$('pre').forEach(function(tag){
		sourceCode = tag;
		tag.className+=' sh_'+lang;
		tag.style.fontSize = '14px';
		tag.style.fontFamily = 'consolas';
		tag.style.background = 'auto';
		tag.style.marginLeft = '0';
		tag.style.marginRight = '0';
		//tag.style.paddingLeft = '80px';
		var lines = tag.innerText.match(/\n/g).length;
		tag.innerText = tag.innerText.replace(/^( +)/gm, 
			function(a,b){
				x = parseInt((b.length+7)/8);
				s='';
				for(i=0;i<x;i++)s+='    ';
				return s;
		});
		
		var x = document.createElement('pre');
		x.style.float="left";
		x.style.fontSize = '14px';
		x.style.fontFamily = 'consolas';
		x.className += 'sh_sourceCode';
		x.style.marginTop = '0';
		x.style.textAlign='right';
		
		var tab = [];
		for(var i = 1;i<=lines;i++){
			tab.push(''+i);
		}
		x.innerText = tab.join('\n');
		tag.insertAdjacentElement('beforebegin', x);
	});

		
	var fn = slowCallback(2, function(){
		console.log('Scripts loading completed!');
		var GM4 = document.createElement('script'); 
		GM4.textContent = 'sh_highlightDocument();';
		GM4.type = 'text/javascript';
		$('body').item(0).appendChild(GM4);
	});

	var GM1 = document.createElement('script'); 
	GM1.onload = fn;
	GM1.type = 'text/javascript'; 
	GM1.src='http://shjs.sourceforge.net/sh_main.min.js';
	$('head').item(0).appendChild(GM1); 

	var GM2 = document.createElement('script'); 
	GM2.onload = fn;
	GM2.type = 'text/javascript'; 
	GM2.src = 'http://shjs.sourceforge.net/lang/sh_'+lang+'.min.js';
	$('head').item(0).appendChild(GM2); 

	var GM3 = document.createElement('link');
	GM3.rel='stylesheet';
	GM3.type = 'text/css'; 
	GM3.href='http://shjs.sourceforge.net/css/sh_'+theme+'.min.css';
	GM3.onload = function(){console.log('Loaded:css');}
	$('head').item(0).appendChild(GM3); 
}

//setTimeout(function(){copyCode();}, 5000);
