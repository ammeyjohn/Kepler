function LSystem(param) {
    this.param = param;
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

LSystem.prototype.render = function (g, expr) {

    var info = {
        x: this.param.origin.x,
        y: this.param.origin.y,
        d: this.param.angle
    };

    var stack = [];

    for (var i = 0; i < expr.length; i++) {
        var c = expr[i];

        switch (c) {
            case 'F':
                var obj = {
                    pt1: {
                        x: info.x,
                        y: info.y
                    },
                    pt2: {
                        x: info.x + this.param.step,
                        y: info.y
                    },
                    style: 'green'
                };
                // 设置绘图旋转角度
                if (info.d && info.d != 0) {
                    obj.rotation = {
                        degree: info.d,
                        anchor: {
                            x: obj.pt1.x,
                            y: obj.pt1.y
                        }
                    };
                }
                // 绘制直线
                g.drawLine(obj);
                // 将直线的终点作为下一次绘制的起点
                if (info.d != 0) {
                    // 将线段起点进行旋转操作
                    var pt = g.rotateAngle(info.d, obj.pt2, obj.pt1);
                    info.x = pt.x;
                    info.y = pt.y;
                }
                break;
            case 'f':
                info.x -= this.param.step;
                break;
            case '+':
                info.d += this.param.deltaAngle;
                break;
            case '-':
                info.d -= this.param.deltaAngle;
                break;
            case '[':
                var new_obj = {
                    x: info.x,
                    y: info.y,
                    d: info.d
                };
                stack.push(new_obj);
                break;
            case ']':
                obj = stack.pop();
                break;              
        }
    }
}