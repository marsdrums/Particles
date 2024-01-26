autowhatch = 1; inlets = 1; outlets = 1;

var bypassed = false;
var grid_size = 256;
var grid = [];
var search = {	fov: 1,
				radius: 0.06,
				attraction: 0.01};

var grid = new Array(grid_size);
for(var x = 0; x < grid.length; x++){
	grid[x] = new Array(grid_size);
	for(var y = 0; y < grid.length; y++){
		grid[x][y] = new Array(grid_size);
		for(var z = 0; z < grid.length; z++){
			grid[x][y][z] = 0;
		}
	}
}

function length(a){ return Math.sqrt(a[0]*a[0] + a[1]*a[1] + a[2]*a[2]); }
function normalize(a){
	var l = length(a);
	return[ a[0]/l, a[1]/l, a[2]/l ];
}
/*
function reset_grid(){

	var grid = new Array(grid_size);
	for(var x = 0; x < grid.length; x++){
		grid[x] = new Array(grid_size);
		for(var y = 0; y < grid.length; y++){
			grid[x][y] = new Array(grid_size);
			for(var z = 0; z < grid.length; z++){
				grid[x][y][z] = 0;
			}
		}
	}
}
*/


function evaporate(){

	for(var x = 0; x < grid.length; x++){
		for(var y = 0; y < grid.length; y++){
			for(var z = 0; z < grid.length; z++){
				grid[x][y][z] = Math.max(0, grid[x][y][z] - 0.1);
			}
		}
	}
}

function pos2grid(p){

	p[0] = Math.floor((p[0]*0.5 + 0.5)*grid_size);
	p[1] = Math.floor((p[1]*0.5 + 0.5)*grid_size);
	p[2] = Math.floor((p[2]*0.5 + 0.5)*grid_size);
	return p;
}

function fill_grid(){

	for(var i = 0; i < particles.length; i++){

		if(paricles[i].age < 0) continue;

		var g = pos2grid(particles[i].pos);
		grid[g.x][g.y][g.z] += 1;
	}
}

/*
function find_densest_cell(g, front){

	var max_density = -1;
	var best_dir;

	for(var i = 0; i < 6; i++){

		var rd = normalize([	Math.random()*2 - 1,
								Math.random()*2 - 1,
								Math.random()*2 - 1 ]);
		rd[0] *= search.fov;
		rd[1] *= search.fov;
		rd[2] *= search.fov;
		
		rd[0] += front[0];
		rd[1] += front[1];
		rd[2] += front[2];

		rd = normalize(rd);

		var sampleg =  	[	Math.floor(g[0] + rd[0] * search.radius * (grid_size*0.5)),
							Math.floor(g[1] + rd[1] * search.radius * (grid_size*0.5)),
							Math.floor(g[2] + rd[2] * search.radius * (grid_size*0.5)) ];

		if(	sampleg[0] == g[0] && 
			sampleg[1] == g[1] && 
			sampleg[2] == g[2]) continue;

		if(grid[x][y][x] > max_density){
			max_density = grid[x][y][z];
			best_dir = rd;

	}
	return best_dir;
}
*/

function bypass(x){ bypassed = x == 1; }

function bang(){

	if(bypassed){
		outlet(0, "bang");
		return;
	}

	//reset_grid();
	//evaporate();
	//fill_grid();
/*
	for(var i = 0; i < particles.length; i++){

		if(paricles[i].age < 0) continue;

		var front = normalize(particles[i].vel);
		var pos = particles[i].pos;
		var g = pos2grid(pos);
		var best_dir = find_densest_cell(g, front);

		particles[i].vel[0] += best_dir[0]*search.attraction;

	}
*/
	outlet(0, "bang");
}