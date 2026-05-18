@Extend(Text)
function colorfulText(color: Color) {
  .fontColor(color)
  .fontSize(20)
}

@Extend(Column)
function cardStyle() {
  .backgroundColor('#ffffff')
  .borderRadius(16)
  .padding(16)
  .shadow({
    radius: 8,
    color: 'rgba(0, 0, 0, 0.1)',
    offsetX: 0,
    offsetY: 2
  })
}

@Extend(Button)
function primaryButton() {
  .type(ButtonType.Capsule)
  .backgroundColor('#00ff88')
  .fontColor('#0a0a0f')
  .height(44)
  .width('100%')
}

@Extend(Button)
function secondaryButton() {
  .type(ButtonType.Capsule)
  .backgroundColor('transparent')
  .borderWidth(1)
  .borderColor('#00ff88')
  .fontColor('#00ff88')
  .height(44)
  .width('100%')
}

@Styles
function cardPressedStyle() {
  .backgroundColor('#f0f0f0')
}

@Styles
function disabledStyle() {
  .opacity(0.5)
  .enabled(false)
}

export { colorfulText, cardStyle, primaryButton, secondaryButton };
