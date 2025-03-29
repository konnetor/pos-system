pipeline {
    agent any

    environment {
        FRONTEND_DIR = 'frontend'
        BACKEND_DIR = 'backend'
    }

    stages {
        stage('Build Frontend') {
            steps {
                dir("${FRONTEND_DIR}") {
                    sh '''
                    npm install
                    npm run build
                    '''
                }
            }
        }

        stage('Build Backend') {
            steps {
                dir("${BACKEND_DIR}") {
                    sh 'pip3 install --user -r requirements.txt'
                }
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                ssh -o StrictHostKeyChecking=no root@172.245.95.218 '
                cd /var/www/pos-system || git clone https://github.com/konnetor/pos-system.git /var/www/pos-system;
                cd /var/www/pos-system;
                git pull;
                fuser -k 8000/tcp || true;
                fuser -k 3000/tcp || true;

                cd backend
                pip3 install --user -r requirements.txt
                nohup python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload > ../backend.log 2>&1 &

                cd ../frontend
                npm install
                nohup npx vite --host --port 3000 > ../frontend.log 2>&1 &
                '
                '''
            }
        }

    }
}
