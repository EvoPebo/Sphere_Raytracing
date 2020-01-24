#include "GL/glew.h"
#include <GL/freeglut.h>
#include "ShaderLoader.h"

#include "vec.h"
#include "mat.h"

enum Attribute { position1 = 0, rayDirection1 };

GLuint shaderProagram;
GLuint quad;

float ar = 1;
float fov = 60 * DegreesToRadians;

float pitch = -15;
float yaw = 0;
vec3 eye(-3, 5, 15);

mat4 FPSViewRH(vec3 eye, float pitch, float yaw)
{
	pitch *= DegreesToRadians;
	yaw *= DegreesToRadians;
	// If the pitch and yaw angles are in degrees,
	// they need to be converted to radians. Here
	// I assume the values are already converted to radians.
	float cosPitch = cos(pitch);
	float sinPitch = sin(pitch);
	float cosYaw = cos(yaw);
	float sinYaw = sin(yaw);

	vec3 xaxis = { cosYaw, 0, -sinYaw };
	vec3 yaxis = { sinYaw * sinPitch, cosPitch, cosYaw * sinPitch };
	vec3 zaxis = { sinYaw * cosPitch, -sinPitch, cosPitch * cosYaw };

	// Create a 4x4 view matrix from the right, up, forward and eye position vectors
	mat4 viewMatrix = {
		xaxis.x,            yaxis.x,            zaxis.x,      0,
		xaxis.y,            yaxis.y,            zaxis.y,      0,
		xaxis.z,            yaxis.z,            zaxis.z,      0,
		-dot(xaxis, eye), -dot(yaxis, eye), -dot(zaxis, eye), 1
	};

	return transpose(viewMatrix);
}

float rayDirection[] = {
	-tan(fov / 2) * ar, -tan(fov / 2), -1.0,
	tan(fov / 2) * ar, -tan(fov / 2), -1.0,
	tan(fov / 2) * ar, tan(fov / 2), -1.0,
	-tan(fov / 2) * ar, tan(fov / 2), -1.0
};

float position[] = {
	-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0
};

unsigned int indices[] = {
	0, 2, 3,
	0, 1, 2
};

static void myDisplay()
{

    glClear(GL_COLOR_BUFFER_BIT); 

	glDrawElements(GL_TRIANGLES, 6, GL_UNSIGNED_INT, 0);

    glutSwapBuffers();
}

static void init() {
	// Create and initialize a buffer object
	GLuint positionVBO;
	glGenBuffers(1, &positionVBO);
	glBindBuffer(GL_ARRAY_BUFFER, positionVBO);
	glBufferData(GL_ARRAY_BUFFER, sizeof(position), position, GL_STATIC_DRAW);
	glVertexAttribPointer(Attribute::position1, 3, GL_FLOAT, GL_FALSE, 0, 0);
	glEnableVertexAttribArray(Attribute::position1);

	GLuint rayDirectionVBO;
	glGenBuffers(1, &rayDirectionVBO);
	glBindBuffer(GL_ARRAY_BUFFER, rayDirectionVBO);
	glBufferData(GL_ARRAY_BUFFER, sizeof(rayDirection), rayDirection, GL_STATIC_DRAW);
	glVertexAttribPointer(Attribute::rayDirection1, 3, GL_FLOAT, GL_FALSE, 0, 0);
	glEnableVertexAttribArray(Attribute::rayDirection1);

	GLuint indicesVBO;
	glGenBuffers(1, &indicesVBO);
	glBindBuffer(GL_ELEMENT_ARRAY_BUFFER, indicesVBO);
	glBufferData(GL_ELEMENT_ARRAY_BUFFER, sizeof(indices), indices, GL_STATIC_DRAW);
}

int main(int argc, char** argv)
{
	glutInit(&argc, argv);
    glutInitDisplayMode(GLUT_DOUBLE|GLUT_RGBA);
    glutInitWindowSize(750, 750);
    glutInitWindowPosition(100, 100);
    glutCreateWindow("A Simple Window");

	GLenum res = glewInit();
	if (res != GLEW_OK) {
		fprintf(stderr, "Error: '%s'\n", glewGetErrorString(res));
		return 1;
	}

	shaderProagram = loadShaders("RayTracer.vert", "RayTracer.frag");

	glUseProgram(shaderProagram);

	glutDisplayFunc(myDisplay);

	init();

    glutMainLoop();
    
    return 0;
}