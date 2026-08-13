export class CircularText {
  constructor(sectionId, text, uppercase) {
    this.sectionId = sectionId;
    this.text = uppercase ? text.toUpperCase() : text;
    this.uppercase = uppercase;
    this.fontSize = 15;
    this.svg = document.getElementById(`circleSvg-${sectionId}`);
    this.textPath = document.getElementById(`textPath-${sectionId}`);
    this.path = document.getElementById(`circle-${sectionId}`);
  }

  measureTextWidth() {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    context.font = `${this.fontSize}px ${this.uppercase ? " uppercase" : ""}`;
    const textWidth = context.measureText(this.text).width * 1.05;
    return textWidth;
  }

  updateSvg() {
    const textWidth = this.measureTextWidth();
    const circumference = textWidth;
    const radius = circumference / (2 * Math.PI);
    const padding = this.fontSize * 2;
    const svgSize = radius * 2 + padding;
    const center = svgSize / 2;

    this.svg.setAttribute("width", svgSize);
    this.svg.setAttribute("height", svgSize);
    this.svg.setAttribute("viewBox", `0 0 ${svgSize} ${svgSize}`);

    const pathD = `
        M ${center}, ${center}
        m -${radius}, 0
        a ${radius},${radius} 0 1,1 ${radius * 2},0
        a ${radius},${radius} 0 1,1 -${radius * 2},0
      `;
    this.path.setAttribute("d", pathD);

    this.textPath.textContent = this.text;
  }

  init() {
    this.updateSvg();
  }
}
