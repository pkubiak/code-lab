var cube = {
	vertices: [
		{x:-1,	y:-1,	z:1},
		{x:1,	y:-1,	z:1},
		{x:1,	y:1,	z:1},
		{x:-1,	y:1,	z:1},
		{x:-1,	y:-1,	z:-1},
		{x:1,	y:-1,	z:-1},
		{x:1,	y:1,	z:-1},
		{x:-1,	y:1,	z:-1}
	],
	faces: [
		[0,4,5,1],
		[1,5,6,2],
		[3,2,6,7],
		[0,3,7,4],
		[0,1,2,3],
		[7,6,5,4]
	]
};//Model of cube

var f = (1+Math.sqrt(5))/2.0;

var dodecahedron = {
	vertices: [
		{x: -1,	y: -1,	z: -1},
		{x: -1,	y: -1,	z: 1},
		{x: -1,	y: 1,	z: -1},
		{x: -1,	y: 1,	z: 1},
		{x: 1,	y: -1,	z: -1},
		{x: 1,	y: -1,	z: 1},
		{x: 1,	y: 1,	z: -1},
		{x: 1,	y: 1,	z: 1},
		
		{x: 0,	y: -1/f,	z:-f},
		{x: 0,	y: -1/f,	z:f},
		{x: 0,	y: 1/f,	z:-f},
		{x: 0,	y: 1/f,	z:f},
		
		{x: -1/f,	y: -f,	z:0},
		{x: -1/f,	y: f,	z:0},
		{x: 1/f,	y: -f,	z:0},
		{x: 1/f,	y: f,	z:0},
		
		{x: -f,	y: 0,	z:-1/f},
		{x: -f,	y: 0,	z:1/f},
		{x: f,	y: 0,	z:-1/f},
		{x: f,	y: 0,	z:1/f},
	],
	faces: [
		[0, 16, 17, 1, 12],
		[1, 9,5,14,12],
		[4,14,5,19,18],
		[4,18,6,10,8],
		[0,12,14,4,8],
		[3,11,9,1,17],
		[7,19,5,9,11],
		[17,16,2,13,3],
		[0,8,10,2,16],
		[10,6,15,13,2],
		[18,19,7,15,6],
		[7,11,3,13,15],
	]
}

function dotProduct(A,B){
	return A.x*B.x+A.y*B.y+A.z*B.z;
}

function crossProduct(A,B){
	return {x: A.z*B.y-A.y*B.z, y:A.x*B.z-A.z*B.x, z:A.y*B.x-A.x*B.y};
}

function Viewer3D(obj){
	x = document.getElementById(obj);
	
	if(x===null){
		console.debug("Wrong object!");
		return false;
	}else{
		console.debug(x+' '+x.getAttribute('width')+' '+x.getAttribute('height'));
		this.viewport = obj;
		this.width = x.getAttribute('width');
		this.height = x.getAttribute('height')
		this.ppd = 3.0;//Projection Plane Distance
		this.camera = {x: 0.0, y: 0.0, z:-5.0};//position of camera
		this.lookAt = {x: 0.0, y: 0.0, z:0.0};//Not used
		this.lightAt = {x: 3.0, y: 3.0, z: 5.0};
		
		this.triangles = [];
		this.vertices = [];
		this.faces = [];
	}
}

//Perform good triangulation of faces
Viewer3D.prototype.triangularize = function(){
	for(i=0;i<this.faces.length;i++){
		t = [];
		if(this.faces[i].length<3)continue;
		for(j=0;j<this.faces[i].length;j++){			
			t.push(this.faces[i][j]);
			if(t.length>=3){//ponadto należałoby sprawdzać wklęsłość
				this.triangles.push([t[t.length-3], t[t.length-2], t[t.length-1], i]);//Dodaj nową scianę
				x = t.pop();t.pop();t.push(x);
			}
		}
	}
}


//Load data from json {vertices: [[x,y,z],...], sides: [[1,2,3,..],...]}
Viewer3D.prototype.loadObj = function(obj){
	console.debug(obj);
	//Deep Clone
	this.vertices = [];//obj.vertices;
	for(i=0;i<obj.vertices.length;i++)
		this.vertices.push({x:obj.vertices[i].x, y:obj.vertices[i].y, z:obj.vertices[i].z});
	this.faces = [];
	for(i=0;i<obj.faces.length;i++){
		this.faces.push([]);
		for(j=0;j<obj.faces[i].length;j++)
			this.faces[i].push(obj.faces[i][j]);
	}
	this.triangles = [];
	this.triangularize();
	
	console.log('Triangles:');
	console.debug(this.triangles);
}

//Translate
Viewer3D.prototype.translate = function(dx, dy, dz){
	for(i=0;i<this.vertices.length;i++){
		this.vertices[i].x += dx;
		this.vertices[i].y += dy;
		this.vertices[i].z += dz;
	}
}

//Perform matrix transformation with matrix [[a1,a2,a3],[b1,b2,b3],[c1,c2,c3]]
Viewer3D.prototype.applyMatrix = function(matrix){
	var x,y,z;
	for(i=0;i<this.vertices.length;i++){
		x = this.vertices[i].x*matrix[0][0]+ this.vertices[i].y*matrix[1][0]+this.vertices[i].z*matrix[2][0];
		y = this.vertices[i].x*matrix[0][1]+ this.vertices[i].y*matrix[1][1]+this.vertices[i].z*matrix[2][1];
		z = this.vertices[i].x*matrix[0][2]+ this.vertices[i].y*matrix[1][2]+this.vertices[i].z*matrix[2][2];
		this.vertices[i].x = x;
		this.vertices[i].y = y;
		this.vertices[i].z = z;
	}
}

//Rotate along X axe
Viewer3D.prototype.rotateX = function(theta){
	this.applyMatrix([[1.0,0.0,0.0],[0.0,Math.cos(theta),-Math.sin(theta)],[0.0,Math.sin(theta),Math.cos(theta)]]);
}

//Rotate along Y axe
Viewer3D.prototype.rotateY = function(theta){
	this.applyMatrix([[Math.cos(theta),0.0,Math.sin(theta)],[0.0,1.0,0.0],[-Math.sin(theta),0.0,Math.cos(theta)]]);
}

//Rotate along Z axe
Viewer3D.prototype.rotateZ = function(theta){
	this.applyMatrix([[Math.cos(theta),-Math.sin(theta),0.0],[Math.sin(theta),Math.cos(theta),0.0][0.0,0.0,1.0]]);
}

Viewer3D.prototype.scale = function(sx, sy, sz){
	this.applyMatrix([[sx,0.0,0.0],[0.0,sy,0.0],[0.0,0.0,sz]]);
}

Viewer3D.prototype.scaleAll = function(s){
	this.scale(s,s,s);
}

//Render only vertices
Viewer3D.prototype.renderPoints = function(){
	var canvas = document.getElementById(this.viewport);

	if (canvas.getContext){
		var ctx = canvas.getContext('2d');
		//ctx.clearRect(0,0,this.width,this.height);
		ctx.strokeStyle="black";
		for(i=0;i<this.vertices.length;i++){
			if(this.vertices[i].z>this.camera.z+this.ppd){//point visible
				dz = this.vertices[i].z-this.camera.z;

				sx = this.vertices[i].x*this.ppd/dz;
				sy = this.vertices[i].y*this.ppd/dz;
				
				sx*=this.width/2.0;sx+=this.width/2.0;
				sy*=this.height/2.0;sy+=this.height/2.0;
				
				//console.debug('Vertices #'+i+': '+sx+' '+sy);
				ctx.beginPath();  
				ctx.arc(sx,sy,1,0,Math.PI*2,true);
				ctx.stroke();
				ctx.strokeText(i, sx, sy); 
			}
		}
	}
}

//Render only lines
Viewer3D.prototype.renderLines = function(){
	var canvas = document.getElementById(this.viewport);

	if (canvas.getContext){
		var ctx = canvas.getContext('2d');
		ctx.clearRect(0,0,this.width,this.height);
		ctx.strokeStyle="red";
		for(i=0;i<this.triangles.length;i++){
			ctx.beginPath();
			for(j=0;j<4;j++){
				dz = this.vertices[this.triangles[i][j%3]].z-this.camera.z;
				sx = this.vertices[this.triangles[i][j%3]].x*this.ppd/dz;
				sy = this.vertices[this.triangles[i][j%3]].y*this.ppd/dz;
				sx*=this.width/2.0;sx+=this.width/2.0;
				sy*=this.height/2.0;sy+=this.width/2.0;
				if(j==0)ctx.moveTo(sx,sy);else ctx.lineTo(sx,sy);
			}
			ctx.stroke();		
		}
	}
}

//Render only lines
Viewer3D.prototype.renderFaces = function(){
	var canvas = document.getElementById(this.viewport);

	if (canvas.getContext){
		var ctx = canvas.getContext('2d');
		ctx.clearRect(0,0,this.width,this.height);
		ctx.fillStyle="red";
		ctx.lineWidth = "0px";
		ZBuffer = [];
		for(i=0;i<this.triangles.length;i++){
			px = (this.vertices[this.triangles[i][0]].x+this.vertices[this.triangles[i][1]].x+this.vertices[this.triangles[i][2]].x)/3.0;
			py = (this.vertices[this.triangles[i][0]].y+this.vertices[this.triangles[i][1]].y+this.vertices[this.triangles[i][2]].y)/3.0;
			pz = (this.vertices[this.triangles[i][0]].z+this.vertices[this.triangles[i][1]].z+this.vertices[this.triangles[i][2]].z)/3.0;
			ZBuffer.push({d: Math.sqrt((this.camera.x-px)*(this.camera.x-px)+(this.camera.y-py)*(this.camera.y-py)+(this.camera.z-pz)*(this.camera.z-pz)), t: i});
			
			//nv = crossProduct(
		}
		ZBuffer.sort(function(a,b){return b.d-a.d;});
		
		//console.debug(ZBuffer);
		for(i=0;i<ZBuffer.length;i++){
			ctx.fillStyle = "rgba("+parseInt(255*(this.triangles[ZBuffer[i].t][3]+1)/(this.faces.length))+",0,0,1)";
			ctx.strokeStyle = "rgba("+parseInt(255*(this.triangles[ZBuffer[i].t][3]+1)/(this.faces.length))+",0,0,1)";
			ctx.beginPath();
			for(j=0;j<4;j++){
				dz = this.vertices[this.triangles[ZBuffer[i].t][j%3]].z-this.camera.z;
				sx = this.vertices[this.triangles[ZBuffer[i].t][j%3]].x*this.ppd/dz;
				sy = this.vertices[this.triangles[ZBuffer[i].t][j%3]].y*this.ppd/dz;
				sx*=this.width/2.0;sx+=this.width/2.0;
				sy*=this.height/2.0;sy+=this.width/2.0;
				if(j==0)ctx.moveTo(sx,sy);else ctx.lineTo(sx,sy);
				//ctx.strokeText(this.triangles[ZBuffer[i].t][j%3], sx, sy); 	
			}
			ctx.fill();	
			ctx.stroke();//!! Hack
			//ctx.strokeText(this.triangles[ZBuffer[i].t], sx, sy); 	
		}
	}
}

Viewer3D.prototype.showStats = function(){
	var canvas = document.getElementById(this.viewport);

	if (canvas.getContext){
		var ctx = canvas.getContext('2d');
		ctx.beginPath();
		ctx.strokeStyle = "yellow";
		for(i=0;i<this.triangles.length;i++){
			mi = Math.min(Math.min(this.vertices[this.triangles[i][0]].z, this.vertices[this.triangles[i][1]].z), this.vertices[this.triangles[i][2]].z);
			ma = Math.max(Math.max(this.vertices[this.triangles[i][0]].z, this.vertices[this.triangles[i][1]].z), this.vertices[this.triangles[i][2]].z);
			console.debug(mi+" "+ma);
			ctx.moveTo(this.width/2.0+100*mi,3*i+50);
			ctx.lineTo(this.width/2.0+100*ma,3*i+50);
		}
		ctx.stroke();
	}
}

//Render with sheadeing and removing hidden faces
Viewer3D.prototype.render = function(){
	//this.renderPoints();
	this.renderFaces();
	this.showStats();
	//this.renderPoints();
}


var main,int=null;

window.addEventListener('load', 
	function (event) {
		main =  new Viewer3D('viewport');
		//main.loadObj(cube);
		//main.scaleAll(0.7);
		//main.loadObj(dodecahedron);
		//main.scaleAll(0.7/(Math.sqrt(5)-1));
		main.render();
	}, true);

function button(x){
	d = 50;dt=0.05;
	if(x==0){
		if(int!=null){clearInterval(int);int=null;}
	}else
	if(x>=1&&x<=8){
		if(int!=null){clearInterval(int);int=null;}
		if(x==1){
			int = setInterval(function(){main.rotateX(dt);main.render();},d);
		}
		if(x==2){
			int = setInterval(function(){main.rotateX(-dt);main.render();},d);
		}
		if(x==3){
			int = setInterval(function(){main.rotateY(-dt);main.render();},d);
		}
		if(x==4){
			int = setInterval(function(){main.rotateY(dt);main.render();},d);
		}
	}
	
}
