const canvas = document.getElementById("canvas") as (HTMLCanvasElement | null);
if (canvas === null) throw new Error("Canvas error.");
const ctx = canvas.getContext("2d");
if (ctx === null) throw new Error("Ctx error.");

const earthImage = new Image(512, 512);
earthImage.src = "img/earth_resized_512.png";

let width = ctx.canvas.width;
let height = ctx.canvas.height;

let PIXEL_RADIUS = 8;
let GLOBE_RADIUS = width/2;
const ZOOM = 9;
const PERSPECTIVE = 1000;
let GLOBE_CENTER_X = width/2;
let GLOBE_CENTER_Y = height/2;

class Pixel {
    x: number;
    y: number;
    lambda: number;
    phi: number;
    X: number;
    Y: number;
    Z: number;
    scaleProjected: number;
    xProjected: number;
    yProjected: number;
    constructor(x: number, y: number) {
        this.x = x; // x co-ordinate of original image
        this.y = y; // y co-ordinate of original image
        this.lambda = ((2*Math.PI*this.x)/(2**ZOOM)) - Math.PI; // geodesic latitude of point
        this.phi = 2*(Math.atan(Math.exp(Math.PI-((2*Math.PI*this.y)/(2**ZOOM))))); // geodesic longitude of point
        this.X = (GLOBE_RADIUS)*(Math.sin(this.phi))*(Math.cos(this.lambda)); // x co-ordinate of point on sphere
        this.Y = (GLOBE_RADIUS)*(Math.cos(this.phi)); // y co-ordinate of point on sphere
        this.Z = (GLOBE_RADIUS)*(Math.sin(this.phi))*(Math.sin(this.lambda)) + GLOBE_RADIUS; // z co-ordinate of point on sphere
        this.scaleProjected = PERSPECTIVE/(PERSPECTIVE+this.Z); // scaled size of pixel based on distance from viewer
        this.xProjected = (this.X*this.scaleProjected)+GLOBE_CENTER_X; // x co-ordinate of pixel in 2D projection of sphere
        this.yProjected = (this.Y*this.scaleProjected)+GLOBE_CENTER_Y; // y co-ordinate of pixel in 2D projection of sphere
    }
}

let pixels: Array<Pixel> = [];
for (let i = 0; i < 2**ZOOM; i+=4) {
    for (let j = 0; j < 2**ZOOM; j+=4) {
        var pixel = new Pixel((2**ZOOM)-1-i, j);
        pixels.push(pixel);
    }
}

pixels.sort((pixel1, pixel2) => {
    return pixel1.scaleProjected - pixel2.scaleProjected;
});

var frameCount = 0;
function render(): void {
    if (ctx !== null && frameCount < 512) {
        ctx.clearRect(0, 0, width, height);
        for (let i = 0; i < pixels.length; i++) {
            ctx.drawImage(earthImage, (pixels[i].x+(frameCount*4))%(2**ZOOM), pixels[i].y, 1, 1, pixels[i].xProjected, pixels[i].yProjected, PIXEL_RADIUS*pixels[i].scaleProjected, PIXEL_RADIUS*pixels[i].scaleProjected);
        }
    }
    frameCount++;
    window.requestAnimationFrame(render);
}

(async () => {
    window.requestAnimationFrame(render);
})();