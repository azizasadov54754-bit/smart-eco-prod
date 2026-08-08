from __future__ import annotations
import hashlib, json, os, secrets, uuid
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy import String, Integer, Boolean, DateTime, ForeignKey, Text, select, func
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from jose import jwt, JWTError
from passlib.context import CryptContext
from redis.asyncio import Redis

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', extra='ignore')
    DATABASE_URL: str = 'postgresql+asyncpg://postgres:postgres@localhost:5432/smarteco'
    REDIS_URL: str = 'redis://localhost:6379/0'
    JWT_SECRET: str = 'dev-only-change-me'
    JWT_EXPIRE_MINUTES: int = 10080
    CORS_ORIGINS: str = 'http://localhost:5173'
    ADMIN_EMAIL: str = 'admin@smarteco.local'
    ADMIN_PASSWORD: str = 'CHANGE_ME'
settings=Settings()
db_url=settings.DATABASE_URL
if db_url.startswith('postgresql://'): db_url='postgresql+asyncpg://'+db_url[len('postgresql://'):]
if db_url.startswith('postgres://'): db_url='postgresql+asyncpg://'+db_url[len('postgres://'):]
engine=create_async_engine(db_url, pool_pre_ping=True)
Session=async_sessionmaker(engine, expire_on_commit=False)
redis=Redis.from_url(settings.REDIS_URL, decode_responses=True)
pwd=CryptContext(schemes=['bcrypt'], deprecated='auto')

class Base(DeclarativeBase): pass
class User(Base):
    __tablename__='users'
    id: Mapped[str]=mapped_column(String(36), primary_key=True, default=lambda:str(uuid.uuid4()))
    phone: Mapped[str]=mapped_column(String(32), unique=True, index=True)
    first_name: Mapped[str]=mapped_column(String(80)); last_name: Mapped[str]=mapped_column(String(80))
    eco_coins: Mapped[int]=mapped_column(Integer, default=0); streak: Mapped[int]=mapped_column(Integer, default=0)
    is_admin: Mapped[bool]=mapped_column(Boolean, default=False); created_at: Mapped[datetime]=mapped_column(DateTime(timezone=True), default=lambda:datetime.now(timezone.utc))
class Bin(Base):
    __tablename__='bins'
    id: Mapped[str]=mapped_column(String(36), primary_key=True, default=lambda:str(uuid.uuid4()))
    code: Mapped[str]=mapped_column(String(64), unique=True, index=True)
    name: Mapped[str]=mapped_column(String(120)); lat: Mapped[float]=mapped_column(); lng: Mapped[float]=mapped_column()
    fill_level: Mapped[int]=mapped_column(Integer, default=0); battery: Mapped[int]=mapped_column(Integer, default=100); active: Mapped[bool]=mapped_column(Boolean, default=True)
    updated_at: Mapped[datetime]=mapped_column(DateTime(timezone=True), default=lambda:datetime.now(timezone.utc))
class CoinLedger(Base):
    __tablename__='coin_ledger'
    id: Mapped[str]=mapped_column(String(36), primary_key=True, default=lambda:str(uuid.uuid4()))
    user_id: Mapped[str]=mapped_column(ForeignKey('users.id'), index=True); amount: Mapped[int]=mapped_column(Integer)
    reason: Mapped[str]=mapped_column(String(120)); reference: Mapped[str]=mapped_column(String(120), unique=True)
    created_at: Mapped[datetime]=mapped_column(DateTime(timezone=True), default=lambda:datetime.now(timezone.utc))
class Scan(Base):
    __tablename__='scans'
    id: Mapped[str]=mapped_column(String(36), primary_key=True, default=lambda:str(uuid.uuid4()))
    user_id: Mapped[str]=mapped_column(ForeignKey('users.id'), index=True); bin_code: Mapped[str]=mapped_column(String(64)); nonce_hash: Mapped[str]=mapped_column(String(128))
    reward: Mapped[int]=mapped_column(Integer); created_at: Mapped[datetime]=mapped_column(DateTime(timezone=True), default=lambda:datetime.now(timezone.utc))

class RegisterIn(BaseModel): phone:str=Field(min_length=7,max_length=32); first_name:str=Field(min_length=1,max_length=80); last_name:str=Field(min_length=1,max_length=80)
class LoginIn(BaseModel): phone:str; otp:str='0000'
class ScanIn(BaseModel): bin_code:str; nonce:str=Field(min_length=8,max_length=128)
class ProfileIn(BaseModel): first_name:str=Field(min_length=1,max_length=80); last_name:str=Field(min_length=1,max_length=80)

app=FastAPI(title='Smart Eco API', version='2.0.0')
app.add_middleware(CORSMiddleware, allow_origins=[x.strip() for x in settings.CORS_ORIGINS.split(',')], allow_credentials=True, allow_methods=['*'], allow_headers=['*'])

async def db():
    async with Session() as s: yield s
async def token_for(user:User):
    return jwt.encode({'sub':user.id,'exp':datetime.now(timezone.utc)+timedelta(minutes=settings.JWT_EXPIRE_MINUTES)},settings.JWT_SECRET,algorithm='HS256')
async def current_user(token:str, session:AsyncSession):
    if token.startswith('Bearer '): token=token[7:]
    try: uid=jwt.decode(token,settings.JWT_SECRET,algorithms=['HS256'])['sub']
    except (JWTError,KeyError): raise HTTPException(401,'Invalid or expired token')
    u=await session.get(User,uid)
    if not u: raise HTTPException(401,'User not found')
    return u

@app.on_event('startup')
async def startup():
    async with engine.begin() as c: await c.run_sync(Base.metadata.create_all)
    async with Session() as s:
        if not (await s.execute(select(Bin))).scalars().first():
            s.add_all([Bin(code='BIN-001',name='Main Campus',lat=38.8610,lng=65.7890,fill_level=34,battery=92),Bin(code='BIN-002',name='Library',lat=38.8620,lng=65.7910,fill_level=61,battery=78),Bin(code='BIN-003',name='Innovation Hub',lat=38.8595,lng=65.7875,fill_level=18,battery=98)])
            await s.commit()

@app.get('/api/health')
async def health():
    try: await redis.ping(); r='ok'
    except Exception: r='unavailable'
    return {'status':'ok','redis':r,'time':datetime.now(timezone.utc).isoformat()}

@app.post('/api/auth/register')
async def register(data:RegisterIn, s:AsyncSession=Depends(db)):
    if (await s.execute(select(User).where(User.phone==data.phone))).scalar_one_or_none(): raise HTTPException(409,'Telefon allaqachon ro‘yxatdan o‘tgan')
    u=User(phone=data.phone,first_name=data.first_name,last_name=data.last_name); s.add(u); await s.commit(); await s.refresh(u)
    return {'token':await token_for(u),'user':{'id':u.id,'phone':u.phone,'first_name':u.first_name,'last_name':u.last_name,'eco_coins':u.eco_coins,'streak':u.streak}}

@app.post('/api/auth/login')
async def login(data:LoginIn,s:AsyncSession=Depends(db)):
    u=(await s.execute(select(User).where(User.phone==data.phone))).scalar_one_or_none()
    if not u: raise HTTPException(404,'Foydalanuvchi topilmadi')
    return {'token':await token_for(u),'user':{'id':u.id,'phone':u.phone,'first_name':u.first_name,'last_name':u.last_name,'eco_coins':u.eco_coins,'streak':u.streak}}

@app.get('/api/me')
async def me(token:str,s:AsyncSession=Depends(db)): return await profile(token,s)
async def profile(token,s):
    u=await current_user(token,s); return {'id':u.id,'phone':u.phone,'first_name':u.first_name,'last_name':u.last_name,'eco_coins':u.eco_coins,'streak':u.streak,'is_admin':u.is_admin}

@app.put('/api/me')
async def edit_profile(data:ProfileIn,token:str,s:AsyncSession=Depends(db)):
    u=await current_user(token,s); u.first_name=data.first_name; u.last_name=data.last_name; await s.commit(); return await profile(token,s)

@app.get('/api/bins')
async def bins(s:AsyncSession=Depends(db)):
    rows=(await s.execute(select(Bin).order_by(Bin.code))).scalars().all(); return [{'code':b.code,'name':b.name,'lat':b.lat,'lng':b.lng,'fill_level':b.fill_level,'battery':b.battery,'active':b.active} for b in rows]

@app.post('/api/scans')
async def scan(data:ScanIn,token:str,s:AsyncSession=Depends(db)):
    u=await current_user(token,s); b=(await s.execute(select(Bin).where(Bin.code==data.bin_code,Bin.active==True))).scalar_one_or_none()
    if not b: raise HTTPException(404,'Smart Bin topilmadi')
    # Replay protection: nonce may be used only once, and is stored as a hash.
    h=hashlib.sha256(f'{u.id}:{data.nonce}'.encode()).hexdigest()
    exists=(await s.execute(select(Scan).where(Scan.nonce_hash==h))).scalar_one_or_none()
    if exists: raise HTTPException(409,'Bu QR hodisasi allaqachon ishlatilgan')
    # Server-issued short-lived nonce can be added later; this baseline prevents duplicate submissions.
    reward=25 if b.fill_level<90 else 15
    ref=f'scan:{uuid.uuid4()}'
    s.add(Scan(user_id=u.id,bin_code=b.code,nonce_hash=h,reward=reward)); s.add(CoinLedger(user_id=u.id,amount=reward,reason='QR scan',reference=ref)); u.eco_coins+=reward; u.streak+=1
    await s.commit()
    await redis.publish('eco:events',json.dumps({'type':'reward','user_id':u.id,'amount':reward,'balance':u.eco_coins}))
    return {'ok':True,'reward':reward,'eco_coins':u.eco_coins,'streak':u.streak,'message':'Eco-Coin muvaffaqiyatli qo‘shildi'}

@app.get('/api/leaderboard')
async def leaderboard(s:AsyncSession=Depends(db)):
    rows=(await s.execute(select(User).order_by(User.eco_coins.desc()).limit(50))).scalars().all(); return [{'rank':i+1,'name':f'{u.first_name} {u.last_name[:1]}.','eco_coins':u.eco_coins,'streak':u.streak} for i,u in enumerate(rows)]

class WSManager:
    def __init__(self): self.clients=set()
    async def connect(self,ws): await ws.accept(); self.clients.add(ws)
    def remove(self,ws): self.clients.discard(ws)
    async def broadcast(self,msg):
        for ws in list(self.clients):
            try: await ws.send_json(msg)
            except Exception: self.remove(ws)
manager=WSManager()

@app.websocket('/ws')
async def websocket(ws:WebSocket):
    await manager.connect(ws)
    try:
        while True: await ws.receive_text()
    except WebSocketDisconnect: manager.remove(ws)

@app.get('/api/admin/overview')
async def admin_overview(s:AsyncSession=Depends(db)):
    users=await s.scalar(select(func.count()).select_from(User)); bins_count=await s.scalar(select(func.count()).select_from(Bin)); coins=await s.scalar(select(func.coalesce(func.sum(CoinLedger.amount),0)))
    return {'users':users or 0,'bins':bins_count or 0,'coins_issued':coins or 0}
