from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, Sequence, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class UserSimilarity(Base):
    __tablename__ = "user_similarity"

    similarity_id = Column(Integer, Sequence("similarity_id_seq"), primary_key=True)
    user_id_1 = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    user_id_2 = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    similarity_score = Column(Float, default=0.0)
    last_updated = Column(DateTime, default=func.current_timestamp())
    
    # Relationships
    user1 = relationship("User", foreign_keys=[user_id_1])
    user2 = relationship("User", foreign_keys=[user_id_2])
    
    # Indexes for faster lookups
    __table_args__ = (
        Index('idx_user_sim_users', user_id_1, user_id_2, unique=True),
        Index('idx_user_sim_score', similarity_score.desc()),
    )