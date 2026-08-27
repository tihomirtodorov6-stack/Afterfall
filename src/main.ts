import Phaser from 'phaser'

class City extends Phaser.Scene {
  constructor(){ super('City') }
  create(){
    this.cameras.main.setBackgroundColor('#0a1a0f')
    const W = this.scale.width
    const H = this.scale.height

    // РЕСУРСИ ГОРЕ
    this.add.text(W/2, 20, '🌽 500 🛢️ 500 - Main Hall Lv.1', {
      fontSize:'18px', color:'#fff', backgroundColor:'#000', padding:{x:12,y:6}
    }).setOrigin(0.5)

    // HEADQUARTERS В ЦЕНТЪРА - без картинка, само квадрат
    const hq = this.add.rectangle(W/2, H/2, 140, 140, 0x3a6b4a).setStrokeStyle(4, 0x7cff6b)
    this.add.text(W/2, H/2, '🏛️\nHQ\nLv.1', {fontSize:'20px', align:'center', color:'#fff'}).setOrigin(0.5)
    this.tweens.add({targets:hq, scale:1.05, yoyo:true, repeat:-1, duration:900})

    // FARM - В РУИНИ - горе вляво за да се вижда целия
    const farm = this.add.rectangle(120, 150, 160, 100, 0x2a4a2a).setStrokeStyle(2, 0xff5555).setInteractive()
    const farmText = this.add.text(120, 150, '🌾 Farm\n💀 РУИНИ', {fontSize:'16px', align:'center', color:'#ffaaaa'}).setOrigin(0.5)
    this.tweens.add({targets:[farm, farmText], alpha:0.5, yoyo:true, repeat:-1, duration:400})

    farm.on('pointerdown', ()=>{
      farm.setFillStyle(0x1a6b1a)
      farm.setStrokeStyle(3, 0x7cff6b)
      farmText.setText('🌾 Farm\nLv.1\n400/h')
      farmText.setColor('#7cff6b')
      this.tweens.killTweensOf([farm, farmText])
      farm.setAlpha(1); farmText.setAlpha(1)
      this.add.text(120, 220, '✅ Построен!', {fontSize:'12px', color:'#7cff6b'}).setOrigin(0.5)
    })

    // OIL - горе вдясно
    const oil = this.add.rectangle(W-120, 150, 160, 100, 0x4a3a2a).setStrokeStyle(2, 0xff5555).setInteractive()
    this.add.text(W-120, 150, '🛢️ Oil\n💀 РУИНИ', {fontSize:'16px', align:'center', color:'#ffaaaa'}).setOrigin(0.5)

    // Инструкция долу
    this.add.text(W/2, H-40, 'ЦЪКНИ FARM ЗА ДА ИЗЧИСТИШ ЗОМБИТАТА', {
      fontSize:'16px', color:'#7cff6b', backgroundColor:'#000', padding:{x:8,y:4}
    }).setOrigin(0.5)
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