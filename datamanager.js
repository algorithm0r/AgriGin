class DataManager {
    constructor(automata) {
        this.automata = automata;

        this.initData();
    }

    initData() {
        // population graphs
        this.seedPop = [];
        this.humanPop = [];
        this.goatPop = [];

        this.wildSeedPop = [];
        this.domeSeedPop = [];
        this.wildGoatPop = [];
        this.domeGoatPop = [];

        // seed histograms
        this.weightData = [];
        this.rootData = [];
        this.seedData = [];
        this.dispersalData = [];
        this.weightDataWild = [];
        this.rootDataWild = [];
        this.seedDataWild = [];
        this.dispersalDataWild = [];
        this.weightDataDomesticated = [];
        this.rootsDataDomesticated = [];
        this.seedDataDomesticated = [];
        this.dispersalDataDomesticated = [];

        // goat histograms
        this.hornsData = [];
        this.herdData = [];
        this.fearData = [];
        this.aggressionData = [];
        this.hornsDataWild = [];
        this.herdDataWild = [];
        this.fearDataWild = [];
        this.aggressionDataWild = [];
        this.hornsDataDomesticated = [];
        this.herdDataDomesticated = [];
        this.fearDataDomesticated = [];
        this.aggressionDataDomesticated = [];

        // graphs
        const seedData = [this.seedPop, this.wildSeedPop, this.domeSeedPop];
        let popGraph = new Graph(gameEngine, 810, 0, seedData, "Population");
        gameEngine.addGraph(popGraph);
        const agentData = [this.humanPop, this.goatPop, this.wildGoatPop, this.domeGoatPop];
        popGraph = new Graph(gameEngine, 810, 150, agentData, "Population");
        gameEngine.addGraph(popGraph);

        this.weightHist = new Histogram(gameEngine, 810, 300, this.weightData, "Dispersal")
        this.rootHist = new Histogram(gameEngine, 810, 400, this.rootData, "Root Depth");
        this.seedHist = new Histogram(gameEngine, 810, 500, this.seedData, "Hardiness");
        this.dispersalHist = new Histogram(gameEngine, 810, 600, this.dispersalData, "Abscision");
        this.weightHistWild = new Histogram(gameEngine, 1010, 300, this.weightDataWild, "Dispersal - Wild")
        this.rootHistWild = new Histogram(gameEngine, 1010, 400, this.rootDataWild, "Root Depth - Wild");
        this.seedHistWild = new Histogram(gameEngine, 1010, 500, this.seedDataWild, "Hardiness - Wild");
        this.dispersalHistWild = new Histogram(gameEngine, 1010, 600, this.dispersalDataWild, "Abscision - Wild");
        this.weightHistDomesticated = new Histogram(gameEngine, 1210, 300, this.weightDataDomesticated, "Dispersal - Domesticated")
        this.rootHistDomesticated = new Histogram(gameEngine, 1210, 400, this.rootsDataDomesticated, "Root Depth - Domesticated");
        this.seedHistDomesticated = new Histogram(gameEngine, 1210, 500, this.seedDataDomesticated, "Hardiness - Domesticated");
        this.dispersalHistDomesticated = new Histogram(gameEngine, 1210, 600, this.dispersalDataDomesticated, "Abscision - Domesticated");

        this.hornsHist = new Histogram(gameEngine, 810, 300, this.hornsData, "Horns")
        this.herdHist = new Histogram(gameEngine, 810, 400, this.herdData, "Herding");
        this.fearHist = new Histogram(gameEngine, 810, 500, this.fearData, "Fear");
        this.aggressionHist = new Histogram(gameEngine, 810, 600, this.aggressionData, "Aggression");
        this.hornsHistWild = new Histogram(gameEngine, 1010, 300, this.hornsDataWild, "Horns - Wild")
        this.herdHistWild = new Histogram(gameEngine, 1010, 400, this.herdDataWild, "Herding - Wild");
        this.fearHistWild = new Histogram(gameEngine, 1010, 500, this.fearDataWild, "Fear - Wild");
        this.aggressionHistWild = new Histogram(gameEngine, 1010, 600, this.aggressionDataWild, "Aggression - Wild");
        this.hornsHistDomesticated = new Histogram(gameEngine, 1210, 300, this.hornsDataDomesticated, "Horns - Domesticated")
        this.herdHistDomesticated = new Histogram(gameEngine, 1210, 400, this.herdDataDomesticated, "Herding - Domesticated");
        this.fearHistDomesticated = new Histogram(gameEngine, 1210, 500, this.fearDataDomesticated, "Fear - Domesticated");
        this.aggressionHistDomesticated = new Histogram(gameEngine, 1210, 600, this.aggressionDataDomesticated, "Aggression - Domesticated");
    }

    updateData() {
        var seeds = this.automata.seeds;
        var goats = this.automata.goats;

        var seedPop = seeds.length;
        var humanPop = this.automata.humans.length;
        var goatPop = goats.length;
        var wildSeedPop = 0;
        var domeSeedPop = 0;
        var wildGoatPop = 0;
        var domeGoatPop = 0;

        var weightData = [];
        var rootsData = [];
        var seedData = [];
        var dispersalData = [];
        var weightDataWild = [];
        var rootsDataWild = [];
        var seedDataWild = [];
        var dispersalDataWild = [];
        var weightDataDomesticated = [];
        var rootsDataDomesticated = [];
        var seedDataDomesticated = [];
        var dispersalDataDomesticated = [];

        var hornsData = [];
        var hornsDataWild = [];
        var hornsDataDomesticated = [];
        var herdData = [];
        var herdDataWild = [];
        var herdDataDomesticated = [];
        var fearData = [];
        var fearDataWild = [];
        var fearDataDomesticated = [];
        var aggressionData = [];
        var aggressionDataWild = [];
        var aggressionDataDomesticated = [];

        for (var i = 0; i < 20; i++) {
            weightData.push(0);
            rootsData.push(0);
            seedData.push(0);
            dispersalData.push(0);
            weightDataWild.push(0);
            rootsDataWild.push(0);
            seedDataWild.push(0);
            dispersalDataWild.push(0);
            weightDataDomesticated.push(0);
            rootsDataDomesticated.push(0);
            seedDataDomesticated.push(0);
            dispersalDataDomesticated.push(0);

            hornsData.push(0);
            hornsDataWild.push(0);
            hornsDataDomesticated.push(0);
            herdData.push(0);
            herdDataWild.push(0);
            herdDataDomesticated.push(0);
            fearData.push(0);
            fearDataWild.push(0);
            fearDataDomesticated.push(0);
            aggressionData.push(0);
            aggressionDataWild.push(0);
            aggressionDataDomesticated.push(0);
        }

        function getHistogramBucket(value) {
            return Math.floor(value * 20) < 20 ? Math.floor(value * 20) : 19;;
        }

        for (var k = 0; k < seeds.length; k++) {
            var weightIndex = getHistogramBucket(seeds[k].weight.value);
            weightData[weightIndex]++;
            var rootsIndex = getHistogramBucket(seeds[k].deepRoots.value);
            rootsData[rootsIndex]++;
            var seedIndex = getHistogramBucket(seeds[k].hardiness.value);
            seedData[seedIndex]++;
            var dispersalIndex = getHistogramBucket(seeds[k].dispersal.value);
            dispersalData[dispersalIndex]++;

            if (seeds[k].dispersal.value < PARAMS.wildDomesticThreshold) {
                domeSeedPop++;
                weightDataDomesticated[weightIndex]++;
                rootsDataDomesticated[rootsIndex]++;
                seedDataDomesticated[seedIndex]++;
                dispersalDataDomesticated[dispersalIndex]++;
            }
            else {
                wildSeedPop++;
                weightDataWild[weightIndex]++;
                rootsDataWild[rootsIndex]++;
                seedDataWild[seedIndex]++;
                dispersalDataWild[dispersalIndex]++;
            }
        }

        for (var k = 0; k < goats.length; k++) {
            var hornsIndex = getHistogramBucket(goats[k].horns.value);
            hornsData[hornsIndex]++;
            var herdIndex = getHistogramBucket(goats[k].herd.value);
            herdData[herdIndex]++;
            var fearIndex = getHistogramBucket(goats[k].fear.value);
            fearData[fearIndex]++;
            var aggressionIndex = getHistogramBucket(goats[k].aggression.value);
            aggressionData[aggressionIndex]++;

            if (goats[k].aggression.value < PARAMS.wildDomesticThreshold) {
                domeGoatPop++;
                hornsDataDomesticated[hornsIndex]++;
                herdDataDomesticated[herdIndex]++;
                fearDataDomesticated[fearIndex]++;
                aggressionDataDomesticated[aggressionIndex]++;
            }
            else {
                wildGoatPop++;
                hornsDataWild[hornsIndex]++;
                herdDataWild[herdIndex]++;
                fearDataWild[fearIndex]++;
                aggressionDataWild[aggressionIndex]++;
            }
        }

        this.weightData.push(weightData);
        this.rootData.push(rootsData);
        this.seedData.push(seedData);
        this.dispersalData.push(dispersalData);
        this.weightDataWild.push(weightDataWild);
        this.rootDataWild.push(rootsDataWild);
        this.seedDataWild.push(seedDataWild);
        this.dispersalDataWild.push(dispersalDataWild);
        this.weightDataDomesticated.push(weightDataDomesticated);
        this.rootsDataDomesticated.push(rootsDataDomesticated);
        this.seedDataDomesticated.push(seedDataDomesticated);
        this.dispersalDataDomesticated.push(dispersalDataDomesticated);

        this.hornsData.push(hornsData);
        this.hornsDataWild.push(hornsDataWild);
        this.hornsDataDomesticated.push(hornsDataDomesticated);
        this.herdData.push(herdData);
        this.herdDataWild.push(herdDataWild);
        this.herdDataDomesticated.push(herdDataDomesticated);
        this.fearData.push(fearData);
        this.fearDataWild.push(fearDataWild);
        this.fearDataDomesticated.push(fearDataDomesticated);
        this.aggressionData.push(aggressionData);
        this.aggressionDataWild.push(aggressionDataWild);
        this.aggressionDataDomesticated.push(aggressionDataDomesticated);

        this.seedPop.push(seedPop);
        this.humanPop.push(humanPop);
        this.goatPop.push(goatPop);
        this.wildSeedPop.push(wildSeedPop);
        this.domeSeedPop.push(domeSeedPop);
        this.wildGoatPop.push(wildGoatPop);
        this.domeGoatPop.push(domeGoatPop);
    }


    logData() {
        var data = {
            db: PARAMS.db,
            collection: PARAMS.collection,
            data: {
                PARAMS: PARAMS,
                seedPop: this.seedPop,
                goatPop: this.goatPop,
                humanPop: this.humanPop,
                wildSeedPop: this.wildSeedPop,
                domeSeedPop: this.domeSeedPop,
                wildGoatPop: this.wildGoatPop,
                domeGoatPop: this.domeGoatPop,
                weightData: this.weightData,
                rootData: this.rootData,
                seedData: this.seedData,
                dispersalData: this.dispersalData,
                weightDataWild: this.weightDataWild,
                rootDataWild: this.rootDataWild,
                seedDataWild: this.seedDataWild,
                dispersalDataWild: this.dispersalDataWild,
                weightDataDomesticated: this.weightDataDomesticated,
                rootDataDomesticated: this.rootsDataDomesticated,
                seedDataDomesticated: this.seedDataDomesticated,
                dispersalDataDomesticated: this.dispersalDataDomesticated,
                hornsData: this.hornsData,
                hornsDataWild: this.hornsDataWild,
                hornsDataDomesticated: this.hornsDataDomesticated,
                herdData: this.herdData,
                herdDataWild: this.herdDataWild,
                herdDataDomesticated: this.herdDataDomesticated,
                fearData: this.fearData,
                fearDataWild: this.fearDataWild,
                fearDataDomesticated: this.fearDataDomesticated,
                aggressionData: this.aggressionData,
                aggressionDataWild: this.aggressionDataWild,
                aggressionDataDomesticated: this.aggressionDataDomesticated,
            }
        };

        if (socket) socket.emit("insert", data);
    }

    update() {
    }

    draw(ctx) {
        const selectedRadioButton = document.querySelector('input[name="settings"]:checked').id;
        if (selectedRadioButton === "seeds") {
            this.weightHist.draw(ctx);
            this.rootHist.draw(ctx);
            this.seedHist.draw(ctx);
            this.dispersalHist.draw(ctx);
            this.weightHistWild.draw(ctx);
            this.rootHistWild.draw(ctx);
            this.seedHistWild.draw(ctx);
            this.dispersalHistWild.draw(ctx);
            this.weightHistDomesticated.draw(ctx);
            this.rootHistDomesticated.draw(ctx);
            this.seedHistDomesticated.draw(ctx);
            this.dispersalHistDomesticated.draw(ctx);
        } else {
            this.hornsHist.draw(ctx);
            this.herdHist.draw(ctx);
            this.fearHist.draw(ctx);
            this.aggressionHist.draw(ctx);
            this.hornsHistWild.draw(ctx);
            this.herdHistWild.draw(ctx);
            this.fearHistWild.draw(ctx);
            this.aggressionHistWild.draw(ctx);
            this.hornsHistDomesticated.draw(ctx);
            this.herdHistDomesticated.draw(ctx);
            this.fearHistDomesticated.draw(ctx);
            this.aggressionHistDomesticated.draw(ctx);
        }
    }
}