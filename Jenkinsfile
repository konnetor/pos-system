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
                # Force remove with sudo if needed
                echo "Removing old directory..."
                rm -rf /var/www/pos-system || true
                
                # Make sure the directory is gone
                if [ -d "/var/www/pos-system" ]; then
                    echo "Directory still exists, using stronger command..."
                    find /var/www/pos-system -type f -delete
                    find /var/www/pos-system -type d -delete
                    rm -rf /var/www/pos-system
                fi
                
                echo "Cloning fresh repository..."
                git clone https://github.com/konnetor/pos-system.git /var/www/pos-system
                
                # Kill existing processes
                echo "Stopping existing processes..."
                fuser -k 8000/tcp || true
                fuser -k 3000/tcp || true
                
                # Verify backend directory exists
                if [ ! -d "/var/www/pos-system/backend" ]; then
                    echo "ERROR: Backend directory not found. Repository structure may be incorrect."
                    ls -la /var/www/pos-system
                    exit 1
                fi
                
                # Start backend
                echo "Setting up backend..."
                cd /var/www/pos-system/backend
                pip3 install --user -r requirements.txt
                nohup python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload > ../backend.log 2>&1 &
                
                # Verify frontend directory exists
                if [ ! -d "/var/www/pos-system/frontend" ]; then
                    echo "ERROR: Frontend directory not found. Repository structure may be incorrect."
                    ls -la /var/www/pos-system
                    exit 1
                fi
                
                # Build frontend
                echo "Setting up frontend..."
                cd /var/www/pos-system/frontend
                rm -rf node_modules package-lock.json || true
                npm install
                npm run build
                nohup npx vite --host --port 3000 > ../frontend.log 2>&1 &
                '
                '''
            }
        }
    }
}