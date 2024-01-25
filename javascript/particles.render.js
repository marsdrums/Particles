autowhatch = 1; inlets = 1; outlets = 2;

var mPos = new JitterMatrix(3, "float32", 1);
var mPrev = new JitterMatrix(3, "float32", 1);

function bang(){

	var toOutput = [];
	for(var i = 0; i < particles.length; i++){
		if(particles[i].age >= 0) toOutput.push(i);
	}

	mPos.dim = toOutput.length;
	mPrev.dim = toOutput.length;
	for(var i = 0; i < toOutput.length; i++){
		mPos.setcell(i, "val", particles[toOutput[i]].pos);
		mPrev.setcell(i, "val", particles[toOutput[i]].prevpos);
	}
	outlet(1, "jit_matrix", mPrev.name);
	outlet(0, "jit_matrix", mPos.name);
}