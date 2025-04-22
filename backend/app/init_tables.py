from sqlalchemy import text
from app.core.database import engine, Base

# import all models to register them with Base.metadata
from app.models.user import User
from app.models.recipe import Recipe
from app.models.ingredient import Ingredient, RecipeIngredient
from app.models.category import Category, recipe_categories
from app.models.favorite import Favorite
from app.models.review import Review

def init_db():
    # Create all tables
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    # Create sequences explicitly for Oracle
    with engine.connect() as conn:
        print("Creating sequences...")
        
        # Check if USER_ID_SEQ exists and create it if not
        conn.execute(text("""
        DECLARE
            v_count NUMBER;
        BEGIN
            SELECT COUNT(*) INTO v_count FROM user_sequences WHERE sequence_name = 'USER_ID_SEQ';
            IF v_count = 0 THEN
                EXECUTE IMMEDIATE 'CREATE SEQUENCE USER_ID_SEQ START WITH 1 INCREMENT BY 1 NOCACHE';
            END IF;
        END;
        """))
        
        # Check if INGREDIENT_ID_SEQ exists and create it if not
        conn.execute(text("""
        DECLARE
            v_count NUMBER;
        BEGIN
            SELECT COUNT(*) INTO v_count FROM user_sequences WHERE sequence_name = 'INGREDIENT_ID_SEQ';
            IF v_count = 0 THEN
                EXECUTE IMMEDIATE 'CREATE SEQUENCE INGREDIENT_ID_SEQ START WITH 1 INCREMENT BY 1 NOCACHE';
            END IF;
        END;
        """))
        
        # Check if CATEGORY_ID_SEQ exists and create it if not
        conn.execute(text("""
        DECLARE
            v_count NUMBER;
        BEGIN
            SELECT COUNT(*) INTO v_count FROM user_sequences WHERE sequence_name = 'CATEGORY_ID_SEQ';
            IF v_count = 0 THEN
                EXECUTE IMMEDIATE 'CREATE SEQUENCE CATEGORY_ID_SEQ START WITH 1 INCREMENT BY 1 NOCACHE';
            END IF;
        END;
        """))
        
        # Check if REVIEW_ID_SEQ exists and create it if not
        conn.execute(text("""
        DECLARE
            v_count NUMBER;
        BEGIN
            SELECT COUNT(*) INTO v_count FROM user_sequences WHERE sequence_name = 'REVIEW_ID_SEQ';
            IF v_count = 0 THEN
                EXECUTE IMMEDIATE 'CREATE SEQUENCE REVIEW_ID_SEQ START WITH 1 INCREMENT BY 1 NOCACHE';
            END IF;
        END;
        """))
        
        # Alter the prep_time and cook_time columns to increase their size from 30 to 40
        try:
            print("Altering prep_time and cook_time columns to increase size to 40 characters...")
            conn.execute(text("ALTER TABLE recipes MODIFY (prep_time VARCHAR2(40), cook_time VARCHAR2(40))"))
            print("Columns altered successfully.")
        except Exception as e:
            print(f"Error altering columns: {e}")
            # Continue execution even if this fails
        
        conn.commit()
    
    # Verify tables were created
    with engine.connect() as conn:
        # Get a list of all tables in the schema
        result = conn.execute(text(
            "SELECT table_name FROM user_tables"
        ))
        tables = [row[0] for row in result]
        
        print("Created tables:")
        for table in tables:
            print(f"- {table}")
            
        # List created sequences
        result = conn.execute(text(
            "SELECT sequence_name FROM user_sequences"
        ))
        sequences = [row[0] for row in result]
        
        print("Created sequences:")
        for sequence in sequences:
            print(f"- {sequence}")
            
    print("Database initialization complete!")

def reset_db():
    print("Dropping all tables...")
    Base.metadata.drop_all(bind=engine)
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    # Re-create sequences after reset
    with engine.connect() as conn:
        print("Re-creating sequences...")
        
        # Drop and recreate USER_ID_SEQ
        conn.execute(text("""
        DECLARE
            v_count NUMBER;
        BEGIN
            SELECT COUNT(*) INTO v_count FROM user_sequences WHERE sequence_name = 'USER_ID_SEQ';
            IF v_count > 0 THEN
                EXECUTE IMMEDIATE 'DROP SEQUENCE USER_ID_SEQ';
            END IF;
            EXECUTE IMMEDIATE 'CREATE SEQUENCE USER_ID_SEQ START WITH 1 INCREMENT BY 1 NOCACHE';
        END;
        """))
        
        # Drop and recreate INGREDIENT_ID_SEQ
        conn.execute(text("""
        DECLARE
            v_count NUMBER;
        BEGIN
            SELECT COUNT(*) INTO v_count FROM user_sequences WHERE sequence_name = 'INGREDIENT_ID_SEQ';
            IF v_count > 0 THEN
                EXECUTE IMMEDIATE 'DROP SEQUENCE INGREDIENT_ID_SEQ';
            END IF;
            EXECUTE IMMEDIATE 'CREATE SEQUENCE INGREDIENT_ID_SEQ START WITH 1 INCREMENT BY 1 NOCACHE';
        END;
        """))
        
        # Drop and recreate CATEGORY_ID_SEQ
        conn.execute(text("""
        DECLARE
            v_count NUMBER;
        BEGIN
            SELECT COUNT(*) INTO v_count FROM user_sequences WHERE sequence_name = 'CATEGORY_ID_SEQ';
            IF v_count > 0 THEN
                EXECUTE IMMEDIATE 'DROP SEQUENCE CATEGORY_ID_SEQ';
            END IF;
            EXECUTE IMMEDIATE 'CREATE SEQUENCE CATEGORY_ID_SEQ START WITH 1 INCREMENT BY 1 NOCACHE';
        END;
        """))
        
        # Drop and recreate REVIEW_ID_SEQ
        conn.execute(text("""
        DECLARE
            v_count NUMBER;
        BEGIN
            SELECT COUNT(*) INTO v_count FROM user_sequences WHERE sequence_name = 'REVIEW_ID_SEQ';
            IF v_count > 0 THEN
                EXECUTE IMMEDIATE 'DROP SEQUENCE REVIEW_ID_SEQ';
            END IF;
            EXECUTE IMMEDIATE 'CREATE SEQUENCE REVIEW_ID_SEQ START WITH 1 INCREMENT BY 1 NOCACHE';
        END;
        """))
        
        conn.commit()
        
        # Ensure prep_time and cook_time columns have the correct size
        try:
            print("Setting prep_time and cook_time columns to 40 characters...")
            conn.execute(text("ALTER TABLE recipes MODIFY (prep_time VARCHAR2(40), cook_time VARCHAR2(40))"))
            print("Columns set successfully.")
        except Exception as e:
            print(f"Error setting column sizes: {e}")
            # Continue execution even if this fails
        
    print("Database reset complete!")

if __name__ == "__main__":
    #reset_db()
    init_db()