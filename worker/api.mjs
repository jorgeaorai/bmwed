const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json;charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const OWNER_EMAIL='jorgeventa@gmail.com';
const clean=v=>typeof v==='string'?v.trim():'';
export function validateRSVP(x){
 if(!x||typeof x!=='object')return 'Preencha os dados da confirmação.';
 const name=clean(x.name);if(name.length<3||name.length>120)return 'Informe seu nome completo (3 a 120 caracteres).';
 if(!['yes','no'].includes(x.attendance))return 'Selecione se poderá comparecer.';
 if(!Number.isInteger(x.partySize)||x.partySize<0||x.partySize>8||(x.attendance==='yes'&&x.partySize<1)||(x.attendance==='no'&&x.partySize!==0))return 'Confira o número de pessoas do seu convite.';
 if(!Array.isArray(x.guests)||x.guests.length!==Math.max(0,x.partySize-1)||x.guests.some(g=>typeof g!=='string'||g.trim().length<3||g.length>120))return 'Informe o nome completo de cada acompanhante.';
 if(typeof x.message!=='string'||x.message.length>1000)return 'O recado pode ter até 1.000 caracteres.';
 if((x.id&&!/^[a-f0-9-]{36}$/.test(x.id))||(x.token&&!/^[a-f0-9-]{36}$/.test(x.token))||Boolean(x.id)!==Boolean(x.token))return 'Não foi possível identificar sua confirmação. Tente novamente.';
 return null;
}
async function hash(value){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return Array.from(new Uint8Array(bytes),x=>x.toString(16).padStart(2,'0')).join('')}
export async function api(request,env){const url=new URL(request.url);
 if(url.pathname==='/api/rsvps'){
  if(request.method!=='GET')return json({error:'Método não permitido.'},405);
  if(request.headers.get('oai-authenticated-user-email')?.toLowerCase()!==OWNER_EMAIL)return json({error:'Entre com a conta dos noivos para consultar as confirmações.'},403);
  if(!env.DB)return json({error:'A lista está temporariamente indisponível.'},503);
  try{const {results}=await env.DB.prepare('SELECT id,name,attendance,party_size,guests,message,updated_at FROM wedding_rsvps ORDER BY updated_at DESC LIMIT 5000').all();return json({items:results})}catch{return json({error:'Não foi possível carregar a lista. Tente novamente.'},503)}
 }
 if(url.pathname!=='/api/rsvp')return json({error:'Página não encontrada.'},404);
 if(request.method!=='POST')return json({error:'Método não permitido.'},405);
 if(request.headers.get('origin')&&request.headers.get('origin')!==url.origin)return json({error:'Origem não permitida.'},403);
 if(!request.headers.get('content-type')?.includes('application/json'))return json({error:'Formato inválido.'},415);
 if(Number(request.headers.get('content-length')||0)>12000)return json({error:'Sua resposta excede o tamanho permitido.'},413);
 let x;try{const body=await request.text();if(body.length>12000)return json({error:'Sua resposta excede o tamanho permitido.'},413);x=JSON.parse(body)}catch{return json({error:'Confira os dados e tente novamente.'},400)}
 const error=validateRSVP(x);if(error)return json({error},400);
 if(!env.DB)return json({error:'As confirmações estão temporariamente indisponíveis. Tente novamente em alguns instantes.'},503);
 try{
 const id=x.id||crypto.randomUUID(),token=x.token||crypto.randomUUID(),tokenHash=await hash(token);
 if(x.id){const row=await env.DB.prepare('SELECT token_hash FROM wedding_rsvps WHERE id = ?').bind(id).first();if(!row||row.token_hash!==tokenHash)return json({error:'Não foi possível validar esta confirmação. Use o mesmo dispositivo da resposta original.'},403)}
 await env.DB.prepare('INSERT INTO wedding_rsvps (id,token_hash,name,attendance,party_size,guests,message,updated_at) VALUES (?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,attendance=excluded.attendance,party_size=excluded.party_size,guests=excluded.guests,message=excluded.message,updated_at=excluded.updated_at').bind(id,tokenHash,clean(x.name),x.attendance,x.partySize,JSON.stringify(x.guests.map(clean)),clean(x.message),new Date().toISOString()).run();
 return json({id,token,saved:true},x.id?200:201);
 }catch{return json({error:'Não foi possível registrar agora. Sua resposta não foi confirmada. Tente novamente.'},503)}
}
