function Graphics(canvas, isClear) {
    this.Canvas = canvas;
    this.Context = null;
    this.Width = function () { return this.Canvas.width; }
    this.Height = function () { return this.Canvas.height; }
    this.Origin = { x: 0, y: 0 }
    if (isClear) {
        this.clearAll();
    }
}

Graphics.prototype.getContext = function () {
    if (!this.Context) {
        this.Context = this.Canvas.getContext('2d');
    }
    return this.Context;
}

Graphics.prototype.save = function () {
    var cxt = this.getContext();
    cxt.save();
}

Graphics.prototype.restore = function () {
    var cxt = this.getContext();
    cxt.restore();
}

Graphics.prototype.clearAll = function () {
    var cxt = this.getContext();
    cxt.clearRect(0, 0, this.Width(), this.Height());
}

Graphics.prototype.getRadian = function (angle) {
    return angle * Math.PI / 180;
}

Graphics.prototype.getAngle = function (radian) {
    return radian / Math.PI * 180;
}

Graphics.prototype.rotateAngle = function (angle, pt, anchor) {
    if (!anchor) {
        anchor = {};
        anchor.x = 0;
        anchor.y = 0;
    }
    var radian = this.getRadian(angle);
    var res = {};
    res.x = (pt.x - anchor.x) * Math.cos(radian) + (pt.y - anchor.y) * Math.sin(radian) + anchor.x;
    res.y = (pt.x - anchor.x) * Math.sin(radian) + (pt.y - anchor.y) * Math.cos(radian) + anchor.y;
    return res;
}

Graphics.prototype.rotate = function (x, y, angle) {
    var radian = this.getRadian(angle);
    var cxt = this.getContext();
    cxt.translate(x, y);
    cxt.rotate(radian);
}

Graphics.prototype.setOrigin = function (x, y, isRel) {
    var cxt = this.getContext();

    var org = this.getOrigin();
    if (!isRel) {
        // 是否为相对坐标，如果为相对坐标
        // 如果为不是相对坐标则需要按照当前坐标原点计算偏移
        cxt.translate(-org.x, -org.y);
    } else {
        x += org.x;
        y += org.y;
    }
    this.Origin.x = x;
    this.Origin.y = y;
    cxt.translate(x, y);
}

Graphics.prototype.getOrigin = function () {
    return this.Origin;
}

Graphics.prototype.drawLine = function (obj) {
    if (!obj) return;

    var cxt = this.getContext();

    // 保存上下文绘图状态
    cxt.save();
    if (obj.width) cxt.lineWidth = obj.width;
    if (obj.style) cxt.strokeStyle = obj.style;

    var x1 = obj.pt1.x, y1 = obj.pt1.y;
    var x2 = obj.pt2.x, y2 = obj.pt2.y;

    // 设定旋转角度
    if (obj.rotation && obj.rotation.degree != 0) {
        if (obj.rotation.anchor) {
            // 设置旋转锚点
            var rx = obj.rotation.anchor.x;
            var ry = obj.rotation.anchor.y;
            cxt.translate(rx, ry);

            // 调整定位坐标
            x1 -= rx; x2 -= rx;
            y1 -= ry; y2 -= ry;
        }
        cxt.rotate(this.getRadian(obj.rotation.degree));
    }

    cxt.beginPath();
    cxt.moveTo(x1, y1);
    cxt.lineTo(x2, y2);
    cxt.stroke();
    cxt.closePath();

    // 恢复上下文绘图状态
    cxt.restore();
}

///// <summary>绘制点</summary>    
///// <param name="x" type="Number">x坐标</param>
///// <param name="y" type="Number">y坐标</param>
///// <param name="r" type="Number">半径</param>
///// <param name="c" type="String">点填充颜色</param>
//Graphics.prototype.drawPoint = function (x, y, r, c) {
//    var cxt = this.getContext();
//    // 设置点填充颜色
//    if (c) cxt.fillStyle = c;
//    cxt.beginPath();
//    cxt.arc(x, y, r, 0, Math.PI * 2, true);
//    cxt.closePath();
//    cxt.fill();
//}

///// <summary>绘制矩形</summary>
///// <param name="x1" type="Number">矩形左上角x坐标</param>
///// <param name="y1" type="Number">矩形左上角y坐标</param>
///// <param name="x2" type="Number">矩形右下角x坐标</param>
///// <param name="y2" type="Number">矩形右下角y坐标</param>
///// <param name="w" type="Number">矩形边框宽度，默认为1</param>
///// <param name="bc" type="String">矩形边框颜色</param>
///// <param name="fc" type="String">矩形填充颜色</param>
//Graphics.prototype.drawRect = function (x1, y1, x2, y2, w, bc, fc) {
//    var cxt = this.getContext();
//    if (w || w <= 0) cxt.lineWidth = w;
//    cxt.beginPath();
//    cxt.rect(x1, y1, x2, y2);
//    cxt.closePath();

//    if (bc) {
//        cxt.strokeStyle = bc;
//        cxt.stroke();
//    }

//    if (fc) {
//        cxt.fillStyle = fc;
//        cxt.fill();
//    }
//}