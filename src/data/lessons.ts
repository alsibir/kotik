import type {Lang} from './ui';
export type Lesson={id:string;topic:number;number:number;title:string;goal:string;time:number;body:string;example:string;caution:string;task:string;criteria:string;reflection:string};
const files=import.meta.glob('../content/wiki/*/*.md',{query:'?raw',import:'default',eager:true}) as Record<string,string>;
export function lessons(lang:Lang):Lesson[]{
 return Object.entries(files).filter(([path])=>path.includes(`/${lang}/`)).map(([,raw])=>{
  const [,front,body]=raw.split('---');
  const meta=JSON.parse(front);
  const parts=body.trim().split(/^## /m).filter(Boolean);
  const sections=Object.fromEntries(parts.map(part=>{const at=part.indexOf('\n');return [part.slice(0,at).trim(),part.slice(at).trim()];}));
  for(const key of ['body','example','caution','task','criteria','reflection'])if(!sections[key])throw new Error(`Missing ${key}: ${meta.id} (${lang})`);
  return {...meta,...sections} as Lesson;
 }).sort((a,b)=>a.number-b.number);
}
