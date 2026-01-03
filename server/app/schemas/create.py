from pydantic import BaseModel
from typing import List


class CreateRequest(BaseModel):
    title: str
    content: str
    tags: List[str]


class CreateResponse(BaseModel):
    id: str