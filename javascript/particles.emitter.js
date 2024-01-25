autowhatch = 1; inlets = 1; outlets = 1;

//global variables
particles = new Array(1000);
for(var i = 0; i < particles.length; i++){
	particles[i] = { 	pos: [0,0,0], 
						prevpos: [0,0,0],
						vel: [0,0,0], 
						mass: 1,
						age: -1,
						stuck: false };
}

//local variables
var rate = 3;
var accumulation = 0;
var initial = {	speed: 0.02,
				mass: 1,
				pos: [0,0,0]};
var active = 0;
var threshold = 0;
var mOut = new JitterMatrix(3, "float32", 1);

function position(x, y, z){ initial.pos = [x, y, z]; }

function reset(){

	particles = new Array(1000);
	for(var i = 0; i < particles.length; i++){
		particles[i] = { 	pos: [0,0,0], 
							prevpos: [0,0,0],
							vel: [0,0,0], 
							mass: 1,
							age: -1,
							stuck: false };
	}
}

function update(){

	for(var i = 0; i < particles.length; i++){
		if(particles[i].age < 0) continue;
		if(particles[i].age >= 1000){
			kill(i);
		} else {

			particles[i].prevpos[0] = particles[i].pos[0];
			particles[i].prevpos[1] = particles[i].pos[1];
			particles[i].prevpos[2] = particles[i].pos[2];
			particles[i].pos[0] += particles[i].vel[0];
			particles[i].pos[1] += particles[i].vel[1];
			particles[i].pos[2] += particles[i].vel[2];
			particles[i].age++;
		}
	}
}

function kill(i){

	//particles[i].pos = [0,0,0];
	//particles[i].prevpos = [0,0,0];
	//particles[i].vel = [0,0,0];
	particles[i].age = -1;
}

function generate(){

	accumulation += rate;
	//if rand is above trheshold, generate a particle
	for(var i = 0; i < Math.floor(accumulation); i++){

		active = (active+1) % particles.length;

		particles[active].vel = [	(Math.random()*2 - 1)*initial.speed, 
									(Math.random()*2 - 1)*initial.speed, 
									(Math.random()*2 - 1)*initial.speed];

		particles[active].pos[0] = initial.pos[0] + particles[active].vel[0];
		particles[active].pos[1] = initial.pos[1] + particles[active].vel[1];
		particles[active].pos[2] = initial.pos[2] + particles[active].vel[2];
		particles[active].prevpos[0] = initial.pos[0];
		particles[active].prevpos[1] = initial.pos[1];
		particles[active].prevpos[2] = initial.pos[2];

		particles[active].mass = initial.mass;
		particles[active].stuck = false;

		particles[active].age = 0;		
	}

	accumulation = accumulation % 1;

}

function bang(){

	update();
	generate();
	outlet(0, "bang");
}