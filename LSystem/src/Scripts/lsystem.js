function LSystem(param) {
    this.dl = 1;
    this.dd = 25;
}

LSystem.prototype.draw = function (g, expr) {

    var canvas = g.Canvas;
    var info = {
        point: {
            x: canvas.width / 2,
            y: canvas.height - 10
        },
        color: 'black',
        degree: 0,
        width: 1
    };

    // 绘图堆栈
    var stack = [];

    for (var i = 0; i < expr.length ; i++) {
        var c = expr[i];

        var x = 0, y = 0;

        switch (c) {
            // 按指定长度向前画一条线段
            case 'F':
                x = info.point.x;
                y = info.point.y - this.dl;
                g.drawLine(info.point.x, info.point.y, x, y);                
                break;
            // 按指定长度向前移动（不画）一条线段
            case 'f':
                x = info.point.x;
                y = info.point.y - this.length;
                break;
            // 逆时针旋转给定角度
            case '+':
                info.degree -= this.dd;
                break;
            // 顺时针旋转给定角度 
            case '-':
                info.degree += this.dd;
                break;
            // 反向180°
            case '|':
                info.degree += 180;                
                break;
            // 当前指令入栈
            case '[':
                stack.push(info);
                break;
            // 当前指令出栈
            case ']':
                info = stack.pop();
                break;
            // 增加线宽
            case '#':
                info.width += 1;
                break;
            // 减小现况
            case '!':
                info.width -= 1;
                if (info.width <= 0)
                    info.width = 1;
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

        info.point.x = x;
        info.point.y = y;

        // 将角度调整到0~360之间
        if (info.degree >= 360 || info.degree < 0) {
            info.degree %= 360;
            if (info.degree < 0) {
                info.degree -= 360;
            }
        }
    }
}