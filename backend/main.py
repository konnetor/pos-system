from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional, List
import jwt
import json
import bcrypt
from supabase import create_client, Client
from typing import List, Optional, Dict, Any, Union
from datetime import datetime
import os
import traceback
import logging
# FastAPI app initialization
app = FastAPI(
    title="AutoSpa API",
    description="Backend API for AutoSpa vehicle service management system",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import logging
from logging.handlers import RotatingFileHandler
import os

# Ensure the log directory exists
LOG_FILE = os.path.join(os.path.dirname(__file__), "main.log")

# Set up rotating log handler (10MB, keep 5 backups)
file_handler = RotatingFileHandler(
    LOG_FILE, maxBytes=10 * 1024 * 1024, backupCount=5
)
file_handler.setFormatter(logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
))
file_handler.setLevel(logging.DEBUG)

# Configure root logger
root_logger = logging.getLogger()
root_logger.setLevel(logging.DEBUG)
root_logger.addHandler(file_handler)

# Define and configure custom app logger
app_logger = logging.getLogger("autospa")
app_logger.setLevel(logging.DEBUG)
app_logger.addHandler(file_handler)

# Optional: redirect print() to log file
import sys
sys.stdout = open(LOG_FILE, 'a')
sys.stderr = open(LOG_FILE, 'a')

# Database configuration
DATABASE_URL = "sqlite:///./autospa.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

SUPABASE_URL = "https://uhntubkqjzoftmkknvqr.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVobnR1YmtxanpvZnRta2tudnFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzOTAxNzAsImV4cCI6MjA1Nzk2NjE3MH0.msCbxM2Zuvjb091xy435EijWPsaEb9HUt93FLEDOUo8"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy check is success", "timestamp": datetime.utcnow()}

class ProductCreate(BaseModel):
    name: str
    price: float
    code: str
    quantity: int
    discount: Optional[float] = 0
    user_type: Optional[str] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    code: Optional[str] = None
    quantity: Optional[int] = None
    discount: Optional[float] = None
    user_type: Optional[str] = None

@app.post("/api/edit_products")
async def edit_product(product: ProductUpdate):
    try:
        # Get product code from the request body
        product_code = product.code
        
        if not product_code:
            raise HTTPException(status_code=400, detail="Product code is required")
            
        # Create update data dictionary excluding None values
        update_data = {k: v for k, v in product.dict().items() if v is not None and k != 'code'}
        update_data['edited_at'] = datetime.utcnow().isoformat()

        if 'user_type' in update_data:
            update_data['edited_by'] = update_data['user_type']
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No valid update data provided")

        # Update the product in Supabase by matching product_code
        response = supabase.table('products')\
            .update(update_data)\
            .eq('code', product_code)\
            .execute()
        
        if response.data and len(response.data) > 0:
            return response.data[0]
        else:
            raise HTTPException(status_code=404, detail="Product not found")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/get_products")
async def get_products():
    try:
        # Fetch all products from Supabase
        response = supabase.table('products').select("*").execute()
        
        if response.data:
            return response.data
        else:
            return []
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/add_products")
async def add_product(product: ProductCreate):

    try:
        edited_by = 'no'
        # Insert the product into Supabase
        response = supabase.table('products').insert({
            "name": product.name,
            "price": product.price,
            "code": product.code,
            "quantity": product.quantity,
            "discount": product.discount,
            "user_type": product.user_type,
            "edited_by":edited_by,
        }).execute()
        
        # Check if the insertion was successful
        if response.data:
            return response.data[0]
        else:
            raise HTTPException(status_code=400, detail="Failed to add product")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



class ServiceCreate(BaseModel):
    name: str
    price: float
    code: str
    description: Optional[str] = None
    user_type: Optional[str] = None  # Add user_type to the model


@app.get("/api/get_services")
async def get_services():
    try:
        # Fetch all services from Supabase
        response = supabase.table('services').select("*").execute()
        
        if response.data:
            return response.data
        else:
            return []
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/add_service")
async def add_service(service: ServiceCreate):
    try:
        # Extract user_type but don't use it directly if the column doesn't exist
        user_type = service.user_type
        
        # Create base service data - excluding user_type since it's not in the table
        service_data = {
            'name': service.name,
            'price': service.price,
            'code': service.code,
            'description': service.description
        }
        
        # Add only timestamps that are confirmed to exist in your table
        current_time = datetime.utcnow().isoformat()
        service_data.update({
            'created_at': current_time,
            'updated_at': current_time
        })
        
        # Optionally add edited_by if it exists in your table
        if user_type:
            service_data['user_type'] = user_type

        # Insert the service into Supabase
        response = supabase.table('services')\
            .insert(service_data)\
            .execute()
        
        if response.data and len(response.data) > 0:
            return response.data[0]
        else:
            raise HTTPException(status_code=500, detail="Failed to add service")
            
    except Exception as e:
        # More detailed error handling
        error_message = str(e)
        print(f"Error adding service: {error_message}")
        
        if "duplicate" in error_message.lower() and "code" in error_message.lower():
            raise HTTPException(status_code=400, detail="Service code already exists")
        
        raise HTTPException(status_code=500, detail=error_message)


class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None
    user_type: Optional[str] = None
    code: str  # Added required code field

@app.get("/api/get_all_data")
async def get_all_data():
    try:
        # Fetch all products and services from Supabase
        products_response = supabase.table('products').select("*").execute()
        services_response = supabase.table('services').select("*").execute()
        
        return {
            "products": products_response.data if products_response.data else [],
            "services": services_response.data if services_response.data else []
        }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/get_summary_data")
async def get_summary_data():
    try:
        # Get current date in ISO format for comparison
        today = datetime.utcnow().date().isoformat()
        
        # Get total products and services
        products_response = supabase.table('products').select('id').execute()
        services_response = supabase.table('services').select('id').execute()
        
        # Get today's invoices
        billing_response = supabase.table('billing')\
            .select('id')\
            .gte('payment_date', today)\
            .lt('payment_date', (datetime.utcnow() + timedelta(days=1)).date().isoformat())\
            .execute()
        
        # Get low stock products (quantity < 10)
        low_stock_response = supabase.table('products')\
            .select('id')\
            .lt('quantity', 10)\
            .execute()
        
        return {
            "total_products": len(products_response.data) if products_response.data else 0,
            "total_services": len(services_response.data) if services_response.data else 0,
            "total_bills": len(billing_response.data) if billing_response.data else 0,
            "low_stock_count": len(low_stock_response.data) if low_stock_response.data else 0
        }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/edit_services")
async def edit_service(service: ServiceUpdate):
    try:
        # Get service code from the request body
        service_code = service.code
        
        if not service_code:
            raise HTTPException(status_code=400, detail="Service code is required")
            
        # Create update data dictionary excluding None values
        update_data = {k: v for k, v in service.dict().items() if v is not None and k != 'code'}
        update_data['updated_at'] = datetime.utcnow().isoformat()
        update_data['edited_at'] = datetime.utcnow().isoformat()
        
        # Set edited_by from user_type
        if 'user_type' in update_data:
            update_data['edited_by'] = update_data['user_type']
            del update_data['user_type']  # Remove user_type from update data
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No valid update data provided")

        # Update the service in Supabase by matching service_code
        response = supabase.table('services')\
            .update(update_data)\
            .eq('code', service_code)\
            .execute()
        
        if response.data and len(response.data) > 0:
            return response.data[0]
        else:
            raise HTTPException(status_code=404, detail="Service not found")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


logger = logging.getLogger("uvicorn.error")

class CustomerInfo(BaseModel):
    name: str
    mobile: str
    vehicleNumber: str
    company: str

class BillPayload(BaseModel):
    date: datetime
    customer: CustomerInfo
    discount: float
    items: list  # Each item is a dict with details such as id, type, name, code, price, quantity, discount, etc.
    paymentMethod: str
    subTotal: float
    total: float

# --- Helper Functions ---
def insert_payment_data(payload, customer_id):
    billing_data = {
        "customer_id": customer_id,
        "items": payload.items,
        "payment_method": payload.paymentMethod,
        "sub_total": payload.subTotal,
        "total": payload.total,
        "vehicle_no": payload.customer.vehicleNumber,
        "payment_date": payload.date.isoformat()
    }
    print("Inserting billing data:", billing_data)
    response = supabase.table("billing").insert(billing_data).execute()
    return response

def reduce_quantity(item):
    if item.get("id") == 0 or item.get("code") == "CUSTOM" or item.get("type", "").lower() == "service":
        print("Skipping quantity reduction for item:", item.get("name", "Unknown"), "(type:", item.get("type", "Unknown"), ")")
        return None

    try:
        product_response = supabase.table("products").select("quantity").eq("id", item["id"]).execute()

        if not product_response.data:
            print(f"Product with id {item['id']} not found in database. Skipping.")
            return None

        current_quantity = product_response.data[0]["quantity"]
        new_quantity = max(0, current_quantity - item["quantity"])

        print("Reducing product id", item["id"], "quantity from", current_quantity, "to", new_quantity)
        update_response = supabase.table("products").update({"quantity": new_quantity}).eq("id", item["id"]).execute()
        return update_response

    except Exception as e:
        print(f"Error reducing quantity for product {item.get('id')}: {str(e)}")
        return None

@app.post("/api/submit_bill")
def submit_bill(payload):
    print("=== Starting submit_bill endpoint ===")
    print(f"Received payload with {len(payload.items)} items")

    try:
        print("Step 1: Inserting customer data")
        customer_response = supabase.table("customer").insert({
            "name": payload.customer.name,
            "mobile_no": payload.customer.mobile,
            "vehicel_no": payload.customer.vehicleNumber,
            "company": payload.customer.company,
            "payment": payload.total,
            "payment_date": payload.date.isoformat()
        }).execute()

        print("Step 1 complete: Customer response data:", customer_response.data)
        if not customer_response.data:
            print("Failed to add customer - no data returned from insert operation")
            raise HTTPException(status_code=400, detail="Failed to add customer")

        customer_id = customer_response.data[0]["id"]
        print("Step 2: Preparing to insert billing data for customer_id=", customer_id)

        print("Step 3: Inserting billing data")
        billing_response = insert_payment_data(payload, customer_id)
        print("Step 3 complete: Billing response status:", 'success' if billing_response.data else 'failed')

        # print("Step 4: Beginning item processing loop")
        # for index, item in enumerate(payload.items):
        #     item_id = item.get("id")
        #     item_type = item.get("type", "").lower()
        #     item_name = item.get("name")

        #     print(f"Processing item #{index+1}: ID={item_id}, Type={item_type}, Name={item_name}")

        #     if item_type == "service":
        #         print(f"Item {item_id} is a service - skipping inventory update")
        #         continue

        #     try:
        #         print(f"Checking for product with ID={item_id} in database")
        #         product_check = supabase.table("products").select("id, quantity").eq("id", item_id).execute()
        #         if not product_check.data:
        #             print(f"⚠️ CRITICAL: Product with ID={item_id} not found in database")
        #             continue

        #         print("Product found, current quantity:", product_check.data[0].get("quantity", "unknown"))
        #         reduce_resp = reduce_quantity(item)
        #         print("Reduce quantity response:", reduce_resp)

        #     except Exception as item_error:
        #         print(f"Exception while processing item {item_id}: {str(item_error)}")

        print("=== All processing completed successfully ===")
        return {
            "customer_id": customer_id,
            "billing_id": billing_response.data[0]["id"] if billing_response.data else None,
            "message": "Customer, billing data inserted and product quantities updated successfully."
        }

    except HTTPException as http_ex:
        print(f"HTTPException in submit_bill: {http_ex.detail}")
        raise http_ex
    except Exception as e:
        print(f"Unhandled exception in submit_bill: {str(e)}")
        raise HTTPException(status_code=500, detail="An error occurred while processing your request")