const assert=require('assert');
const themes={
  watchverseBlack:{bg:'#070707',surface:'#111112',text:'#fafafa',muted:'#a9a9af',accent:'#75121a',on:'#ffffff'},
  original:{bg:'#0a0a0b',surface:'#141416',text:'#f7f7f8',muted:'#a9a9b2',accent:'#f4c400',on:'#0a0a0a'},
  cinematic:{bg:'#090d13',surface:'#121923',text:'#f6f8fb',muted:'#b3bfce',accent:'#e9bd55',on:'#11100c'},
  classic:{bg:'#120b0b',surface:'#1d1212',text:'#fff8e8',muted:'#cbbca8',accent:'#e0b461',on:'#171006'},
  neon:{bg:'#080a14',surface:'#111527',text:'#fafaff',muted:'#bdc0dc',accent:'#73e8e5',on:'#061414'},
  lastOfUs:{bg:'#090d0a',surface:'#151b16',text:'#eee9d9',muted:'#b5b4a6',accent:'#c7793d',on:'#160e08'},
  buffy:{bg:'#0b0708',surface:'#171012',text:'#f5eadb',muted:'#c7b5aa',accent:'#a92e3c',on:'#fff7ea'},
  editorial:{bg:'#f5f1e8',surface:'#fffdf8',text:'#1d1a16',muted:'#5d554b',accent:'#6f4300',on:'#ffffff'}
};
const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255);
const lum=h=>{const c=rgb(h).map(v=>v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4));return .2126*c[0]+.7152*c[1]+.0722*c[2]};
const ratio=(a,b)=>{const [x,y]=[lum(a),lum(b)].sort((m,n)=>n-m);return (x+.05)/(y+.05)};
for(const [name,t] of Object.entries(themes)){
  for(const [fg,bg] of [['text','bg'],['muted','bg'],['text','surface'],['muted','surface'],['on','accent']]) assert(ratio(t[fg],t[bg])>=4.5,`${name}: ${fg}/${bg}`);
}
console.log('✓ Contrasto AA delle palette principali verificato');
