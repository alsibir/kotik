import {readdirSync,readFileSync,existsSync,statSync} from 'node:fs';
import {resolve,join,extname} from 'node:path';
const root=resolve('dist');
const scan=(d)=>readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?scan(join(d,e.name)):[join(d,e.name)]);
const html=scan(root).filter(p=>p.endsWith('.html'));
const first=readFileSync(join(root,'ru/index.html'),'utf8');
const home=first.match(/<a class="brand" href="([^"]+)"/)[1];
const base=home.replace(/\/ru\/$/,'');
let checked=0;const failures=[];
for(const file of html){
 const text=readFileSync(file,'utf8');
 const expected=file.match(/\/(ru|en|cs)\//)?.[1];
 if(expected&&!text.includes(`<html lang="${expected}"`))failures.push(`${file}: wrong language`);
 for(const match of text.matchAll(/(?:href|src|action)="([^"]+)"/g)){
  const link=match[1];if(!link.startsWith('/')||link.startsWith('//'))continue;
  if(base&&!link.startsWith(base+'/')){failures.push(`${file}: outside base ${link}`);continue;}
  const target=resolve(root,'.'+link.slice(base.length).split(/[?#]/)[0]);
  const found=existsSync(target)&&(statSync(target).isFile()||existsSync(join(target,'index.html')));
  if(!found)failures.push(`${file}: missing ${link}`);checked++;
 }
 for(const match of text.matchAll(/href="#([^"]+)"/g)){if(!text.includes(`id="${match[1]}"`))failures.push(`${file}: missing anchor #${match[1]}`);}
 if(text.includes('undefined'))failures.push(`${file}: undefined output`);
}
if(failures.length){console.error(failures.join('\n'));process.exit(1);}
console.log(`OK: ${html.length} pages, ${checked} local links/assets, base=${base||'/'}`);
