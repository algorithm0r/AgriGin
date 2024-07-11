class RealGene {
    constructor(gene) {
        this.value = gene ? gene.value : Math.random();
    }
    mutate() {
        var range = 0.08;
        this.value += Math.random() * range - range / 2;
        if (this.value > 1) this.value = 1;
        if (this.value < 0) this.value = 0;
    }
};

