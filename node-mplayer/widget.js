var assert = require('assert');

function zfill(t, n, c){
	if(c == undefined)
		c = ' ';
	var r = [], l = n-t.length;
	while(l>0){
		if(l-c.length<0){
			l = 0;
			r.push(c.substr(0,l));
		}else{
			l -= c.length;
			r.push(c);
		}
	}
	return r.join('');
}

function fillWithAligment(t, tlen, len, align, c){
	if(c == undefined)
		c = ' ';
	if(align == 'left'){
		return t + zfill('', len-tlen, c);
	}else
	if(align == 'right'){
		return zfill('', len-tlen, c) + t;
	}else
	if(align == 'center'){
		var d = len-tlen, d2 = Math.floor(d/2);
		return zfill('', d2, c) + t + zfill('', d-d2, c);
	}else
	if(align == 'justify'){
		return t + zfill('', len-tlen, c);//TODO
	}
}
Widget = {};
Widget.Renderers = {};

Widget.Renderers.Int = function(){
	this.getSize = function(data){
		return (''+parseInt(data)).length;
	}
	
	this.render = function(data){
		return ''+parseInt(data);
	}
}

Widget.Renderers.String = function(){
	this.getSize = function(data){
		return data.length;
	}
	
	this.render = function(data){
		return data;
	}
}

Widget.Renderers.Boolean = function(){
	var config = {
		'true-value': 'true',
		'false-value': 'false',
		'wrong-value': ''
	}
	
	this.getSize = function(data){
		if(data === true)
			return config['true-value'].length;
		else if(data === false)
			return config['false-value'].length;
		return config['wrong-value'].length;
	}
	
	this.render = function(data){
		if(data === true)
			return config['true-value'];
		else if(data === false)
			return config['false-value'];
		return config['wrong-value'];
	}
	
	this.setProperty = function(name, value){
		if(config.hasOwnProperty(name))
			config[name] = value;
	}
	
	this.getProperty = function(name){
		if(config.hasOwnProperty(name))
			return config[name];
	}
}

Widget.Renderers.Time = function(){
	this.getSize = function(data){
		if(typeof(data)!='number')
			return 0;
		return 7;
	}
	
	this.render = function(data){
		if(typeof(data)!='number')
			return '';

		var hours = Math.floor(data/3600), min = Math.floor((data%3600)/60), sec = Math.floor(data % 60);
		
		if(hours!=0){
			if(hours<10)return '['+hours+'h:'+zfill(''+min,2,'0')+min+']';
			else return '['+zfill(''+hours, 4, ' ')+hours+'h]';
		}else
			return '['+zfill(''+min, 2, '0')+min+':'+zfill(''+sec, 2, '0')+sec+']';
	}
}

Widget.ItemList = function(){
	var allocation = [0,0,0,0];
	
	var config = {
		'show-header': false,
		'shrink-column': -1,
		'column-separator': '│',
		'fill-space' : true,
		'padding-left': 1,
		'padding-right' : 1,
		'header-separator': '╴',
		'cross-separator': '┼'
	};
	
	var renderers = {
		'int': Widget.Renderers.Int,
		'string': Widget.Renderers.String,
		'widget': true,
		'float': true,
		'boolean': Widget.Renderers.Boolean,
		'time': Widget.Renderers.Time,
	};
	
	var renderer = [], types = [], store = [], header = [], aligment = [];
	
	for(var i=0;i<arguments.length;i++){
		if(!(typeof(arguments[i])==='string'&&renderers.hasOwnProperty(arguments[i])))
			throw 'Unsupported data type';
		renderer.push(new renderers[arguments[i]]);
		types.push(arguments[i]);
		header.push('column_'+(i+1));
		aligment.push('left');
	}
	
	this.setAllocation = function(x, y, width, height){
		allocation = [x,y,width,height];
		Object.freeze(allocation);
	}

	this.getAllocation = function(){
		return allocation;
	}
	
	this.redraw = function(){
		var size = this.getSizeRequest();
		var cols = columnSize(), y = allocation[1], x = allocation[0], yt = y+allocation[3];
		
		if(config['fill-space'] !== false){
			var underflow = allocation[2]-size[0];
			if(underflow>0){
				if(config['fill-space'] === 'equal'){
					var ile = Math.floor(underflow/cols.length), rem = underflow % cols.length;
					for(var i = 0;i < cols.length; i++)
						cols[i] += ile + (i < rem ? 1 : 0);
				}else
				if(config['fill-space'] === 'proportional'){
					
				}else
				if(typeof(config['fill-space'] == 'number')){
					cols[config['fill-space']] += underflow;
				}
			}
		}
		
		var out = [];
		if(config['show-header']){
			if(y<yt){
				out.push('\033['+y+';'+x+'H');y+=1;
				var l = 0;
				for(var i=0;i<cols.length;i++){
					if(i>0)out.push(config['column-separator']);
					out.push(zfill('', config['padding-left'], ' '));
					out.push(header[i]);
					out.push(zfill(header[i], cols[i], ' '));
					out.push(zfill('', config['padding-right'], ' '));
					l+=cols[i];
				}
			}
			if(y<yt){
				out.push('\033['+y+';'+x+'H');y+=1;
				for(var i=0;i<cols.length;i++){
					if(i>0)out.push(config['cross-separator']);
					out.push(zfill('', config['padding-left']+config['padding-right']+cols[i], config['header-separator']));
				}
			}
		}
		
		for(var s=0;s<store.length;s++){
			if(y < yt){
				out.push('\033['+y+';'+x+'H');y+=1;
				
				for(var i=0;i<cols.length;i++){
					if(i>0)out.push(config['column-separator']);
					out.push(zfill('', config['padding-left'], ' '));
					out.push(
						fillWithAligment(renderer[i].render(store[s][i]), renderer[i].getSize(store[s][i]), cols[i], aligment[i], ' ')
					);
					out.push(zfill('', config['padding-right'], ' '));
				}
			}else break;
		}
		
		
		process.stdout.write(out.join(''));
		process.stdout.write('\n');
	}
	
	this.append = function(data){
		assert(data.length == types.length, "Data size differ from columns count");
		
		store.push(data);
	}
	
	var columnSize = function(){
		var cols = new Array(types.length);
		for(var i=0;i<cols.length;i++){
			if(config['show-header'])
				cols[i] = header[i].length;
			else cols[i] = 0;
		}
		
		for(var i = 0;i<store.length;i++)
			for(var j=0;j<types.length;j++)
				cols[j] = Math.max(cols[j], renderer[j].getSize(store[i][j]));

		return cols;
	}
	//Return size 
	this.getSizeRequest = function(){
		var cols = columnSize();
		
		width = 0;
		for(var i=0;i<cols.length;i++)
			width += cols[i];
		
		width += (cols.length-1) * (config['column-separator'].length);
		width += (cols.length) * (config['padding-left'] + config['padding-right']);
		height = store.length;
		if(config['show-header'])
			height+=2;
		
		return [width, height];
	}
	
	/*this.focus = function(){
		
	}
	
	this.unfocus = function(){
		
	}*/
	
	this.setProperty = function(name, value){
		//TODO: value validation
		if(config.hasOwnProperty(name))
			config[name] = value;
	}
	
	this.getProperty = function(name){
		if(config.hasOwnProperty(name))
			return config[name];
	}
	
	
	this.setAligment = function(colno, align){
		if(arguments.length == 1 && Array.isArray(colno)){
			assert(colno.length == types.length, "Aligment list length differ from columns count");
			for(var i=0;i<types.length;i++){
				var align = colno[i];
				assert( typeof(align)==='string' && (align == 'left' || align == 'right' || align == 'center' || align == 'justify'), "Wrong aligment type");
			}
			for(var i=0;i<types.length;i++){
				aligment[i] = colno[i];
			}
		}else
		if(arguments.length == 2){
			assert(colno >=0 && colno < types.length, "Wrong column pos");
			assert((align == 'left' || align == 'right' || align == 'center' || align == 'justify'), "Wrong aligment type");
			aligment[colno] = align;
		}else
			throw "Wrong Call";
	}
	
	this.setHeader = function(captions){
		assert(captions.length == types.length, "Headers length doesn't match list length");
		
		for(var i=0;i<types.length;i++)
			header[i] = captions[i];
	}
	
	this.getRenderer = function(colno){
		assert( colno>=0 && colno < renderer.length, "Wrong column number");
		return renderer[colno];
	}
}


module.exports = Widget;


