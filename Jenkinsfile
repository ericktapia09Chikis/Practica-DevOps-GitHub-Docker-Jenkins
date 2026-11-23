pipeline {
    agent any

    stages {
        stage('1. Obtener Codigo (GitHub)') {
            steps {
                git branch: 'main', url: 'https://github.com/ericktapia09Chikis/Practica-DevOps-GitHub-Docker-Jenkins.git'
            }
        }
        stage('2. Ejecutar Pruebas') {
            steps {
                sh 'npm install'
                sh 'npm test'
            }
        }
        stage('3. Construir Imagen Docker') {
            steps {
                sh 'docker build -t app-devops-utfv:latest .'
            }
        }
        stage('4. Desplegar Contenedor') {
            steps {
                sh 'docker rm -f contenedor-devops contenedor-pipeline || true'
                sh 'docker run -d -p 3000:3000 --name contenedor-pipeline app-devops-utfv:latest'
            }
        }
    }
}
