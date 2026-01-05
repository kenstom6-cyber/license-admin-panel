
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./database');
const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));

app.post('/api/verify',(req,res)=>{
 const sk=req.headers['x-server-key'];
 if(!sk) return res.status(403).json({error:'Missing ServerKey'});
 db.get("SELECT * FROM server_keys WHERE key=? AND status='active'",[sk],(e,sr)=>{
  if(!sr) return res.status(403).json({error:'Invalid ServerKey'});
  const {key, hwid}=req.body;
  db.get("SELECT * FROM license_keys WHERE key=?",[key],(e,row)=>{
    if(!row) return res.json({status:'invalid'});
    if(row.status!=='active') return res.json({status:'locked'});
    if(row.hwid && row.hwid!==hwid) return res.json({status:'hwid_mismatch'});
    res.json({status:'valid', expire:row.expire});
  });
 });
});

app.post('/admin/serverkey',(req,res)=>{
 const key='SERVER-'+Math.random().toString(36).slice(2);
 db.run("INSERT INTO server_keys(key) VALUES(?)",[key]);
 res.json({serverKey:key});
});

app.post('/admin/key/create',(req,res)=>{
 const key='KEY-'+Math.random().toString(36).slice(2,10);
 db.run("INSERT INTO license_keys(key) VALUES(?)",[key]);
 res.json({key});
});

app.post('/admin/key/lock',(req,res)=>{
 db.run("UPDATE license_keys SET status='locked' WHERE key=?",[req.body.key]);
 res.json({ok:true});
});

app.post('/admin/key/reset',(req,res)=>{
 db.run("UPDATE license_keys SET hwid=NULL WHERE key=?",[req.body.key]);
 res.json({ok:true});
});

app.post('/admin/key/delete',(req,res)=>{
 db.run("DELETE FROM license_keys WHERE key=?",[req.body.key]);
 res.json({ok:true});
});

app.listen(3000,()=>console.log('Server running'));
