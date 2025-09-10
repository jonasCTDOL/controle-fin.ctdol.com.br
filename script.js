const canvas = document.getElementById('digital-rain');
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

let columns = Math.floor(width / 20);
let drops = [];

for (let i = 0; i < columns; i++) {
    drops[i] = 1;
}

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function draw() {
    ctx.fillStyle = 'rgba(10, 10, 26, 0.05)';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#00f0ff'; // Cor ciano
    ctx.font = '15px Orbitron';

    for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * 20, drops[i] * 20);

        if (drops[i] * 20 > height && Math.random() > 0.975) {
            drops[i] = 0;
        }

        drops[i]++;
    }
}

setInterval(draw, 33);

window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    columns = Math.floor(width / 20);
    drops = [];
    for (let i = 0; i < columns; i++) {
        drops[i] = 1;
    }
});
