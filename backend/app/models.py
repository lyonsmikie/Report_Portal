# models.py
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from .database import Base

# class Site(Base):
#     __tablename__ = "sites"
#     id = Column(Integer, primary_key=True, index=True)
#     name = Column(String, unique=True, index=True)
#     users = relationship("User", back_populates="site")

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    site_name = Column(String, nullable=False)  

class Report(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True, index=True)
    site_name = Column(String, nullable=False)   # changed from site_id
    category = Column(String, nullable=False)
    file_name = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    date = Column(DateTime, nullable=False)
