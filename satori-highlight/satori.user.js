// ==UserScript==
// @name        satori
// @namespace   http://userscripts.org/users/useridnumber
// @include     http://satori.tcs.uj.edu.pl/contest/*/results/*
// @version     1
// ==/UserScript==

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

var lang, theme = 'railscasts', p = new RegExp('download/Submit/[0-9]+/data/content/[0-9]+\.(.+)$'), exts, lang, sourceCode;


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
	$('pre').forEach(function(tag_old){
		//sourceCode = tag;
		//tag.className+=' sh_'+lang;
		
		var tag = document.createElement('div');
		
		tag.style.fontSize = '12pt';
		tag.style.fontFamily = 'Ubuntu mono';
		tag.style.background = 'auto';
		tag.style.marginLeft = '0';
		tag.style.marginRight = '0';
		tag.style.padding = '0';
		tag.className = 'hljs hljs-'+lang;
		tag.style.position='relative';
		var lines = tag_old.innerText.match(/\n/g).length;
		
		tag_old.insertAdjacentElement('beforebegin', tag);
		
		var code = document.createElement('code');
		code.className = 'highlightjs';
		code.style.whiteSpace = 'pre';
		//code.innerHTML= tag_old.innerHTML;
		code.innerHTML = tag_old.innerHTML.replace(/^( +)/gm, 
			function(a,b){
				x = parseInt((b.length+7)/8);
				s='';
				for(i=0;i<x;i++)s+='    ';
				return s;
		});
		code.style.fontSize = '12pt';
		code.style.lineHeight = '120%';
		code.style.fontFamily = 'Ubuntu mono';
		code.style.overflow = 'scroll';
		code.style.overflowY = 'hidden';
		
		code.style.display = 'block';
		
		tag.insertAdjacentElement('beforeend', code);
		
		tag_old.parentElement.removeChild(tag_old);
		tag_old = null;
		
		
		var x = document.createElement('code');
		x.style.whiteSpace = 'pre';
		x.style.float="left";
		x.style.fontSize = '12pt';
		x.style.fontFamily = 'Ubuntu mono';
		x.style.background = 'transparent';
		x.style.padding = '0 7px';
		x.style.marginRight = '10px';
		x.style.border = 'none';
		x.style.borderRight = '1px dotted #bbb';
		x.style.lineHeight = '120%';
		x.className += 'hljs hljs-number';
		x.style.marginTop = '0';
		x.style.textAlign='right';
		
		var tab = [];
		for(var i = 1;i<=lines;i++){
			tab.push(''+i);
		}
		x.innerText = tab.join('\n');
		tag.insertAdjacentElement('afterbegin', x);
	});

		
	var fn = slowCallback(1, function(){
		console.log('Scripts loading completed!');
		var GM4 = document.createElement('script'); 
		GM4.textContent = "hljs.configure({tabReplace: '    '});$('.highlightjs').each(function(i, e) {$(this).html(hljs.highlight('"+lang+"', $(this).text()).value)});";
		GM4.type = 'text/javascript';
		$('body').item(0).appendChild(GM4);
	});

	var GM1 = document.createElement('script'); 
	GM1.onload = function(){
		var GM2 = document.createElement('script'); 
		GM2.onload = fn;
		GM2.type = 'text/javascript'; 
		GM2.src = 'https://yandex.st/highlightjs/8.0/languages/'+lang+'.min.js';
		$('head').item(0).appendChild(GM2); 
	};
	
	GM1.type = 'text/javascript'; 
	GM1.src='https://yandex.st/highlightjs/8.0/highlight.min.js';
	$('head').item(0).appendChild(GM1); 

	

	var GM3 = document.createElement('link');
	GM3.rel='stylesheet';
	GM3.type = 'text/css'; 
	GM3.href = 'https://yandex.st/highlightjs/8.0/styles/'+theme+'.min.css';
	//GM3.href='http://shjs.sourceforge.net/css/sh_'+theme+'.min.css';
	GM3.onload = function(){console.log('Loaded:css');}
	$('head').item(0).appendChild(GM3); 
	
	var GM5 = document.createElement('style');
	GM5.type = 'text/css';
	GM3.textContent = '@import url(https://fonts.googleapis.com/css?family=Ubuntu+Mono:400,700,400italic);';
	$('head').item(0).appendChild(GM5);
}

//setTimeout(function(){copyCode();}, 5000);
