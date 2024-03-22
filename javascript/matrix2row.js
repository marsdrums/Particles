autowhatch = 1; inlets = 1; outles = 1;

var mIn;
var mOut = new JitterMatrix(4, "float32", 1);

function jit_matrix(inname){

	mIn = JitterMatrix(inname);
/*
	if(mIn.dim.length == 0 || mIn.dim[1] = 1){

		outlet(0, "jit_matrix", mIn.name);
		return;
	}
*/
	mOut.type = mIn.type;
	mOut.planecount = mIn.planecount;
	mOut.dim = mIn.dim[0]*mIn.dim[1];

	var count = 0;
	for(var x = 0; x < mIn.dim[0]; x++){
		for(var y = 0; y < mIn.dim[1]; y++){
			var thisVal = mIn.getcell(x, y);
			mOut.setcell(count++, "val",thisVal[1], thisVal[2], thisVal[3], thisVal[0]);
		}
	}

	outlet(0, "dim", mOut.dim, 1);
	outlet(0, "jit_matrix", mOut.name);
}