function LSystem(param) {
    this.dl = 15;
    this.dd = 20;
    this.c = 'green';
    this.o = { x: 300, y: 550 }
}

LSystem.prototype.generate = function (axtom, rules, depth) {
    var temp = axtom, gen = '';
    for (var d = 0; d < depth; d++) {
        gen = temp;
        temp = '';
        for (var i = 0; i < gen.length; i++) {
            var c = gen[i];
            var r = rules[c];
            if (r) {
                temp += r;
            } else {
                temp += c;
            }
        }
    }
    return gen;
}