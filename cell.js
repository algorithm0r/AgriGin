
class Cell {
    constructor(game, x, y) {
        this.x = x;
        this.y = y;
        this.game = game;

        this.water = PARAMS.dry;
        this.rockiness = randomInt(16);

        this.seeds = [];
        this.humans = [];
        this.goats = [];
        this.carcasses = [];

        this.neighborhood = [];
        this.moore = [];
        this.neighborhoodFlat = [];
        this.mooreFlat = [];

        this.color = "brown";
    }

    init(board) {
        this.board = board;

        for (let i = 0; i < 5; i++) {
            this.neighborhood.push([]);
            for (let j = 0; j < 5; j++) {
                this.neighborhood[i].push(this.board[this.x + i - 2]?.[this.y + j - 2]);
            }
        }
        this.moore = this.neighborhood.slice(1, 4).map(row => row.slice(1, 4));
        this.neighborhoodFlat = this.neighborhood.flatMap(row => row);
        this.mooreFlat = this.moore.flatMap(row => row);
    }

    cellState() {
        let state = "";
        
        if(this.hasMatureSeeds()) {
            state += "1";
        } else {
            state += "0";
        }

        if(this.hasWater()) {
            state += "1";
        } else {
            state += "0";
        }

        if(this.hasGoats()) {
            state += "1";
        } else {
            state += "0";
        }

        if(this.hasCarcasses()) {
            state += "1";
        } else {
            state += "0";
        }

        return state;
    }

    cellStates(){
        let state1x1 = this.cellState();

        let state3x3 = this.mooreFlat.map(cell => cell?.cellState()).join('');
        let location = `(${this.x},${this.y})`;

        return { location, state1x1, state3x3 };
    }

    hasMatureSeeds() {
        for(let i = 0; i < this.seeds.length; i++) {
            if(this.seeds[i].isMature())
             return true;
        }
        return false;
    }

    hasWater() {
        return this.water > 0;
    }

    hasGoats() {
        return this.goats > 0;
    }

    hasCarcasses() {
        return this.carcasses > 0;
    }

    addSeed(seed) {
        if (!this.shelter && this.seeds.length < 4) {
            var s = new Seed(seed);
            s.cell = this;
            s.x = this.x;
            s.y = this.y;

            this.seeds.push(s);
            this.game.board.seeds.push(s);
        }
    }

    removeSeed(seed) {
        for (var i = 0; i < this.seeds.length; i++) {
            if (this.seeds[i] === seed) {
                this.seeds.splice(i, 1);
                return;
            }
        }
    }

    hasFoodForGoat() {
        for (let i = 0; i < this.seeds.length; i++) {
            let seed = this.seeds[i];
            if (seed.growth > seed.threshold / 2) return true;
        }
        return false;
    }

    addGoat(goat) {
        this.goats.push(goat);
        goat.cell = this;
        goat.x = this.x;
        goat.y = this.y;
    }

    removeGoat(goat) {
        for (var i = 0; i < this.goats.length; i++) {
            if (this.goats[i] === goat) {
                this.goats.splice(i, 1);
                return;
            }
        }
    }

    addCarcass(carcass) {
        this.carcasses.push(carcass);
        carcass.cell = this;
        carcass.x = this.x;
        carcass.y = this.y;
    }

    removeCarcass(carcass) {
        for (var i = 0; i < this.carcasses.length; i++) {
            if (this.carcasses[i] === carcass) {
                this.carcasses.splice(i, 1);
                return;
            }
        }
    }

    addHuman(human) {
        this.humans.push(human);
        human.cell = this;
        human.x = this.x;
        human.y = this.y;
    }

    removeHuman(human) {
        for (var i = 0; i < this.humans.length; i++) {
            if (this.humans[i] === human) {
                this.humans.splice(i, 1);
                return;
            }
        }
    }

    update() {
    }

    draw(ctx) {
        if (this.water <= 0) {
            var h = 18;
            // var s = 30 - this.water*2;
            var s = 50 - this.rockiness * 2;
            var l = 30 - this.water * 4;
            this.color = hsl(h, s, l);
        }
        else {
            var r = 0;
            var g = 0;
            var b = 255 - this.water * 10;
            this.color = rgb(r, g, b);
        }
        if (this.shelter) this.color = "gray";
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x * PARAMS.size, this.y * PARAMS.size, PARAMS.size, PARAMS.size);
        for (var i = 0; i < this.seeds.length; i++) {
            this.seeds[i].draw(ctx, i);
        }
        for (var i = 0; i < this.goats.length; i++) {
            this.goats[i].draw(ctx);
        }
        for (var i = 0; i < this.carcasses.length; i++) {
            this.carcasses[i].draw(ctx);
        }
        for (var i = 0; i < this.humans.length; i++) {
            this.humans[i].draw(ctx);
        }

    }
};











