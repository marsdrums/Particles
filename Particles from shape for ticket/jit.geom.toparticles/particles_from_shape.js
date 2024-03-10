autowatch = 1; inlets = 1; outlets = 1;

var weights;
var probability;
var alias;
var small;
var large;
var geom;
var num_part = 20000;
var part_mode = "faces"; //or "edges", or "vertices"
var mOut = new JitterMatrix(3, "float32", num_part);

// Vose's alias method for fast weighted random number generation
// https://www.keithschwarz.com/darts-dice-coins/ 
// https://blog.bruce-hill.com/a-faster-weighted-random-choice

function num_particles(x){
    mOut.dim = x;
    num_part = x;
}

function mode(x){
    part_mode = x;
}

function distance(a, b){
    var diff = [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    return Math.sqrt(diff[0]*diff[0] + diff[1]*diff[1] + diff[2]*diff[2]);
}

function compute_weights(){

    if(part_mode == "vertices") return;

    weights = [];
    surface = 0;

    switch (part_mode) {
      case "faces":
        for(var i = 0; i < geom.faces_size; i++){
            surface += geom.faces[i].area;
        }

        for(var i = 0; i < geom.faces_size; i++){
            weights.push(geom.faces[i].area/surface);
        }
        break; 

      case "edges":
        var edges_length = new Array(geom.edges_size);
        for(var i = 0; i < geom.edges_size; i++){
            var he0 = geom.edges[i].halfedges[0];
            var v0 = geom.halfedges[he0].from;
            var v1 = geom.halfedges[he0].to;
            var p0 = geom.vertices[v0].point;
            var p1 = geom.vertices[v1].point;
            edges_length[i] = distance(p0, p1);
            surface += edges_length[i];
        }

        for(var i = 0; i < geom.edges_size; i++){
            weights.push(edges_length[i]/surface);
        }        
        break; 
    }
}

function create_alias() {

    if(part_mode == "vertices") return;

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

function add_to_faces(){

    for(var i = 0; i < num_part; i++){

        var rand_face = get_random_value();

        var he0 = geom.faces[rand_face].halfedge;
        var he1 = geom.halfedges[he0].next;

        var v0 = geom.halfedges[he0].from;
        var v1 = geom.halfedges[he1].from;
        var v2 = geom.halfedges[he1].to;

        var p0 = geom.vertices[v0].point;
        var p1 = geom.vertices[v1].point;
        var p2 = geom.vertices[v2].point;

        var e10 = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]];
        var e20 = [p2[0] - p0[0], p2[1] - p0[1], p2[2] - p0[2]];

        var u = Math.random();
        var v = Math.random();

        if( u+v > 1){
            u = 1 - u;
            v = 1 - v;
        }

        var pos = [ u*e10[0] + v*e20[0] + p0[0], 
                    u*e10[1] + v*e20[1] + p0[1], 
                    u*e10[2] + v*e20[2] + p0[2]];

        mOut.setcell(i, "val", pos);
    }
}

function add_to_edges(){

    for(var i = 0; i < num_part; i++){

        var rand_edge = get_random_value();

        var he0 = geom.edges[rand_edge].halfedges[0];

        var v0 = geom.halfedges[he0].from;
        var v1 = geom.halfedges[he0].to;

        var p0 = geom.vertices[v0].point;
        var p1 = geom.vertices[v1].point;

        var a = Math.random();
        var b = 1 - a;
        var pos = [ p0[0]*a + p1[0]*b,
                    p0[1]*a + p1[1]*b,
                    p0[2]*a + p1[2]*b];

        mOut.setcell(i, "val", pos);
    }
}

function add_to_vertices(){

    for(var i = 0; i < num_part; i++){
        var rand_vert = Math.floor(Math.random()*geom.vertices_size);
        mOut.setcell(i, "val", geom.vertices[rand_vert].point);
    }
}

function add_particles(){

    switch (part_mode) {
      case "faces":
        add_to_faces();
        break; 

      case "edges":
        add_to_edges();      
        break; 

      case "vertices":
        add_to_vertices();
        break;
    }
}

function dictionary(geomDict) {

	var d = new Dict(geomDict);
	var geomdict = JSON.parse(d.stringify());
	geom = geomdict.geomlist[0];

    compute_weights();
    create_alias();
    add_particles();

    outlet(0, "jit_matrix", mOut.name);
}