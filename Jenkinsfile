pipeline {
    agent any

    stages {
        stage('w/o docker') {
            steps {
                sh 'echo "Without docker"'
                sh '''
                touch file1.txt
                '''
            }
        }
    }
}
