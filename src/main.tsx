import Phaser from 'phaser'

class CityScene extends Phaser.Scene {
  res = { food: 500, oil: 500, steel: 0 }
  buildings: any[] = []
  resText!: Phaser.GameObjects.Text
  logText!: Phaser.GameObjects.Text

  constructor(){ super('City') }

  create(){
    const w = this.scale.width, h = this.scale.height
    
    // TOP BAR - точно като твоята снимка от AgeOfZ
    this.add.rectangle(0,0,w,90,0x121a21).setOrigin(0,0)
    this.add.text(10,8, '👤 VIP 11  🏆 Lv.15  💰 1 154 123  🔷 14359', {fontSize:'12px', color:'#ffcc33'})
    this.resText = this.add.text(10,28, '', {fontSize:'11px', color:'#8a9a8a'})
    this.add.text(10,48, '🎁 Newbie Pack  📦 Specials !  🎀 03:58:44', {fontSize:'10px', color:'#c8a87a', backgroundColor:'#2a1a0a'}).setPadding(4)

    // СГРАДИ - почваме от Level 1, в руини, както е при Camel в началото
    this.buildings = [
      { id:'main', x: w*0.32, y: h*0.28, lvl:1, name:'Headquarters', icon:'🏛️', ruined:false, cost:null },
      { id:'farm', x: w*0.58, y: h*0.45, lvl:0, name:'Farm', icon:'🌾', ruined:true, cost:{oil:270} },
      { id:'oil', x: w*0.62, y: h*0.58, lvl:0, name:'Oil Refinery', icon:'🛢️', ruined:true, cost:{food:270} },
      { id:'oil2', x: w*0.80, y: h*0.66, lvl:0, name:'Oil Rig', icon:'🛢️', ruined:true, cost:{food:270} },
      { id:'wall', x: w*0.18, y: h*0.72, lvl:0, name:'City Wall', icon:'🧱', ruined:true, cost:{food:180, oil:180} },
      { id:'garage', x: w*0.60, y: h*0.35, lvl:0, name:'Garage', icon:'🚛', ruined:true, cost:{food:500} },
    ]

    this.buildings.forEach((b)=>{
      const container = this.add.container(b.x, b.y)
      const bg = this.add.rectangle(0,0, b.id==='main'? 90:70, b.id==='main'? 90:70, b.id==='main'? 0x1a3a5a:0x1a252c)
        .setStrokeStyle(2, b.id==='main'? 0x00e5ff:0x2a3f4a)
        .setInteractive({useHandCursor:true})
      
      // Анимации като в Camel
      if(b.id==='main'){
        this.tweens.add({ targets:bg, scaleX:1.08, scaleY:1.08, duration:900, yoyo:true, repeat:-1 })
      } else {
        this.tweens.add({ targets:container, y: b.y-5, duration:1200+Math.random()*800, yoyo:true, repeat:-1 })
      }

      const icon = this.add.text(0,-10, b.ruined?'💀':b.icon, {fontSize:'30px'}).setOrigin(0.5)
      const name = this.add.text(0,18, b.name, {fontSize:'8px', color:'#aaa'}).setOrigin(0.5)
      const lvlBg = this.add.circle(22,22,11,0xffcc33)
      const lvlText = this.add.text(22,22, b.lvl>0?`${b.lvl}`:'', {fontSize:'10px', color:'#000', fontStyle:'bold'}).setOrigin(0.5)

      container.add([bg, icon, name, lvlBg, lvlText])

      bg.on('pointerdown', ()=>{
        if(b.ruined){
          b.ruined = false
          icon.setText(b.icon)
          this.logText.setText(`Изчисти ${b.name}! Иска ${b.cost? JSON.stringify(b.cost).replace(/[{}"]/g,'') : 'FREE'} за Lv.1`)
        } else if(b.lvl===0){
          // Проверка на реалните цени от Camel
          const needFood = (b.cost as any)?.food || 0
          const needOil = (b.cost as any)?.oil || 0
          if(this.res.food < needFood || this.res.oil < needOil){
            this.logText.setText(`Няма ресурси! Трябва ${needFood} Food, ${needOil} Oil`)
            return
          }
          this.res.food -= needFood
          this.res.oil -= needOil
          b.lvl = 1
          lvlText.setText('1')
          this.logText.setText(`${b.name} Lv.1 построен! Дава 400/час (истинската стойност от Camel)`)
        } else {
          // ъпгрейд - цената расте като в Camel: 270, 540, 690, 970...
          const nextCostFood = 270 * Math.pow(1.8, b.lvl-1)
          const nextCostOil = 270 * Math.pow(1.8, b.lvl-1)
          if(this.res.food < nextCostFood || this.res.oil < nextCostOil){
            this.logText.setText(`За Lv.${b.lvl+1} трябват ${Math.floor(nextCostFood)} Food/Oil`)
            return
          }
          this.res.food -= nextCostFood
          this.res.oil -= nextCostOil
          b.lvl++
          lvlText.setText(`${b.lvl}`)
          this.logText.setText(`${b.name} -> Lv.${b.lvl}! Производство: ${400 + (b.lvl-1)*120}/час`)
        }
      })
      // запазваме референция
      b.iconObj = icon; b.lvlText = lvlText
    })

    // LOG и BOTTOM BAR
    this.logText = this.add.text(10, h-85, 'СТАРТ Level 1: Град в руини. Цъкни 💀 за да изчистиш. Farm = 270 Oil, Oil Rig = 270 Food - реални цени от Camel.', 
      {fontSize:'11px', color:'#7cff6b', backgroundColor:'#1a2a1a', wordWrap:{width:w-20}}).setPadding(6)
    
    const bottomY = h-38
    this.add.rectangle(0,bottomY,w,38,0x0f151a).setOrigin(0,0)
    const bottomLabels = ['📖 Quest','🎒 Bag','✉️ Mail 9','⭐ Alliance 25','🧑 My Info']
    bottomLabels.forEach((t,i)=>{
      this.add.text((w/5)*i+15, bottomY+12, t, {fontSize:'10px', color:i===0?'#ffcc33':'#7a8a7a'}).setOrigin(0,0.5)
    })

    // ТИК - реално производство от Camel: 400/час на Lv.1
    this.time.addEvent({ delay:1000, loop:true, callback:()=>{
      let prodFood=0, prodOil=0
      this.buildings.forEach((b:any)=>{
        if(b.lvl>0){
          const prod = 400 + (b.lvl-1)*120 // Lv1=400, Lv2=510, Lv3=630 като в таблиците
          if(b.id==='farm') prodFood += prod
          if(b.id.includes('oil')) prodOil += prod
        }
      })
      this.res.food += prodFood/3600
      this.res.oil += prodOil/3600
      this.resText.setText(`🌽 ${Math.floor(this.res.food)} (+${prodFood}/h)  🛢️ ${Math.floor(this.res.oil)} (+${prodOil}/h)  Depot пази 300k  Main Hall Lv.1`)
    }})
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: '#0f1210',
  scene: CityScene,
  scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH }
})