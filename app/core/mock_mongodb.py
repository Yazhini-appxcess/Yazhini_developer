import os
import json
import asyncio
import copy
from datetime import datetime
from bson import ObjectId
from loguru import logger

# Directory to save database collections as JSON files
MOCK_DB_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "data",
    "mock_db"
)

# Helper serialization functions
def serialize_doc(doc):
    if isinstance(doc, dict):
        return {k: serialize_doc(v) for k, v in doc.items()}
    elif isinstance(doc, list):
        return [serialize_doc(v) for v in doc]
    elif isinstance(doc, datetime):
        return {"$date": doc.isoformat()}
    elif isinstance(doc, ObjectId):
        return {"$oid": str(doc)}
    return doc

def deserialize_doc(doc):
    if isinstance(doc, dict):
        if "$date" in doc:
            return datetime.fromisoformat(doc["$date"])
        if "$oid" in doc:
            try:
                return ObjectId(doc["$oid"])
            except Exception:
                return doc["$oid"]
        return {k: deserialize_doc(v) for k, v in doc.items()}
    elif isinstance(doc, list):
        return [deserialize_doc(v) for v in doc]
    return doc

# Collection Locks to prevent concurrent write issues
_collection_locks = {}

def get_collection_lock(col_name):
    if col_name not in _collection_locks:
        _collection_locks[col_name] = asyncio.Lock()
    return _collection_locks[col_name]

def _load_collection(col_name) -> list:
    os.makedirs(MOCK_DB_DIR, exist_ok=True)
    file_path = os.path.join(MOCK_DB_DIR, f"{col_name}.json")
    if not os.path.exists(file_path):
        return []
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            return deserialize_doc(data)
    except Exception as e:
        logger.error(f"Error loading mock collection {col_name}: {e}")
        return []

def _save_collection(col_name, docs):
    os.makedirs(MOCK_DB_DIR, exist_ok=True)
    file_path = os.path.join(MOCK_DB_DIR, f"{col_name}.json")
    try:
        serialized = serialize_doc(docs)
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(serialized, f, indent=2, ensure_ascii=False)
    except Exception as e:
        logger.error(f"Error saving mock collection {col_name}: {e}")

def match_query(doc, query):
    if not query:
        return True
    for key, value in query.items():
        if key == "$or":
            if not isinstance(value, list):
                return False
            if not any(match_query(doc, subquery) for subquery in value):
                return False
            continue
        
        # Nested field lookup (e.g. "messages.timestamp")
        parts = key.split(".")
        doc_val = doc
        for part in parts:
            if isinstance(doc_val, dict):
                doc_val = doc_val.get(part)
            elif isinstance(doc_val, list):
                list_match = False
                for item in doc_val:
                    # check if this item or its subfields match
                    sub_val = item
                    sub_parts = parts[parts.index(part)+1:]
                    for sub_part in sub_parts:
                        if isinstance(sub_val, dict):
                            sub_val = sub_val.get(sub_part)
                        else:
                            sub_val = None
                            break
                    if match_value(sub_val, value):
                        list_match = True
                        break
                if list_match:
                    doc_val = value  # mock it matching so the outer check passes
                    break
                else:
                    return False
            else:
                doc_val = None
                break
        
        if not match_value(doc_val, value):
            return False
    return True

def match_value(doc_val, query_val):
    if isinstance(query_val, dict):
        for op, val in query_val.items():
            if op == "$ne":
                if doc_val == val:
                    return False
            elif op == "$gte":
                if doc_val is None or doc_val < val:
                    return False
            elif op == "$lte":
                if doc_val is None or doc_val > val:
                    return False
            elif op == "$gt":
                if doc_val is None or doc_val <= val:
                    return False
            elif op == "$lt":
                if doc_val is None or doc_val >= val:
                    return False
            elif op == "$in":
                if not isinstance(val, (list, tuple, set, dict)):
                    return False
                if isinstance(doc_val, list):
                    if not any(x in val for x in doc_val):
                        return False
                else:
                    if doc_val not in val:
                        return False
        return True
    return doc_val == query_val

def update_doc(doc, update):
    modified = False
    if "$set" in update:
        for k, v in update["$set"].items():
            parts = k.split(".")
            target = doc
            for part in parts[:-1]:
                if part not in target or not isinstance(target[part], dict):
                    target[part] = {}
                target = target[part]
            if target.get(parts[-1]) != v:
                target[parts[-1]] = copy.deepcopy(v)
                modified = True
    if "$push" in update:
        for k, v in update["$push"].items():
            parts = k.split(".")
            target = doc
            for part in parts[:-1]:
                if part not in target or not isinstance(target[part], dict):
                    target[part] = {}
                target = target[part]
            if parts[-1] not in target or not isinstance(target[parts[-1]], list):
                target[parts[-1]] = []
            
            # Handle $each modifier in push if any
            if isinstance(v, dict) and "$each" in v:
                for item in v["$each"]:
                    target[parts[-1]].append(copy.deepcopy(item))
                modified = True
            else:
                target[parts[-1]].append(copy.deepcopy(v))
                modified = True
    return modified

def resolve_val(doc, expr):
    if isinstance(expr, str) and expr.startswith("$"):
        field = expr[1:]
        return doc.get(field)
    elif isinstance(expr, dict):
        if "$dateToString" in expr:
            date_expr = expr["$dateToString"]
            date_val = resolve_val(doc, date_expr["date"])
            fmt = date_expr["format"]
            if isinstance(date_val, datetime):
                return date_val.strftime(fmt)
            elif isinstance(date_val, str):
                try:
                    dt = datetime.fromisoformat(date_val.replace("Z", "+00:00"))
                    return dt.strftime(fmt)
                except Exception:
                    return None
            return None
    return expr

class InsertOneResult:
    def __init__(self, inserted_id):
        self.inserted_id = inserted_id

class UpdateResult:
    def __init__(self, matched_count, modified_count):
        self.matched_count = matched_count
        self.modified_count = modified_count

class DeleteResult:
    def __init__(self, deleted_count):
        self.deleted_count = deleted_count

class MockCursor:
    def __init__(self, docs):
        self._docs = docs
        self._skip = 0
        self._limit = None
        self._sort_fields = None

    def sort(self, field, direction=1):
        if isinstance(field, list):
            self._sort_fields = field
        else:
            self._sort_fields = [(field, direction)]
        return self

    def skip(self, n):
        self._skip = n
        return self

    def limit(self, n):
        self._limit = n
        return self

    async def to_list(self, length=None):
        docs = copy.deepcopy(self._docs)
        
        # Apply sorting
        if self._sort_fields:
            for key, direction in reversed(self._sort_fields):
                def get_sort_val(d):
                    val = d.get(key)
                    if val is None:
                        return ""
                    return val
                docs.sort(key=get_sort_val, reverse=(direction == -1))
        
        # Apply skip
        if self._skip > 0:
            docs = docs[self._skip:]
            
        # Apply limit
        lim = length if length is not None else self._limit
        if lim is not None:
            docs = docs[:lim]
            
        return docs

class MockAsyncIOMotorCollection:
    def __init__(self, db, name):
        self.db = db
        self.name = name

    async def insert_one(self, doc):
        async with get_collection_lock(self.name):
            docs = _load_collection(self.name)
            doc_copy = copy.deepcopy(doc)
            if "_id" not in doc_copy:
                doc_copy["_id"] = ObjectId()
            docs.append(doc_copy)
            _save_collection(self.name, docs)
            return InsertOneResult(doc_copy["_id"])

    def find(self, query=None):
        docs = _load_collection(self.name)
        matched = [d for d in docs if match_query(d, query)]
        return MockCursor(matched)

    async def find_one(self, query=None, *args, **kwargs):
        docs = _load_collection(self.name)
        matched = [d for d in docs if match_query(d, query)]
        sort_fields = kwargs.get("sort")
        if sort_fields:
            if isinstance(sort_fields, tuple):
                sort_fields = [sort_fields]
            for key, direction in reversed(sort_fields):
                matched.sort(key=lambda d: d.get(key) or "", reverse=(direction == -1))
        for d in matched:
            if match_query(d, query):
                return copy.deepcopy(d)
        return None

    async def update_one(self, query, update, upsert=False):
        async with get_collection_lock(self.name):
            docs = _load_collection(self.name)
            matched_count = 0
            modified_count = 0
            
            match_idx = -1
            for i, d in enumerate(docs):
                if match_query(d, query):
                    match_idx = i
                    matched_count = 1
                    break
            
            if match_idx != -1:
                modified = update_doc(docs[match_idx], update)
                if modified:
                    modified_count = 1
                _save_collection(self.name, docs)
            elif upsert:
                new_doc = {}
                if query:
                    for k, v in query.items():
                        if not k.startswith("$") and "." not in k:
                            new_doc[k] = copy.deepcopy(v)
                if "_id" not in new_doc:
                    new_doc["_id"] = ObjectId()
                
                update_doc(new_doc, update)
                docs.append(new_doc)
                _save_collection(self.name, docs)
                matched_count = 1
                modified_count = 1
                
            return UpdateResult(matched_count, modified_count)

    async def update_many(self, query, update):
        async with get_collection_lock(self.name):
            docs = _load_collection(self.name)
            matched_count = 0
            modified_count = 0

            for d in docs:
                if match_query(d, query):
                    matched_count += 1
                    if update_doc(d, update):
                        modified_count += 1

            if matched_count > 0:
                _save_collection(self.name, docs)

            return UpdateResult(matched_count, modified_count)

    async def delete_one(self, query):
        async with get_collection_lock(self.name):
            docs = _load_collection(self.name)
            deleted_count = 0
            for i, d in enumerate(docs):
                if match_query(d, query):
                    docs.pop(i)
                    deleted_count = 1
                    break
            if deleted_count > 0:
                _save_collection(self.name, docs)
            return DeleteResult(deleted_count)

    async def count_documents(self, query=None):
        docs = _load_collection(self.name)
        matched = [d for d in docs if match_query(d, query)]
        return len(matched)

    def aggregate(self, pipeline):
        docs = _load_collection(self.name)
        current_docs = copy.deepcopy(docs)
        
        for stage in pipeline:
            if not isinstance(stage, dict):
                continue
            for op, val in stage.items():
                if op == "$match":
                    current_docs = [d for d in current_docs if match_query(d, val)]
                elif op == "$group":
                    group_stage = val
                    groups = {}
                    for doc in current_docs:
                        group_id = resolve_val(doc, group_stage["_id"])
                        if group_id not in groups:
                            groups[group_id] = []
                        groups[group_id].append(doc)
                    
                    result_docs = []
                    for group_id, group_docs in groups.items():
                        res_doc = {"_id": group_id}
                        for out_field, accum in group_stage.items():
                            if out_field == "_id":
                                continue
                            if isinstance(accum, dict) and "$sum" in accum:
                                sum_expr = accum["$sum"]
                                if isinstance(sum_expr, (int, float)):
                                    total = sum_expr * len(group_docs)
                                else:
                                    total = 0
                                    for gd in group_docs:
                                        v = resolve_val(gd, sum_expr)
                                        if isinstance(v, (int, float)):
                                            total += v
                                res_doc[out_field] = total
                        result_docs.append(res_doc)
                    current_docs = result_docs
                elif op == "$sort":
                    for field, direction in reversed(list(val.items())):
                        current_docs.sort(key=lambda d: d.get(field), reverse=(direction == -1))
                        
        return MockCursor(current_docs)

class MockAsyncIOMotorDatabase:
    def __init__(self, client, name):
        self.client = client
        self.name = name
        self._collections = {}

    def __getitem__(self, name):
        if name not in self._collections:
            self._collections[name] = MockAsyncIOMotorCollection(self, name)
        return self._collections[name]

class MockAdminDatabase:
    async def command(self, cmd_name):
        if cmd_name == "ping":
            return {"ok": 1.0}
        raise NotImplementedError(f"Command {cmd_name} not mocked")

class MockAsyncIOMotorClient:
    def __init__(self, uri=None, **kwargs):
        self.uri = uri
        self._databases = {}
        self.admin = MockAdminDatabase()

    def __getitem__(self, name):
        if name not in self._databases:
            self._databases[name] = MockAsyncIOMotorDatabase(self, name)
        return self._databases[name]

    def close(self):
        pass
