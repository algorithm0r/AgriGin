class Human {
    constructor(human) {
        this.game = human.game;
        this.x = human.x;
        this.y = human.y;
        this.cell = human.cell;

        // metabolic properties
        this.thirst = 0;
        this.hunger = 0;
        this.tired = 0;

        // resources carried
        this.water = 0;
        this.meat = 0;
        this.seeds = [];
        this.toPlant = [];
        
        // Q learning
        let actions1x1 = ["move", "harvest seeds", "fill waterskin", "plant seed", "hunt goat", "harvest meat"];
        this.seedLearner1x1 = new QLearner(actions1x1);
        let actions3x3 = ["move north", "move northeast", "move east", "move southeast", "move south", "move southwest", "move west", "move northwest", 
            "harvest seeds", "fill waterskin", "plant seed", "hunt goat", "harvest meat"];
        this.seedLearner3x3 = new QLearner(actions3x3);
        let moveActions = ["move north", "move northeast", "move east", "move southeast", "move south", "move southwest", "move west", "move northwest", 
            "harvest seeds", "fill waterskin", "plant seed", "hunt goat", "harvest meat"];
        this.mapLearner1x1 = new QLearner(moveActions);

        this.epsilon = 1;
        this.epsilonDecay = 0.99;

        // navigation
        this.shelter = null;
        this.returningToShelter = false;

        // display properties
        this.color = "red";
    }

    spendEnergy() {
        var r = randomInt(3);
        if (r === 0) this.thirst++;
        else if (r === 1) this.hunger++;
        else this.tired++;
        if (this.isHungry() || this.isThirsty() || this.isTired()) {
            return true;
        }
        return false;
    }

    isTired() {
        return this.tired > PARAMS.metabolicThreshold;
    }

    isThirsty() {
        return this.thirst > PARAMS.metabolicThreshold;
    }

    isHungry() {
        return this.hunger > PARAMS.metabolicThreshold;
    }

    isBasketFull() {
        return this.meat + this.seeds.length >= PARAMS.basketSize;
    }

    moveRandom() {
        let cells = this.cell.mooreFlat.filter((cell, index) => cell !== undefined && index !== 4);
        let cell = cells[randomInt(cells.length)];
        return this.move(cell);
    }

    move(cell) {
        if (cell) {
            this.cell.removeHuman(this);
            cell.addHuman(this);
        }
        return -1;
    }

    moveNorth() {
        let newCell = this.cell.moore[0][1];
        return this.move(newCell);
    }
    
    moveNortheast() {
        let newCell = this.cell.moore[0][2];
        return this.move(newCell);
    }
    
    moveEast() {
        let newCell = this.cell.moore[1][2];
        return this.move(newCell);
    }
    
    moveSoutheast() {
        let newCell = this.cell.moore[2][2];
        return this.move(newCell);
    }
    
    moveSouth() {
        let newCell = this.cell.moore[2][1];
        return this.move(newCell);
    }
    
    moveSouthwest() {
        let newCell = this.cell.moore[2][0];
        return this.move(newCell);
    }
    
    moveWest() {
        let newCell = this.cell.moore[1][0];
        return this.move(newCell);
    }
    
    moveNorthwest() {
        let newCell = this.cell.moore[0][0];
        return this.move(newCell);
    }    

    moveToShelter() {
        this.returningToShelter = true;
        this.shelter = this.cell.closestShelter;
        this.move(this.nextStepToShelter());
    }

    nextStepToShelter() {
        let shelterX = this.shelter.x;
        let shelterY = this.shelter.y;
        
        let dx = shelterX - this.x;
        let dy = shelterY - this.y;
    
        if (Math.abs(dx) > Math.abs(dy)) {
            return this.cell.moore[1 + Math.sign(dx)][1];
        } else if (Math.abs(dy) > Math.abs(dx)) {
            return this.cell.moore[1][1 + Math.sign(dy)];
        } else {
            return this.cell.moore[1 + Math.sign(dx)][1 + Math.sign(dy)];
        }
    }

    fillWaterskin() {
        let reward = Math.min(PARAMS.scoopSize, this.cell.water);
        if(this.water < PARAMS.skinSize && reward > 0) this.water += reward;
        else reward = -2;
        return reward;
    }

    harvestSeed() {
        let plants = this.cell.seeds;
        let seeds = [];
        for (let i = 0; i < plants.length; i++) {
            let plant = plants[i];
            if (plant.seeds > 0) {
                seeds = plant.pluckSeeds();
                break;
            }
        }

        if (seeds.length > 0 && !this.isBasketFull()) {
            this.seeds.push(...seeds);
            return seeds.length;
        } else {
            return -2;
        }
    }

    plantSeed() {
        if (this.cell.seeds.length < 4 && this.toPlant.length > 0) {
            var [seed] = this.toPlant.splice(0, 1);
            this.cell.addSeed(seed);
            return 1;
        } else {
            return -2;
        }
    }

    huntGoat() {
        let goats = this.cell.goats;
        if (goats.length > 0) {
            let goat = goats[randomInt(goats.length)];
            if(Math.random() > goat.aggression.value) {
                goat.dead = true;
                return 1;
            }
        }
        return -2;
    }

    harvestMeat() {
        let carcasses = this.cell.carcasses;
        if(carcasses.length > 0 && !this.isBasketFull()) {
            let carcass = carcasses[0];
            let val = carcass.harvestMeat();
            this.meat += val;
            return val;
        } else {
            return -2;
        }
    }

    dropSeeds() { // not currently used
        var dropSize = Math.min(this.seeds.length, randomInt(PARAMS.maxSeedDrop) + 1);

        // this.seeds.sort((s1,s2)=>(s1.energy>s2.energy) ? 1 : (s2.energy < s1.energy) ? -1 : 0);
        var seeds = this.seeds.splice(this.seeds.length - dropSize, dropSize);
        for (var i = 0; i < seeds.length; i++) {
            seeds[i].cell = this.cell;
            seeds[i].x = this.x;
            seeds[i].y = this.y;
            seeds[i].seeds = 1;
            seeds[i].spreadSeeds();
        }
    }

    rest() {
        var shelter = this.cell.shelter;
        this.returningToShelter = false;
        
        // empty seeds and meat
        if (this.seeds.length > 0 || this.meat > 0) {
            shelter.seeds.push(...this.seeds);
            this.seeds = [];
            shelter.meat += this.meat;
            this.meat = 0;
        }
        
        // sleep
        this.tired = Math.max(this.tired - PARAMS.metabolicUnit, 0);

        //drink
        if ( /*shelter.water > 0 &&*/this.thirst > 0) {
            var val = PARAMS.metabolicUnit;
            shelter.water -= val;
            this.thirst -= val;
        }

        // eat
        if (this.hunger > 0) {
            if(shelter.meat > 0) {
                shelter.meat--;
                this.hunger -= PARAMS.metabolicUnit;    
            } else if (shelter.seeds.length > 0) {
                shelter.seeds.splice(0, 1);
                this.hunger -= PARAMS.metabolicUnit;    
            } else {
                this.hunger--;
            }
        }

        // fill planting seeds
        if (this.toPlant.length < PARAMS.basketSize && shelter.seeds.length > 0) {
            var diff = Math.min(PARAMS.scoopSize, PARAMS.plantBasketSize - this.toPlant.length);
            this.toPlant.push(...shelter.seeds.splice(0, diff));
        }
    }

    selfState(cellState) {
        let state = "";
        state += this.isBasketFull() ? "1" : "0";
        state += this.water < PARAMS.skinSize ? "1" : "0";
        state += this.toPlant.length > 0 ? "1" : "0";

        cellState.state1x1 += state;
        cellState.state3x3 += state;
        cellState.location += state;

        return cellState;
    }

    learn(state, action, reward, nextState) {
        this.seedLearner1x1.learn(state.state1x1, action > 0 ? action - 7 : 0, reward, nextState.state1x1);
        this.seedLearner3x3.learn(state.state3x3, action, reward, nextState.state3x3);
        this.mapLearner1x1.learn(state.location, action, reward, nextState.location);
    }

    broadcast(state, action, reward, nextState) {
        let cells = this.cell.neighborhoodFlat;
        cells.forEach(cell => {
            if (cell) cell.humans.forEach(human => {
                human.learn(state, action, reward, nextState);
            });
        });
    }

    selectAction() {
        let action = null;
        let actions = this.seedLearner3x3.actions;
        let state = this.cell.cellStates();
        state = this.selfState(state);

        if(Math.random() < this.epsilon) {
            // explore
            action = randomInt(actions.length);
        } else {
            // exploit
            let action1x1 = this.seedLearner1x1.policy(state.state1x1).action;
            let action3x3 = this.seedLearner3x3.policy(state.state3x3).action;
            let actionMap = this.mapLearner1x1.policy(state.location).action;

            if(action1x1 > 1)
                action = action1x1 + 7;
            else
                action = [actionMap, action3x3][randomInt(2)]; 
        }

        let reward = this.act(action);
        let nextState = this.cell.cellStates();
        nextState = this.selfState(nextState);

        // calls learn on all humans in 5x5 neighborhood (including this humans)
        this.broadcast(state, action, reward, nextState); 

        this.epsilon *= this.epsilonDecay;
    }

    act(action) {
        switch (action) {
            case 0:
                return this.moveNorthwest();
            case 1:
                return this.moveNorth();
            case 2:
                return this.moveNortheast();
            case 3:
                return this.moveEast();
            case 4:
                return this.moveSoutheast();
            case 5:
                return this.moveSouth();
            case 6:
                return this.moveSouthwest();
            case 7:
                return this.moveWest();
            case 8:
                return this.harvestSeed();
            case 9:
                return this.fillWaterskin();
            case 10:
                return this.plantSeed();
            case 11:
                return this.huntGoat();
            case 12:
                return this.harvestMeat();
            }        
    }

    update() {
        if(this.cell.shelter) { // in a shelter
            if(this.spendEnergy()) this.rest();
            else this.moveRandom();
        } else if(this.returningToShelter) { // already on the way home
            this.spendEnergy();
            this.move(this.nextStepToShelter());
        } else if(this.spendEnergy()){ // head home
            this.moveToShelter();
        } else { // use learners to select action
            this.selectAction();
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
};















