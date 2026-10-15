const THREE = window.THREE;
if (!THREE) throw new Error("No se pudo cargar la biblioteca 3D.");

const rooms = [
  { id: "vestibulo", file: "vestibulo.json", label: "Vestíbulo", x: 0, z: 25, bounds: [-9, 9, 18, 32], door: "south", entry: [0, 26, 0] },
  { id: "sala-41", file: "sala-41.json", label: "Origen y textos", x: -11, z: 9, bounds: [-18, -4, 2, 16], door: "east", entry: [-7.5, 9, Math.PI / 2] },
  { id: "sala-42", file: "sala-42.json", label: "Ideas y vida", x: 11, z: 9, bounds: [4, 18, 2, 16], door: "west", entry: [7.5, 9, -Math.PI / 2] },
  { id: "fiestas", file: "fiestas.json", label: "Fiestas", x: -11, z: -7, bounds: [-18, -4, -14, 0], door: "east", entry: [-7.5, -7, Math.PI / 2] },
  { id: "actualidad", file: "actualidad.json", label: "Mundo actual", x: 11, z: -7, bounds: [4, 18, -14, 0], door: "west", entry: [7.5, -7, -Math.PI / 2] },
  { id: "comparacion", file: "comparacion.json", label: "Comparación", x: -11, z: -23, bounds: [-18, -4, -30, -16], door: "east", entry: [-7.5, -23, Math.PI / 2] },
  { id: "final", file: "final.json", label: "Conclusiones", x: 0, z: -44, bounds: [-9, 9, -51, -37], door: "north", entry: [0, -41, 0] }
];
const $ = id => document.getElementById(id);
const canvas = $("scene");
const isTouch = matchMedia("(pointer: coarse)").matches;
const scene = new THREE.Scene();
function skyTexture() {
  const canvas=document.createElement("canvas");canvas.width=1024;canvas.height=512;
  const ctx=canvas.getContext("2d");
  const sky=ctx.createLinearGradient(0,0,0,512);
  sky.addColorStop(0,"#4f82ad");sky.addColorStop(.52,"#8cb7d0");sky.addColorStop(.83,"#c6d1ce");sky.addColorStop(1,"#e0d8c6");
  ctx.fillStyle=sky;ctx.fillRect(0,0,1024,512);
  for(const [x,y,w] of [[130,180,220],[570,115,180],[840,245,250]]) {
    const haze=ctx.createRadialGradient(x,y,5,x,y,w);
    haze.addColorStop(0,"rgba(255,255,255,.17)");haze.addColorStop(1,"rgba(255,255,255,0)");
    ctx.fillStyle=haze;ctx.fillRect(x-w,y-w,w*2,w*2);
  }
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
}
scene.background = skyTexture();
scene.fog = new THREE.FogExp2(0xb9c6c1, 0.005);
const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.05, 150);
camera.rotation.order = "YXZ";
camera.position.set(0, 1.65, 52);
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: !isTouch, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, isTouch ? 1.25 : 1.6));
  renderer.setSize(innerWidth, innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.24;
  renderer.shadowMap.enabled = !isTouch;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
} catch (error) {
  $("error-message").textContent = "Este navegador no pudo activar los gráficos 3D. Puedes recorrer todo el contenido en modo lectura.";
  $("error-overlay").hidden = false;
  throw error;
}

const mat = {
  wall: new THREE.MeshStandardMaterial({ color: 0x944b39, roughness: 0.9 }),
  wallDark: new THREE.MeshStandardMaterial({ color: 0x572632, roughness: 0.95 }),
  floor: new THREE.MeshStandardMaterial({ color: 0xb9956a, roughness: 0.9 }),
  floorLine: new THREE.MeshStandardMaterial({ color: 0x6c4333, roughness: 1 }),
  ceiling: new THREE.MeshStandardMaterial({ color: 0x643c30, roughness: 1 }),
  stone: new THREE.MeshStandardMaterial({ color: 0xd7a771, roughness: 0.85 }),
  exterior: new THREE.MeshStandardMaterial({ color: 0x857566, roughness: 0.94 }),
  ivory: new THREE.MeshStandardMaterial({ color: 0xe9d5ac, roughness: 0.88 }),
  garden: new THREE.MeshStandardMaterial({ color: 0x577251, roughness: 1 }),
  leaf: new THREE.MeshStandardMaterial({ color: 0x36583e, roughness: 1, side: THREE.DoubleSide }),
  leafLight: new THREE.MeshStandardMaterial({ color: 0x567544, roughness: 1, side: THREE.DoubleSide }),
  bronze: new THREE.MeshStandardMaterial({ color: 0xe0ac55, metalness: 0.3, roughness: 0.4 }),
  bronzeDark: new THREE.MeshStandardMaterial({ color: 0x5e3e22, metalness: 0.35, roughness: 0.5 }),
  carpet: new THREE.MeshStandardMaterial({ color: 0x602b28, roughness: 1 }),
  plinth: new THREE.MeshStandardMaterial({ color: 0x4d3028, roughness: 0.9 }),
  velvet: new THREE.MeshStandardMaterial({ color: 0x762c39, roughness: 1 }),
  velvetGold: new THREE.MeshStandardMaterial({ color: 0xc3904e, roughness: 1 }),
  wood: new THREE.MeshStandardMaterial({ color: 0x542c21, roughness: .74 }),
  sculpture: new THREE.MeshStandardMaterial({ color: 0x9c7659, roughness: .9, metalness: .02 }),
  glass: new THREE.MeshPhysicalMaterial({color:0x263e42,roughness:.22,metalness:.1,transparent:true,opacity:.94,side:THREE.DoubleSide}),
  mortar: new THREE.MeshStandardMaterial({color:0x736c61,roughness:1}),
  foliage: new THREE.MeshStandardMaterial({color:0x476c38,roughness:1}),
  foliageLight: new THREE.MeshStandardMaterial({color:0x6b8544,roughness:1})
};
function stoneNoise(x,y,seed) {
  let n=Math.imul(x,374761393)^Math.imul(y,668265263)^seed;
  n=Math.imul(n^(n>>>13),1274126177);
  return ((n^(n>>>16))>>>0)/4294967295;
}
function smoothStoneNoise(x,y,scale,seed) {
  const gx=x/scale,gy=y/scale,ix=Math.floor(gx),iy=Math.floor(gy);
  const sx=(gx-ix)**2*(3-2*(gx-ix)),sy=(gy-iy)**2*(3-2*(gy-iy));
  const a=stoneNoise(ix,iy,seed),b=stoneNoise(ix+1,iy,seed);
  const c=stoneNoise(ix,iy+1,seed),d=stoneNoise(ix+1,iy+1,seed);
  return (a+(b-a)*sx)*(1-sy)+(c+(d-c)*sx)*sy;
}
function mineralTexture(base, seed, strength = 1) {
  const canvas = document.createElement("canvas"); canvas.width = canvas.height = 256;
  const context = canvas.getContext("2d");
  const image = context.createImageData(256, 256);
  for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
    const broad=smoothStoneNoise(x,y,80,seed)-.5;
    const medium=smoothStoneNoise(x,y,22,seed+41)-.5;
    const fine=smoothStoneNoise(x,y,5,seed+89)-.5;
    const n=(broad*22+medium*10+fine*4)*strength;
    const i = (y * 256 + x) * 4;
    image.data[i] = Math.max(0, Math.min(255, base[0] + n));
    image.data[i + 1] = Math.max(0, Math.min(255, base[1] + n));
    image.data[i + 2] = Math.max(0, Math.min(255, base[2] + n));
    image.data[i + 3] = 255;
  }
  context.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}
for (const [material, color, seed] of [
  [mat.wall, [147, 86, 69], 11], [mat.floor, [189, 165, 136], 29],
  [mat.stone, [198, 160, 117], 43], [mat.exterior, [151, 140, 124], 61],
  [mat.ivory, [215, 205, 185], 71], [mat.sculpture, [151, 128, 103], 81],
  [mat.garden, [88, 112, 69], 99]
]) {
  material.color.set(0xffffff);
  material.map = mineralTexture(color, seed, material===mat.garden?1.5:1);
  material.bumpMap = material.map;
  material.bumpScale = material===mat.garden ? .05 : .018;
}
mat.facade=mat.exterior.clone();
function textileTexture(base,wood=false) {
  const canvas=document.createElement("canvas");canvas.width=canvas.height=256;
  const ctx=canvas.getContext("2d"),image=ctx.createImageData(256,256);
  for(let y=0;y<256;y++)for(let x=0;x<256;x++){
    const noise=wood ? Math.sin(y*.25+Math.sin(x*.07)*2)*5+(smoothStoneNoise(x,y,35,211)-.5)*11
      : ((x%4===0?1:-1)+(y%4===0?1:-1))*2+(smoothStoneNoise(x,y,17,307)-.5)*5;
    const i=(y*256+x)*4;
    for(let channel=0;channel<3;channel++)image.data[i+channel]=base[channel]+noise;
    image.data[i+3]=255;
  }
  ctx.putImageData(image,0,0);
  const texture=new THREE.CanvasTexture(canvas);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
  texture.repeat.set(3,3);texture.colorSpace=THREE.SRGBColorSpace;return texture;
}
for(const [material,color,wood] of [
  [mat.wood,[87,49,35],true],[mat.velvet,[113,39,55],false],[mat.carpet,[92,36,41],false]
]){
  material.color.set(0xffffff);material.map=textileTexture(color,wood);
  material.bumpMap=material.map;material.bumpScale=wood ? .016 : .009;
}
scene.add(new THREE.HemisphereLight(0xf1e8d5, 0x554b43, 1.35));
const sunlight = new THREE.DirectionalLight(0xffe1af, 2.4);
sunlight.position.set(-18, 28, 42); scene.add(sunlight);
sunlight.castShadow = true;
sunlight.shadow.mapSize.set(1024, 1024);
sunlight.shadow.camera.left = -35; sunlight.shadow.camera.right = 35;
sunlight.shadow.camera.top = 55; sunlight.shadow.camera.bottom = -55;
sunlight.shadow.camera.near = 1; sunlight.shadow.camera.far = 90;
sunlight.shadow.bias = -.0003;
const walls = [];
const interactive = [];
const textureLoader = new THREE.TextureLoader();
function imageSource(path) {
  return location.protocol === "file:" ? (window.MUSEO_OFFLINE?.images?.[path] || path) : path;
}
async function loadMuseumTextures() {
  const surfaces=[
    ["assets/img/textura-piedra-exterior-v2.png",mat.facade,.028],
    ["assets/img/textura-yeso-interior-v2.png",mat.wall,.017],
    ["assets/img/textura-suelo-piedra-v2.png",mat.floor,.013]
  ];
  await Promise.all(surfaces.map(([path,material,bump])=>new Promise(resolve=>{
    textureLoader.load(imageSource(path),texture=>{
      texture.colorSpace=THREE.SRGBColorSpace;
      texture.wrapS=texture.wrapT=THREE.RepeatWrapping;
      texture.repeat.set(1,1);
      texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
      material.map=texture;material.bumpMap=texture;material.bumpScale=bump;material.needsUpdate=true;
      resolve();
    },undefined,()=>resolve());
  })));
}
const textureCache = new Map();
const dataById = new Map();
let credits = null;
let bibliography = null;
let yaw = 0, pitch = 0, started = false, dragging = false, dragMoved = false;
let lastX = 0, lastY = 0, dragStartX = 0, dragStartY = 0, currentTarget = null, currentRoom = "exterior";
let joyX = 0, joyY = 0, joystickPointer = null;
const keys = new Set();
const visited = new Set();
const raycaster = new THREE.Raycaster();
const clock = new THREE.Clock();

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[char]);
}
function safeUrl(value) {
  try { const url = new URL(value, location.href); return ["http:", "https:"].includes(url.protocol) ? escapeHtml(url.href) : "#"; } catch { return "#"; }
}
function box(x, y, z, w, h, d, material, collision = false) {
  const geometry=new THREE.BoxGeometry(w,h,d);
  const uv=geometry.getAttribute("uv"),faces=[[d,h],[d,h],[w,d],[w,d],[w,h],[w,h]];
  for(let face=0;face<6;face++)for(let vertex=0;vertex<4;vertex++){
    const i=face*4+vertex;
    uv.setXY(i,uv.getX(i)*faces[face][0]/3.2,uv.getY(i)*faces[face][1]/3.2);
  }
  uv.needsUpdate=true;
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  if (y <= 0 && h < 1) mesh.receiveShadow = true;
  scene.add(mesh);
  if (collision) walls.push({ minX: x - w / 2, maxX: x + w / 2, minZ: z - d / 2, maxZ: z + d / 2 });
  return mesh;
}
function wallX(x, z1, z2, material = mat.wall) { box(x, 2.65, (z1 + z2) / 2, .42, 5.3, z2 - z1, material, true); }
function wallZ(z, x1, x2, material = mat.wall) { box((x1 + x2) / 2, 2.65, z, x2 - x1, 5.3, .42, material, true); }
function floorArea(x1, x2, z1, z2) {
  box((x1+x2)/2, -.12, (z1+z2)/2, x2-x1, .24, z2-z1, mat.floor);
  box((x1+x2)/2, 5.45, (z1+z2)/2, x2-x1, .3, z2-z1, mat.ceiling);
  for (let z = Math.ceil(z1 / 2) * 2; z < z2; z += 2) box((x1+x2)/2, .012, z, x2-x1, .012, .045, mat.floorLine);
  for (let x = Math.ceil(x1 / 2) * 2; x < x2; x += 2) box(x, .012, (z1+z2)/2, .045, .012, z2-z1, mat.floorLine);
  for(const z of [z1+.48,z2-.48])box((x1+x2)/2,.023,z,x2-x1-.95,.016,.035,mat.bronzeDark);
  for(const x of [x1+.48,x2-.48])box(x,.023,(z1+z2)/2,.035,.016,z2-z1-.95,mat.bronzeDark);
  for(let x=x1+2.4;x<x2-1;x+=3.4)box(x,5.2,(z1+z2)/2,.11,.18,z2-z1-.5,mat.wood);
  for(let z=z1+2.4;z<z2-1;z+=3.4)box((x1+x2)/2,5.2,z,x2-x1-.5,.18,.11,mat.wood);
}
function makeTextTexture(text, background = "#421d1a", foreground = "#efc16b", aspect = 4) {
  const c = document.createElement("canvas"); c.width = 1024; c.height = Math.max(96,Math.round(1024/aspect));
  const context = c.getContext("2d");
  context.fillStyle = background; context.fillRect(0, 0, c.width, c.height);
  const inset=Math.max(7,Math.round(c.height*.055));
  context.strokeStyle = foreground; context.lineWidth = Math.max(3,Math.round(c.height*.025));
  context.strokeRect(inset,inset,c.width-inset*2,c.height-inset*2);
  let fontSize=Math.min(76,Math.round(c.height*.44));
  context.font = `bold ${fontSize}px Georgia,serif`;
  context.textAlign = "center"; context.textBaseline = "middle"; context.fillStyle = foreground;
  let label = text;
  while(context.measureText(label).width>c.width*.89&&fontSize>25){fontSize-=2;context.font=`bold ${fontSize}px Georgia,serif`;}
  while (context.measureText(label).width > c.width*.89 && label.length > 6) label = label.slice(0, -2);
  if (label !== text) label += "…";
  context.fillText(label, c.width/2, c.height/2+2);
  const texture = new THREE.CanvasTexture(c); texture.colorSpace = THREE.SRGBColorSpace; return texture;
}
function sign(text, x, y, z, w, h, rotation = 0) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: makeTextTexture(text,"#421d1a","#efc16b",w/h), side: THREE.FrontSide }));
  mesh.position.set(x,y,z); mesh.rotation.y = rotation; scene.add(mesh); return mesh;
}
function lamp(x, z, y = 4.6) {
  const light = new THREE.PointLight(0xffc778, 12, 12, 2);
  light.position.set(x, y, z); scene.add(light);
  const globe = new THREE.Mesh(new THREE.SphereGeometry(.14, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffd891 }));
  globe.position.copy(light.position); scene.add(globe);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(.28, .035, 8, 24), mat.bronze);
  ring.rotation.x = Math.PI / 2; ring.position.set(x,y-.06,z); scene.add(ring);
}
function floralTexture() {
  const canvas=document.createElement("canvas");canvas.width=512;canvas.height=128;
  const ctx=canvas.getContext("2d");ctx.fillStyle="#632043";ctx.fillRect(0,0,512,128);
  ctx.strokeStyle="#edbb5a";ctx.lineWidth=3;
  for(const y of [7,13,115,121]){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(512,y);ctx.stroke();}
  for(let i=0;i<4;i++){
    const x=64+i*128,y=64;
    for(let p=0;p<8;p++){
      const a=p*Math.PI/4;
      ctx.save();ctx.translate(x+Math.cos(a)*22,y+Math.sin(a)*22);ctx.rotate(a+Math.PI/2);
      ctx.beginPath();ctx.ellipse(0,0,12,26,0,0,Math.PI*2);ctx.stroke();ctx.restore();
    }
    ctx.beginPath();ctx.arc(x,y,12,0,Math.PI*2);ctx.stroke();
    ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.fillStyle="#edbb5a";ctx.fill();
    ctx.beginPath();ctx.moveTo(x-64,y);ctx.lineTo(x-51,y-10);ctx.lineTo(x-39,y);ctx.lineTo(x-51,y+10);ctx.closePath();ctx.stroke();
    ctx.beginPath();ctx.moveTo(x+39,y);ctx.lineTo(x+51,y-10);ctx.lineTo(x+64,y);ctx.lineTo(x+51,y+10);ctx.closePath();ctx.stroke();
  }
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  texture.wrapS=THREE.RepeatWrapping;return texture;
}
const floralBase=floralTexture();
function ornamentalBand(x,z,length,rotation=0,y=4.55) {
  const texture=floralBase.clone();texture.repeat.set(length/5,1);texture.needsUpdate=true;
  const band=new THREE.Mesh(new THREE.PlaneGeometry(length,.72),new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}));
  band.position.set(x,y,z);band.rotation.y=rotation;scene.add(band);
}
function panelWallZ(z,x1,x2,inward) {
  box((x1+x2)/2,.78,z+inward*.27,x2-x1,1.34,.1,mat.wood);
  box((x1+x2)/2,1.48,z+inward*.32,x2-x1,.085,.16,mat.bronzeDark);
  box((x1+x2)/2,.24,z+inward*.32,x2-x1,.14,.18,mat.stone);
  for(let x=x1+1.3;x<x2-1;x+=2.65){
    box(x,.83,z+inward*.335,2.25,.91,.045,mat.bronzeDark);
    box(x,.83,z+inward*.365,2.08,.75,.036,mat.wood);
  }
}
function panelWallX(x,z1,z2,inward) {
  box(x+inward*.27,.78,(z1+z2)/2,.1,1.34,z2-z1,mat.wood);
  box(x+inward*.32,1.48,(z1+z2)/2,.16,.085,z2-z1,mat.bronzeDark);
  box(x+inward*.32,.24,(z1+z2)/2,.18,.14,z2-z1,mat.stone);
  for(let z=z1+1.3;z<z2-1;z+=2.65){
    box(x+inward*.335,.83,z,.045,.91,2.25,mat.bronzeDark);
    box(x+inward*.365,.83,z,.036,.75,2.08,mat.wood);
  }
}
function wallSconce(x,y,z,alongX=false) {
  const base=box(x,y,z,.28,.52,.14,mat.bronzeDark);if(alongX)base.rotation.y=Math.PI/2;
  const bracket=new THREE.Mesh(new THREE.CylinderGeometry(.045,.06,.45,10),mat.bronze);
  bracket.position.set(x,y-.3,z);scene.add(bracket);
  const shade=new THREE.Mesh(new THREE.ConeGeometry(.22,.31,16),mat.ivory);
  shade.rotation.z=Math.PI;shade.position.set(x,y+.33,z);scene.add(shade);
  const flame=new THREE.Mesh(new THREE.SphereGeometry(.1,12,8),new THREE.MeshBasicMaterial({color:0xffdf9c}));
  flame.position.set(x,y+.09,z);scene.add(flame);
  const light=new THREE.PointLight(0xffc883,2.4,4,2);light.position.copy(flame.position);scene.add(light);
}
function roomArchitecture(room) {
  const [x1,x2,z1,z2]=room.bounds;
  if(room.door==="east"||room.door==="west"){
    panelWallZ(z1,x1,x2,1);panelWallZ(z2,x1,x2,-1);
    panelWallX(room.door==="east"?x1:x2,z1,z2,room.door==="east"?1:-1);
    wallSconce(room.x,3.05,z1+.4);
  }else{
    panelWallX(x1,z1,z2,1);panelWallX(x2,z1,z2,-1);
    if(room.id!=="vestibulo")panelWallZ(z1,x1,x2,1);
    wallSconce(x2-.4,3.05,room.z,true);
  }
}
function lotusMedallion(x,z,ceiling=false) {
  const group=new THREE.Group();
  const backing=new THREE.Mesh(new THREE.CylinderGeometry(1.18,1.18,.025,48),mat.wallDark);
  group.add(backing);
  for(let i=0;i<12;i++){
    const a=i*Math.PI/6;
    const petal=new THREE.Mesh(new THREE.SphereGeometry(.29,12,8),mat.bronze);
    petal.scale.set(1,.06,2.05);petal.position.set(Math.sin(a)*.64,.025,Math.cos(a)*.64);
    petal.rotation.y=a;group.add(petal);
  }
  const heart=new THREE.Mesh(new THREE.CylinderGeometry(.25,.25,.04,24),mat.ivory);heart.position.y=.05;group.add(heart);
  group.position.set(x,ceiling?5.26:.035,z);
  if(ceiling)group.rotation.z=Math.PI;
  scene.add(group);
}
function column(x,z) {
  box(x,.18,z,.72,.36,.72,mat.stone);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(.22,.27,4.6,10),mat.stone);
  shaft.position.set(x,2.55,z); scene.add(shaft);
  box(x,4.92,z,.85,.27,.85,mat.bronzeDark);
  box(x,4.63,z,.65,.17,.65,mat.bronze);
  for(let i=0;i<8;i++){
    const a=i*Math.PI/4;
    const petal=new THREE.Mesh(new THREE.SphereGeometry(.15,8,6),mat.bronze);
    petal.scale.set(.6,.25,1.55);petal.position.set(x+Math.sin(a)*.31,4.48,z+Math.cos(a)*.31);petal.rotation.y=a;scene.add(petal);
  }
}
function portal(x,z,side,label) {
  const left = side === "west" || side === "east" ? [x,z-2.65] : [x-2.65,z];
  const right = side === "west" || side === "east" ? [x,z+2.65] : [x+2.65,z];
  column(...left); column(...right);
  if (side === "west" || side === "east") {
    box(x,4.98,z,.56,.33,5.6,mat.bronzeDark);
    sign(label,x-.3,4.64,z,3.7,.47,-Math.PI/2);
    sign(label,x+.3,4.64,z,3.7,.47,Math.PI/2);
  } else {
    box(x,4.98,z,5.6,.33,.56,mat.bronzeDark);
    sign(label,x,4.64,z-.3,3.7,.47,Math.PI);
    sign(label,x,4.64,z+.3,3.7,.47,0);
  }
  const arch = new THREE.Mesh(new THREE.TorusGeometry(2.55,.085,8,48,Math.PI),mat.bronze);
  arch.position.set(x,2.2,z);
  if (side === "west" || side === "east") arch.rotation.y=Math.PI/2;
  scene.add(arch);
  for(let i=1;i<12;i++){
    const a=i*Math.PI/12;
    const petal=new THREE.Mesh(new THREE.SphereGeometry(.115,8,6),mat.ivory);
    petal.position.set((side==="west"||side==="east")?x:x+2.55*Math.cos(a),2.2+2.55*Math.sin(a),(side==="west"||side==="east")?z+2.55*Math.cos(a):z);
    scene.add(petal);
  }
}
function wallSegments(x, doors) {
  const cuts = doors.map(z => [z-2.55,z+2.55]).sort((a,b)=>a[0]-b[0]);
  let start = -37;
  for (const [lo,hi] of cuts) { if (lo > start) wallX(x,start,lo); start = hi; }
  if (start < 18) wallX(x,start,18);
}
function dome(x,z,radius,baseY=5.75) {
  const drumHeight=radius>4?1.15:.7;
  const drum=new THREE.Mesh(new THREE.CylinderGeometry(radius*.88,radius*.92,drumHeight,48),mat.exterior);
  drum.position.set(x,baseY+drumHeight/2,z);drum.castShadow=true;scene.add(drum);
  for(const height of [baseY+.08,baseY+drumHeight-.08]){
    const ring=new THREE.Mesh(new THREE.TorusGeometry(radius*.91,.055,8,64),mat.stone);
    ring.rotation.x=Math.PI/2;ring.position.set(x,height,z);scene.add(ring);
  }
  const profile=[
    [0,0],[radius*.9,0],[radius*.99,radius*.10],[radius*1.01,radius*.22],
    [radius*.96,radius*.42],[radius*.78,radius*.70],[radius*.47,radius*.94],
    [radius*.15,radius*1.09],[0,radius*1.11]
  ].map(([r,h])=>new THREE.Vector2(r,h));
  const roof=new THREE.Mesh(new THREE.LatheGeometry(profile,64),mat.ivory);
  roof.position.set(x,baseY+drumHeight,z);roof.castShadow=true;scene.add(roof);
  for(let i=0;i<16;i++){
    const a=i*Math.PI/8;
    const points=profile.slice(1,-1).map(point=>new THREE.Vector3(x+point.x*Math.cos(a),baseY+drumHeight+point.y,z+point.x*Math.sin(a)));
    const rib=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),18,.018*radius,5),mat.stone);
    scene.add(rib);
  }
  const finial=new THREE.Mesh(new THREE.SphereGeometry(radius*.11,16,10),mat.bronze);
  finial.position.set(x,baseY+drumHeight+radius*1.12,z);scene.add(finial);
  const point=new THREE.Mesh(new THREE.ConeGeometry(radius*.075,radius*.4,12),mat.bronzeDark);
  point.position.set(x,baseY+drumHeight+radius*1.36,z);scene.add(point);
}
function palm(x,z,height=6.2) {
  const lean=(x<0?1:-1)*.24;
  for(let i=0;i<9;i++){
    const y1=height*i/9,y2=height*(i+1)/9;
    const r1=.29-i*.017,r2=r1-.012;
    const trunk=new THREE.Mesh(new THREE.CylinderGeometry(r2,r1,y2-y1,12),mat.wood);
    trunk.position.set(x+lean*(i+.5)/9,(y1+y2)/2,z);trunk.rotation.z=-lean/height;
    trunk.castShadow=true;scene.add(trunk);
    const scar=new THREE.Mesh(new THREE.TorusGeometry(r2+.009,.018,5,12),mat.bronzeDark);
    scar.rotation.x=Math.PI/2;scar.position.set(x+lean*(i+1)/9,y2,z);scene.add(scar);
  }
  const topX=x+lean;
  for(let i=0;i<10;i++){
    const a=i*Math.PI/5+.13;
    const start=new THREE.Vector3(topX,height,z);
    const mid=new THREE.Vector3(topX+Math.cos(a)*1.25,height+.55,z+Math.sin(a)*1.25);
    const end=new THREE.Vector3(topX+Math.cos(a)*3.45,height-1.42,z+Math.sin(a)*3.45);
    const curve=new THREE.QuadraticBezierCurve3(start,mid,end);
    const stem=new THREE.Mesh(new THREE.TubeGeometry(curve,18,.035,6),mat.leaf);scene.add(stem);
    const vertices=[];
    for(let k=1;k<=14;k++){
      const t=k/15,p=curve.getPoint(t),next=curve.getPoint(Math.min(1,t+.08));
      const length=.55*(1-.55*t)*Math.sin(Math.PI*t)**.55;
      for(const side of [-1,1]){
        const lateral=new THREE.Vector3(-Math.sin(a)*side,0,Math.cos(a)*side);
        const mid=p.clone().addScaledVector(lateral,length*.55).add(new THREE.Vector3(0,.08,0));
        const tip=p.clone().addScaledVector(lateral,length).addScaledVector(next.clone().sub(p),.4).add(new THREE.Vector3(0,-.12,0));
        const endPoint=next.clone().addScaledVector(lateral,length*.3);
        for(const v of [p,mid,tip,p,tip,endPoint])vertices.push(v.x,v.y,v.z);
      }
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute("position",new THREE.Float32BufferAttribute(vertices,3));geometry.computeVertexNormals();
    const leaves=new THREE.Mesh(geometry,i%3===0?mat.leafLight:mat.leaf);leaves.castShadow=true;scene.add(leaves);
  }
  addFurnitureCollider(x,z,.48,.48);
}
function facadeWindow(x,z) {
  const shape=new THREE.Shape();
  shape.moveTo(-.76,1.12);shape.lineTo(-.76,3.37);
  shape.quadraticCurveTo(-.76,4.22,0,4.35);
  shape.quadraticCurveTo(.76,4.22,.76,3.37);
  shape.lineTo(.76,1.12);shape.closePath();
  const glass=new THREE.Mesh(new THREE.ShapeGeometry(shape),mat.glass);
  glass.position.set(x,0,z+.13);scene.add(glass);
  const outline=[new THREE.Vector3(x-.85,1.05,z+.21),new THREE.Vector3(x-.85,3.37,z+.21)];
  for(let i=0;i<=16;i++){
    const t=i/16;
    outline.push(new THREE.Vector3(x-.85+1.7*t,3.37+.98*Math.sin(Math.PI*t),z+.21));
  }
  outline.push(new THREE.Vector3(x+.85,1.05,z+.21));
  const frame=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(outline),36,.065,8,false),mat.stone);
  frame.castShadow=true;scene.add(frame);
  box(x,1.02,z+.24,2,.14,.35,mat.stone);
  for(const dx of [-.39,0,.39])box(x+dx,2.39,z+.22,.045,2.5,.065,mat.bronzeDark);
  for(const wy of [1.75,2.45,3.13])box(x,wy,z+.22,1.49,.045,.065,mat.bronzeDark);
  const gleam=new THREE.Mesh(new THREE.PlaneGeometry(.09,2.1),new THREE.MeshBasicMaterial({color:0xd4d7cc,transparent:true,opacity:.13}));
  gleam.position.set(x-.56,2.4,z+.25);gleam.rotation.z=-.12;scene.add(gleam);
}
function shrub(x,z,scale=1) {
  const center=new THREE.Vector3(x,.33*scale,z);
  for(let i=0;i<7;i++){
    const a=i*Math.PI*2/7,r=.23*scale;
    const leaf=new THREE.Mesh(new THREE.IcosahedronGeometry((i%2?.28:.34)*scale,1),i%3===0?mat.foliageLight:mat.foliage);
    leaf.position.set(center.x+Math.cos(a)*r,center.y+(i%2)*.12*scale,center.z+Math.sin(a)*r);
    leaf.castShadow=true;scene.add(leaf);
  }
  for(let i=0;i<3;i++){
    const flower=new THREE.Mesh(new THREE.SphereGeometry(.055*scale,7,5),i%2?mat.bronze:mat.velvetGold);
    flower.position.set(x+Math.cos(i*2.2)*.25*scale,.66*scale,z+Math.sin(i*2.2)*.25*scale);scene.add(flower);
  }
}
function buildExterior() {
  box(0,-.57,46,120,.28,100,mat.garden);
  box(0,-.36,50,65,.36,40,mat.garden);
  box(0,-.13,49.6,6.2,.24,36,mat.floor);
  const paving=[mat.floor,mat.floor.clone(),mat.floor.clone()];
  const facadeFaces=[mat.exterior,mat.exterior,mat.exterior,mat.exterior,mat.facade,mat.exterior];
  paving[1].color.set(0xf1eee6);paving[2].color.set(0xe9e1d5);
  for(let row=0,z=33.1;z<67.8;row++,z+=1.88){
    for(let col=0;col<3;col++){
      const x=(col-1)*2.06;
      const slab=box(x,.015,z,1.98,.05,1.77,paving[(row+col)%3]);
      const uv=slab.geometry.getAttribute("uv"),shiftU=((row*7+col*3)%13)/13,shiftV=((row*11+col*5)%17)/17;
      for(let vertex=0;vertex<uv.count;vertex++)uv.setXY(vertex,uv.getX(vertex)+shiftU,uv.getY(vertex)+shiftV);
      uv.needsUpdate=true;
      slab.castShadow=true;
    }
  }
  for(const x of [-3.22,3.22])box(x,.04,49.8,.13,.12,35.7,mat.stone);
  for(const side of [-1,1]){
    const x=side*16;
    const wing=box(x,2.65,32,14,5.3,.65,facadeFaces,true);wing.castShadow=true;
    box(x,5.45,32.2,14,.3,1.25,mat.stone).castShadow=true;
    box(x,5.7,32.25,14,.16,.9,mat.bronzeDark);
    box(x,.43,32.53,14,.33,.39,mat.stone);
    const pier=box(side*5.8,2.65,32.23,6.2,5.3,.4,facadeFaces);pier.castShadow=true;
    ornamentalBand(x,32.37,14,0,4.73);
    for(const wx of [side*11,side*15,side*19]){
      facadeWindow(wx,32.45);
    }
    for(const px of [side*9,side*13,side*17,side*21]){
      box(px,2.65,32.6,.38,5.1,.42,mat.stone).castShadow=true;
      box(px,.48,32.67,.65,.32,.57,mat.exterior);
      box(px,5.05,32.68,.68,.23,.56,mat.exterior);
    }
    for(const px of [side*3.05,side*8.55]){
      box(px,2.64,32.58,.48,5.25,.54,mat.stone).castShadow=true;
      box(px,5.24,32.64,.7,.22,.65,mat.bronzeDark);
    }
    for(const px of [side*11.5,side*19.5])palm(px,43,6.1);
    palm(side*23,54,7.2);
    box(side*12,.24,48,13,.48,1.35,mat.wallDark);
    box(side*12,.62,48,12.5,.3,1.05,mat.garden);
    box(side*4.95,-.04,54,1.12,.15,22,mat.stone);
    for(let z=44;z<=64;z+=2.4)shrub(side*(4.85+(Math.round(z)%2)*.24),z,.9+(Math.round(z)%3)*.12);
    addFurnitureCollider(side*4.95,54,1.45,22);
    const minaret=new THREE.Mesh(new THREE.CylinderGeometry(.72,.83,3.1,12),mat.exterior);
    minaret.position.set(side*8.7,6.5,31.9);minaret.castShadow=true;scene.add(minaret);
    for(const y of [5.22,6.35,7.55]){
      const rim=new THREE.Mesh(new THREE.TorusGeometry(.81,.06,8,24),mat.stone);
      rim.rotation.x=Math.PI/2;rim.position.set(side*8.7,y,31.9);scene.add(rim);
    }
    const cap=new THREE.Mesh(new THREE.SphereGeometry(.8,16,8,0,Math.PI*2,0,Math.PI/2),mat.ivory);
    cap.position.set(side*8.7,8.05,31.9);scene.add(cap);
  }
  box(0,5.42,32.22,17.6,.18,.9,mat.stone).castShadow=true;
  box(0,6.02,32.15,17.6,1.18,.7,mat.exterior).castShadow=true;
  box(0,6.58,32.29,18.2,.22,.88,mat.stone).castShadow=true;
  sign("MUSEO DEL HINDUISMO",0,6.02,32.57,9,.7,0);
  portal(0,32,"south","ENTRADA PRINCIPAL");
  dome(0,24.4,5.15);
  dome(-16,24,2.3);dome(16,24,2.3);
  for(const x of [-3.4,3.4]){
    const torch=new THREE.PointLight(0xffb85b,7,5);torch.position.set(x,2.6,32.8);scene.add(torch);
    const bowl=new THREE.Mesh(new THREE.SphereGeometry(.2,10,6),mat.bronze);bowl.position.copy(torch.position);scene.add(bowl);
  }
  elephantSculpture(-8.4,39.5,Math.PI+.16,2.15,-.18);
  elephantSculpture(8.4,39.5,Math.PI-.16,2.15,-.18);
}
function buildShell() {
  buildExterior();
  floorArea(-4,4,-37,18);
  box(0,.018,-9.5,3.1,.025,55,mat.carpet);
  for (let z=-31;z<=16;z+=8) lamp(0,z);
  wallSegments(-4,[9,-7,-23]); wallSegments(4,[9,-7]);
  for (const room of rooms) {
    const [x1,x2,z1,z2]=room.bounds;
    floorArea(x1,x2,z1,z2);
    lamp(room.x,room.z);
    if (room.door === "east" || room.door === "west") {
      wallZ(z1,x1,x2); wallZ(z2,x1,x2);
      wallX(room.door === "east" ? x1 : x2,z1,z2);
      portal(room.door === "east" ? x2 : x1,room.z,room.door,room.label);
    } else {
      wallX(x1,z1,z2); wallX(x2,z1,z2);
      if(room.id==="vestibulo"){
        wallZ(z2,x1,-2.7);wallZ(z2,2.7,x2);
      } else wallZ(room.door === "south" ? z2 : z1,x1,x2);
      const entryWall = room.door === "south" ? z1 : z2;
      wallZ(entryWall,x1,-2.6); wallZ(entryWall,2.6,x2);
      portal(0,entryWall,room.door,room.label);
    }
    for (const z of [z1+.2,z2-.2]) box(room.x,.3,z,x2-x1,.16,.18,mat.bronzeDark);
    ornamentalBand(room.x,z1+.24,x2-x1);
    ornamentalBand(room.x,z2-.24,x2-x1);
    ornamentalBand(x1+.24,room.z,z2-z1,Math.PI/2);
    ornamentalBand(x2-.24,room.z,z2-z1,Math.PI/2);
    lotusMedallion(room.x,room.z,true);
    roomArchitecture(room);
  }
  for(const x of [-3.75,3.75])ornamentalBand(x,-9.5,55,Math.PI/2);
  wallZ(18,-4,-2.6); wallZ(18,2.6,4);
  wallZ(-37,-4,-2.6); wallZ(-37,2.6,4);
  sign("LAS SALAS DEL HINDUISMO",0,4.86,16.7,5.2,.64,Math.PI);
  const mandala = new THREE.Group();
  for (const radius of [1.1,1.65,2.2]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius,.045,8,80),mat.bronze);
    ring.rotation.x = -Math.PI/2; mandala.add(ring);
  }
  for (let i=0;i<12;i++) {
    const angle=i*Math.PI/6;
    const strip=box(Math.cos(angle)*1.4,.025,25+Math.sin(angle)*1.4,.12,.02,1.1,mat.bronze);
    strip.rotation.y = -angle;
  }
  mandala.position.set(0,.04,25); scene.add(mandala);
}

function markInteractive(group, payload) {
  group.userData.exhibit = payload;
  interactive.push(group);
  scene.add(group);
}
function artwork(room, item, index) {
  const group = new THREE.Group();
  const offset = (index - 1) * 4.2;
  if (room.id === "vestibulo") { group.position.set(room.bounds[0]+.29,2.7,room.z+offset); group.rotation.y=Math.PI/2; }
  else if (room.door === "east") { group.position.set(room.bounds[0]+.29,2.7,room.z+offset); group.rotation.y=Math.PI/2; }
  else if (room.door === "west") { group.position.set(room.bounds[1]-.29,2.7,room.z+offset); group.rotation.y=-Math.PI/2; }
  else if (room.door === "south") { group.position.set(offset,2.7,room.bounds[3]-.29); group.rotation.y=Math.PI; }
  else if (room.door === "north") { group.position.set(offset,2.7,room.bounds[2]+.29); }
  const outer = new THREE.Mesh(new THREE.BoxGeometry(3.25,2.55,.16),mat.bronzeDark);
  outer.castShadow=true;group.add(outer);
  const border = new THREE.Mesh(new THREE.BoxGeometry(3.05,2.35,.18),mat.bronze);
  border.position.z=.02;border.castShadow=true;group.add(border);
  const matte = new THREE.Mesh(new THREE.PlaneGeometry(2.85,2.15),new THREE.MeshBasicMaterial({color:0xe9d9b8,side:THREE.DoubleSide}));
  matte.position.z=.12; group.add(matte);
  const picture = new THREE.Mesh(new THREE.PlaneGeometry(2.65,1.95),new THREE.MeshBasicMaterial({color:0x8b5b43,side:THREE.DoubleSide}));
  picture.position.z=.13; group.add(picture);
  const texture = textureCache.get(item.imagen);
  if (texture) setPicture(texture);
  else textureLoader.load(imageSource(item.imagen), loaded => { loaded.colorSpace=THREE.SRGBColorSpace; loaded.anisotropy=renderer.capabilities.getMaxAnisotropy(); textureCache.set(item.imagen,loaded); setPicture(loaded); }, undefined, () => {
    picture.material.color.set(0x583a31);
  });
  function setPicture(loaded) {
    const ratio=loaded.image.width/loaded.image.height;
    const width=Math.min(2.65,1.95*ratio),height=Math.min(1.95,2.65/ratio);
    picture.geometry.dispose(); picture.geometry=new THREE.PlaneGeometry(width,height);
    picture.material=new THREE.MeshBasicMaterial({map:loaded,side:THREE.DoubleSide});
  }
  const title = new THREE.Mesh(new THREE.PlaneGeometry(2.9,.43),new THREE.MeshBasicMaterial({map:makeTextTexture(item.titulo,"#2d1b17","#f2cc8e",2.9/.43),side:THREE.DoubleSide}));
  title.position.set(0,-1.53,.14); group.add(title);
  const pictureLight=new THREE.Mesh(new THREE.BoxGeometry(1.25,.055,.13),mat.bronzeDark);
  pictureLight.position.set(0,1.47,.29);group.add(pictureLight);
  for(const px of [-.48,.48]){
    const arm=new THREE.Mesh(new THREE.BoxGeometry(.04,.18,.04),mat.bronze);
    arm.position.set(px,1.37,.21);group.add(arm);
  }
  const diffuser=new THREE.Mesh(new THREE.PlaneGeometry(1.09,.055),new THREE.MeshBasicMaterial({color:0xffdeb1,side:THREE.DoubleSide}));
  diffuser.rotation.x=-Math.PI/2;diffuser.position.set(0,1.43,.3);group.add(diffuser);
  markInteractive(group,{type:"art",roomId:room.id,item});
}
function lectern(room) {
  const group = new THREE.Group();
  let x=room.x,z=room.z;
  if (room.id==="vestibulo") {x=-2.4;z=25;}
  if (room.id==="final") {x=4;z=-43;}
  if (room.door==="east") {x-=1;z+=1.8;}
  if (room.door==="west") {x+=1;z+=1.8;}
  group.position.set(x,0,z);
  group.rotation.y=room.id==="vestibulo"?Math.PI/2:{east:Math.PI/2,west:-Math.PI/2,south:Math.PI,north:0}[room.door];
  group.scale.setScalar(.88);
  const base=new THREE.Mesh(new THREE.CylinderGeometry(.56,.72,.28,12),mat.bronzeDark); base.position.y=.15; group.add(base);
  const shaft=new THREE.Mesh(new THREE.CylinderGeometry(.34,.4,1.05,12),mat.plinth); shaft.position.y=.79; group.add(shaft);
  const top=new THREE.Mesh(new THREE.BoxGeometry(1.5,.12,.8),mat.bronze); top.position.y=1.38; top.rotation.x=-.3; group.add(top);
  const plate=new THREE.Mesh(new THREE.PlaneGeometry(1.26,.55),new THREE.MeshBasicMaterial({map:makeTextTexture("EXPLORAR SALA","#421d1a","#efc16b",1.26/.55),side:THREE.DoubleSide}));
  plate.position.set(0,1.43,-.025); plate.rotation.x=-Math.PI/2-.3; group.add(plate);
  const glow=new THREE.PointLight(0xffc17a,2.5,3); glow.position.set(0,1.6,0); group.add(glow);
  markInteractive(group,{type:"room",roomId:room.id});
}
function furniturePart(group, geometry, material, x, y, z, sx=1, sy=1, sz=1) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x,y,z); mesh.scale.set(sx,sy,sz);
  mesh.castShadow = true; mesh.receiveShadow = true;
  group.add(mesh); return mesh;
}
function addFurnitureCollider(x,z,width,depth) {
  walls.push({minX:x-width/2,maxX:x+width/2,minZ:z-depth/2,maxZ:z+depth/2});
}
const shadowCanvas=document.createElement("canvas");shadowCanvas.width=shadowCanvas.height=128;
const shadowContext=shadowCanvas.getContext("2d");
const shadowFade=shadowContext.createRadialGradient(64,64,0,64,64,64);
shadowFade.addColorStop(0,"rgba(25,17,12,.5)");shadowFade.addColorStop(.55,"rgba(25,17,12,.22)");shadowFade.addColorStop(1,"rgba(25,17,12,0)");
shadowContext.fillStyle=shadowFade;shadowContext.fillRect(0,0,128,128);
const shadowTexture=new THREE.CanvasTexture(shadowCanvas);
const shadowMaterial=new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});
function contactShadow(group,width,depth) {
  const shadow=new THREE.Mesh(new THREE.PlaneGeometry(width,depth),shadowMaterial);
  shadow.rotation.x=-Math.PI/2;shadow.position.y=.006;group.add(shadow);
}
function upholsteredBench(x,z,rotation=0) {
  const group = new THREE.Group(); group.position.set(x,0,z); group.rotation.y=rotation;
  const cube = new THREE.BoxGeometry(1,1,1),cushion=new THREE.SphereGeometry(1,18,10);
  furniturePart(group,cube,mat.wood,0,.42,0,3.1,.25,1.1);
  furniturePart(group,cube,mat.velvet,0,.61,.02,2.85,.19,.92);
  furniturePart(group,cube,mat.velvet,0,1.05,-.47,2.85,.8,.19);
  for(const px of [-.93,0,.93]){
    furniturePart(group,cushion,mat.velvet,px,.73,.04,.44,.14,.46);
    furniturePart(group,cushion,mat.velvet,px,1.07,-.34,.44,.37,.13);
  }
  furniturePart(group,cube,mat.wood,-1.52,.73,0,.18,.86,1.23);
  furniturePart(group,cube,mat.wood,1.52,.73,0,.18,.86,1.23);
  for(const px of [-1.48,1.48])furniturePart(group,cushion,mat.wood,px,1.18,-.36,.1,.12,.16);
  for(const px of [-1.31,1.31])for(const pz of [-.38,.38]) {
    furniturePart(group,cube,mat.wood,px,.18,pz,.15,.35,.15);
    furniturePart(group,new THREE.SphereGeometry(.055,8,6),mat.bronze,px,.13,pz);
  }
  for(const px of [-.93,0,.93]) {
    furniturePart(group,cube,mat.velvetGold,px,1.04,-.355,.035,.55,.018);
    furniturePart(group,cube,mat.velvetGold,px,.746,.13,.65,.016,.018);
  }
  contactShadow(group,3.9,1.9);
  scene.add(group);
  if(Math.abs(Math.sin(rotation))>.5)addFurnitureCollider(x,z,1.25,3.3);
  else addFurnitureCollider(x,z,3.3,1.25);
}
function wovenRug(x,z,width=5.8,depth=5) {
  const canvas=document.createElement("canvas");canvas.width=canvas.height=512;
  const ctx=canvas.getContext("2d");
  ctx.fillStyle="#6b2734";ctx.fillRect(0,0,512,512);
  for(const [inset,line] of [[11,14],[34,3],[48,8],[67,2]]) {
    ctx.strokeStyle=inset===11?"#d6a660":"#e2b875";
    ctx.lineWidth=line;ctx.strokeRect(inset,inset,512-inset*2,512-inset*2);
  }
  ctx.translate(256,256);ctx.strokeStyle="#d9aa68";ctx.lineWidth=5;
  for(const radius of [44,90,143]){ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.stroke();}
  for(let i=0;i<16;i++){
    ctx.save();ctx.rotate(i*Math.PI/8);
    ctx.beginPath();ctx.ellipse(0,-112,28,62,0,0,Math.PI*2);ctx.stroke();
    ctx.beginPath();ctx.moveTo(0,-52);ctx.lineTo(0,-166);ctx.stroke();
    ctx.restore();
  }
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const rug=new THREE.Mesh(new THREE.PlaneGeometry(width,depth),new THREE.MeshStandardMaterial({map:texture,roughness:1,side:THREE.DoubleSide}));
  rug.rotation.x=-Math.PI/2;rug.position.set(x,.028,z);rug.receiveShadow=true;scene.add(rug);
}
function lotusSculpture(x,z,scale=1) {
  const group=new THREE.Group();group.position.set(x,0,z);group.scale.setScalar(scale);
  furniturePart(group,new THREE.CylinderGeometry(.8,.88,.28,16),mat.plinth,0,.14,0);
  furniturePart(group,new THREE.CylinderGeometry(.68,.7,.12,16),mat.bronze,0,.33,0);
  furniturePart(group,new THREE.CylinderGeometry(.13,.18,1.25,12),mat.bronzeDark,0,1.03,0);
  const bowl=furniturePart(group,new THREE.SphereGeometry(.43,20,12),mat.bronze,0,1.66,0,1,.43,1);
  bowl.rotation.x=Math.PI;
  for(let ring=0;ring<2;ring++)for(let i=0;i<10;i++){
    const a=i*Math.PI/5+ring*Math.PI/10;
    const petal=furniturePart(group,new THREE.SphereGeometry(.5,12,8),ring?mat.ivory:mat.bronze,Math.cos(a)*(ring?.24:.42),1.75+ring*.18,Math.sin(a)*(ring?.24:.42),.38,.13,.82);
    petal.rotation.y=-a+Math.PI/2;petal.rotation.x=ring?-.27:-.48;
  }
  furniturePart(group,new THREE.SphereGeometry(.3,16,10),mat.bronzeDark,0,1.91,0,1,.32,1);
  contactShadow(group,2.35,2.35);
  scene.add(group);addFurnitureCollider(x,z,1.7*scale,1.7*scale);
}
function taperedTube(curve,startRadius,endRadius,segments=18,sides=12) {
  const frames=curve.computeFrenetFrames(segments,false),vertices=[],indices=[];
  for(let i=0;i<=segments;i++){
    const t=i/segments,p=curve.getPointAt(t),radius=startRadius+(endRadius-startRadius)*t;
    for(let j=0;j<=sides;j++){
      const a=j*Math.PI*2/sides;
      const point=p.clone().addScaledVector(frames.normals[i],Math.cos(a)*radius).addScaledVector(frames.binormals[i],Math.sin(a)*radius);
      vertices.push(point.x,point.y,point.z);
      if(i<segments&&j<sides){
        const current=i*(sides+1)+j,next=current+sides+1;
        indices.push(current,current+1,next,next,current+1,next+1);
      }
    }
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute("position",new THREE.Float32BufferAttribute(vertices,3));
  geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
}
function elephantSculpture(x,z,rotation=0,scale=1,groundY=0) {
  const group=new THREE.Group();group.position.set(x,groundY,z);group.rotation.y=rotation;group.scale.setScalar(scale);
  const sphere=new THREE.SphereGeometry(1,28,18);
  furniturePart(group,new THREE.CylinderGeometry(1.02,1.12,.23,18),mat.plinth,0,.12,0);
  furniturePart(group,new THREE.CylinderGeometry(.97,1.02,.13,18),mat.stone,0,.3,0);
  furniturePart(group,sphere,mat.sculpture,0,1.47,.08,.64,.57,.86);
  for(const px of [-.4,.4])for(const pz of [-.46,.52]){
    furniturePart(group,new THREE.CylinderGeometry(.17,.23,.93,16),mat.sculpture,px,.83,pz);
    furniturePart(group,sphere,mat.sculpture,px,.41,pz,.23,.12,.23);
    for(let k=0;k<3;k++)furniturePart(group,new THREE.SphereGeometry(.04,7,5),mat.ivory,px+(k-1)*.09,.37,pz-.21);
  }
  furniturePart(group,sphere,mat.sculpture,0,1.72,-.76,.53,.56,.5);
  furniturePart(group,sphere,mat.sculpture,0,2.09,-1.04,.34,.23,.27);
  for(const side of [-1,1]){
    const earShape=new THREE.Shape();
    earShape.moveTo(.26,1.99);
    earShape.bezierCurveTo(.63,2.21,.93,1.99,.88,1.63);
    earShape.bezierCurveTo(.83,1.31,.57,1.25,.31,1.49);
    earShape.closePath();
    const earMaterial=mat.sculpture.clone();earMaterial.side=THREE.DoubleSide;
    const ear=furniturePart(group,new THREE.ShapeGeometry(earShape),earMaterial,0,0,-.89);
    ear.scale.x=side;ear.castShadow=true;
    furniturePart(group,sphere,mat.bronzeDark,side*.31,1.9,-1.22,.043,.042,.02);
    furniturePart(group,sphere,mat.ivory,side*.32,1.912,-1.237,.013,.013,.011);
    const tuskPath=new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(side*.29,1.43,-1.16),
      new THREE.Vector3(side*.43,1.19,-1.52),
      new THREE.Vector3(side*.52,1.52,-1.66)
    );
    furniturePart(group,taperedTube(tuskPath,.095,.012,12,9),mat.ivory,0,0,0);
  }
  const trunkCurve=new THREE.CatmullRomCurve3([
    new THREE.Vector3(0,1.61,-1.19),new THREE.Vector3(0,1.25,-1.42),
    new THREE.Vector3(.04,.77,-1.45),new THREE.Vector3(.2,.63,-1.27)
  ]);
  furniturePart(group,taperedTube(trunkCurve,.18,.075,22,12),mat.sculpture,0,0,0);
  const tail=new THREE.QuadraticBezierCurve3(new THREE.Vector3(0,1.57,.85),new THREE.Vector3(.08,.91,1.12),new THREE.Vector3(.03,.67,1.03));
  furniturePart(group,taperedTube(tail,.06,.025,10,7),mat.sculpture,0,0,0);
  furniturePart(group,new THREE.BoxGeometry(1.18,.05,1.08),mat.velvet,0,2.02,.1);
  furniturePart(group,new THREE.BoxGeometry(1.04,.03,.93),mat.bronze,0,2.057,.1);
  furniturePart(group,new THREE.BoxGeometry(.88,.026,.79),mat.velvet,0,2.081,.1);
  for(const side of [-1,1])for(const pz of [-.23,.13,.49])
    furniturePart(group,new THREE.SphereGeometry(.043,8,6),mat.bronze,side*.44,2.11,pz);
  furniturePart(group,new THREE.SphereGeometry(.12,12,8),mat.bronze,0,2.2,-1.12,1,.7,.28);
  contactShadow(group,2.9,3.2);
  scene.add(group);addFurnitureCollider(x,z,2.15*scale,2.35*scale);
}
function sculptureGroup(x,z,width=1.7,depth=1.7) {
  const group=new THREE.Group();group.position.set(x,0,z);
  furniturePart(group,new THREE.CylinderGeometry(.77,.86,.24,20),mat.plinth,0,.12,0);
  furniturePart(group,new THREE.CylinderGeometry(.68,.72,.1,20),mat.bronze,0,.29,0);
  contactShadow(group,width+.6,depth+.6);
  scene.add(group);addFurnitureCollider(x,z,width,depth);
  return group;
}
function manuscriptSculpture(x,z) {
  const group=sculptureGroup(x,z);
  const cube=new THREE.BoxGeometry(1,1,1);
  furniturePart(group,cube,mat.stone,0,.81,0,.93,.94,.68);
  furniturePart(group,cube,mat.bronzeDark,0,1.31,0,1.02,.09,.77);
  const leafMaterial=new THREE.MeshStandardMaterial({color:0xd0b17c,roughness:.92,side:THREE.DoubleSide});
  for(let i=0;i<7;i++){
    const leaf=furniturePart(group,cube,leafMaterial,0,1.39+i*.045,0,1.28,.032,.45);
    leaf.rotation.y=(i-3)*.014;
    for(const side of [-1,1])furniturePart(group,new THREE.SphereGeometry(.025,8,6),mat.bronzeDark,side*.51,1.414+i*.045,-.12);
  }
  for(const px of [-.54,.54])furniturePart(group,cube,mat.bronze,px,1.58,0,.065,.36,.49);
  furniturePart(group,cube,mat.bronzeDark,0,1.78,.2,.64,.1,.15);
}
function cycleWheelSculpture(x,z) {
  const group=sculptureGroup(x,z,1.95,1.65);
  furniturePart(group,new THREE.CylinderGeometry(.12,.18,1.14,14),mat.bronzeDark,0,.94,0);
  const centerY=2.03;
  furniturePart(group,new THREE.TorusGeometry(.68,.085,12,40),mat.bronze,0,centerY,0);
  furniturePart(group,new THREE.TorusGeometry(.54,.025,8,40),mat.bronzeDark,0,centerY,0);
  for(let i=0;i<8;i++){
    const angle=i*Math.PI/4;
    const spoke=furniturePart(group,new THREE.BoxGeometry(.045,.58,.055),mat.bronze,Math.sin(angle)*.27,centerY+Math.cos(angle)*.27,0);
    spoke.rotation.z=-angle;
    furniturePart(group,new THREE.SphereGeometry(.065,10,7),mat.ivory,Math.sin(angle)*.68,centerY+Math.cos(angle)*.68,0);
  }
  furniturePart(group,new THREE.CylinderGeometry(.18,.18,.12,18),mat.bronzeDark,0,centerY,0).rotation.x=Math.PI/2;
  furniturePart(group,new THREE.SphereGeometry(.11,12,8),mat.ivory,0,centerY,.08);
}
function diyaSculpture(x,z) {
  const group=sculptureGroup(x,z,1.85,1.85);
  const flame=new THREE.MeshBasicMaterial({color:0xffb340});
  furniturePart(group,new THREE.CylinderGeometry(.16,.25,1.18,16),mat.bronze,0,.97,0);
  for(const [height,radius,count] of [[.77,.53,6],[1.37,.42,5],[1.9,.29,1]]){
    furniturePart(group,new THREE.CylinderGeometry(radius*.76,radius,.095,20),mat.bronze,0,height,0);
    furniturePart(group,new THREE.SphereGeometry(radius,18,10),mat.bronzeDark,0,height+.06,0,1,.18,1);
    for(let i=0;i<count;i++){
      const a=i*2*Math.PI/count;
      const px=Math.cos(a)*radius*.78,pz=Math.sin(a)*radius*.78;
      furniturePart(group,new THREE.SphereGeometry(.12,10,7),mat.bronze,px,height+.12,pz,1,.32,1);
      furniturePart(group,new THREE.SphereGeometry(.065,9,7),flame,px,height+.37,pz,.8,1.7,.8);
    }
  }
  furniturePart(group,new THREE.SphereGeometry(.11,12,8),mat.bronze,0,2.37,0,1,1.65,1);
}
function peacockSculpture(x,z) {
  const group=sculptureGroup(x,z,2,1.75);
  const blue=new THREE.MeshStandardMaterial({color:0x215d67,metalness:.23,roughness:.6});
  const green=new THREE.MeshStandardMaterial({color:0x44754f,metalness:.18,roughness:.72});
  const eye=new THREE.MeshStandardMaterial({color:0x224e55,metalness:.25,roughness:.55});
  const sphere=new THREE.SphereGeometry(1,16,10);
  for(let i=0;i<11;i++){
    const angle=(i-5)*.23;
    const px=Math.sin(angle)*.88,py=1.91+Math.cos(angle)*.55;
    const feather=furniturePart(group,sphere,green,px,py,.2,.12,.65,.075);
    feather.rotation.z=-angle*.85;
    furniturePart(group,sphere,mat.bronze,px,py+.22,.26,.075,.12,.035);
    furniturePart(group,sphere,eye,px,py+.22,.29,.038,.065,.025);
  }
  furniturePart(group,sphere,blue,0,1.1,-.18,.34,.35,.52);
  const neck=new THREE.CatmullRomCurve3([new THREE.Vector3(0,1.18,-.49),new THREE.Vector3(0,1.55,-.55),new THREE.Vector3(0,1.89,-.62)]);
  furniturePart(group,taperedTube(neck,.15,.105,15,10),blue,0,0,0);
  furniturePart(group,sphere,blue,0,1.95,-.63,.17,.18,.17);
  furniturePart(group,new THREE.ConeGeometry(.1,.26,8),mat.bronze,0,1.92,-.86).rotation.x=-Math.PI/2;
  for(const side of [-1,1]){
    furniturePart(group,sphere,mat.ivory,side*.1,1.98,-.755,.028,.028,.02);
    furniturePart(group,sphere,eye,side*.1,1.98,-.771,.014,.014,.01);
    furniturePart(group,new THREE.CylinderGeometry(.035,.055,.38,8),mat.bronzeDark,side*.16,.65,-.15);
  }
  for(const px of [-.075,0,.075])furniturePart(group,new THREE.CylinderGeometry(.013,.025,.22,7),mat.bronze,px,2.19,-.64);
}
function bellSculpture(x,z) {
  const group=sculptureGroup(x,z,1.85,1.7);
  const cube=new THREE.BoxGeometry(1,1,1);
  for(const px of [-.55,.55]){
    furniturePart(group,cube,mat.stone,px,1.22,0,.18,1.73,.18);
    furniturePart(group,new THREE.SphereGeometry(.13,10,7),mat.bronze,px,2.12,0);
  }
  furniturePart(group,cube,mat.bronzeDark,0,2.1,0,1.3,.18,.27);
  furniturePart(group,new THREE.CylinderGeometry(.04,.04,.33,10),mat.bronzeDark,0,1.84,0);
  const bellProfile=[new THREE.Vector2(0,0),new THREE.Vector2(.39,.01),new THREE.Vector2(.42,.07),new THREE.Vector2(.37,.12),new THREE.Vector2(.27,.36),new THREE.Vector2(.22,.59),new THREE.Vector2(.12,.73),new THREE.Vector2(0,.74)];
  furniturePart(group,new THREE.LatheGeometry(bellProfile,28),mat.bronze,0,1.07,0);
  furniturePart(group,new THREE.CylinderGeometry(.07,.07,.42,10),mat.bronzeDark,0,1.02,0);
  furniturePart(group,new THREE.SphereGeometry(.105,12,8),mat.bronzeDark,0,.79,0);
  for(const y of [1.35,1.61])furniturePart(group,new THREE.TorusGeometry(y===1.35?.37:.26,.026,7,28),mat.bronzeDark,0,y,0).rotation.x=Math.PI/2;
}
function treeSculpture(x,z) {
  const group=sculptureGroup(x,z,1.95,1.95);
  const leaves=new THREE.MeshStandardMaterial({color:0x497052,roughness:.88});
  furniturePart(group,new THREE.CylinderGeometry(.19,.26,1.34,14),mat.wood,0,1.04,0);
  const branches=[[-.61,1.99,-.16],[-.42,2.3,.15],[0,2.52,-.2],[.44,2.3,.12],[.65,1.99,-.13]];
  for(const [px,py,pz] of branches){
    const curve=new THREE.QuadraticBezierCurve3(new THREE.Vector3(0,1.54,0),new THREE.Vector3(px*.45,py-.1,pz*.4),new THREE.Vector3(px,py,pz));
    furniturePart(group,taperedTube(curve,.095,.045,13,8),mat.wood,0,0,0);
    for(const [dx,dy,dz] of [[0,0,0],[-.13,.1,.05],[.13,.08,-.04]])
      furniturePart(group,new THREE.SphereGeometry(.21,10,7),leaves,px+dx,py+dy,pz+dz,1.15,.7,.8);
  }
  furniturePart(group,new THREE.SphereGeometry(.3,12,8),leaves,0,2.37,0,1.8,.75,1.35);
}
function furnishRoom(room,index) {
  const [x1,x2,z1,z2]=room.bounds;
  wovenRug(room.x,room.z-1.15,room.id==="vestibulo"?5.4:5.8,4.75);
  if(room.id==="vestibulo"){
    upholsteredBench(x2-1.2,room.z,-Math.PI/2);
    lotusSculpture(x2-2.4,z2-2.4,.94);
  }else if(room.id==="final"){
    upholsteredBench(x2-1.25,room.z,-Math.PI/2);
    treeSculpture(x1+2.1,z1+2.1);
  }else{
    upholsteredBench(room.x,z1+1.2);
    const sculptureX=room.door==="east"?x2-2.35:x1+2.35;
    const sculpture={"sala-41":manuscriptSculpture,"sala-42":cycleWheelSculpture,
      fiestas:diyaSculpture,actualidad:peacockSculpture,comparacion:bellSculpture}[room.id];
    sculpture(sculptureX,z2-2.4);
  }
}
function populateGalleries() {
  for (const [index,room] of rooms.entries()) {
    const data=dataById.get(room.id);
    data.galeria.slice(0,3).forEach((item,i)=>artwork(room,item,i));
    lectern(room);
    furnishRoom(room,index);
  }
}

function findRoom(x,z) {
  if(z>32.25)return "exterior";
  for (const room of rooms) {
    const [x1,x2,z1,z2]=room.bounds;
    if (x>x1+.25&&x<x2-.25&&z>z1+.25&&z<z2-.25) return room.id;
  }
  return "corredor";
}
function canMove(x,z) {
  const r=.36;
  if(z>68||Math.abs(x)>29||z<-51.5)return false;
  if(z<32&&z>17&&Math.abs(x)>9)return false;
  for (const wall of walls) {
    const nx=Math.max(wall.minX,Math.min(x,wall.maxX));
    const nz=Math.max(wall.minZ,Math.min(z,wall.maxZ));
    if ((x-nx)**2+(z-nz)**2<r*r) return false;
  }
  return true;
}
function updateRoomHud() {
  const id=findRoom(camera.position.x,camera.position.z);
  if (id!==currentRoom) {
    currentRoom=id;
    if (id!=="corredor"&&id!=="exterior") visited.add(id);
    $("room-label").textContent=id==="corredor"?"Galería central":id==="exterior"?"Jardín de entrada":rooms.find(r=>r.id===id).label;
    $("visit-label").textContent=`${visited.size} / ${rooms.length} salas visitadas`;
    $("visit-fill").style.width=`${visited.size/rooms.length*100}%`;
  }
}
function pickAt(nx=0,ny=0) {
  raycaster.setFromCamera(new THREE.Vector2(nx,ny),camera);
  const hits=raycaster.intersectObjects(interactive,true);
  for (const hit of hits) {
    if (hit.distance>5.5) return null;
    let node=hit.object;
    while (node && !node.userData.exhibit) node=node.parent;
    if (node?.userData.exhibit) return node.userData.exhibit;
  }
  return null;
}
function updateHint() {
  currentTarget=pickAt();
  $("interact-hint").hidden=!currentTarget || !started || isOverlayOpen();
  if (currentTarget) $("interact-title").textContent=currentTarget.type==="room"?"Información de esta sala":currentTarget.item.titulo;
}
function isOverlayOpen() { return !$("map-overlay").hidden || !$("detail-overlay").hidden || !$("welcome").hidden || !$("error-overlay").hidden; }

function creditFor(path) { return credits.imagenes.find(image=>image.archivo===path); }
function imageCredit(credit) {
  if (!credit) return "";
  return `<p class="detail-credit">Imagen: <a href="${safeUrl(credit.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(credit.autor)}</a> · <a href="${safeUrl(credit.licenciaUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(credit.licencia)}</a></p>`;
}
function bibliographyHtml() {
  const all=[...bibliography.principal.map(x=>`${escapeHtml(x.autor)} (${escapeHtml(x.anio)}). <em>${escapeHtml(x.titulo)}</em>. ${escapeHtml(x.editorial)} (${escapeHtml(x.paginas)}).`),...bibliography.citadasEnLibro.map(x=>`${escapeHtml(x.autor)}. <em>${escapeHtml(x.titulo)}</em>. ${escapeHtml(x.nota)}`),...bibliography.adicionales.map(x=>`${escapeHtml(x.autor)}. <a href="${safeUrl(x.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(x.titulo)}</a>.`)];
  const generated=(credits.texturas||[]).map(x=>`<li>${escapeHtml(x.titulo)} — ${escapeHtml(x.autor)}. ${escapeHtml(x.uso)}</li>`).join("");
  return `<h3>Bibliografía</h3><ul class="bib-list">${all.map(x=>`<li>${x}</li>`).join("")}</ul><h3>Créditos de imágenes</h3><ul class="bib-list">${credits.imagenes.map(x=>`<li><a href="${safeUrl(x.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(x.titulo)}</a> — ${escapeHtml(x.autor)}, ${escapeHtml(x.licencia)}.</li>`).join("")}${generated}</ul>`;
}
function roomDetail(roomId) {
  const data=dataById.get(roomId);
  let html=`<span class="detail-tag">SALA ${escapeHtml(data.numeroSala)} · ${data.exhibiciones.length} exhibiciones</span><h2 id="detail-title">${escapeHtml(data.titulo)}</h2><p class="room-intro">${escapeHtml(data.introduccion)}</p><div class="room-exhibits">`;
  html+=data.exhibiciones.map(x=>`<details><summary>${x.numero?`<span>Pregunta ${x.numero}</span>`:`<span>${escapeHtml(x.etiqueta)}</span>`}${escapeHtml(x.titulo)} <span aria-hidden="true">+</span></summary><p>${escapeHtml(x.detalle)}</p>${x.fuente?`<small>Fuente: ${escapeHtml(x.fuente)}</small>`:""}</details>`).join("");
  html+="</div>";
  if (data.quiz) html+=`<div class="quiz-panel"><strong>Pregunta rápida: ${escapeHtml(data.quiz.pregunta)}</strong>${data.quiz.opciones.map((option,i)=>`<button type="button" data-quiz-option="${i}">${escapeHtml(option)}</button>`).join("")}<p class="quiz-feedback" role="status"></p></div>`;
  if (roomId==="final") html+=bibliographyHtml();
  return html;
}
function artDetail(item) {
  const credit=creditFor(item.imagen);
  const portrait=/^(rigveda|gita|vishnu|shiva|saraswati|catedral|holi)\.jpg$/.test(item.imagen.split("/").pop());
  return `<span class="detail-tag">${escapeHtml(item.etiqueta)}</span><h2 id="detail-title">${escapeHtml(item.titulo)}</h2><img class="detail-image ${portrait?"portrait":""}" src="${escapeHtml(imageSource(item.imagen))}" alt="${escapeHtml(item.alt)}">${imageCredit(credit)}<p>${escapeHtml(item.descripcion)}</p><a class="source-link" href="${safeUrl(item.fuente)}" target="_blank" rel="noopener noreferrer">Consultar la fuente de esta explicación</a>`;
}
function releaseMouse() { if (document.pointerLockElement===canvas) document.exitPointerLock(); }
function openDetail(payload) {
  if (!payload) return;
  releaseMouse();
  $("detail-content").innerHTML=payload.type==="art"?artDetail(payload.item):roomDetail(payload.roomId);
  $("detail-overlay").hidden=false;
  $("interact-hint").hidden=true;
  $("detail-overlay").querySelector(".close").focus();
  if (payload.type==="room") {
    const quiz=dataById.get(payload.roomId).quiz;
    $("detail-content").querySelectorAll("[data-quiz-option]").forEach(button=>button.addEventListener("click",()=>{
      const correct=Number(button.dataset.quizOption)===quiz.correcta;
      $("detail-content").querySelectorAll("[data-quiz-option]").forEach(other=>{
        other.disabled=true;
        if (Number(other.dataset.quizOption)===quiz.correcta) other.classList.add("correct");
        else if (other===button) other.classList.add("incorrect");
      });
      $("detail-content").querySelector(".quiz-feedback").textContent=`${correct?"¡Correcto!":"Revisa la exhibición y vuelve a intentarlo cuando abras la sala otra vez."} ${quiz.explicacion}`;
    }));
  }
}
function closeDetail() {
  $("detail-overlay").hidden=true;
}
function openMap() {
  releaseMouse();
  $("map-overlay").hidden=false;
  $("map-overlay").querySelector(".close").focus();
}
function closeMap() {
  $("map-overlay").hidden=true;
}
function teleport(room) {
  const [x,z,angle]=room.entry;
  camera.position.set(x,1.65,z); yaw=angle; pitch=0; camera.rotation.set(0,yaw,0);
  visited.add(room.id); currentRoom=""; updateRoomHud();
  closeMap();
}
function buildMap() {
  $("map-grid").innerHTML=rooms.map((room,i)=>`<button type="button" data-room="${escapeHtml(room.id)}"><span>${String(i).padStart(2,"0")}</span><strong>${escapeHtml(dataById.get(room.id).titulo)}</strong></button>`).join("");
  $("map-grid").querySelectorAll("[data-room]").forEach(button=>button.addEventListener("click",()=>teleport(rooms.find(room=>room.id===button.dataset.room))));
}

function requestLook() { if (!isTouch&&started&&document.pointerLockElement!==canvas) canvas.requestPointerLock?.().catch(()=>{}); }
function interact() { if (!isOverlayOpen()) openDetail(currentTarget); }
$("enter-button").addEventListener("click",()=>{ started=true; $("welcome").hidden=true; canvas.focus(); requestLook(); });
$("map-button").addEventListener("click",openMap);
$("back-to-museum").addEventListener("click",closeDetail);
document.querySelectorAll("[data-close='map']").forEach(button=>button.addEventListener("click",closeMap));
document.querySelectorAll("[data-close='detail']").forEach(button=>button.addEventListener("click",closeDetail));
$("touch-interact").addEventListener("click",interact);
document.addEventListener("keydown",event=>{
  if (["KeyW","KeyA","KeyS","KeyD","KeyJ","KeyL","KeyI","KeyK","ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].includes(event.code)) event.preventDefault();
  keys.add(event.code);
  if (event.code==="KeyE"&&!event.repeat) interact();
  if (event.code==="KeyM"&&!event.repeat&&started&&!isOverlayOpen()) openMap();
  if (event.code==="Escape") {
    if (!$("detail-overlay").hidden) closeDetail();
    else if (!$("map-overlay").hidden) closeMap();
  }
});
document.addEventListener("keyup",event=>keys.delete(event.code));
window.addEventListener("blur",()=>keys.clear());
document.addEventListener("mousemove",event=>{
  if (!started||isOverlayOpen()||document.pointerLockElement!==canvas) return;
  yaw-=event.movementX*.0025; pitch=Math.max(-1.25,Math.min(1.25,pitch-event.movementY*.0025));
});
canvas.addEventListener("pointerdown",event=>{
  if (!started||isOverlayOpen()) return;
  canvas.focus();
  dragging=true; dragMoved=false; lastX=dragStartX=event.clientX; lastY=dragStartY=event.clientY;
  canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener("pointermove",event=>{
  if (!dragging||isOverlayOpen()||document.pointerLockElement===canvas) return;
  const dx=event.clientX-lastX,dy=event.clientY-lastY;
  if (Math.hypot(event.clientX-dragStartX,event.clientY-dragStartY)>5) dragMoved=true;
  const sensitivity=isTouch?.005:.004;
  yaw-=dx*sensitivity; pitch=Math.max(-1.25,Math.min(1.25,pitch-dy*sensitivity));
  lastX=event.clientX; lastY=event.clientY;
});
canvas.addEventListener("pointerup",event=>{
  if (dragging&&!dragMoved&&!isOverlayOpen()) {
    const point=new THREE.Vector2(event.clientX/innerWidth*2-1,-(event.clientY/innerHeight*2-1));
    openDetail(pickAt(point.x,point.y));
  }
  dragging=false;
});
canvas.addEventListener("pointercancel",()=>{ dragging=false; });
const joystick=$("joystick"),knob=$("joystick-knob");
function updateJoystick(event) {
  const rect=joystick.getBoundingClientRect(),cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
  const dx=(event.clientX-cx)/(rect.width*.34),dy=(event.clientY-cy)/(rect.height*.34);
  const length=Math.max(1,Math.hypot(dx,dy)); joyX=dx/length; joyY=dy/length;
  knob.style.transform=`translate(${joyX*29}px,${joyY*29}px)`;
}
joystick.addEventListener("pointerdown",event=>{joystickPointer=event.pointerId;joystick.setPointerCapture(event.pointerId);updateJoystick(event);});
joystick.addEventListener("pointermove",event=>{if(event.pointerId===joystickPointer)updateJoystick(event);});
function resetJoystick(event){if(event.pointerId!==joystickPointer)return;joystickPointer=null;joyX=0;joyY=0;knob.style.transform="translate(0,0)";}
joystick.addEventListener("pointerup",resetJoystick);joystick.addEventListener("pointercancel",resetJoystick);
window.addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});

function animate() {
  requestAnimationFrame(animate);
  const dt=Math.min(clock.getDelta(),.055);
  if (started&&!isOverlayOpen()) {
    yaw+=(Number(keys.has("KeyJ"))-Number(keys.has("KeyL")))*1.8*dt;
    pitch=Math.max(-1.25,Math.min(1.25,pitch+(Number(keys.has("KeyI"))-Number(keys.has("KeyK")))*1.5*dt));
    let forward=Number(keys.has("KeyW")||keys.has("ArrowUp"))-Number(keys.has("KeyS")||keys.has("ArrowDown"))-joyY;
    let right=Number(keys.has("KeyD")||keys.has("ArrowRight"))-Number(keys.has("KeyA")||keys.has("ArrowLeft"))+joyX;
    const length=Math.hypot(forward,right);
    if (length>0) {
      forward/=Math.max(1,length);right/=Math.max(1,length);
      const dx=(-Math.sin(yaw)*forward+Math.cos(yaw)*right)*4.8*dt;
      const dz=(-Math.cos(yaw)*forward-Math.sin(yaw)*right)*4.8*dt;
      if (canMove(camera.position.x+dx,camera.position.z)) camera.position.x+=dx;
      if (canMove(camera.position.x,camera.position.z+dz)) camera.position.z+=dz;
      updateRoomHud();
    }
    camera.rotation.set(pitch,yaw,0);
    updateHint();
  }
  renderer.render(scene,camera);
}

async function start() {
  await window.museoOfflineReady;
  const texturesReady=loadMuseumTextures();
  async function loadJSON(file) {
    if (location.protocol === "file:") {
      const data=window.MUSEO_OFFLINE?.content?.[file];
      if (!data) throw new Error(`Faltan datos para ${file}. Ejecuta actualizar-offline.py.`);
      return data;
    }
    const response=await fetch(`content/${file}`);
    if(!response.ok)throw new Error(file);
    return response.json();
  }
  const loaded=await Promise.all(rooms.map(async room=>[room.id,await loadJSON(room.file)]));
  loaded.forEach(([id,data])=>dataById.set(id,data));
  [credits,bibliography]=await Promise.all([loadJSON("creditos.json"),loadJSON("bibliografia.json")]);
  await texturesReady;
  buildShell();populateGalleries();buildMap();animate();
}
start().catch(error=>{
  console.error(error);
  $("error-message").textContent=`No se pudieron cargar las salas. ${error.message} Revisa que todos los archivos del museo sigan dentro de la misma carpeta.`;
  $("error-overlay").hidden=false;
});
