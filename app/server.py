# run command:
# uvicorn app.server:app --reload
import math

import joblib
import numpy as np
import onnxruntime as ort
from fastapi import FastAPI
from geopy.geocoders import Nominatim
from pydantic import BaseModel
from starlette.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

ort_session = ort.InferenceSession("app/my_model.onnx")

f_scaler = joblib.load('app/feature_scaler.joblib')
p_scaler = joblib.load('app/price_scaler.joblib')

geolocator = Nominatim(user_agent='ontariotechu')


# Define input schema
class InputData(BaseModel):
    num_bed: int
    num_bath: int
    acre_lot: float
    house_size: float
    address: str
    city: str
    state: str
    zip_code: str


def convert_to_cartesian(lat, lon):
    lat_rad = math.radians(lat)
    lon_rad = math.radians(lon)
    x = math.cos(lat_rad) * math.cos(lon_rad)
    y = math.cos(lat_rad) * math.sin(lon_rad)
    z = math.sin(lat_rad)
    return x, y, z


def get_coordinates(location):
    try:
        loc = geolocator.geocode(location.split(',')[-1].strip()) # try with only the zip code
        if loc:
            return convert_to_cartesian(loc.latitude, loc.longitude)
        else:
            loc = geolocator.geocode(location)
            if loc:
                return convert_to_cartesian(loc.latitude, loc.longitude)
            else:
                return None, None, None
    except Exception as e:
        return None, None, None


@app.get("/")
def read_root():
    return {"message": "Welcome to the MLP Model API for predicting housing prices"}


@app.post("/predict")
def predict(data: InputData):
    location = f'{data.address}, {data.city}, {data.state}, {data.zip_code}'
    loc_x, loc_y, loc_z = get_coordinates(location)

    if loc_x and loc_y and loc_z:
        raw_inputs = np.array([data.num_bed, data.num_bath, data.acre_lot, data.house_size])
        norm_inputs = f_scaler.transform([raw_inputs])
        input_data = np.append(norm_inputs, [loc_x, loc_y, loc_z])
        outputs = ort_session.run(None, {"input": np.expand_dims(input_data, axis=0).astype(np.float32)})
        norm_price = outputs[0][0].item()
        original_price = p_scaler.inverse_transform(np.array([[norm_price]]))[0][0]
        return {"price": round(original_price), "prediction": norm_price}
    else:
        return {"error": "cannot find location"}
