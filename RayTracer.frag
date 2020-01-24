#version 420

in vec3 rayDirection_fs;

out vec3 FragColor;

uniform vec3 eye = vec3(0, 0, 0);


struct Ray {
	vec3 origin;
	vec3 direction;
};

Ray shadowRay;
Ray ray;
Ray ray2;
Ray ray3;

struct Plane {
	vec3 normal;
	vec3 point;
	vec3 color;
	int id;
};

Plane plane;

struct Sphere {
	vec3 center;
	float radius;
	int id;
	vec3 color;
};

Sphere sphere1;
Sphere sphere2;
Sphere sphere3;

struct PointLight {
	vec3 ambient;
	vec3 diffuse;
	vec3 specular;
	vec3 position;
	vec3 attenuation;
	vec3 color;
};

PointLight pointLight;

struct DirectionalLight {
	vec3 ambient;
	vec3 diffuse;
	vec3 specular;
	vec3 direction;
	vec3 color;
};

DirectionalLight directionLight;

bool intersectPlane(Ray ray, Plane plane, out float distance) 
{ 
    //distance = ((ray.point - ray.origin) * plane.normal)/ 
					//rayDirection_fs * plane.normal)
					
    float denom = dot(ray.direction, plane.normal);
	
	if (denom != 0) { 
        vec3 numer = plane.point - ray.origin; 
        distance = dot(numer, plane.normal) / denom; 
        return (distance >= 0);
		
    } 
 
    return false; 
} 

bool intersectSphere(Ray ray, Sphere sphere, out float distance){
	
	float one = (dot(ray.direction,(ray.origin - sphere.center)));
	float two = length(ray.origin - sphere.center);
	float square = pow(one, 2) - pow(two, 2) + pow(sphere.radius, 2);
	float three = -1 * (dot(ray.direction, (ray.origin - sphere.center)));
	
	if(square >= 0){
		distance = -1;
		float front = three - sqrt(square);
		float back = three + sqrt(square);
		
		if(front > 0 && front < back)
			distance = front;
		if(back > 0 && back < front)
			distance = back;
		return distance > 0;
		
	}	
	return false;
}

int ShadowTracing(Ray shadowRay, float LightDis, int id){
	
	float distance = 0;

	if (id != sphere1.id && intersectSphere(shadowRay, sphere1, distance) && distance < LightDis){
		return 0;
	}	
	
	if (id != sphere2.id && intersectSphere(shadowRay, sphere2, distance) && distance < LightDis){
		return 0;
	}	
	
	if (id != sphere3.id && intersectSphere(shadowRay, sphere3, distance) && distance < LightDis){
		return 0;	
	}
	
	if(id != plane.id && intersectPlane(shadowRay, plane, distance) && distance < LightDis){
		return 0;
	}
	return 1;
}

int ShadowTracing2(Ray shadowRay, int id){
	
	float distance = 0;

	if (id != sphere1.id && intersectSphere(shadowRay, sphere1, distance)){
		return 0;
	}	
	
	if (id != sphere2.id && intersectSphere(shadowRay, sphere2, distance)){
		return 0;
	}	
	
	if (id != sphere3.id && intersectSphere(shadowRay, sphere3, distance)){
		return 0;	
	}
	
	if(id != plane.id && intersectPlane(shadowRay, plane, distance)){
		return 0;
	}
	return 1;
}

 vec3 Lights(Ray ray, vec3 smashPoint, vec3 objNorm, int id){
	
	// Point Light
	vec3 viewDir = normalize(-ray.direction);
	vec3 lightDirection = pointLight.position - smashPoint;
	float distance = length(lightDirection - smashPoint);
	lightDirection = normalize(lightDirection);
	float diffuse = max(dot(lightDirection, objNorm), 0);
	float attenuation = 1.0 / (pointLight.attenuation.x + pointLight.attenuation.y * distance + pointLight.attenuation.z * distance * distance);
	vec3 ambient = pointLight.ambient;
	vec3 halfway = normalize(lightDirection + viewDir);
	float specular = pow(dot(halfway, objNorm), 256);
	
	//Directional Light
	
	vec3 DirLightDirection = normalize(directionLight.direction);
	float DirDiffuse = max(dot(DirLightDirection, objNorm), 0);
	vec3 DirHalfway = normalize(DirLightDirection + viewDir);
	float DirSpecular = pow(dot(DirHalfway, objNorm), 32);
	vec3 DirAmbient = directionLight.ambient;
	
	//return vec3((attenuation * pointLight.attenuation * (
	//diffuse * pointLight.diffuse + specular * pointLight.specular) 
	//+  pointLight.ambient * ambient));
	
	
	
	shadowRay.direction = lightDirection;
	shadowRay.origin = pointLight.position;
	
	vec3 temp = ambient + attenuation * ShadowTracing(shadowRay, distance, id) * (specular * pointLight.specular + diffuse * pointLight.diffuse);
	//temp += ambient + attenuation *(specular * pointLight.specular + diffuse * pointLight.diffuse);
	
	shadowRay.direction = DirLightDirection;
	shadowRay.origin = smashPoint;
	
	//return shadowRay.direction;
	return (temp + (DirAmbient + ShadowTracing2(shadowRay, id) * (DirSpecular * directionLight.specular + DirDiffuse *directionLight.diffuse)));
	//return (temp + (DirAmbient + (DirSpecular * directionLight.specular + DirDiffuse *directionLight.diffuse)));
	//return temp;
}

 vec3 mattLights(Ray ray, vec3 smashPoint, vec3 objNorm, int id){
	
	// Point Light
	vec3 viewDir = normalize(-ray.direction);
	vec3 lightDirection = pointLight.position - smashPoint;
	float distance = length(lightDirection - smashPoint);
	lightDirection = normalize(lightDirection);
	float diffuse = max(dot(lightDirection, objNorm), 0);
	float attenuation = 1.0 / (pointLight.attenuation.x + pointLight.attenuation.y * distance + pointLight.attenuation.z * distance * distance);
	vec3 ambient = pointLight.ambient;
	vec3 halfway = normalize(lightDirection + viewDir);
	float specular = pow(dot(halfway, objNorm), 256);
	
	//Directional Light
	
	vec3 DirLightDirection = normalize(directionLight.direction);
	float DirDiffuse = max(dot(DirLightDirection, objNorm), 0);
	vec3 DirHalfway = normalize(DirLightDirection + viewDir);
	float DirSpecular = pow(dot(DirHalfway, objNorm), 32);
	vec3 DirAmbient = directionLight.ambient;
	
	//return vec3((attenuation * pointLight.attenuation * (
	//diffuse * pointLight.diffuse + specular * pointLight.specular) 
	//+  pointLight.ambient * ambient));
	
	
	
	shadowRay.direction = lightDirection;
	shadowRay.origin = pointLight.position;
	
	vec3 temp = ambient + attenuation * ShadowTracing(shadowRay, distance, id) * (diffuse * pointLight.diffuse);
	//temp += ambient + attenuation *(specular * pointLight.specular + diffuse * pointLight.diffuse);
	
	shadowRay.direction = DirLightDirection;
	shadowRay.origin = smashPoint;
	
	//return shadowRay.direction;
	return (temp + (DirAmbient + ShadowTracing2(shadowRay, id) * (DirDiffuse *directionLight.diffuse)));
	//return (temp + (DirAmbient + (DirSpecular * directionLight.specular + DirDiffuse *directionLight.diffuse)));
	//return temp;
}

vec3 getNormal(int id, vec3 smashPoint){
	
	vec3 objNorm;
	
	if(sphere1.id == id){
		
		objNorm = normalize(smashPoint - sphere1.center);
		
		
	}
	
	if(sphere2.id == id){
		
		objNorm = normalize(smashPoint - sphere2.center);
		
		 
	}
	
	if(sphere3.id == id){
		
		objNorm = normalize(smashPoint - sphere3.center);
		
	}
	
	if(plane.id ==  id){
		
		return plane.normal;
		
	} 
	return objNorm;
}
	
vec3 RayTracing(Ray ray, out float distance, out int id){
	
	vec3 pointColor = vec3(0, .5, .8);
	float maxDistance = 100000.0;
	id = -1;

	if (intersectSphere(ray, sphere1, distance) && (distance < maxDistance)){
		maxDistance = distance;
		pointColor = sphere1.color;
		id = sphere1.id;
	}	
	
	if (intersectSphere(ray, sphere2, distance) && (distance < maxDistance)){
		maxDistance = distance;
		pointColor = sphere2.color;
		id = sphere2.id;
	}	
	
	if (intersectSphere(ray, sphere3, distance) && (distance < maxDistance)){
		maxDistance = distance;
		pointColor = sphere3.color;
		id = sphere3.id;
	}
	
	if(intersectPlane(ray, plane, distance) && (distance < maxDistance)){
		maxDistance = distance;
		pointColor = plane.color;
		id = plane.id;
	}
	distance = maxDistance;
	return pointColor;
}
	
void main(){
	
	
	// inits
	ray.direction = normalize(rayDirection_fs);
	ray.origin = eye;
	
	plane.normal = vec3(0, 1, 0);
	plane.point = vec3(0, -1, 0);
	plane.color = vec3(.5, .5, 0);
	plane.id = 4;
	
	sphere1.center = vec3(0, 0, -10);
	sphere1.radius = 1.0;
	sphere1.id = 0;
	sphere1.color = vec3(.1, .7, .2);
	
	sphere2.center = vec3(3, 2, -11);
	sphere2.radius = 1.2;
	sphere2.id = 1;
	sphere2.color = vec3(.6, 0, .4);
	
	sphere3.center = vec3(-3, 3, -13);
	sphere3.radius = 2;
	sphere3.id = 2;
	sphere3.color = vec3(.2, .5, .9);
	
	pointLight.ambient = vec3(0.5, 0.5, 0.5);
	pointLight.diffuse = vec3(.6, .6, .6);
	pointLight.specular = vec3(.3, .3, .3);
	pointLight.attenuation = vec3(1, 0, 0);
	pointLight.position = vec3(-3, 4, -6);
	
	directionLight.ambient = vec3(0.1, 0.1, 0.1);
	directionLight.diffuse = vec3(.4, .4, .4);
	directionLight.specular = vec3(.3, .3, .3);
	directionLight.direction = vec3(3, 5, -4);
	
	
	int id;
	float distance;
	
	//FragColor = normalize(rayDirection_fs);
	FragColor = vec3(.9, .7, .8);
	
	//FragColor = RayTracing(ray, distance, id);
	vec3 TempColor = RayTracing(ray, distance, id);
	
	vec3 smashPoint = ray.origin + ray.direction * (distance-.001);
	
	vec3 lightDirection;
	
	vec3 objNorm = getNormal(id, smashPoint);
	
	//smashPoint += objNorm * 0.001;
		//lightDirection = normalize(pointLight.position - smashPoint);
		
		//FragColor = Lights(ray, smashPoint, objNorm, id) * TempColor;
		//FragColor = objNorm;
		
		/* ray2.origin = smashPoint;
		ray2.direction = -normalize(reflect(smashPoint, (smashPoint - sphere1.center)));
		
		vec3 TempColor2 = RayTracing(ray2, distance, id);
		smashPoint = ray2.origin + ray2.direction * distance;
		objNorm = normalize(smashPoint - sphere1.center);
		
		FragColor += .5 *(Lights(ray, smashPoint, objNorm, id) * TempColor2); */
	
	/* if(sphere1.id == id){
		
		vec3 objNorm = normalize(smashPoint - sphere1.center);
		smashPoint += objNorm * 0.001;
		//lightDirection = normalize(pointLight.position - smashPoint);
		
		FragColor = Lights(ray, smashPoint, objNorm, id) * TempColor;
		//FragColor = objNorm;
		
		ray2.origin = smashPoint;
		ray2.direction = -normalize(reflect(smashPoint, (smashPoint - sphere1.center)));
		
		vec3 TempColor2 = RayTracing(ray2, distance, id);
		smashPoint = ray2.origin + ray2.direction * distance;
		objNorm = normalize(smashPoint - sphere1.center);
		
		FragColor += .5 *(Lights(ray, smashPoint, objNorm, id) * TempColor2);
		
	}
	
	if(sphere2.id == id){
		
		vec3 objNorm = normalize(smashPoint - sphere2.center);
		smashPoint += objNorm * 0.001;
		//lightDirection = normalize(pointLight.position - smashPoint);
		
		FragColor = Lights(ray, smashPoint, objNorm, id) * TempColor;
		//FragColor = objNorm;
		
		ray2.origin = smashPoint;
		ray2.direction = -normalize(reflect(smashPoint, (smashPoint - sphere2.center)));
		
		vec3 TempColor2 = RayTracing(ray2, distance, id);
		smashPoint = ray2.origin + ray2.direction * distance;
		objNorm = normalize(smashPoint - sphere2.center);
		
		FragColor += .5 *(Lights(ray, smashPoint, objNorm, id) * TempColor2);
		 
	}
	
	if(sphere3.id == id){
		
		vec3 objNorm = normalize(smashPoint - sphere3.center);
		smashPoint += objNorm * 0.001;
		//lightDirection = normalize(pointLight.position - smashPoint);
		
		FragColor = Lights(ray, smashPoint, objNorm,id) * TempColor;
		//FragColor = objNorm;
		
		ray2.origin = smashPoint;
		ray2.direction = -normalize(reflect(smashPoint, (smashPoint - sphere3.center)));
		
		vec3 TempColor2 = RayTracing(ray2, distance, id);
		smashPoint = ray2.origin + ray2.direction * distance;
		objNorm = normalize(smashPoint - sphere3.center);
		
		FragColor += .5 *(Lights(ray, smashPoint, objNorm, id) * TempColor2);
	}
	
	if(plane.id ==  id){
		
		smashPoint += plane.normal * 0.001;
		
		FragColor = Lights(ray, smashPoint, plane.normal, id) * TempColor;
		//FragColor = plane.normal;
		
		ray2.origin = smashPoint;
		ray2.direction = -normalize(reflect(smashPoint, plane.normal));
		
		vec3 TempColor2 = RayTracing(ray2, distance, id);
		smashPoint = ray2.origin + ray2.direction * distance;
		
		FragColor += .5 * (Lights(ray, smashPoint, plane.normal, id) * TempColor2);
		
		
	} */
	vec3 TempColor2;
	if (id != -1)
	{	
		if(id != -1 && id != 0){
			TempColor = Lights(ray, smashPoint, objNorm, id) * TempColor;
			ray2.origin = smashPoint;
			ray2.direction = normalize(reflect(ray.direction, objNorm));
		
			TempColor2 = RayTracing(ray2, distance, id);
		}
		
		if(id == 0){
			TempColor = mattLights(ray, smashPoint, objNorm, id) * TempColor;
			
		} 
		
		if(id != -1){
			smashPoint = ray2.origin + ray2.direction * distance;
		
			objNorm = getNormal(id, smashPoint);
		
			TempColor2 = Lights(ray, smashPoint, objNorm, id) * TempColor2;
			
		}
		
		else{
			TempColor2 = vec3(0, 0, 0);
		}
	}
	
	/* if (id == 0)
	{
		TempColor = Lights(ray, smashPoint, objNorm, id) * TempColor;
		ray2.origin = smashPoint;
		ray2.direction = normalize(refract(ray.direction, objNorm, .3));
		
		FragColor = RayTracing(ray2, distance, id);
		
		
	} */
	/* else
		Fragolor = vec3(0, 0, 0); */
	
	else 
		TempColor = vec3(.7, 0, .7);
		//TempColor = vec3(gl_FragCoord.x, 0, gl_FragCoord.y);
		//FragColor = sphere1.color;
		FragColor = TempColor + .5 * (TempColor2);
		//FragColor = ray2.origin + ray2.direction * distance;
	
}