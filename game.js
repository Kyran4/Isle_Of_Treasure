(function(){
var K="treasure-isle-v1",REGEN=20000,SIZE=64;
var ITEMS={shell:["🐚","Shell",3,22],boot:["🥾","Old boot",1,8],bottle:["🍾","Bottle",8,10],coin:["🪙","Gold coin",5,14],map:["🗺️","Map piece",12,6],gem:["💎","Gem",25,6],chest:["🧰","Chest",60,4]};
var EMPTY_W=30;
var POOL=[{k:"shell",n:6,t:"Gather 6 shells",c:30,e:5},{k:"dig",n:15,t:"Dig 15 tiles",c:25,e:6},{k:"gem",n:2,t:"Find 2 gems",c:60,e:8},{k:"bottle",n:3,t:"Pull up 3 bottles",c:40,e:5},{k:"map",n:2,t:"Collect 2 map pieces",c:45,e:6},{k:"boot",n:3,t:"Fish out 3 old boots",c:15,e:3},{k:"chest",n:1,t:"Open a treasure chest",c:100,e:10},{k:"coin",n:5,t:"Find 5 gold coins",c:35,e:4}];
var S,last=-1,$=function(i){return document.getElementById(i)};
function maxE(){return 20+2*(S.level-1)}
function need(){return 25*S.level}
function roll(){var tot=EMPTY_W,k;for(k in ITEMS)tot+=ITEMS[k][3];var r=Math.random()*tot;if((r-=EMPTY_W)<0)return null;for(k in ITEMS){if((r-=ITEMS[k][3])<0)return k}return "shell"}
function newGrid(){var g=[];for(var i=0;i<SIZE;i++)g.push({o:false,i:roll()});return g}
function newQuest(){var used=S.quests.map(function(q){return q.k}),c=POOL.filter(function(p){return used.indexOf(p.k)<0}),p=c[Math.floor(Math.random()*c.length)];return {k:p.k,n:p.n,t:p.t,c:p.c,e:p.e,p:0}}
function fresh(){S={energy:20,tick:Date.now(),coins:0,xp:0,level:1,inv:{},grid:null,island:1,quests:[]};S.grid=newGrid();for(var i=0;i<3;i++)S.quests.push(newQuest())}
function load(){try{var s=JSON.parse(localStorage.getItem(K));if(s&&s.grid&&s.grid.length===SIZE)return s}catch(e){}return null}
function save(){try{localStorage.setItem(K,JSON.stringify(S))}catch(e){}}
function regen(){var now=Date.now();if(S.energy>=maxE()){S.tick=now;return}
var g=Math.floor((now-S.tick)/REGEN);if(g>0){S.energy=Math.min(maxE(),S.energy+g);S.tick+=g*REGEN;if(S.energy>=maxE())S.tick=now}}
function say(t){$("msg").textContent=t}
function bump(k,n){S.quests.forEach(function(q){if(q.k===k&&q.p<q.n)q.p=Math.min(q.n,q.p+(n||1))})}
function gainXp(n){S.xp+=n;while(S.xp>=need()){S.xp-=need();S.level++;S.energy=maxE();say("Level "+S.level+"! Energy refilled and your max energy grew.")}}
function dig(i){var t=S.grid[i];if(t.o)return;regen();
if(S.energy<1){var s=Math.ceil((REGEN-(Date.now()-S.tick))/1000);say("Out of energy. Next point in "+s+"s, or refill with coins.");return}
S.energy--;if(S.energy===maxE()-1)S.tick=Date.now();t.o=true;last=i;popT=performance.now();bump("dig");
if(t.i){var it=ITEMS[t.i];S.inv[t.i]=(S.inv[t.i]||0)+1;bump(t.i);gainXp(2+Math.ceil(it[2]/6));say("Found "+it[0]+" "+it[1]+"! Worth "+it[2]+" coins.")}
else{gainXp(1);say("Just sand this time.")}
save();render()}
function fmt(s){s=Math.max(0,Math.ceil(s));return Math.floor(s/60)+":"+("0"+s%60).slice(-2)}
function bars(){regen();var m=maxE();
$("eb").firstChild.style.width=(S.energy/m*100)+"%";$("el").textContent="⚡ Energy "+S.energy+"/"+m;
$("et").textContent=S.energy<m?"+1 in "+fmt((REGEN-(Date.now()-S.tick))/1000):"Full";
$("xb").firstChild.style.width=(S.xp/need()*100)+"%";$("xl").textContent="Level "+S.level;$("xt").textContent=S.xp+"/"+need()+" XP"}
function render(){
$("coins").textContent="🪙 "+S.coins;$("isl").textContent=S.island;
var left=S.grid.filter(function(t){return !t.o}).length;
$("clear").innerHTML=left?"":'<button class="b" id="sail">⛵ Sail to a new island (+20 coins)</button>';
var qh="";S.quests.forEach(function(q,i){var d=q.p>=q.n;
qh+='<div class="q"><div><b>'+q.t+'</b><br><small>Reward: '+q.c+' coins + '+q.e+' energy</small></div>'+
'<button class="b" data-q="'+i+'"'+(d?"":" disabled")+'>'+(d?"Claim":q.p+"/"+q.n)+'</button><div class="pb"><i style="width:'+(q.p/q.n*100)+'%"></i></div></div>'});
$("quests").innerHTML=qh;
var ih="",val=0;for(var k in S.inv){if(S.inv[k]>0){ih+='<span class="chip">'+ITEMS[k][0]+" "+S.inv[k]+"</span>";val+=S.inv[k]*ITEMS[k][2]}}
$("inv").innerHTML=ih||"Nothing yet. Start digging!";
$("sell").disabled=!val;$("sell").textContent=val?"Sell everything ("+val+" coins)":"Sell everything";
$("refill").disabled=S.coins<30||S.energy>=maxE();bars()}

$("quests").addEventListener("click",function(e){var b=e.target.closest("[data-q]");if(!b)return;var i=+b.getAttribute("data-q"),q=S.quests[i];if(q.p<q.n)return;
S.coins+=q.c;S.energy=Math.min(maxE(),S.energy+q.e);gainXp(10);say("Quest complete! +"+q.c+" coins, +"+q.e+" energy.");S.quests.splice(i,1);S.quests.push(newQuest());save();render()});
$("sell").onclick=function(){var v=0;for(var k in S.inv)v+=S.inv[k]*ITEMS[k][2];S.inv={};S.coins+=v;say("Sold your finds for "+v+" coins.");save();render()};
$("refill").onclick=function(){if(S.coins<30)return;S.coins-=30;S.energy=maxE();S.tick=Date.now();say("Energy refilled.");save();render()};
$("clear").addEventListener("click",function(e){if(e.target.id!=="sail")return;S.island++;S.coins+=20;S.grid=newGrid();last=-1;say("Welcome to island "+S.island+"! +20 coins.");save();render()});
$("reset").onclick=function(){if(confirm("Erase your island and start over?")){fresh();last=-1;say("A fresh start. Tap a dirt mound to dig.");save();render()}};
var cv=$("cv"),cx=cv.getContext("2d"),popT=0,hov=-1,HW=30,HH=15,OX=260,OY=80,RM=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function ctr(r,c){return [OX+(c-r)*HW,OY+(c+r+1)*HH]}
function cell(ev){var b=cv.getBoundingClientRect(),k=520/b.width,x=(ev.clientX-b.left)*k,y=(ev.clientY-b.top)*k,a=(y-OY)/HH,d=(x-OX)/HW,r=Math.floor((a-d)/2),c=Math.floor((a+d)/2);return r>=0&&r<8&&c>=0&&c<8?r*8+c:-1}
cv.addEventListener("click",function(e){var i=cell(e);if(i>=0)dig(i)});
cv.addEventListener("pointermove",function(e){hov=e.pointerType==="mouse"?cell(e):-1});
cv.addEventListener("pointerleave",function(){hov=-1});
cv.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();var i=S.grid.findIndex(function(t){return !t.o});if(i>=0)dig(i)}});
function isl(e,dy){dy=dy||0;cx.beginPath();cx.moveTo(OX,OY-e+dy);cx.lineTo(OX+8*HW+e*2,OY+8*HH+dy);cx.lineTo(OX,OY+16*HH+e+dy);cx.lineTo(OX-8*HW-e*2,OY+8*HH+dy);cx.closePath()}
function el(x,y,rx,ry,f){cx.fillStyle=f;cx.beginPath();cx.ellipse(x,y,rx,ry,0,0,7);cx.fill()}
function palm(x,y,s,ph,t){var tx=x+6*s,ty=y-46*s;cx.lineCap="round";cx.strokeStyle="#8a5a2b";cx.lineWidth=6*s;cx.beginPath();cx.moveTo(x,y);cx.quadraticCurveTo(x-8*s,y-24*s,tx,ty);cx.stroke();
for(var k=0;k<7;k++){var a=k*0.9+Math.sin(t*1.3+ph)*0.07,ex=tx+Math.cos(a)*34*s,ey=ty+Math.sin(a)*13*s+11*s;cx.strokeStyle="#23913f";cx.lineWidth=6*s;cx.beginPath();cx.moveTo(tx,ty);cx.quadraticCurveTo(tx+Math.cos(a)*18*s,ty-12*s,ex,ey);cx.stroke();cx.strokeStyle="#5ccf6c";cx.lineWidth=2.5*s;cx.stroke()}
el(tx-3*s,ty+3*s,3*s,3*s,"#6b4220");el(tx+3*s,ty+4*s,3*s,3*s,"#6b4220")}
function draw(ms){var t=RM?0:ms/1000,dpr=window.devicePixelRatio||1,w=cv.clientWidth,i,r,c,p;
if(w&&cv.width!==Math.round(w*dpr)){cv.width=Math.round(w*dpr);cv.height=Math.round(w*dpr*400/520)}
var q=cv.width/520;cx.setTransform(q,0,0,q,0,0);cx.globalAlpha=1;
var g=cx.createLinearGradient(0,0,0,400);g.addColorStop(0,"#52d6e4");g.addColorStop(1,"#1a86b0");cx.fillStyle=g;cx.fillRect(0,0,520,400);
cx.lineCap="round";cx.lineJoin="round";cx.strokeStyle="rgba(255,255,255,.3)";cx.lineWidth=2;
for(i=0;i<16;i++){var wx=((i*97+t*(8+i%3*5))%560)-20,wy=14+(i*53)%380;cx.beginPath();cx.ellipse(wx,wy,14,3,0,0,Math.PI);cx.stroke()}
isl(8);cx.strokeStyle="rgba(255,255,255,"+(.35+.2*Math.sin(t*2))+")";cx.lineWidth=16;cx.stroke();
isl(6,18);cx.fillStyle="#6e4524";cx.fill();
var L=[OX-8*HW-12,OY+8*HH],R=[OX+8*HW+12,OY+8*HH],B=[OX,OY+16*HH+6];
cx.fillStyle="#a8733d";cx.beginPath();cx.moveTo(L[0],L[1]);cx.lineTo(B[0],B[1]);cx.lineTo(B[0],B[1]+18);cx.lineTo(L[0],L[1]+18);cx.fill();
cx.fillStyle="#8a5a2c";cx.beginPath();cx.moveTo(R[0],R[1]);cx.lineTo(B[0],B[1]);cx.lineTo(B[0],B[1]+18);cx.lineTo(R[0],R[1]+18);cx.fill();
isl(6);cx.fillStyle="#f7e2a8";cx.fill();
[[1.5,-.2,1,0],[-.2,2.3,.9,1],[5.2,-.2,1.05,2],[-.2,6,.95,3]].forEach(function(a){p=ctr(a[0],a[1]);palm(p[0],p[1],a[2],a[3],t)});
for(r=0;r<8;r++)for(c=0;c<8;c++){i=r*8+c;var T=S.grid[i],x=ctr(r,c)[0],y=ctr(r,c)[1],ring=!r||!c||r===7||c===7,odd=(r+c)&1;
cx.fillStyle=ring?(odd?"#f2d994":"#f7e2a8"):(odd?"#7cc454":"#88cf5d");
cx.beginPath();cx.moveTo(x,y-HH);cx.lineTo(x+HW,y);cx.lineTo(x,y+HH);cx.lineTo(x-HW,y);cx.closePath();cx.fill();
if(i===hov&&!T.o){cx.strokeStyle="#fff";cx.lineWidth=2;cx.stroke()}
if(T.o){el(x,y+1,13,6.5,"#a87a47");el(x,y+2,11,5,"#5b3a1c");el(x,y+3,8,3.4,"#3d2711")}
else{el(x,y+3,14,6.5,"rgba(0,0,0,.2)");el(x,y,13,6.5,"#8b5a2b");el(x,y-3,11,6,"#b07a43");el(x-3,y-5,5,2.2,"#d9a56a")}}
if(last>=0){var U=S.grid[last],a=(performance.now()-popT)/1000;if(U.o&&a<1.5){p=ctr(last>>3,last&7);
if(U.i){var sc=a<.25?a/.25*1.25:Math.max(1,1.25-(a-.25)*1.5),ry=p[1]-6-Math.min(a,.35)*70-(a>.7?(a-.7)*40:0);cx.globalAlpha=a>.9?Math.max(0,1-(a-.9)/.6):1;cx.font=(26*sc)+"px sans-serif";cx.textAlign="center";cx.textBaseline="middle";cx.fillText(ITEMS[U.i][0],p[0],ry);
cx.strokeStyle="#fff7b0";cx.lineWidth=2;for(var s=0;s<6;s++){var ag=s*1.05,d=6+a*30;cx.beginPath();cx.moveTo(p[0]+Math.cos(ag)*d,p[1]-10+Math.sin(ag)*d*.6);cx.lineTo(p[0]+Math.cos(ag)*(d+5),p[1]-10+Math.sin(ag)*(d+5)*.6);cx.stroke()}}
else{cx.globalAlpha=Math.max(0,.5-a);el(p[0],p[1]-4,10+a*30,5+a*12,"#f4dc9e")}
cx.globalAlpha=1}}
requestAnimationFrame(draw)}
S=load();if(!S)fresh();regen();render();requestAnimationFrame(draw);
setInterval(function(){bars();$("refill").disabled=S.coins<30||S.energy>=maxE();save()},1000);
})();
