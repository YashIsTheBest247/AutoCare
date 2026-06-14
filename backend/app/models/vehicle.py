from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.orm import relationship

from app.database import Base


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    model = Column(String(120), nullable=False)
    type = Column(String(60), nullable=False, default="car")
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    sensor_readings = relationship(
        "SensorData", back_populates="vehicle", cascade="all, delete-orphan"
    )
    predictions = relationship(
        "Prediction", back_populates="vehicle", cascade="all, delete-orphan"
    )
    maintenance_tasks = relationship(
        "MaintenanceTask", back_populates="vehicle", cascade="all, delete-orphan"
    )
