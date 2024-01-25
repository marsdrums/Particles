autowhatch = 1; inlets = 1; outlets = 1;

var force = {	direction: [0,-1,0],
				position: [0,0,0],
				amount: 0.002,
				mode: "direction" 
			};

var bypassed = false;

function bypass(x){ bypassed = x == 1; }
function mode(x){ force.mode = x; }
function position(){ force.position = [arguments[0], arguments[1], arguments[2]]; }

function length(a){ return Math.sqrt(a[0]*a[0] + a[1]*a[1] + a[2]*a[2]); }

function apply_gravity(){

	var attraction = [ 	force.direction[0]*force.amount, 
						force.direction[1]*force.amount, 
						force.direction[2]*force.amount ];

	for(var i = 0; i < particles.length; i++){

		if(particles[i].age < 0 || particles[i].stuck) continue;

		particles[i].vel[0] += attraction[0]/particles[i].mass;
		particles[i].vel[1] += attraction[1]/particles[i].mass;
		particles[i].vel[2] += attraction[2]/particles[i].mass;

	}
}
function apply_attractor(){

	for(var i = 0; i < particles.length; i++){

		if(particles[i].age < 0 || particles[i].stuck) continue;

		var attraction = [	force.position[0] - particles[i].pos[0], 
							force.position[1] - particles[i].pos[1], 
							force.position[2] - particles[i].pos[2] ];

		var  dist = length(attraction);

		dist *= dist;
		dist += 0.01;
		var attraction_force = force.amount / dist;
		attraction[0] *= attraction_force;
		attraction[1] *= attraction_force;
		attraction[2] *= attraction_force;

		particles[i].vel[0] += attraction[0]/particles[i].mass;
		particles[i].vel[1] += attraction[1]/particles[i].mass;
		particles[i].vel[2] += attraction[2]/particles[i].mass;
	}
}
function bang(){

	if(bypassed){
		outlet(0, "bang");
		return;
	}

	switch(force.mode){
		case "direction":
			apply_gravity();
			break;

		case "attractor":
			apply_attractor();
			break;
	}

	outlet(0, "bang");
}