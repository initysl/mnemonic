from typing import Dict, List, Optional
from pydantic import BaseModel


class QueryRequest(BaseModel):
    query_text: str
    top_k: int = 5


class QueryResult(BaseModel):
    id: str
    query_text: Optional[str]
    metadata: Dict


class QueryResponse(BaseModel):
    results: List[QueryResult]