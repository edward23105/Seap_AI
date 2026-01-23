from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class AuthRequest(BaseModel):
	username: str 
	email: str
	password : str
	type : int # if 1 create a new account , if 0 login

from pydantic import BaseModel
from typing import Optional, Literal

class DataRequest(BaseModel):
    cpv: Optional[str] = None          # CPV code
    minvalue: Optional[float] = None   # minimum estimated value
    maxvalue: Optional[float] = None   # maximum estimated value
    keywords: Optional[str] = None     # free-text search
    date: Optional[str] = None         # you can use "YYYY-MM-DD" (or adapt)
    size: int = 10                     # how many results
    sort_by: Optional[str] = None      # ES field to sort by
    order: Literal["asc", "desc"] = "asc"  # sort direction


# Expecting shape { deals: [{title, description, savings, authority, value, deadlineDays, cpv}] }
class DataFormat(BaseModel):
	title : str
	description : str
	savings : Optional[float] = None 
	authority : str
	value : Optional[float] = None
#	deadlineDays : Optional[int] = None
	cpv : Optional[str] = None
	lots : List = None

class Lot(BaseModel):
	description: str
	value: Optional[float] = None

class DataSend(BaseModel):
	deals : List[DataFormat]

class ToSum(BaseModel): # data to summarize
	title : str
	description : str
