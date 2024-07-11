class Automata {
    constructor() {
        gameEngine.board = this;
        this.x = 0;
        this.y = 0;

        this.run = 0;

        loadParameters();
        this.buildAutomata();
    }

    buildAutomata() {
        // reset entities and graphs
        gameEngine.entities = [];
        gameEngine.addEntity(this);
        gameEngine.graphs = [];

        this.dataMan = new DataManager(this);
        gameEngine.addGraph(this.dataMan);

        // reset day
        this.day = 0;

        // initialize shelter
        this.shelter = { water: 0, seeds: [], plantSeeds: [], meat: 0 };
        for(let i = 0; i < 2000; i++) this.shelter.seeds.push(new Seed({ cell: { x: -1, y: -1 }}));

        // agents
        this.seeds = [];
        this.humans = [];
        this.goats = [];
        this.carcasses = [];

        // grid
        this.board = [];

        this.createBoard();
    }


    createBoard() {
        for (var i = 0; i < PARAMS.dimension; i++) {
            this.board.push([]);
            for (var j = 0; j < PARAMS.dimension; j++) {
                this.board[i].push(new Cell(gameEngine, i, j, this));
            }
        }

        for (var i = 0; i < PARAMS.dimension; i++) {
            for (var j = 0; j < PARAMS.dimension; j++) {
                this.board[i][j].init(this.board);
            }
        }
        this.generateRiver();
        this.plantSeeds();
        this.addShelters(20);
        this.mapShelters();
    }

    mapShelters(){
        for (var i = 0; i < PARAMS.dimension; i++) {
            for (var j = 0; j < PARAMS.dimension; j++) {
                let cell = this.findClosestShelter(i,j);
                this.board[i][j].closestShelter = cell;
            }
        }
    }

    findClosestShelter(x, y) {
        var cell = this.board[x][y];

        // if(x > 1) {
        //     console.log("Asdf");
        // }
        let q = [cell];
        let visited = new Set();
        visited.add(cell);

        while (q.length > 0) {
            let current = q.shift();
            if (current.shelter) {
                return current; // Found closest shelter
            }
            // Explore neighbors
            for (let neighbor of current.mooreFlat) {
                if (neighbor !== undefined && !visited.has(neighbor)) {
                    q.push(neighbor);
                    visited.add(neighbor);
                }
            }
        }
        return null; // No shelter found
    }

    partitionSeeds() {
        var seeds = this.shelter.seeds;
        var plant = [];

        var selectionProperty = PARAMS.plantStrategy;

        if (seeds.length > 0 && this.shelter.plantSeeds.length < seeds.length / 4 && this.day > PARAMS.plantingTime) {
            if (selectionProperty == "none") {
                // do nothing
            } else if (selectionProperty == "random") {
                this.shelter.plantSeeds.push(...seeds.splice(0, seeds.length / 4));
            } else if (selectionProperty.substring(0, 3) == "min") {
                selectionProperty = selectionProperty.slice(3);
                var avg = seeds.reduce((p, c) => p + (c[selectionProperty].value ?? c[selectionProperty].length ?? c[selectionProperty]), 0) / seeds.length;
                var obj = seeds.reduce((p, c) => (c[selectionProperty].value ?? c[selectionProperty].length ?? c[selectionProperty]) < avg
                    ? { sum: p.sum + (c[selectionProperty].value ?? c[selectionProperty].length ?? c[selectionProperty]), num: p.num + 1 }
                    : p, { sum: 0, num: 0 });
                var avg2 = obj.sum / obj.num;

                [this.shelter.seeds, plant] = seeds.reduce(([k, p], c) => (c[selectionProperty].value ?? c[selectionProperty].length ?? c[selectionProperty]) > avg2 ? [[...k, c], p] : [k, [...p, c]], [[], []]);
                this.shelter.plantSeeds.push(...plant);
            } else {
                var avg = seeds.reduce((p, c) => p + (c[selectionProperty].value ?? c[selectionProperty].length ?? c[selectionProperty]), 0) / seeds.length;
                var obj = seeds.reduce((p, c) => (c[selectionProperty].value ?? c[selectionProperty].length ?? c[selectionProperty]) > avg
                    ? { sum: p.sum + (c[selectionProperty].value ?? c[selectionProperty].length ?? c[selectionProperty]), num: p.num + 1 }
                    : p, { sum: 0, num: 0 });
                var avg2 = obj.sum / obj.num;

                [this.shelter.seeds, plant] = seeds.reduce(([k, p], c) => (c[selectionProperty].value ?? c[selectionProperty].length ?? c[selectionProperty]) < avg2 ? [[...k, c], p] : [k, [...p, c]], [[], []]);
                this.shelter.plantSeeds.push(...plant);
            }
        }
    }

    generateRiver() {
        //var start = Math.floor(randomInt(PARAMS.dimension / 10) + PARAMS.dimension * 0.45);
        var start = Math.floor(PARAMS.dimension / 2);
        for (var i = 0; i < PARAMS.dimension; i++) {
            this.board[start][i].water = PARAMS.riverWidth;
            for (var j = 1; j < PARAMS.dimension - start; j++) {
                this.board[start + j][i].water = Math.max(PARAMS.riverWidth - j, PARAMS.dry);
            }
            for (var j = 1; j < start - 1; j++) {
                this.board[start - j][i].water = Math.max(PARAMS.riverWidth - j + 1, PARAMS.dry);
            }

            //if (randomInt(5) === 0)
            //    start += randomInt(2) === 0 ? 1 : -1;
        }
    }

    plantSeeds() {
        for (var i = 0; i < PARAMS.dimension; i++) {
            for (var j = 0; j < PARAMS.dimension; j++) {
                if (Math.random() < 0.1) {
                    var seed = new Seed({ cell: this.board[i][j] })
                    this.board[i][j].addSeed(seed, 0);
                    this.seeds.push(seed);
                }
            }
        }
    }

    addGoats(numOfGoats) {
        for (var i = 0; i < numOfGoats; i++) {
            var row = randomInt(PARAMS.dimension);
            var col = randomInt(PARAMS.dimension);
            var goat = new Goat({ game: gameEngine, x: row, y: col, cell: this.board[row][col] });
            this.board[row][col].addGoat(goat);
            this.goats.push(goat);
        }
    }

    addHumans(numOfHumans) {
        for (var i = 0; i < numOfHumans; i++) {
            var shelterRow = randomInt(PARAMS.dimension);
            var shelterCol = randomInt(PARAMS.dimension);
            var human = new Human({ game: gameEngine, x: shelterRow, y: shelterCol, cell: this.board[shelterRow][shelterCol] });
            this.board[shelterRow][shelterCol].addHuman(human);
            this.humans.push(human);
        }
    }

    addShelters(numOfShelters) {
        var shelters = new Set();
        for (var i = 0; i < numOfShelters; i++) {
            let oneThird = Math.floor(PARAMS.dimension/3);
            let x = randomInt(2*oneThird);
            if(x >= oneThird) x += oneThird;
            let y = randomInt(PARAMS.dimension);
        
            if(shelters.has(JSON.stringify({ x, y }))) {
                i--;
            } else {
                shelters.add(JSON.stringify({ x, y }));
                this.board[x][y].shelter = this.shelter;
            }
        }
    }

    reset() {
        this.nextRun();
        loadParameters();
        this.buildAutomata();
    }

    nextRun() {
        const harvest = document.getElementById("seed_selection");
        const plant = document.getElementById("plant_selection");
        const human = document.getElementById("human_add_rate");
        const run = document.getElementById("run");
        const chance = document.getElementById("plantSelectionChance");
        const strength = document.getElementById("plantSelectionStrength");
        const indiv = document.getElementById("individualSeedSeparation");
        const share = document.getElementById("sharedPlantingSeeds");


        // update PARAMS
        this.run = (this.run + 1) % runs.length;
        Object.assign(PARAMS, runs[this.run]);

        // update HTML
        run.innerHTML = PARAMS.runName;
        harvest.value = PARAMS.harvestStrategy;
        plant.value = PARAMS.plantStrategy;
        human.value = PARAMS.humanAddRate;
        chance.value = PARAMS.plantSelectionChance;
        strength.value = PARAMS.plantSelectionStrength;
        indiv.checked = PARAMS.individualSeedSeparation;
        share.checked = PARAMS.sharedPlantingSeeds;
    }

    update() {
        this.day++;
        if (this.day === PARAMS.humansAdded) this.addHumans(PARAMS.humanAddRate);
        if (this.day === PARAMS.goatsAdded) this.addGoats(PARAMS.goatAddRate);

        if (this.day > PARAMS.epoch) {
            this.dataMan.logData();
            this.reset();
        }

        // for (var i = 0; i < PARAMS.dimension; i++) {
        //     for (var j = 0; j < PARAMS.dimension; j++) {
        //         this.board[i][j].update();
        //     }
        // }

        for (var i = this.seeds.length - 1; i >= 0; i--) {
            var seed = this.seeds[i];
            seed.update();
            if (seed.dead) {
                this.seeds.splice(i, 1);
                seed.cell.removeSeed(seed);
                if (seed.seeds > 0) {
                    seed.spreadSeeds();
                }
            }
        }

        for (var i = this.goats.length - 1; i >= 0; i--) {
            var goat = this.goats[i];
            goat.update();
            if (goat.dead) {
                this.goats.splice(i, 1);
                goat.cell.removeGoat(goat);
                let carcass = new Carcass(goat);
                this.carcasses.push(carcass);
                carcass.cell.addCarcass(carcass);                
            }
        }

        for (var i = this.humans.length - 1; i >= 0; i--) {
            var human = this.humans[i];
            human.update();
            if (human.dead) {
                this.humans.splice(i, 1);
                human.cell.removeHuman(human);
            }
        }

        for (var i = this.carcasses.length - 1; i >= 0; i--) {
            var carcass = this.carcasses[i];
            carcass.update();
            if (carcass.decayed) {
                this.carcasses.splice(i, 1);
                carcass.cell.removeCarcass(carcass);
            }
        }

        if (!PARAMS.individualSeedSeparation) this.partitionSeeds();
        if (this.shelter.seeds.length > 2000) {
            this.shelter.seeds.splice(0, this.shelter.seeds.length - 2000);
        }
        if (this.shelter.plantSeeds.length > 2000) {
            this.shelter.plantSeeds.splice(0, this.shelter.plantSeeds.length - 2000);
        }


        // data gathering
        if (this.day % PARAMS.reportingPeriod === 0) {
            this.dataMan.updateData();
        }
    }

    draw(ctx) {
        ctx.clearRect(800, 700, 800, 200);

        ctx.font = "12px Arial";
        ctx.fillStyle = "#000000";
        ctx.textAlign = "left";
        ctx.fillText(`Seeds in Shelter: ${this.shelter.seeds.length}`, 810, 710);
        ctx.fillText(`Seeds to Plant: ${this.shelter.plantSeeds.length}`, 810, 724);
        // ctx.fillText(`Water in Shelter: ${this.shelter.water}`, 810, 738);
        ctx.fillText(`Tick ${gameEngine.clockTick}`, 810, 766);
        ctx.fillText(`FPS ${gameEngine.timer.ticks.length}`, 810, 780);
        ctx.fillText(`Day ${this.day}`, 810, 794);
        ctx.font = "10px Arial";

        if (!document.getElementById("visuals").checked) return;
        for (var i = 0; i < PARAMS.dimension; i++) {
            for (var j = 0; j < PARAMS.dimension; j++) {
                var cell = this.board[i][j];
                cell.draw(ctx);
            }
        }
    }
}