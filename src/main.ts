import Phaser from 'phaser'

class City extends Phaser.Scene {
  constructor(){ super('City') }
  preload(){
    this.load.image('hq', 'https://i.imgur.com/8Km9tLL.png')
  }
  create(){
    this.cameras.main.setBackgroundColor('#0a1a0f')
    const cx = this.scale.width/2
    const cy = this.scale.height/2

    const hq = this.add.image(cx, cy, 'hq').setScale(0.5)
    this.tweens.add({ targets: hq, scale: 0.52, yoyo: true, repeat: -1, duration: 1000 })

    this.add.text(cx, 50, '🌽 500 🛢️ 500 - Main Hall Lv.1', {
      fontSize:'18px', backgroundColor:'#000', padding:{x:10,y:6}
    }).setOrigin(0.5)

    const farm = this.add.rectangle(cx-150, cy+150, 120, 80, 0x2a5a2a).setInteractive()
    this.add.text(cx-150, cy+150, '🌾 Farm\n💀 РУИНИ', {fontSize:'12px', align:'center'}).setOrigin(0.5)

    farm.on('pointerdown', ()=>{
      farm.setFillStyle(0x7cff6b)
      this.add.text(cx-150, cy+200, 'Lv.1 400/h', {fontSize:'10px'}).setOrigin(0.5)
    })

    this.add.text(cx, this.scale.height-40, 'ЦЪКНИ FARM ЗА ДА ИЗЧИСТИШ ЗОМБИТАТА', {
      fontSize:'14px', color:'#7cff6b', backgroundColor:'#000'
    }).setOrigin(0.5)
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: window.innerWidth,
  height: window.innerHeight,
  scene: [City],
  scale: { mode: Phaser.Scale.RESIZE }
})