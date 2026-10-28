const db = require('../config/db');
exports.list = async (req,res,next) => {
 try {
 const [rows] = await db.query(`SELECT doc.id,u.full_name AS studentName,u.user_id_number AS rollNo,doc.document_type AS type,doc.file_name AS title,doc.created_at AS submittedDate,doc.verification_status AS status FROM documents doc JOIN users u ON u.id=doc.user_id JOIN students s ON s.user_id=u.id JOIN teachers t ON t.department_id=s.department_id WHERE t.user_id=? ORDER BY doc.created_at DESC`, [req.user.id]);
 res.json({success:true,data:rows});
 } catch(e) {next(e);}
};
exports.review = async (req,res,next) => {
 const {status,comments=''}=req.body;
 if (!['verified','rejected'].includes(status) || (status==='rejected' && !comments.trim())) return res.status(400).json({success:false,message:'Valid status and rejection reason are required.'});
 let connection;
 try {
 connection=await db.getConnection(); await connection.beginTransaction();
 const [rows]=await connection.query(`SELECT doc.* FROM documents doc JOIN students s ON s.user_id=doc.user_id JOIN teachers t ON t.department_id=s.department_id WHERE doc.id=? AND t.user_id=? FOR UPDATE`,[req.params.itemId,req.user.id]);
 if(!rows.length) {await connection.rollback();return res.status(403).json({success:false,message:'Document is outside your department.'});}
 if(rows[0].verification_status!=='pending') {await connection.rollback();return res.status(409).json({success:false,message:'Document has already been reviewed.'});}
 // Legacy uploads only stored metadata; never certify missing evidence.
 if(status==='verified') {
 const path=require('path'),fs=require('fs/promises');
 const root=path.resolve(__dirname,'../uploads');
 const file=path.resolve(__dirname,'..',rows[0].stored_path);
 if(!file.startsWith(root+path.sep)) throw new Error('Invalid document storage path');
 try {await fs.access(file);} catch {await connection.rollback();return res.status(409).json({success:false,message:'Document file is missing. Ask the student to upload evidence again.'});}
 }
 await connection.query('UPDATE documents SET verification_status=?,reviewed_by=? WHERE id=?',[status,req.user.id,req.params.itemId]);
 await connection.query(`INSERT INTO audit_logs(user_id,action,entity_type,entity_id,metadata_json) VALUES (?,'document_review','document',?,?)`,[req.user.id,req.params.itemId,JSON.stringify({status,comments})]);
 await connection.commit();res.json({success:true});
 } catch(e) {if(connection) await connection.rollback();next(e);} finally {if(connection) connection.release();}
};
