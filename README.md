Esta documentación explica cada uno de los pasos base para crear una aplicación nodejs, luego crear una imagen (DockerFile ) para contenerizar dicha App en un pequeño cluster de kubernetes con minikube. 
---
Prerequisitos
- Nodejs: Instalar Nodejs con gestor de paquetes
- Docker: Instalar Docker
- Minikube: Instalar Minikube
- Kubectl: (al instalar Minikube deberia instalarse automaticamente) , si no kubectl
---

Creando nuestra App NodeJS

- [ ] Crear la App Nodejs
```
$ mkdir poc_nodejs_minikube
$ npm init
This utility will walk you through creating a package.json file.
It only covers the most common items, and tries to guess sensible defaults.

See `npm help json` for definitive documentation on these fields
and exactly what they do.

Use `npm install <pkg>` afterwards to install a package and
save it as a dependency in the package.json file.

Press ^C at any time to quit.
package name: (poc_nodejs_minikube) 
version: (1.0.0) 
description: nodeJS with Minikube 
entry point: (index.js) 
test command: 
git repository: (https://github.com/rafarngt/poc_nodejs_minikube.git) 
keywords: 
author: Rafael Noriega
license: (ISC) 
About to write to /media/rafaelnoriega/Users/Rafael/Documents/Learning/poc_nodejs_minikube/package.json:

{
  "name": "poc_nodejs_minikube",
  "version": "1.0.0",
  "description": "nodeJS with Minikube ",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/rafarngt/poc_nodejs_minikube.git"
  },
  "author": "Rafael Noriega",
  "license": "ISC",
  "bugs": {
    "url": "https://github.com/rafarngt/poc_nodejs_minikube/issues"
  },
  "homepage": "https://github.com/rafarngt/poc_nodejs_minikube#readme"
}
```

- [ ] Instalar Express. Express es un Framework para contruir aplicaciones web y Apis en nodejs.

```
$ npm install express --save
```

- [ ] Crear nuestro index.js:  basados en la configuracion del primer paso, debemos tener un index.js como archivo inicial. a efectos practico de este documento vamos a realizar una api basico ("Hello world").

	- Crear archivo con editor de notas o vi o nano. y debe estar situado en la misma carpeta. 
```
const express = require("express");
const app = express();

app.listen(3000, function () {
    console.log("listening on 3000");
});

app.get("/", (req, res) => {
    res.send("Hello world");
});

app.get("/delete", (req, res) => {
    res.send("Delete");
});

app.get("/update", (req, res) => {
    res.send("Update");
});

app.get("/insert", (req, res) => {
    res.send("Insert");
});
```

- [ ] Ejecutar la aplicación

```
node index.js
```
	Resumen:  En estos simples pasos se ha creado una aplicacion en nodejs, ademas se instala Express como framework de desarrollo para la aplicación. 
---
"Dokerinzado" si es que se dice, la Aplicación NodeJS

- [ ] Crear .Dockerfile: se debe crear un docker file para crear nuestra imagen para la aplicacion en docker.

```
FROM node:12 
# Create app directory 
WORKDIR /app 
# Install app dependencies 
# A wildcard is used to ensure both package.json AND package-lock.json are copied 
# where available (npm@5+) 
COPY package.json /app 
RUN npm install 
# If you are building your code for production 
# RUN npm ci --only=production 
# Bundle app source 
COPY . /app
EXPOSE 3000 
CMD [ "node", "index.js" ]
```

	- FROM: Imagen con la que vamos crear el contenedor, en nuestro caso Nodejs en su version 12. 
	- WORDIR:  nuestro directorio de trabajo dentro de nuestra imagen docker.  en nuestro ejemplo es /app
	- COPY: Instrucción de Docker para copiar, en nuestro caso estamos copiando el archivo package.json a la carpeta /app
	- RUN: Instrucción de Docker para ejecutar comandos bash. siguiendo nuestro ejemplo, le decirmos que instale las dependencias de docker npm install
	- COPY: copiamos el contenido (index.js) a la carpeta /app
	- EXPOSE: puerto al que vamos a exponer nuestro aplicativo. (nota: debemos recordarlo para configuraciones en siguientes pasos)
	- CMD: comando para ejecutar nuestra aplicación.  

- [ ] Construir Imagen Docker.:  este comando se utiliza para crear una imagen según las instrucciones dadas en el paso anterior. con -t etiquetamos la imagen con el nombre dado img-nodejs-minikube

```
$ docker build -t img-nodejs-minikube .
```

- [ ] Verificar imagen. (Opcional)

```
$ docker images
```
	Resultado: 

- [ ] Probar nuestra Imagen Nodejs. (Opcional)
	en este paso verificamos que nuestra imagen funciona correctamente. 
```
$ docker run -d --name custom-server-nodejs-minikube -p 3000:3000 img-nodejs-minikube
```
	Parámetros:
	- -d: le indicamos al contener que se ejecute en segundo plano. 
	- --name: (opcional) este es el nombre personalizado a nuestro contenedor en la ejecución. 
	- -p: se utiliza para definir los puertos en el que se ejecuta la imagen. [puerto_contenedor]:[puerto_del_host]
	- [nombre_imagen]: por ultimo especificamos el nombre de la imagen que vamos a ejecutar. img-nodejs-minikube
- [ ] verificar Ejecución de Imagen
```
$ docker ps 
```
	
	Resultado 

ejecución del contenedor. 


ejecución del contenedor en el navegador.

Tips: Si deseas eliminar todos los contenedores que tienes en ejecución: 
```
docker rm -f $(docker ps -aq)
```

---
Cargar Imagen Docker en Docker Hub. 

- [ ] Crear Cuenta en Docker Hub y Crear Repositorio (Seguir estos pasos link) 
- [ ] Loguearte en el Terminal
```
$ docker login docker.io
```
- [ ] Crear Tag de la Imagen
```
$ docker tag img-nodejs-minikube rafarngt/img-nodejs-minikube:v.0.1
```
- [ ] Subir Imagen
```
$ docker push rafarngt/img-nodejs-minikube:v.0.1
```

---

Kubernetes con Minikube

- [ ] Instalar Minikube (link)
- [ ] Iniciar minikube. (el siguiente comando hace inicial un cluster de kubernetes con minikube)
```
minikube start
```
- [ ] Crear Deployment 
	Nota: Se utiliza YAML para crear las configuraciones de kubernetes. 
```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nodejs-minikube
spec:
  selector:
    matchLabels:
      app: nodejs
  replicas: 2
  template:
    metadata:
      labels:
        app: nodejs
    spec:
      containers:
        - name: nodejs-minikube
          image: rafarngt/img-nodejs-minikube:v.0.1
          ports:
          - containerPort: 3000
```
	- apiVersion: version de la api que se esta utilizando para crear objeto en kubernetes
	- kind: Tipo de Objecto. en este caso un Deployment
	- metadata: son utilizados para organizar los objectos 
	- spec:se usa para definir la especificacion del objeto. 
		- selector: define como el Deployment encuentra que pods debe administrar
		- replicas: cantidad de pods a implementar en el cluster basado en este deployment
		- template: 
			- labels: identificado del pod
		- spec: define especificacion de como se crean los contenedores
			- containers: 
				- name: nombre contenedor
				- imagen: iamgen contenedor
				- port
					- puertos
- [ ] Crear Deployments en el  Cluster
```
$ kubectl create -f ./minikube/deployment.yaml
```
	- -f: representa la ruta en donde se encuentra el archivo deployment.yaml
- [ ] Verificar Deployments
```
$ kubectl get deploy,po
```
Resultado


---
- [ ] Opcional si deseamos exponer a fuera del cluster
- [ ] Crear Servicio
```
kubectl expose deployment nodejs-minikube --type="LoadBalancer"
```
	El flag --type=LoadBalancer indica que se quiere exponer el Service fuera del clúster.
- [ ] Revisar Servicios
```
$ kubectl get svc
```
Resultado



Nota. Para la primera Configuración de Minikube es posible que en EXTERNAL-IP no se asigne una IP. para resolver esto. debemos realizar los siguientes pasos: 
- [ ] Uso de MetalLB en su entorno Minikube ( Ver documentacion)
	- [ ] MetalLB es una implementación de equilibrador ideal recomendado para Minikube, en caso de estar en alguna nube (AWS, GOOGLE, etc) es posible que esto no sea necesario 
```
kubectl apply -f https://raw.githubusercontent.com/google/metallb/v0.9.3/manifests/namespace.yaml

kubectl apply -f https://raw.githubusercontent.com/google/metallb/v0.9.3/manifests/metallb.yaml # On the first install only

kubectl create secret generic -n metallb-system memberlist --from-literal=secretkey="$(openssl rand -base64 128)"
```
- [ ] Descubril mi Ip en Minikube
```
$ minikube ip
```
Resultado}



- [ ] Crear configmap.yaml 
```
apiVersion: v1
kind: ConfigMap
metadata:
  namespace: metallb-system
  name: config
data:
  config: |
    address-pools:
    - name: default
      protocol: layer2
      addresses:
      - 192.168.99.90-192.168.99.150
```
- [ ] Implementar configmap.yaml
```
kubectl create -f ./minikube/configmap.yaml
```
- [ ] revisar los servicios
```
kubectl get services
```




---
Consideraciones:
- Minikube es excelente alternativa para aprender kubernetes de forma onpremise. 
- el Sistema Operativo en donde se realiza esta documentacion es Ubunto 20.04
- En windows que realizar un par de pasos adicionales para habilitar Hiper-V y poder intalar minikube. 
- Repositorio: 
