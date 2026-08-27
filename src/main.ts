import Phaser from 'phaser'

class City extends Phaser.Scene {
  corn = 500
  oil = 500
  cornText!: Phaser.GameObjects.Text
  oilText!: Phaser.GameObjects.Text

  constructor(){ super('City') }

  create(){
    this.cameras.main.setBackgroundColor('#08120a')
    const W = this.scale.width
    const H = this.scale.height
    const CX = W/2
    const CY = H/2

    // РЕСУРСИ
    this.cornText = this.add.text(CX, 30, '', {fontSize:'18px', color:'#fff', backgroundColor:'#000', padding:{x:10,y:6}}).setOrigin(0.5)
    this.updateRes()
    // тиктакане
    this.time.addEvent({delay:1000, loop:true, callback:()=>{ this.corn+=2; this.oil+=1; this.updateRes() }})

    // HQ в центъра
    const hq = this.add.rectangle(CX, CY, 150, 150, 0x2d5a3d).setStrokeStyle(4, 0x7cff6b)
    this.add.text(CX, CY, '🏛️\nHQ\nLv.1', {fontSize:'22px', align:'center', color:'#fff'}).setOrigin(0.5)
    this.tweens.add({targets:hq, scale:1.04, yoyo:true, repeat:-1, duration:1000})

    // ФУНКЦИЯ ЗА СГРАДА
    const makeBuilding = (x:number, y:number, icon:string, name:string, type:string) => {
      const bg = this.add.rectangle(x, y, 130, 90, 0x1a2a1a).setStrokeStyle(3, 0xff4444).setInteractive()
      const txt = this.add.text(x, y, `${icon}\n${name}\n💀 РУИНИ`, {fontSize:'14px', align:'center', color:'#ff9999'}).setOrigin(0.5)
      this.tweens.add({targets:[bg, txt], alpha:0.6, yoyo:true, repeat:-1, duration:500})

      bg.on('pointerdown', ()=>{
        this.tweens.killTweensOf([bg, txt])
        bg.setAlpha(1); txt.setAlpha(1)
        bg.setFillStyle(0x1f4a1f)
        bg.setStrokeStyle(3, 0x7cff6b)
        if(type==='farm') txt.setText(`${icon}\n${name}\nLv.1\n400/h`)
        else if(type==='oil') txt.setText(`${icon}\n${name}\nLv.1\n300/h`)
        else txt.setText(`${icon}\n${name}\nLv.1`)
        txt.setColor('#7cff6b')
        // ефект
        this.add.text(x, y-60, '✅ +100 XP', {fontSize:'12px', color:'#7cff6b'}).setOrigin(0.5)
      })
      return bg
    }

    // 8 СГРАДИ ОКОЛО HQ
    makeBuilding(CX-180, CY-180, '🌾', 'Farm', 'farm') // горе ляво
    makeBuilding(CX+180, CY-180, '🛢️', 'Oil Well', 'oil') // горе дясно
    makeBuilding(CX-220, CY, '🏭', 'Steel Mill', 'steel') // ляво
    makeBuilding(CX+220, CY, '🪵', 'Lumber', 'wood') // дясно
    makeBuilding(CX-180, CY+180, '🚛', 'Garage', 'garage') // долу ляво - ВОЙСКИ
    makeBuilding(CX+180, CY+180, '🪖', 'Barracks', 'barracks') // долу дясно - ВОЙСКИ
    makeBuilding(CX, CY-230, '🏥', 'Hospital', 'hospital') // горе център
    makeBuilding(CX, CY+230, '🧪', 'Lab', 'lab') // долу център

    // СТЕНА - голям кръг около всичко
    this.add.circle(CX, CY, 340, 0, 0).setStrokeStyle(2, 0x444444, 0.5)

    this.add.text(CX, H-35, 'ЦЪКНИ РУИНИТЕ ЗА ДА ГИ ИЗЧИСТИШ ОТ ЗОМБИТА',
      {fontSize:'14px', color:'#7cff6b', backgroundColor:'#000'}).setOrigin(0.5)
  }

  updateRes(){
    this.cornText.setText(`🌽 ${this.corn} 🛢️ ${this.oil} - Main Hall Lv.1`)
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: window.innerWidth,
  height: window.innerHeight,
  scene: [City],
  scale: { mode: Phaser.Scale.RESIZE, autoCenter: Phaser.Scale.CENTER_BOTH }
})