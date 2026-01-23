from sqlalchemy import create_engine , Column , Integer , String
from sqlalchemy.ext.declarative import declarative_base 
from sqlalchemy.orm import sessionmaker


Base = declarative_base()

class User(Base):
	__tablename__ = "users"

	id = Column(Integer, primary_key = True)
	username = Column(String(20), unique = True, nullable = False)
	password = Column(String, nullable = False)
	email = Column(String(50), unique = True, nullable = False)

class Contract(Base):
	__tablename__ = "contracts"

	id = Column(Integer, primary_key = True)
	legal_id = Column(Integer, unique = True, nullable = False)
	name = Column(String, nullable = False)
	description = Column(String, nullable = False)

engine = create_engine("sqlite:///db/app.db", echo = True)

sessionMaker = sessionmaker(bind=engine, autoflush= False, autocommit= False, future= True) 
# cream sessionMaker aici ca sa nu initializam unul de fiecare data doar sesiuni

Base.metadata.create_all(engine) 

