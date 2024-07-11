class Goat {
    constructor(goat) {
        this.game = goat.game;
        this.x = goat.x;
        this.y = goat.y;
        this.cell = goat.cell;
    
        // metabolic properties
        this.thirst = 0;
        this.hunger = 0;
        this.tired = 0;
    
        this.sex = randomInt(2);

        // genes
        this.horns = goat.horns ? new RealGene(goat.horns) : new RealGene();
        this.herd = goat.herd ? new RealGene(goat.herd) : new RealGene();
        this.aggression = goat.aggression ? new RealGene(goat.aggression) : new RealGene();
        this.fear = goat.fear ? new RealGene(goat.fear) : new RealGene();
        this.mutate();

        this.penalty = this.horns.value + this.herd.value + this.aggression.value + this.fear.value;

        // display properties
        this.color = this.sex ? "purple" : "pink";
    
        this.parent = true;
    }

    mutate() {
        this.horns.mutate();
        this.herd.mutate();
        this.aggression.mutate();
        this.fear.mutate();
    }

    spendEnergy() {
        var r = randomInt(3);
        if (r === 0) this.thirst++;
        else if (r === 1) this.hunger++;
        else this.tired++;
    }

    isTired() {
        return this.tired > PARAMS.metabolicThreshold/2;
    }

    isThirsty() {
        return this.thirst > PARAMS.metabolicThreshold/2;
    }

    isHungry() {
        return this.hunger > PARAMS.metabolicThreshold/2;
    }

    isExhausted() {
        return this.tired + this.thirst + this.hunger > 3*PARAMS.metabolicThreshold;
    }

    move(cell) {
        this.cell.removeGoat(this);
        cell.addGoat(this);
        if(!cell.water && this.isTired()) {
            this.tired -= PARAMS.metabolicUnit;
            return;
        }
        if(cell.water > 0 && this.isThirsty()) {
            this.thirst -= cell.water;
            return;
        }
        if(cell.seeds.length > 0) { 
            for (var j = 0; j < cell.seeds.length; j++) {
                const seed = cell.seeds[j];
                if (!seed.dead && seed.growth > seed.threshold/2) {
                    this.hunger -= seed.pluckSeeds().length + 1;
                    seed.dead = false;
                    seed.spreadSeeds();
                    seed.seeds = 0;
                    seed.growth = 0;
                }
            }
        }
    }

    canReproduce() {
        return this.hunger < -(PARAMS.metabolicThreshold*(1+this.penalty))*PARAMS.reproductionFactor;
        // return this.hunger < -(PARAMS.metabolicThreshold*(this.penalty))*PARAMS.reproductionFactor;
    }

    reproduce() {
        const goats = this.cell.goats;
        let otherParent = null;
        for(let i = 0; i < goats.length; i++){
            let other = goats[i];
            if(other.canReproduce()){
                if (other.sex != this.sex) {
                    if (!otherParent) otherParent = other;
                    else otherParent = otherParent.matingCombat(other);
                } else if (other != this) {
                    if(this != this.matingCombat(other)) return;
                }
            }       
        }

        if (otherParent != null) {
            this.hunger += PARAMS.metabolicThreshold;
            otherParent.hunger += PARAMS.metabolicThreshold;

            let goat = new Goat(this);
            this.game.board.goats.push(goat);
            this.cell.addGoat(goat);
        }
    }

    fightOrFlight() {
        // spend energy on the combat
        this.hunger += PARAMS.metabolicUnit;
        if(!this.canReproduce()) return false;

        return Math.random() < this.aggression.value;
    }

    hornsCharge() {
        return Math.random() % this.horns.value;
    }

    resolveCharge(other) {
        let winner = other;
        let loser = this;
        if(this.hornsCharge() > other.hornsCharge()) {
            winner = this;
            loser = other;
        }
        return { winner, loser };
    }

    matingCombat(other) {
        let { winner, loser } = this.resolveCharge(other);

        while(loser.fightOrFlight()) {
            let result = this.resolveCharge(other);
            winner = result.winner;
            loser = result.loser;
        }
        return winner;
    }

    scoreCell(cell) {
        let score = 0;
        let region = cell.mooreFlat;

        let reachHerd = false;
        let reachHuman = false;
        for(let j = 0; j < region.length; j++) {
            let neighbor = region[j];
            if (neighbor) {
                if (neighbor.goats.length > 1 || (!reachHerd && neighbor.goats.length === 1 && neighbor.goats[0] != this)) reachHerd = true;
                if (neighbor.humans.length > 0) reachHuman = true;
            }
        }

        if(cell.hasFoodForGoat()) score++;
        if(cell.water > 0 && this.isThirsty()) score++;
        if(this.canReproduce() && (cell.goats.length > 1 || (cell.goats.length === 1 && cell.goats[0] != this))) score++;
        if(reachHerd) score += (this.herd.value - 0.5) * 2;
        if(reachHuman) score -= (this.fear.value - 0.5) * 2;
        return score;
    }

    selectMove() {
        let cell = this.cell;
        let moore = cell.mooreFlat;

        let nextCells = [cell];
        let maxScore = this.scoreCell(cell);
        for(let i = 0; i < moore.length; i++) {
            let candidate = moore[i];
            if(candidate) {
                let candidateScore = this.scoreCell(candidate);
                if(candidateScore > maxScore){
                    maxScore = candidateScore;
                    nextCells = [candidate];
                } else if (candidateScore === maxScore) {
                    nextCells.push(candidate);
                }

            }
        }
        this.move(nextCells[randomInt(nextCells.length)]);
    }

    update() {
        this.spendEnergy();
    
        if (Math.random() < PARAMS.goatDeathChance || this.isExhausted()) this.dead = true;
    
        this.selectMove();
    
        if(this.canReproduce() && this.cell.goats.length > 1) {
            this.reproduce();
        }
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

