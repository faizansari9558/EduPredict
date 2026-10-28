const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
function auth(rows=[]) {
 const module={exports:{}};
 vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../controllers/authController.js'),'utf8'),{module,process:{env:{JWT_SECRET:'test-only-secret'}},console:{error(){}},require:name=>name==='jsonwebtoken'?{sign:u=>JSON.stringify(u)}:name.includes('config/db')?{query:async()=>[rows]}:{comparePassword:async(p,h)=>p==='valid'&&h==='hash'}});
 return module.exports;
}
function response(){return {statusCode:200,status(n){this.statusCode=n;return this;},json(value){this.body=value;return this;}};}
test('unknown admin-like email cannot log in',async()=>{const r=response();await auth().login({body:{email:'unknown-admin@example.invalid',password:'wrong'}},r);assert.equal(r.statusCode,401);assert.equal(r.body.token,undefined);});
test('former demo password cannot bypass password check',async()=>{const r=response();await auth([{id:1,password_hash:'hash',role_name:'admin'}]).login({body:{email:'admin@example.invalid',password:'password123'}},r);assert.equal(r.statusCode,401);});
test('valid credentials authenticate',async()=>{const r=response();await auth([{id:2,password_hash:'hash',role_name:'student'}]).login({body:{email:'student@example.invalid',password:'valid'}},r);assert.equal(r.statusCode,200);assert.ok(r.body.token);});
test('registration cannot overwrite accounts',async()=>{const r=response();await auth().register({body:{role:'admin'}},r);assert.equal(r.statusCode,403);});
test('master OTP cannot authenticate',async()=>{const r=response();await auth().verifyOtp({body:{otp:'000000'}},r);assert.equal(r.statusCode,503);assert.equal(r.body.success,false);});
