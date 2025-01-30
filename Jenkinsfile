pipeline {
    agent any

    environment {
        NETLIFY_SITE_ID = '339ff62d-959d-4e7b-a397-631a4ba894db'
        NETLIFY_AUTH_TOKEN = credentials('netlify-id')
        REACT_APP_VERSION = "1.0.$BUILD_ID"
    }

    stages {
        stage("AWS") {
            agent {
                docker {
                    image 'amazon/aws-cli'
                    // Fix 1: Correctly format Docker arguments (split flags properly)
                    // Fix 2: Add --network=host to access EC2 metadata service
                    args "--rm --entrypoint= --network=host"
                }
            }
            steps {
                // Fix 3: Remove 'aws' prefix since we override the entrypoint
                sh 'aws s3 ls'
            }
        }
        
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
