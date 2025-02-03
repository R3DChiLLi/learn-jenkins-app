pipeline {
    agent any

    environment {
        NETLIFY_SITE_ID = '339ff62d-959d-4e7b-a397-631a4ba894db'
        NETLIFY_AUTH_TOKEN = credentials('netlify-id')
        REACT_APP_VERSION = "1.0.$BUILD_ID"
        SONAR_SCANNER_HOME = tool 'SonarQube Scanner'
        AWS_DEFAULT_REGION = 'us-east-1'
        CLUSTER_NAME = 'Jenkins-App-Prod'
        SERVICE_NAME = 'Jenkins-App-Service-Prod'
        TASK_DEFINITION = 'LearnJenkinsApp-TaskDefinition-Prod'
    }

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

        stage("Building Docker Image") {
            agent {
                docker {
                    image 'amazon/aws-cli'
                    reuseNode true
                    args "-u root -v /var/run/docker.sock:/var/run/docker.sock --entrypoint='' --network=host"
                }
            }            
            steps {
                sh '''
                amazon-linux-extras install docker
                docker build -t myjenkinsapp .
                '''
            }
        }

        stage("Deploy to AWS") {
            agent {
                docker {
                    image 'amazon/aws-cli'
                    reuseNode true
                    args "-u root --rm --entrypoint='' --network=host"
                }
            }
            steps {
                sh '''
                yum install jq -y
                REVISION_VALUE=$(aws ecs register-task-definition --cli-input-json file://aws/task-definition-Prod.json | jq '.taskDefinition.revision')
                aws ecs update-service --cluster ${CLUSTER_NAME} --service ${SERVICE_NAME} --task-definition ${TASK_DEFINITION}:$REVISION_VALUE
                aws ecs wait services-stable --cluster Jenkins-App-Prod --services Jenkins-App-Service-Prod
                '''
            }
        }

        // stage('SonarQube Analysis') {
        //     agent {
        //         docker {
        //             image 'sonarsource/sonar-scanner-cli'
        //             reuseNode true
        //         }
        //     }
        //     environment {
        //         SONAR_HOST_URL = 'http://34.229.134.34:9000'
        //         SONAR_TOKEN = credentials('sonarqube-creds')
        //     }
        //     steps {
        //         sh '''
        //         sonar-scanner \
        //         -Dsonar.projectKey=my-project \
        //         -Dsonar.sources=. \
        //         -Dsonar.host.url=$SONAR_HOST_URL \
        //         -Dsonar.login=$SONAR_TOKEN
        //         '''
        //     }
        // }



        stage('Tests')
        {
            parallel {
                stage('Unit Tests') {
                    agent {
                        docker {
                            image 'node:18-alpine'
                            reuseNode true
                        }
                    }
                    steps {
                        sh '''
                        echo "Testing Stage"
                        echo "$(pwd)"
                        test -f build/index.html
                        ls -l
                        npm test
                        '''
                    }
                    post {
                        always {
                            junit 'jest-results/junit.xml'
                        }
                    }
                }
                stage('E2E') {
                    agent {
                        docker {
                            image 'my-playwright'
                            reuseNode true
                        }
                    }
                    steps {
                        sh '''
                        serve -s build &
                        sleep 10
                        npx playwright test --reporter=html
                        '''
                    }
                    post {
                        always {
                            publishHTML([allowMissing: false, alwaysLinkToLastBuild: false, keepAll: false, reportDir: 'playwright-report', reportFiles: 'index.html', reportName: 'local Report E2E', reportTitles: '', useWrapperFileDirectly: true])
                        }
                    }
                }
            }
        }


// Testing on Staging Env and Deploying To Staging Env
        stage('Staging testing and Deploying') {
            agent {
                docker {
                    image 'my-playwright'
                    reuseNode true
                }
            }
            environment {
                CI_ENVIRONMENT_URL = 'STAGING_URL_TO_BE_SET'
            }
            steps {
                sh '''
                netlify --version
                echo "Deploying to Staging Env... Site-ID: $NETLIFY_SITE_ID"
                netlify deploy --dir=build --json > deploy-output.json
                CI_ENVIRONMENT_URL=$(node-jq -r '.deploy_url' deploy-output.json)
                npx playwright test --reporter=html
                '''
            }
            post {
                always {
                    publishHTML([allowMissing: false, alwaysLinkToLastBuild: false, keepAll: false, reportDir: 'playwright-report', reportFiles: 'index.html', reportName: 'Staging E2E Report', reportTitles: '', useWrapperFileDirectly: true])
                }
            }
        }


// Prod Environment Testing And Deploying
        stage('Prod Test And Deploy') {
            agent {
                docker {
                    image 'my-playwright'
                    reuseNode true
                }
            }
            environment {
                CI_ENVIRONMENT_URL = 'https://dulcet-banoffee-7a5dcc.netlify.app'
            }
            steps {
                sh '''
                node --version
                netlify --version
                echo "Deploying to Production... Site-ID: $NETLIFY_SITE_ID"
                netlify deploy --dir=build --prod
                npx playwright test --reporter=html
                '''
            }
            post {
                always {
                    publishHTML([allowMissing: false, alwaysLinkToLastBuild: false, keepAll: false, reportDir: 'playwright-report', reportFiles: 'index.html', reportName: 'Prod E2E Report', reportTitles: '', useWrapperFileDirectly: true])
                }
            }
        }

    }
}