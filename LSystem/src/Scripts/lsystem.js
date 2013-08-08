function LSystem(param) {
    this.dl = 15;
    this.dd = 20;
    this.c = 'green';
    this.o = { x: 300, y: 550 }
}

LSystem.prototype.generate = function (seed, rules, count) {

    var expr = '', temp = seed;

    for (var cnt = 0; cnt < count; cnt++) {
        expr = temp;
        temp = '';
        for (var i = 0; i < expr.length ; i++) {
            var c = expr[i];
            var r = rules[c];
            if (r) {
                temp += r;
            } else {
                temp += c;
            }
        }
    }

    return expr;
}

LSystem.prototype.draw = function (g, expr) {

    var info = {
        point: this.o,
        color: this.c,
        degree: 0,
        width: 1
    };

    // 绘图堆栈
    var stack = [];

    for (var i = 0; i < expr.length ; i++) {
        var c = expr[i];

        var obj = null;
        switch (c) {
            // 按指定长度向前画一条线段                
            case 'F':
                obj = {
                    pt1: info.point,
                    pt2: {
                        x: info.point.x,
                        y: info.point.y - this.dl
                    },
                    style: info.color
                };
                if (info.degree != 0) {
                    obj.rotation = {
                        anchor: info.point,
                        degree: info.degree
                    };
                }
                info.point = obj.pt2;
                break;
            // 按指定长度向前移动（不画）一条线段
            case 'f':
                info.point.y -= this.dl;
                break;
            // 逆时针旋转给定角度
            case '+':
                info.degree += this.dd;
                break;
            // 顺时针旋转给定角度 
            case '-':
                info.degree -= this.dd;
                break;
            // 反向180°
            case '|':
                info.degree += 180;
                break;
            // 当前指令入栈
            case '[':
                var cloned = info.Clone();
                stack.push(cloned);
                break;
            // 当前指令出栈
            case ']':                
                info = stack.pop();
                break;
            // 增加线宽
            case '#':
                break;
            // 减小现况
            case '!':
                break;
            // 按比例乘以线长
            case '>':
                break;
            // 按比例除以线长
            case '<':
                break;
            // 交换+和-的符号意义
            case '&':
                break;
            // 按转动角度的增量减小角度的转动量
            case '(':
                break;
            // 按转动角度的增量增加角度的转动量
            case ')':
                break;
        }

        if (obj) {

            // 将角度调整到0~360之间
            if (info.degree < 0 || info.degree > 360) {
                var d = info.degree % 360;
                if (d < 0) {
                    d += 360;
                }
                info.degree = d;
            }

            g.drawLine(obj);
            obj = null;
        }
    }
}