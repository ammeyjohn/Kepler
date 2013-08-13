function LSystem() {    
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

LSystem.prototype.render = function (g, expr, param) {
    
    var stack = [];

    // 初始化绘图信息
    var info = {
        pt: {
            x: param.origin.x,
            y: param.origin.y
        },
        angle: param.angle
    };

    //g.save();
    // 将原点设置为起始点
    g.setOrigin(info.pt.x, info.pt.y);

    for (var i = 0; i < expr.length; i++) {
        var c = expr[i];

        switch (c) {
            case 'F':
                var obj = {
                    pt1: { x: 0, y: 0 },
                    pt2: {
                        x: param.step,
                        y: 0
                    },
                    style: 'green'
                };
                if (info.angle != 0) {
                    var pt = g.rotateAngle(-info.angle, obj.pt2);
                    obj.pt2 = pt;
                }
                g.drawLine(obj);

                // 将前一次绘制的终点设置为下一次的起点
                info.pt.x += obj.pt2.x;
                info.pt.y += obj.pt2.y;

                // 将起始点设置为原点
                g.setOrigin(info.pt.x, info.pt.y, false);
                break;
            case 'f':
                break;
            case '+':
                info.angle -= param.deltaAngle;
                break;
            case '-':
                info.angle += param.deltaAngle;
                break;
            case '[':
                var new_info = {
                    pt: {
                        x: info.pt.x,
                        y: info.pt.y
                    },
                    angle: info.angle
                };
                stack.push(new_info);
                break;
            case ']':
                info = stack.pop();
                g.setOrigin(info.pt.x, info.pt.y, false);
                break;              
        }
    }
    //g.restore();
}