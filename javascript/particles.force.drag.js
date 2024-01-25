autowhatch = 1; inlets = 1; outlets = 1;

var drag = 0;
var bypassed = false;

function bypass(x){ bypassed = x == 1; }

function amount(x){ drag = Math.max(-0.9, x); }

function bang(){

	if(bypassed){
		outlet(0, "bang");
		return;
	}
	
	var divisor = 1 / (drag + 1);

	for(var i = 0; i < particles.length; i++){

		if(particles[i].age < 0) continue;

		particles[i].vel[0] *= divisor;
		particles[i].vel[1] *= divisor;
		particles[i].vel[2] *= divisor;

	}
	outlet(0, "bang");
}