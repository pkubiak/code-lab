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

function clearRect(x,y,width,height,c){
	if(c == undefined) c = 'x';
	
	//process.stdout.write('\033['+(c.charCodeAt(0))+';'+y+';'+x+';'+(y+height-1)+';'+(x+width-1)+'$x');
	process.stdout.write('\033['+y+';'+x+';'+(y+height-1)+';'+(x+width-1)+'$z');
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
		var width = allocation[2];
		
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
		
		var outM = [];
		if(config['show-header']){
			if(y<yt){
				outM.push('\033['+y+';'+x+'H');y+=1;
				var l = 0;
				var out = []
				for(var i=0;i<cols.length;i++){
					if(i>0)out.push(config['column-separator']);
					out.push(zfill('', config['padding-left'], ' '));
					out.push(header[i]);
					out.push(zfill(header[i], cols[i], ' '));
					out.push(zfill('', config['padding-right'], ' '));
					l+=cols[i];
				}
				outM.push(out.join('').substr(0, width));
			}
			if(y<yt){
				outM.push('\033['+y+';'+x+'H');y+=1;
				var out = []
				for(var i=0;i<cols.length;i++){
					if(i>0)out.push(config['cross-separator']);
					out.push(zfill('', config['padding-left']+config['padding-right']+cols[i], config['header-separator']));
				}
				outM.push(out.join('').substr(0, width));
			}
		}
		
		for(var s=0;s<store.length;s++){
			if(y < yt){
				outM.push('\033['+y+';'+x+'H');y+=1;
				var out = []
				for(var i=0;i<cols.length;i++){
					if(i>0)out.push(config['column-separator']);
					out.push(zfill('', config['padding-left'], ' '));
					out.push(
						fillWithAligment(renderer[i].render(store[s][i]), renderer[i].getSize(store[s][i]), cols[i], aligment[i], ' ')
					);
					out.push(zfill('', config['padding-right'], ' '));
				}
				outM.push(out.join('').substr(0, width));
			}else break;
		}
		
		
		process.stdout.write(outM.join(''));
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

Widget.GridLayout = function(width, height){
	
	var config = {
		'allow-overlap' : false,
		'show-grid' : true
	}
	
	var allocation = [0,0,0,0];
	var gWidth = width, gHeight = height;
	var widgets = [];
	var areas = [];
	
	for(var i=0;i<gHeight;i++){
		areas.push(new Array(gWidth));
	}
	
	//return position of `i`'th element if space of size `size` is equaly divided into `n` pieces 
	var getPos = function(size, n, i){
		var perCell = Math.floor(size / n), res = size%n;
		return perCell*i+(i<res?i:res);
	}
	
	var allocate = function(widget){
		var x0 = getPos(allocation[2], gWidth, widget.x), y0 = getPos(allocation[3], gHeight, widget.y);
		var x1 = getPos(allocation[2], gWidth, widget.x+widget.width), y1 = getPos(allocation[3], gHeight, widget.y+widget.height);
		
		if(config['show-grid']){
			if(widget.y+widget.height<gHeight)y1--;
			if(widget.x+widget.width<gWidth)x1--;
		}
		
		widget.widget.setAllocation(x0+allocation[0], y0+allocation[1], x1-x0, y1-y0);
	}
	
	this.setAllocation = function(x, y, width, height){
		allocation = [x,y,width,height];
		Object.freeze(allocation);
		
		for(var i = 0; i < widgets.length; i++)
			allocate(widgets[i]);
	}

	this.getAllocation = function(){
		return allocation;
	}
	
	this.redraw = function(){
		clearRect(allocation[0], allocation[1], allocation[2], allocation[3]);
		
		if(config['show-grid']){
			var out = ['\033[33m'];
			//var cross = {0: ' ', 1: '!', 2: '!', 3: '┘', 4: '!', 5: '─', 6: '└', 7: '┴', 8: '!', 9: '┐', 10: '│', 11: '┤', 12: '┌', 13: '┬', 14: '├', 15: '┼'};
			var cross = {0: ' ', 1: '!', 2: '!', 3: '╯', 4: '!', 5: '─', 6: '╰', 7: '┴', 8: '!', 9: '╮', 10: '│', 11: '┤', 12: '╭', 13: '┬', 14: '├', 15: '┼'};
			
			for(var y=1;y<gHeight;y++){
				out.push('\033['+(getPos(allocation[3], gHeight, y)-1+allocation[1])+';'+allocation[0]+'H');
				for(var x=0;x<gWidth;x++){
					var d = Math.max(getPos(allocation[2], gWidth, x+1)-getPos(allocation[2], gWidth, x)-(x+1<gWidth?1:0), 0);
					
					if(areas[y-1][x] != areas[y][x])
						out.push(zfill('', d, '─'));
					else out.push(zfill('', d, ' '));
					if(x+1<gWidth){
						var sum = 0;
						sum += areas[y-1][x] != areas[y][x] ? 1: 0;//left
						sum += areas[y-1][x] != areas[y-1][x+1] ? 2: 0;//top
						sum += areas[y-1][x+1] != areas[y][x+1] ? 4: 0;//right
						sum += areas[y][x] != areas[y][x+1] ? 8: 0;//bottom
						out.push(cross[sum]);
					}
				}
			}
			for(var y=0;y<gHeight;y++)
				for(var x=1;x<gWidth;x++)
					if(areas[y][x-1]!=areas[y][x])
						for(var yy = getPos(allocation[3], gHeight, y); yy<getPos(allocation[3],gHeight, y+1)-(y+1<gHeight?1:0); yy++)
							out.push('\033['+(yy+allocation[1])+';'+(allocation[0]+getPos(allocation[2], gWidth,x)-1)+'H│');
					
			
			/*for(var y=0;y<allocation[3];y++)
				for(var i=1;i<gWidth;i++){
					var x = getPos(allocation[2], gWidth, i)-1+allocation[0];
					out.push('\033['+(y+allocation[1])+';'+x+'H│');
				}
				*/
			/*for(var i = 1;i<gHeight; i++){
				var y = getPos(allocation[3], gHeight, i)-1+allocation[1];
				out.push('\033['+y+';'+allocation[0]+'H');
				out.push(l);
			}

			for(var y=0;y<allocation[3];y++)
				for(var i=1;i<gWidth;i++){
					var x = getPos(allocation[2], gWidth, i)-1+allocation[0];
					out.push('\033['+(y+allocation[1])+';'+x+'H│');
				}
				*/
			out.push('\033[0m');
			process.stdout.write(out.join(''));
		}
		
		for(var i = 0;i < widgets.length; i++)
			widgets[i].widget.redraw();
	}
	this.unpack = function(widget){
		for(var i=0;i<widgets.length;i++)
			if(widgets[i].widget === widget){
				for(var x=0;x<widgets[i].width;x++)
					for(var y=0;y<widgets[i].height;y++)
						areas[widgets[i].y+y][widgets[i].x+x] = undefined;

				widgets.splice(i, 1);//remove widget from list
				return true;
			}
		return false;
	}
	this.pack = function(widget, x, y, width, height){
		assert((x<gWidth&&y<gHeight&&x+width<=gWidth&&y+height<=gHeight&&width>0&&height>0), "Widget doesn't fit in the grid");

		this.unpack(widget);
		
		for(var i=0;i<width;i++)
			for(var j=0;j<height;j++)
				assert(areas[y+j][x+i] == undefined, "Widget overlap with existent widget");
		
		var n = widgets.push({
			widget: widget, x: x, y: y, width: width, height: height
		});
		
		for(var i=0;i<width;i++)
			for(var j=0;j<height;j++)
				areas[y+j][x+i] = n-1;
		
		
		allocate(widgets[n-1]);
		
		this.redraw();
	}
	
	this.setProperty = function(name, value){
		//TODO: value validation
		if(config.hasOwnProperty(name)){
			config[name] = value;
			if(name == 'show-grid'){
				for(var i = 0; i < widgets.length; i++)
					allocate(widgets[i]);
				this.redraw();
			}
		}
	}
	
	this.getProperty = function(name){
		if(config.hasOwnProperty(name))
			return config[name];
	}
}

Widget.ScrollArea = function(){
	var allocation = [0,0,0,0];
	var widget = null;
	this.setAllocation = function(x, y, width, height){
		allocation = [x,y,width,height];
		Object.freeze(allocation);
		if(widget != null)
			widget.setAllocation(x,y,width,height);
	}
	
	this.getAllocation = function(){
		return allocation;
	}
	
	this.redraw = function(){
		clearRect(allocation[0], allocation[1], allocation[2], allocation[3]);
		process.stdout.write('\033[?69h\033[?7l\033['+(allocation[0]+1)+';'+(allocation[0]+allocation[2]-1)+'s');
		if(widget != null)
			widget.redraw();
		process.stdout.write('\033[?69l\033[?7h');
	}
	
	this.pack = function(_widget){
		widget = _widget;
	}
	
	this.unpack = function(){
		widget = null;
	}
}

Widget.TextArea = function(){
	var allocation = [0,0,0,0];
	var text = [];
	
	this.setAllocation = function(x, y, width, height){
		allocation = [x,y,width,height];
		Object.freeze(allocation);
	}
	
	this.getAllocation = function(){
		return allocation;
	}
	
	this.redraw = function(){
		var out = [];
		for(var i =  0 ;text.length;i++){
			if(i>=allocation[3])break;
			out.push('\033['+(allocation[1]+i)+';'+allocation[0]+'H');
			out.push(text[i]);
		}
		process.stdout.write(out.join(''));
	}
	
	this.setText = function(_text){
		text = _text.split('\n');
		
	}
}

module.exports = Widget;


