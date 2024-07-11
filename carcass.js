class Carcass {
    constructor(goat) {
        this.x = goat.x;
        this.y = goat.y;
        this.cell = goat.cell;
        
        this.meat = PARAMS.carcassMeat;

        this.color = "black";
    }

    harvestMeat() {
        let val = Math.min(this.meat, PARAMS.scoopSize);
        this.meat -= val;
        return val;
    }

    update() {
        if(Math.random() < PARAMS.carcassDecay || this.meat <= 0) this.decayed = true;
    }

    draw(ctx) {
        var size = PARAMS.size / 2;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc((this.x * PARAMS.size) + (PARAMS.size / 2), (this.y * PARAMS.size) + (PARAMS.size / 2), (size / 2), 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.closePath();
    }
}

