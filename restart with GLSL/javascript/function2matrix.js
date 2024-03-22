autowhatch = 1; inlets = 1; outlets = 1;

var count = 0;
var points = [];
var output_size = 100;
var mOut = new JitterMatrix(1, "float32", output_size);

function mix(a, b, i){
	return a*(1-i) + b*i;
}

function fill_matrix(){

	//get function length
	var total_time = 0;
	for(var i = 1; i < points.length; i++){
		total_time += points[i].time;
	}
	var time_ratio = output_size / total_time;

	var count = 0;
	for(var i = 0; i < points.length - 1; i++){

		//how many cells doest this segment take?
		var time_diff = points[i + 1].time;// - points[i].time;
		var num_cells = Math.floor(time_diff * time_ratio);
		for(var k = 0; k < num_cells; k++){
			mOut.setcell(count++, "val", mix(points[i].value, points[i+1].value, k/num_cells));
		}
	}

}

function output_matrix(){

	outlet(0, "jit_matrix", mOut.name);
	points = [];
}

function anything(){

	if(arguments.length == 1){
		points.push( { 	value: arguments[0],
						time: 0});
	} else {
		for(var i = 0; i < arguments.length; i+=2){
			points.push( { 	value: arguments[i],
							time: arguments[i+1]});
		}
		fill_matrix();
		output_matrix();
	}


}