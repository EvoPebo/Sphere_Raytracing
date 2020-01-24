#version 420

layout (location = 0) in vec3 position;
layout (location = 1) in vec3 rayDirection;



out vec3 rayDirection_fs;

void main (){
	gl_Position = vec4(position, 1);
	rayDirection_fs = rayDirection;
}