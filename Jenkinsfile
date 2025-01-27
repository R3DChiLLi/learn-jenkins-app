pipeline {
    agent any

    stages {
        stage('Build') {
            agent {
                docker {
                    image 'node:18-alpine'
                    reuseNode true
                }
            }
            steps {
                sh '''
                ls -la
                node --version
                npm --version
                npm ci
                npm run build
                ls -la
                '''
            }
        }
        stage('Test') {
            steps {
                sh '''
                echo "Test Stage"
                echo "$(pwd)"
                test -f jenkins-app/build/index.html
                ls -l
                '''
            }
        }        
    }
}
