const base = process.env.ML_SERVICE_URL || 'http://localhost:8000';
async function request(path, body) {
  const response = await fetch(base + path, {method: body ? 'POST':'GET', headers:{'Content-Type':'application/json'}, ...(body ? {body:JSON.stringify(body)}:{}), signal:AbortSignal.timeout(8000)});
  if (!response.ok) throw new Error('ML service rejected the request');
  return response.json();
}
module.exports = {
 getHealth:()=>request('/health'), getModelInfo:()=>request('/model-info'),
 predictPlacement:features=>request('/predict/placement',features),
 predictAndExplain:features=>request('/predict/explain',features),
 predictBatch:(batch_id,students)=>request('/predict/batch',{batch_id,students})
};
