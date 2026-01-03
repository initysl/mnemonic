from app.core.database  import engine, Base
from sqlalchemy import text, inspect

def check_database():
    print("🔍 Checking database setup...\n")
    
    # 1. Test connection
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            version = result.fetchone()[0] # type: ignore
            print(f"✓ Database connected: {version[:50]}...\n")
    except Exception as e:
        print(f"❌ Connection failed: {e}\n")
        return
    
    # 2. Check if pgvector extension exists
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT * FROM pg_extension WHERE extname = 'vector'"))
            if result.fetchone():
                print("✓ pgvector extension installed\n")
            else:
                print("❌ pgvector extension NOT installed")
                print("   Run: CREATE EXTENSION vector;\n")
    except Exception as e:
        print(f"⚠️  Could not check pgvector: {e}\n")
    
    # 3. Check if notes table exists
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    
    if 'notes' in tables:
        print("✓ 'notes' table exists\n")
        
        # Check columns
        columns = inspector.get_columns('notes')
        print("Columns in 'notes' table:")
        for col in columns:
            print(f"  - {col['name']}: {col['type']}")
    else:
        print("❌ 'notes' table does NOT exist")
        print("   Creating tables now...\n")
        try:
            Base.metadata.create_all(bind=engine)
            print("✓ Tables created successfully!\n")
        except Exception as e:
            print(f"❌ Failed to create tables: {e}\n")
    
    # 4. Test insert
    try:
        with engine.connect() as conn:
            result = conn.execute(text("""
                INSERT INTO notes (title, content, tags) 
                VALUES ('Test', 'Content', ARRAY['tag1'])
                RETURNING id
            """))
            conn.commit()
            note_id = result.fetchone()[0] # type: ignore
            print(f"✓ Test insert successful: {note_id}\n")
            
            # Clean up
            conn.execute(text(f"DELETE FROM notes WHERE id = '{note_id}'"))
            conn.commit()
    except Exception as e:
        print(f"❌ Test insert failed: {e}\n")

if __name__ == "__main__":
    check_database()