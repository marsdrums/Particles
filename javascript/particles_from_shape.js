autowatch = 1; inlets = 1; outlets = 3;

var weights;
var probability;
var alias;
var small;
var large;
var mOut = new JitterMatrix(4, "float32", 1);
var mPos = new JitterMatrix(4, "float32", 1);
var mNor = new JitterMatrix(4, "float32", 1);

// Vose's alias method for fast weighted random number generation
// https://www.keithschwarz.com/darts-dice-coins/ 
// https://blog.bruce-hill.com/a-faster-weighted-random-choice

function create_alias() {

    probability = new Array(weights.length);
    alias = new Array(weights.length);
    small = [];
    large = [];

    for (var i = 0; i < weights.length; i++) {
        weights[i] *= weights.length;
        if (weights[i] < 1.0) small.push(i);
        else large.push(i);
    }

    while (small.length > 0 && large.length > 0) {
        var less = small.pop();
        var more = large.pop();
        probability[less] = weights[less];
        alias[less] = more;
        weights[more] = (weights[more] + weights[less]) - 1.0;
        if (weights[more] < 1.0) small.push(more);
        else large.push(more);
    }

    while (large.length > 0) {
        probability[large.pop()] = 1;
    }

    while (small.length > 0) {
        probability[small.pop()] = 1;
    }
}

function get_random_value() {
    var column = Math.floor(Math.random() * weights.length);
    return Math.random() < probability[column] ? column : alias[column];
}

function dictionary(geomDict) {

	var d = new Dict(geomDict);
	var geomdict = JSON.parse(d.stringify());
	var geom = geomdict.geomlist[0];

//	for(var k = 0; k < geomdict.geomlist_size; k++){
//		geom = geomdict.geomlist[k];
//	}

    weights = [];
	surface = 0;
	for(var i = 0; i < geom.faces_size; i++){
        surface += geom.faces[i].area;
	}

    for(var i = 0; i < geom.faces_size; i++){
        weights.push(geom.faces[i].area/surface);
    }

    create_alias();

    mOut.dim = weights.length;
    mPos.dim = geom.faces_size * 3;
    mNor.dim = mPos.dim;

    for(var i = 0; i < weights.length; i++){
        mOut.setcell(i, "val", 0, probability[i], alias[i], 0);
    }

    var count = 0;
    for(var i = 0; i < geom.faces_size; i++){
        var he0 = geom.faces[i].halfedge;
        var he1 = geom.halfedges[he0].next;
        var v0 = geom.halfedges[he0].from;
        var v1 = geom.halfedges[he1].from;
        var v2 = geom.halfedges[he1].to;
        mPos.setcell(count,   "val", 0, geom.vertices[v0].point);
        mNor.setcell(count++, "val", 0, geom.vertices[v0].normal);
        mPos.setcell(count,   "val", 0, geom.vertices[v1].point);
        mNor.setcell(count++, "val", 0, geom.vertices[v1].normal);
        mPos.setcell(count,   "val", 0, geom.vertices[v2].point);
        mNor.setcell(count++, "val", 0, geom.vertices[v2].normal);

    }
    outlet(2, "jit_matrix", mNor.name);
    outlet(1, "jit_matrix", mPos.name);

    //output a matrix containing the probability and alias for each face
    outlet(0, "jit_matrix", mOut.name);
}