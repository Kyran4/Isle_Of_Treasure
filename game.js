(function(){
var K="treasure-isle-v1",REGEN=20000,SIZE=64;
var ITEMS={shell:["🐚","Shell",3,22],boot:["🥾","Old boot",1,8],bottle:["🍾","Bottle",8,10],coin:["🪙","Gold coin",5,14],anchor:["⚓","Anchor",15,5],map:["🗺️","Map piece",12,6],compass:["🧭","Compass",20,4],gem:["💎","Gem",25,6],pearl:["🦪","Pearl oyster",40,3],chest:["🧰","Chest",60,4],crown:["👑","Crown",150,1]};
var EMPTY_W=30;
var POOL=[{k:"shell",n:6,t:"Gather 6 shells",c:30,e:5},{k:"dig",n:15,t:"Dig 15 tiles",c:25,e:6},{k:"gem",n:2,t:"Find 2 gems",c:60,e:8},{k:"bottle",n:3,t:"Pull up 3 bottles",c:40,e:5},{k:"map",n:2,t:"Collect 2 map pieces",c:45,e:6},{k:"boot",n:3,t:"Fish out 3 old boots",c:15,e:3},{k:"chest",n:1,t:"Open a treasure chest",c:100,e:10},{k:"coin",n:5,t:"Find 5 gold coins",c:35,e:4},{k:"anchor",n:2,t:"Haul up 2 anchors",c:50,e:6},{k:"pearl",n:1,t:"Find a pearl oyster",c:90,e:8}];
var S,last=-1,$=function(i){return document.getElementById(i)};
function maxE(){return 20+2*(S.level-1)+4*(S.up.can||0)}
function need(){return 25*S.level}
function W(k){var v=ITEMS[k];return v[3]*(v[2]>=20?1+0.2*(S.up.mag||0):1)}
function roll(){var tot=EMPTY_W,k;for(k in ITEMS)tot+=W(k);var r=Math.random()*tot;if((r-=EMPTY_W)<0)return null;for(k in ITEMS){if((r-=W(k))<0)return k}return "shell"}
function newGrid(){var g=[];for(var i=0;i<SIZE;i++)g.push(V(i>>3,i&7)?{o:false,i:roll()}:{o:true,i:null,n:1});return g}
function newQuest(){var used=S.quests.map(function(q){return q.k}),c=POOL.filter(function(p){return used.indexOf(p.k)<0}),p=c[Math.floor(Math.random()*c.length)];return {k:p.k,n:p.n,t:p.t,c:p.c,e:p.e,p:0}}
function fresh(){S={energy:20,tick:Date.now(),coins:0,xp:0,level:1,inv:{},grid:null,island:1,quests:[],up:{},found:{},daily:"",streak:0};S.grid=newGrid();for(var i=0;i<3;i++)S.quests.push(newQuest())}
function load(){var s=Store.get();if(s&&s.grid&&s.grid.length===SIZE){s.up=s.up||{};s.found=s.found||{};s.daily=s.daily||"";s.streak=s.streak||0;for(var q=0;q<SIZE;q++)if(!V(q>>3,q&7))s.grid[q]={o:true,i:null,n:1};return s}return null}
function save(){Store.put(S)}
function regen(){var now=Date.now();if(S.energy>=maxE()){S.tick=now;return}
var g=Math.floor((now-S.tick)/REGEN);if(g>0){S.energy=Math.min(maxE(),S.energy+g);S.tick+=g*REGEN;if(S.energy>=maxE())S.tick=now}}
function say(t){$("msg").textContent=t}
function bump(k,n){S.quests.forEach(function(q){if(q.k===k&&q.p<q.n)q.p=Math.min(q.n,q.p+(n||1))})}
function gainXp(n){S.xp+=n;while(S.xp>=need()){S.xp-=need();S.level++;S.energy=maxE();say("Level "+S.level+"! Energy refilled and your max energy grew.")}}
function dig(i){var t=S.grid[i];if(t.o)return;regen();
if(S.energy<1){var s=Math.ceil((REGEN-(Date.now()-S.tick))/1000);say("Out of energy. Next point in "+s+"s, or refill with coins.");return}
var free=Math.random()<0.08*(S.up.shov||0);if(!free){S.energy--;if(S.energy===maxE()-1)S.tick=Date.now()}t.o=true;last=i;popT=performance.now();bump("dig");
if(t.i){var it=ITEMS[t.i];S.inv[t.i]=(S.inv[t.i]||0)+1;S.found[t.i]=1;bump(t.i);gainXp(2+Math.ceil(it[2]/6));say("Found "+it[0]+" "+it[1]+"! Worth "+it[2]+" coins."+(free?" Lucky dig, no energy used!":""))}
else{gainXp(1);say("Just sand this time.")}
save();render()}
function fmt(s){s=Math.max(0,Math.ceil(s));return Math.floor(s/60)+":"+("0"+s%60).slice(-2)}
function bars(){regen();var m=maxE();
$("eb").firstChild.style.width=(S.energy/m*100)+"%";$("el").textContent="⚡ Energy "+S.energy+"/"+m;
$("et").textContent=S.energy<m?"+1 in "+fmt((REGEN-(Date.now()-S.tick))/1000):"Full";
$("xb").firstChild.style.width=(S.xp/need()*100)+"%";$("xl").textContent="Level "+S.level;$("xt").textContent=S.xp+"/"+need()+" XP"}
function render(){
$("coins").textContent="🪙 "+S.coins;$("isl").textContent=S.island+" · "+THEMES[(S.island-1)%3][0];$("plaque").textContent="Island "+S.island+": "+THEMES[(S.island-1)%3][0];
var left=S.grid.filter(function(t){return !t.o}).length;
$("clear").innerHTML=left?"":'<button class="b" id="sail">⛵ Sail to a new island (+20 coins)</button>';
var qh="";S.quests.forEach(function(q,i){var d=q.p>=q.n;
qh+='<div class="q"><div><b>'+q.t+'</b><br><small>Reward: '+q.c+' coins + '+q.e+' energy</small></div>'+
'<button class="b" data-q="'+i+'"'+(d?"":" disabled")+'>'+(d?"Claim":q.p+"/"+q.n)+'</button><div class="pb"><i style="width:'+(q.p/q.n*100)+'%"></i></div></div>'});
$("quests").innerHTML=qh;
var ih="",val=0;for(var k in S.inv){if(S.inv[k]>0){ih+='<span class="chip">'+ITEMS[k][0]+" "+S.inv[k]+"</span>";val+=S.inv[k]*ITEMS[k][2]}}
$("inv").innerHTML=ih||"Nothing yet. Start digging!";
$("sell").disabled=!val;$("sell").textContent=val?"Sell everything ("+val+" coins)":"Sell everything";
$("refill").disabled=S.coins<30||S.energy>=maxE();extras();bars()}

$("quests").addEventListener("click",function(e){var b=e.target.closest("[data-q]");if(!b)return;var i=+b.getAttribute("data-q"),q=S.quests[i];if(q.p<q.n)return;
S.coins+=q.c;S.energy=Math.min(maxE(),S.energy+q.e);gainXp(10);say("Quest complete! +"+q.c+" coins, +"+q.e+" energy.");S.quests.splice(i,1);S.quests.push(newQuest());save();render()});
$("sell").onclick=function(){var v=0;for(var k in S.inv)v+=S.inv[k]*ITEMS[k][2];S.inv={};S.coins+=v;say("Sold your finds for "+v+" coins.");save();render()};
$("refill").onclick=function(){if(S.coins<30)return;S.coins-=30;S.energy=maxE();S.tick=Date.now();say("Energy refilled.");save();render()};
$("clear").addEventListener("click",function(e){if(e.target.id!=="sail")return;S.island++;S.coins+=20;S.grid=newGrid();last=-1;say("Welcome to island "+S.island+"! +20 coins.");save();render()});
$("reset").onclick=function(){if(confirm("Erase your island and start over?")){fresh();last=-1;say("A fresh start. Tap the grass to dig.");save();render()}};
// Swap Store for a server-backed version later (accounts, cloud saves).
var Store={get:function(){try{return JSON.parse(localStorage.getItem(K))}catch(e){return null}},put:function(s){try{localStorage.setItem(K,JSON.stringify(s))}catch(e){}}};
var THEMES=[["Sunny Shore","#22c41e","#1eb81b","#f4e3b0","#f4e3b0"],["Dune Isle","#c9d46a","#bfca5f","#f2dda0","#f2dda0"],["Mossy Cove","#3aa84a","#349b43","#ead9a4","#ead9a4"]];
var UPS=[["shov","🪏 Sturdy shovel","8% more chance per level of a free dig",40],["mag","🔍 Magnifier","Rare finds 20% more likely per level",60],["can","🥤 Canteen","+4 max energy per level",50]];
function today(){return new Date().toISOString().slice(0,10)}
function extras(){var h="";UPS.forEach(function(u){var l=S.up[u[0]]||0,cost=u[3]*Math.pow(2,l);
h+='<div class="q"><div><b>'+u[1]+' (Lv '+l+'/5)</b><br><small>'+u[2]+'</small></div><button class="b" data-u="'+u[0]+'"'+(l>=5||S.coins<cost?" disabled":"")+'>'+(l>=5?"Max":"🪙 "+cost)+'</button></div>'});$("shop").innerHTML=h;
var ch="",n=0;for(var k in ITEMS){if(S.found[k]){n++;ch+='<span class="chip" title="'+ITEMS[k][1]+'">'+ITEMS[k][0]+'</span>'}else ch+='<span class="chip" style="opacity:.4">❔</span>'}
$("col").innerHTML=ch;$("colc").textContent=n+"/"+Object.keys(ITEMS).length;
$("usemap").disabled=(S.inv.map||0)<4;$("usemap").textContent="Read treasure map ("+(S.inv.map||0)+"/4 pieces)";$("daily").disabled=S.daily===today()}
$("shop").addEventListener("click",function(e){var b=e.target.closest("[data-u]");if(!b)return;var u=UPS.filter(function(x){return x[0]===b.getAttribute("data-u")})[0],l=S.up[u[0]]||0,cost=u[3]*Math.pow(2,l);if(l>=5||S.coins<cost)return;S.coins-=cost;S.up[u[0]]=l+1;say(u[1]+" upgraded to level "+(l+1)+".");save();render()});
$("usemap").onclick=function(){if((S.inv.map||0)<4)return;var o=[];S.grid.forEach(function(t,i){if(!t.o&&!t.x)o.push(i)});if(!o.length)return;S.inv.map-=4;var i=o[Math.floor(Math.random()*o.length)];S.grid[i].i=Math.random()<.3?"crown":"chest";S.grid[i].x=1;say("The map reveals buried treasure. Look for the red X!");save();render()};
$("daily").onclick=function(){var d=today();if(S.daily===d)return;var y=new Date(Date.now()-864e5).toISOString().slice(0,10);S.streak=S.daily===y?Math.min(7,S.streak+1):1;S.daily=d;var c=15*S.streak;S.coins+=c;S.energy=Math.min(maxE(),S.energy+5);say("Day "+S.streak+" streak! +"+c+" coins and 5 energy.");save();render()};
var cv=$("cv"),cx=cv.getContext("2d"),popT=0,hov=-1,HW=30,HH=15,OX=260,OY=100,RM=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function ctr(r,c){return [OX+(c-r)*HW,OY+(c+r+1)*HH]}
function cell(ev){var b=cv.getBoundingClientRect(),k=520/b.width,x=(ev.clientX-b.left)*k,y=(ev.clientY-b.top)*k,a=(y-OY)/HH,d=(x-OX)/HW,r=Math.floor((a-d)/2),c=Math.floor((a+d)/2);return r>=0&&r<8&&c>=0&&c<8?r*8+c:-1}
cv.addEventListener("click",function(e){var i=cell(e);if(i>=0)dig(i)});
cv.addEventListener("pointermove",function(e){hov=e.pointerType==="mouse"?cell(e):-1});
cv.addEventListener("pointerleave",function(){hov=-1});
cv.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();var i=S.grid.findIndex(function(t){return !t.o});if(i>=0)dig(i)}});
var SHP=function(r,c){return r+c>1&&r+c<13&&c-r<6&&r-c<6};
var DEC=[[1,5,"hut"],[5,1,"tiki"],[2,2,"tree"],[5,6,"sign"]];
function decAt(r,c){for(var d=0;d<DEC.length;d++)if(DEC[d][0]===r&&DEC[d][1]===c)return DEC[d][2]}
function V(r,c){return SHP(r,c)&&!decAt(r,c)}
function dia(x,y,s){cx.beginPath();cx.moveTo(x,y-HH*s);cx.lineTo(x+HW*s,y);cx.lineTo(x,y+HH*s);cx.lineTo(x-HW*s,y);cx.closePath()}
function el(x,y,rx,ry,f){cx.fillStyle=f;cx.beginPath();cx.ellipse(x,y,rx,ry,0,0,7);cx.fill()}
function thatch(x,y,w,h){cx.fillStyle="#f2b83c";cx.beginPath();cx.moveTo(x-w,y);cx.lineTo(x,y-h);cx.lineTo(x+w,y);cx.quadraticCurveTo(x,y+h*.2,x-w,y);cx.fill();cx.strokeStyle="#c9891a";cx.lineWidth=1.5;for(var k=-2;k<3;k++){cx.beginPath();cx.moveTo(x+k*w/9,y-h*.8+Math.abs(k)*3);cx.lineTo(x+k*w/3.5,y-2);cx.stroke()}}
function hut(x,y){el(x,y+4,22,10,"rgba(0,0,0,.18)");cx.fillStyle="#a8702e";cx.fillRect(x-15,y-24,30,26);el(x,y+2,15,6,"#a8702e");el(x+3,y-8,5,8,"#4a2a0e");thatch(x,y-16,27,36)}
function tiki(x,y){el(x,y+3,20,8,"rgba(0,0,0,.18)");cx.fillStyle="#7a4a24";cx.fillRect(x-2,y-12,4,14);el(x,y-14,17,7,"#9a6230");el(x,y-15,15,5.5,"#b87a3a");el(x-17,y+3,5,3,"#7a4a24");el(x+17,y+3,5,3,"#7a4a24");thatch(x,y-27,19,17);cx.fillStyle="#7a4a24";cx.fillRect(x-1,y-27,2,13)}
function tree(x,y){el(x,y+3,16,6,"rgba(0,0,0,.18)");cx.fillStyle="#8a5a2b";cx.beginPath();cx.moveTo(x-6,y+2);cx.lineTo(x-3,y-26);cx.lineTo(x+3,y-26);cx.lineTo(x+6,y+2);cx.fill();
[[-11,-34,12],[11,-34,12],[0,-44,13]].forEach(function(b){el(x+b[0],y+b[1],b[2],b[2]*.85,"#2f8a3a")});
[[-12,-34],[10,-36],[0,-46],[1,-32]].forEach(function(g){cx.fillStyle="#5fe07a";cx.beginPath();cx.moveTo(x+g[0],y+g[1]-6);cx.lineTo(x+g[0]+4,y+g[1]);cx.lineTo(x+g[0],y+g[1]+6);cx.lineTo(x+g[0]-4,y+g[1]);cx.fill()})}
function sign(x,y){cx.fillStyle="#7a4a24";cx.fillRect(x-2,y-26,4,28);el(x,y-30,9,9,"#fff");cx.strokeStyle="#d8342b";cx.lineWidth=2.5;cx.beginPath();cx.arc(x,y-30,6.5,0,7);cx.moveTo(x-4.5,y-34.5);cx.lineTo(x+4.5,y-25.5);cx.stroke()}
function crab(x,y){cx.strokeStyle="#b82a1c";cx.lineWidth=2;for(var k=-1;k<2;k+=2){for(var m=0;m<3;m++){cx.beginPath();cx.moveTo(x+k*5,y+m*1.5);cx.lineTo(x+k*11,y+2+m*2);cx.stroke()}}
el(x,y,8,5,"#e6402e");el(x-10,y-5,3.2,3.2,"#e6402e");el(x+10,y-5,3.2,3.2,"#e6402e");el(x-3,y-5,1.6,1.6,"#fff");el(x+3,y-5,1.6,1.6,"#fff")}
function guy(x,y,dg){el(x,y+2,9,3.5,"rgba(0,0,0,.25)");cx.strokeStyle="#3a2a1a";cx.lineWidth=3;cx.beginPath();cx.moveTo(x-3,y);cx.lineTo(x-3,y-8);cx.moveTo(x+3,y);cx.lineTo(x+3,y-8);cx.stroke();
el(x,y-14,6.5,7,"#2b2f3a");el(x,y-26,7,7.5,"#f1c9a0");cx.fillStyle="#2a1a10";cx.beginPath();cx.arc(x,y-28,7.5,Math.PI,0);cx.fill();el(x-2.5,y-26,1,1.3,"#222");el(x+2.5,y-26,1,1.3,"#222");
if(dg>=0){var a=Math.sin(dg*16)*.9+.4,ex=x+7+Math.sin(a)*18,ey=y-16+Math.cos(a)*18;cx.strokeStyle="#8a5a2b";cx.lineWidth=2;cx.beginPath();cx.moveTo(x+7,y-16);cx.lineTo(ex,ey);cx.stroke();el(ex,ey,3.5,2.5,"#c9ced6")}}
function palm(x,y,s,ph,t){var tx=x+6*s,ty=y-46*s;cx.lineCap="round";cx.strokeStyle="#8a5a2b";cx.lineWidth=6*s;cx.beginPath();cx.moveTo(x,y);cx.quadraticCurveTo(x-8*s,y-24*s,tx,ty);cx.stroke();
for(var k=0;k<7;k++){var a=k*0.9+Math.sin(t*1.3+ph)*0.07,ex=tx+Math.cos(a)*34*s,ey=ty+Math.sin(a)*13*s+11*s;cx.strokeStyle="#23913f";cx.lineWidth=6*s;cx.beginPath();cx.moveTo(tx,ty);cx.quadraticCurveTo(tx+Math.cos(a)*18*s,ty-12*s,ex,ey);cx.stroke();cx.strokeStyle="#5ccf6c";cx.lineWidth=2.5*s;cx.stroke()}
el(tx-3*s,ty+3*s,3*s,3*s,"#6b4220");el(tx+3*s,ty+4*s,3*s,3*s,"#6b4220")}
var cp=null;
function draw(ms){var t=RM?0:ms/1000,dpr=window.devicePixelRatio||1,w=cv.clientWidth,i,r,c,p,th=THEMES[(S.island-1)%3];
if(w&&cv.width!==Math.round(w*dpr)){cv.width=Math.round(w*dpr);cv.height=Math.round(w*dpr*440/520)}
var q=cv.width/520;cx.setTransform(q,0,0,q,0,0);cx.globalAlpha=1;cx.lineCap="round";cx.lineJoin="round";
var g=cx.createLinearGradient(0,0,0,440);g.addColorStop(0,"#22c3f6");g.addColorStop(1,"#0aa2de");cx.fillStyle=g;cx.fillRect(0,0,520,440);
cx.strokeStyle="rgba(255,255,255,.28)";cx.lineWidth=2;
for(i=0;i<16;i++){var wx=((i*97+t*(8+i%3*5))%560)-20,wy=14+(i*53)%420;cx.beginPath();cx.ellipse(wx,wy,14,3,0,0,Math.PI);cx.stroke()}
function layer(col,lw){cx.strokeStyle=col;cx.fillStyle=col;cx.lineWidth=lw;for(var a=0;a<8;a++)for(var b=0;b<8;b++)if(SHP(a,b)){var z=ctr(a,b);dia(z[0],z[1],1);cx.fill();cx.stroke()}}
layer("#8fe3fb",72+3*Math.sin(t*2));layer("#c7f3fd",56);layer(th[3],44);layer(th[1],6);
[[3.5,-.6,1,0],[-.6,3.5,.9,1]].forEach(function(a){p=ctr(a[0],a[1]);palm(p[0],p[1],a[2],a[3],t)});
cx.lineWidth=1;
for(r=0;r<8;r++)for(c=0;c<8;c++){if(!SHP(r,c))continue;i=r*8+c;var T=S.grid[i],z=ctr(r,c),x=z[0],y=z[1],dc=decAt(r,c),hs=(r*13+c*7+r*c*3)%11;
 dia(x,y,1);if((r+c)&1){cx.fillStyle=th[2];cx.fill()}cx.strokeStyle="rgba(0,90,0,.14)";cx.stroke();
 if(i===hov&&!T.o){cx.strokeStyle="#fff";cx.lineWidth=2.5;cx.stroke();cx.lineWidth=1}
 if(!T.o&&hs<4){cx.strokeStyle="#0f8a12";cx.lineWidth=1.5;cx.beginPath();cx.moveTo(x-15,y+3);cx.lineTo(x-17,y-2);cx.moveTo(x-15,y+3);cx.lineTo(x-13,y-2);cx.stroke();cx.lineWidth=1}
 else if(!T.o&&hs===5)el(x+14,y-1,2,2,(r+c)&1?"#ff7aa8":"#fff2a0");
 if(T.o&&!T.n){dia(x,y,.8);cx.fillStyle="#b27a42";cx.fill();el(x,y+1,14,6.5,"#7d4e24");el(x,y+2,10,4.4,"#5d3a19");el(x-13,y+3,3,1.8,"#c58a50");el(x+12,y-2,2.5,1.5,"#c58a50")}
 if(T.x&&!T.o){cx.strokeStyle="#d8342b";cx.lineWidth=3.5;cx.beginPath();cx.moveTo(x-7,y-5);cx.lineTo(x+7,y+5);cx.moveTo(x+7,y-5);cx.lineTo(x-7,y+5);cx.stroke();cx.lineWidth=1}
 if(dc==="hut")hut(x,y);else if(dc==="tiki")tiki(x,y);else if(dc==="tree")tree(x,y);else if(dc==="sign")sign(x,y)}
[[7.6,3.5,1,2],[3.5,7.6,.95,3]].forEach(function(a){p=ctr(a[0],a[1]);palm(p[0],p[1],a[2],a[3],t)});
crab(134+Math.sin(t*.9)*16,283);
var U=last>=0?S.grid[last]:null,tg=U&&U.o&&!U.n?ctr(last>>3,last&7):ctr(3.5,3.5),age=(performance.now()-popT)/1000;
if(!cp)cp={x:tg[0],y:tg[1]};cp.x+=(tg[0]-cp.x)*.1;cp.y+=(tg[1]+5-cp.y)*.1;
guy(cp.x,cp.y,U&&age<.5&&Math.hypot(tg[0]-cp.x,tg[1]+5-cp.y)<8?age:-1);
if(U&&U.o&&!U.n&&age<1.5){p=ctr(last>>3,last&7);
 if(U.i){var sc=age<.25?age/.25*1.25:Math.max(1,1.25-(age-.25)*1.5),ry=p[1]-6-Math.min(age,.35)*70-(age>.7?(age-.7)*40:0);cx.globalAlpha=age>.9?Math.max(0,1-(age-.9)/.6):1;cx.font=(26*sc)+"px sans-serif";cx.textAlign="center";cx.textBaseline="middle";cx.fillText(ITEMS[U.i][0],p[0],ry);
  cx.strokeStyle="#fff7b0";cx.lineWidth=2;for(var s=0;s<6;s++){var ag=s*1.05,d=6+age*30;cx.beginPath();cx.moveTo(p[0]+Math.cos(ag)*d,p[1]-10+Math.sin(ag)*d*.6);cx.lineTo(p[0]+Math.cos(ag)*(d+5),p[1]-10+Math.sin(ag)*(d+5)*.6);cx.stroke()}}
 else{cx.globalAlpha=Math.max(0,.5-age);el(p[0],p[1]-4,10+age*30,5+age*12,"#b27a42")}
 cx.globalAlpha=1}
requestAnimationFrame(draw)}
S=load();if(!S)fresh();regen();render();requestAnimationFrame(draw);
setInterval(function(){bars();$("refill").disabled=S.coins<30||S.energy>=maxE();save()},1000);
})();
