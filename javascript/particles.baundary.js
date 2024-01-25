autowhatch = 1; inlets = 1; outlets = 1;

var bypassed = false;
var selected_shape = "plane";

var material = {mode: "kill",
				softness: 1};

var plane = { 	normal: [0,-1,0],
				position: [0,-1,0]
			};

var sphere = {	center: [0,0,0],
				radius: 1
			};

var hit_normal;

function length(a){ return Math.sqrt(a[0]*a[0] + a[1]*a[1] + a[2]*a[2]); }
function normalize(a){
	var l = length(a);
	return[ a[0]/l, a[1]/l, a[2]/l ];
}
function dot(a, b){ return a[0]*b[0] + a[1]*b[1] + a[2]*b[2]; }
function reflect(v, n) {

    var dotProduct = 2 * dot(v, n);

    v[0] -= n[0]*dotProduct;
    v[1] -= n[1]*dotProduct;
    v[2] -= n[2]*dotProduct;

    return v;
}

function mode(x){ material.mode = x; }
function shape(x){ selected_shape = x; }
function plane_position(){ plane.position = [arguments[0], arguments[1], arguments[2]]; }
function plane_normal(){ plane.normal = normalize([arguments[0], arguments[1], arguments[2]]); }
function sphere_center(){ sphere.center = [arguments[0], arguments[1], arguments[2]]; }
function sphere_radius(){ sphere.radius = arguments[0]; }
function softness(x){ material.softness = Math.max(1, x + 1); }
function bypass(x){ bypassed = x == 1; }


function plane_intersect(ro, rd){
    // assuming vectors are all normalized
    var denom = dot(plane.normal, rd);
    if(denom <= 1e-6) return -1;
    var p0l0 = [	plane.position[0] - ro[0],
    				plane.position[1] - ro[1],
    				plane.position[2] - ro[2] ];
    hit_normal = plane.normal;
    return dot(p0l0, plane.normal) / denom; 
}

// sphere of size ra centered at point ce
function sphere_intersect(ro, rd){

    var oc = [	ro[0] - sphere.center[0],
    			ro[1] - sphere.center[1],
    			ro[2] - sphere.center[2]] ;
    var b = dot( oc, rd );
    var c = dot( oc, oc ) - sphere.radius*sphere.radius;
    var h = b*b - c;
    if( h<0.0 ) return -1; // no intersection
    h = Math.sqrt( h );
    var d = -b-h;
    hit_normal = normalize(	[	ro[0] + rd[0]*d - sphere.center[0],
    							ro[1] + rd[1]*d - sphere.center[1],
    							ro[2] + rd[2]*d - sphere.center[2]]);
    return d;//vec2( -b-h, -b+h );
}
/*
function sphere_intersect(ro, rd){
    var oc = ro - sphere.center;
    var a = dot(rd, rd);
    var b = 2.0 * dot(oc, rd);
    var c = dot(oc,oc) - sphere.radius*sphere.radius;
    var discriminant = b*b - 4*a*c;
    if(discriminant < 0){
        return -1.0;
    }
    else{
        return (-b - Math.sqrt(discriminant)) / (2.0*a);
    }
}
*/

function shape_intersect(ro, rd){

	switch(selected_shape){

	case "plane":
		return plane_intersect(ro, rd);

	case "sphere":
		return sphere_intersect(ro, rd);
	}
}

function dead_or_stuck(i){ return (particles[i].age == -1) || particles[i].stuck; }

function kill(i){ particles[i].age = -1; }

function bang(){

	if(bypassed){
		outlet(0, "bang");
		return;
	}

	switch(material.mode){

	case "kill":
		for(var i = 0; i < particles.length; i++){

			if(dead_or_stuck(i)) continue;

			var vel_length = length(particles[i].vel);

			var dir = [	particles[i].vel[0] / vel_length, 
						particles[i].vel[1] / vel_length, 
						particles[i].vel[2] / vel_length ];

			var t0 = shape_intersect(particles[i].pos, dir);
			if(t0 <= vel_length && t0 > 0) kill(i);
		}

		break;

	case "stick":

		for(var i = 0; i < particles.length; i++){

			if(dead_or_stuck(i)) continue;

			var vel_length = length(particles[i].vel);

			var dir = [	particles[i].vel[0] / vel_length, 
						particles[i].vel[1] / vel_length, 
						particles[i].vel[2] / vel_length ];

			var t0 = shape_intersect(particles[i].pos, dir);
			if(t0 <= vel_length && t0 > 0){
				particles[i].pos[0] += dir[0]*t0;
				particles[i].pos[1] += dir[1]*t0;
				particles[i].pos[2] += dir[2]*t0;
				particles[i].vel = [0,0,0];
				particles[i].stuck = true;
			}
		}

		break;

	case "bounce":

		for(var i = 0; i < particles.length; i++){

			if(dead_or_stuck(i)) continue;

			var vel_length = length(particles[i].vel);

			var dir = [	particles[i].vel[0] / vel_length, 
						particles[i].vel[1] / vel_length, 
						particles[i].vel[2] / vel_length ];

			var t0 = shape_intersect(particles[i].pos, dir);
			if(t0 <= vel_length && t0 > 0){

				var r = reflect(dir, hit_normal);
				vel_length /= material.softness;
				r[0] *= vel_length;
				r[1] *= vel_length;
				r[2] *= vel_length;
				particles[i].vel = r;
			}
		}

		break;
	}

	outlet(0, "bang");
}