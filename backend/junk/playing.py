import sqlalchemy as db

def db_create():
	return db.create_engine(url="sqlite:///dbname.db", echo = True);

def main():

    try:
        engine = db_create()	
        print("working")
    
    except Exception as e:
        print(e)

    metadata_obj = db.MetaData()
    
    profile = db.Table(
        'profile',
        metadata_obj,
        db.Column('email',db.String,primaty_key= True),
        db.Column('name',db.String),
        db.Column('contact',db.Integer),
    )
    metadata_obj.create_all(engine)

if __name__ == "__main__":
    #main()
