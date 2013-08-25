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

Graphics.prototype.measureText = function (obj) {
    if (!obj) return;
    var cxt = this.getContext();

    cxt.save();
    var font = 'sans-serif', size = 10, bold = false;
    if (obj.size) { size = obj.size; }
    if (obj.bold) { bold = obj.bold; }
    if (obj.font) { font = obj.font; }
    //cxt.textAlign = 'center';
    cxt.textBaseline = "top";
    cxt.font = size + 'px' + (bold ? ' bold' : ' ') + font;
    var m = cxt.measureText(obj.text);
    cxt.restore();

    var metrics = {
        width: m.width,
        height: size * 1.5
    };
    return metrics;
}

//Graphics.prototype.measureText = function (obj) {
//    if (!obj) return;

//    var str = obj.text + ':' + obj.bold + ':' + obj.font + ':' + obj.size;
//    if (typeof (__measuretext_cache__) == 'object' && __measuretext_cache__[str]) {
//        return __measuretext_cache__[str];
//    }

//    var div = document.createElement('DIV');
//    div.innerHTML = obj.text;
//    div.style.position = 'absolute';
//    div.style.top = '-100px';
//    div.style.left = '-100px';
//    div.style.fontFamily = obj.font;
//    div.style.fontWeight = obj.bold ? 'bold' : 'normal';
//    div.style.fontSize = obj.size + 'pt';
//    document.body.appendChild(div);

//    var metrics = {
//        width: div.offsetWidth,
//        height: div.offsetHeight
//    };

//    document.body.removeChild(div);

//    // Add the sizes to the cache as adding DOM elements is costly and can cause slow downs
//    if (typeof (__measuretext_cache__) != 'object') {
//        __measuretext_cache__ = [];
//    }
//    __measuretext_cache__[str] = metrics;

//    return metrics;
//}

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
    if (obj.lineWidth) cxt.lineWidth = obj.lineWidth;
    if (obj.strokeStyle) cxt.strokeStyle = obj.strokeStyle;

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
    cxt.translate(0.5, 0.5);
    cxt.moveTo(x1, y1);
    cxt.lineTo(x2, y2);
    cxt.stroke();
    cxt.closePath();

    // 恢复上下文绘图状态
    cxt.restore();
}

Graphics.prototype.drawRect = function (obj) {
    if (!obj) return;

    var cxt = this.getContext();

    cxt.save();
    if (obj.lineWidth) {
        cxt.lineWidth = obj.lineWidth;
    }

    cxt.beginPath();
    if (obj.strokeStyle) {
        cxt.strokeStyle = obj.strokeStyle;
    }
    if (obj.lineWidth != 0) {
        cxt.strokeRect(obj.pt.x, obj.pt.y, obj.width, obj.height);
    }

    if (obj.fillStyle) {
        cxt.fillStyle = obj.fillStyle;

        if (obj.alpha) {
            cxt.globalAlpha = obj.alpha;
        }

        cxt.fillRect(obj.pt.x, obj.pt.y, obj.width, obj.height);
    }    
    
    cxt.closePath();
    cxt.restore();
}

Graphics.prototype.drawText = function (obj) {
    if (!obj) return;
    var cxt = this.getContext();

    cxt.save();
    if (obj.style) {
        cxt.fillStyle = obj.style;
    }
    var font = 'sans-serif', size = 10, bold = false;
    if (obj.size) { size = obj.size; }
    if (obj.bold) { bold = obj.bold; }
    if (obj.font) { font = obj.font; }
    cxt.textBaseline = "top";
    cxt.font = size + 'px' + (bold ? ' bold' : ' ') + font;
    cxt.beginPath();
    cxt.fillText(obj.text, obj.pt.x, obj.pt.y);
    cxt.closePath();
    cxt.restore();
}

Graphics.prototype.drawImage = function (obj) {
    if (!obj) return;

    var cxt = this.getContext();

    var image = null;
    if (obj.image) {
        image = obj.image;
    } else {
        if (obj.imagePath) {
            image = new Image();
            image.src = obj.ImagePath;
        }
    }
    if (!image) return;

    cxt.save();    
    cxt.beginPath();

    // 设置目标偏移量
    var dx = dy = 0;
    if (obj.dpt) {
        dx = obj.dpt.x;
        dy = obj.dpt.y;
    }

    // 设置图片绘制宽高
    var dw = obj.dw;
    var dh = obj.dh;

    // 设置原始图片偏移量
    var sx = sh = 0;
    if (obj.spt) {
        sx = obj.spt.x;
        sy = obj.spt.y;
    }

    // 设置原始图片绘图宽高
    var sw = obj.sw;
    var sh = obj.sh;

    // 根据参数的个数绘图
    if (obj.spt) {

        // 如果原始图片裁剪宽高没有设置则默认为原始图片的宽高
        if (!sw) sw = image.width;
        if (!sh) sh = image.height;

        if (!dw) dw = sw;
        if (!dh) dh = sh;

        cxt.drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh);
    } else {

        if (!dw && !dh) {
            cxt.drawImage(image, dx, dy);
        } else {
            if (!dw) dw = image.width;
            if (!dh) dh = image.height;

            cxt.drawImage(image, dx, dy, dw, dh);
        }
    }

    cxt.closePath();
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


var Rectangle = function (l, t, r, b) {
    this.Left = l;
    this.Top = t;
    this.Right = r;
    this.Bottom = b;
    this.Width = function () { return this.Right - this.Left; }
    this.Height = function () { return this.Bottom - this.Top; }
}