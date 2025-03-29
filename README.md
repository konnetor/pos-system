# AutoSpa POS System

A comprehensive Point of Sale (POS) system designed for vehicle service management, built with FastAPI backend and React frontend.

## Technology Stack

### Backend
- **FastAPI**: High-performance web framework for building APIs with Python
- **Supabase**: Open source Firebase alternative for database management
- **Uvicorn**: ASGI server implementation
- **Python 3.x**

### Frontend
- **React**: UI library
- **Vite**: Next generation frontend tooling
- **TypeScript**: Typed JavaScript
- **TailwindCSS**: Utility-first CSS framework

### CI/CD
- **Jenkins**: Automation server for building, testing, and deploying

## Prerequisites

- Python 3.x
- Node.js and npm
- Jenkins (for deployment)
- Supabase account and project setup

## Configuration

### Backend Configuration

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure environment variables:
   - Set up Supabase credentials in `main.py`:
     ```python
     SUPABASE_URL = "your-supabase-url"
     SUPABASE_KEY = "your-supabase-key"
     ```

### Frontend Configuration

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure API endpoint:
   - Update `src/config/api.ts` with your backend URL

## Running the Application

### Development Mode

1. Start the backend server:
   ```bash
   cd backend
   python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```

2. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

### Production Deployment

The application uses Jenkins for automated deployment. The Jenkinsfile includes:

1. Building frontend assets
2. Installing backend dependencies
3. Deploying to production server

## API Endpoints

### Products
- `GET /api/get_products`: Retrieve all products
- `POST /api/add_products`: Add new product
- `POST /api/edit_products`: Update existing product

### Services
- `GET /api/get_services`: Retrieve all services
- `POST /api/add_service`: Add new service

## Important Considerations

### Security
1. The application uses CORS middleware - configure allowed origins in production
2. Secure Supabase credentials in production environment
3. Implement proper authentication for API endpoints

### Database
1. Uses Supabase as the primary database
2. Includes tables for products and services
3. Implements proper data validation and error handling

### Deployment
1. Configure Jenkins pipeline according to your infrastructure
2. Set up proper environment variables in production
3. Implement proper logging and monitoring

### Performance
1. Backend uses FastAPI for high performance
2. Frontend built with Vite for optimal development experience
3. Implements proper error handling and loading states

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.