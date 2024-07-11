class Seed {
    constructor(seed) {
        this.cell = seed.cell;
        this.x = seed.cell.x;
        this.y = seed.cell.y;
    
        // init
        this.seeds = 0;
        this.growth = 0;
    
        // genes
        if (PARAMS.randomSeeds) {
            this.weight = seed.weight ? new RealGene(seed.weight) : new RealGene();
            this.deepRoots = seed.deepRoots ? new RealGene(seed.deepRoots) : new RealGene();
            this.hardiness = seed.hardiness ? new RealGene(seed.hardiness) : new RealGene();
            this.dispersal = seed.dispersal ? new RealGene(seed.dispersal) : new RealGene();
        } else {
            this.weight = seed.weight ? new RealGene(seed.weight) : new RealGene({ value: 0.5 });
            this.deepRoots = seed.deepRoots ? new RealGene(seed.deepRoots) : new RealGene();
            this.hardiness = seed.hardiness ? new RealGene(seed.hardiness) : new RealGene({ value: 1 });
            this.dispersal = seed.dispersal ? new RealGene(seed.dispersal) : new RealGene({ value: 0 });
        }
        this.mutate();
    
        this.penalty = this.weight.value + this.deepRoots.value + this.hardiness.value + this.dispersal.value;
        this.growthUnit = (1 - this.deepRoots.value) * (this.cell.water - PARAMS.dry) + this.deepRoots.value * PARAMS.range / 2 - Math.max(0, this.cell.rockiness - this.hardiness.value*PARAMS.range);
        
        this.threshold = Math.floor((PARAMS.germThreshold + this.penalty * PARAMS.growthPenalty)/this.growthUnit);
        this.dropThreshold = Math.floor(this.threshold + ((PARAMS.fullGrown * (1 - this.dispersal.value)) + 10)/this.growthUnit);
    }

    update() {
        this.growth++;
        
        if (this.growth === this.threshold) { // germinate
            var r = PARAMS.range + (this.cell.water - PARAMS.riverWidth);
            this.seeds = Math.ceil(r/4)+1;
        }
    
        if (this.growth > this.dropThreshold || Math.random() < PARAMS.seedDeathChance) { // die
            this.dead = true;
        }

        if (this.isMature() && Math.random() < PARAMS.predationChance) {
            this.pluckSeeds();
        }
    }

    draw(ctx, i) {
        // var penalty = Math.floor(this.deepRoots.value * 255);
        // ctx.fillStyle = rgb(0, 255 - penalty, 0);
        ctx.fillStyle = rgb(0, this.growth > this.threshold ? 255 : 0, 0);
        ctx.fillRect(this.x * PARAMS.size + (i % 2) * PARAMS.size * 3 / 4, this.y * PARAMS.size + Math.floor(i / 2) * PARAMS.size * 3 / 4, PARAMS.size / 4, PARAMS.size / 4);
    }

    mutate() {
        this.weight.mutate();
        this.deepRoots.mutate();
        this.hardiness.mutate();
        this.dispersal.mutate();
    }

    pluckSeeds() {
        var pluckRate = 0.75;
        var list = [];
    
        for (var i = 0; i < this.seeds;) {
            if (Math.random() < pluckRate) {
                var seed = new Seed(this);
                list.push(seed);
                this.seeds--;
            } else {
                i++;
            }
        }
        this.dead = true;
    
        return list;
    }

    spreadSeeds() {
        // console.log(this.seeds);
        for (var i = 0; i < this.seeds; i++) {
            if (Math.random() >= this.weight.value) {
                this.cell.addSeed(this);
            } else {
                var randomCell = (5 + randomInt(8)) % 9;
                var dX = (randomCell % 3) - 1;
                var dY = Math.floor(randomCell / 3) - 1;
                var x = this.x + dX < 0 || this.x + dX > PARAMS.dimension - 1 ? this.x : this.x + dX;
                var y = this.y + dY < 0 || this.y + dY > PARAMS.dimension - 1 ? this.y : this.y + dY;
                var cell = gameEngine.board.board[x][y];
    
                cell.addSeed(this);
            }
        }
    }

    isMature() {
        return this.growth >= this.threshold;
    }
}

