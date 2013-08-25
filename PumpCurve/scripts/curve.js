function PumpCurve(canvas, args) {

    (function init(self, canvas, args) {

        // 设置Canvas对象
        self.Canvas = canvas;

        // 创建绘图区域
        self.DrawPane = new DrawPane(self, args);

        // 为鼠标移动注册事件
        canvas.ctrl = self;
        canvas.addEventListener('mousemove', function (event) {
            var e = event;
            this.ctrl.draw();
            this.ctrl.onMouseMove(event);
        }, false);

        // 设置调试标志，在调试状态下会绘制定位框
        self.IsDebug = args.Debug;
    })(this, canvas, args);

    // 泵图数据
    this.Data = null;

    this.draw = function () {

        if (this.Data) {

            // 创建绘图句柄
            var g = new Graphics(this.Canvas, true);

            // 绘图前需要计算各元素位置
            this.adjust(g, this.Data);

            // 绘画绘图区域
            var p = { IsDebug: this.IsDebug };
            this.DrawPane.draw(g, this.Data, p);
        }
    }

    this.adjust = function (g, data) {

        // 设置Canvas宽度
        this.Width = this.Canvas.width;

        // 设置Canvas高度
        this.Height = this.Canvas.height;

        // 计算绘图区域边界
        this.DrawPane.adjust(g, data);

        // 调整绘图Canvas高度
        this.Canvas.height = this.DrawPane.Bound.Height() +
                             this.DrawPane.Margin.Bottom +
                             this.DrawPane.Margin.Top;
    }

    this.onMouseMove = function (event) {
        var g = new Graphics(this.Canvas, false);

        if (this.IsDebug) {
            g.drawText({
                text: '(' + event.offsetX + ',' + event.offsetY + ')',
                pt: { x: 2, y: 2 }
            });
        }
        this.DrawPane.onMouseMove(g, event);
    }

    // 定义水泵状态图
    PumpCurve.StatePixelImage = null;

    // 定义时间显示背景图
    PumpCurve.TimePanelImage = null;

    // 定义所有边界间隔距离
    PumpCurve.MARGIN = 3;

    // 定义边框宽度
    PumpCurve.BOARD_WIDTH = 1;
}

function DrawPane(container, args) {

    (function init(self, container, args) {

        // 设置绘图区域容器
        self.Container = container;

        // 设置绘图区边距
        self.Margin = args.Margin;

        // 创建图例对象
        if (args.Legend && args.Legend.IsShow) {
            self.Legend = new Legend(self, args.Legend);
        }

        // 创建X坐标轴
        self.AxisX = new TimeAxis(self, args.AxisX);

        // 创建Y坐标轴
        self.AxisY = new LabelAxis(self, args.AxisY);

        // 创建曲线区域
        self.CurvePane = new CurvePane(self, args.CurvePane);

    })(this, container, args);

    this.adjust = function (g, data) {

        // 计算绘图区域边界
        var bound = new Rectangle();
        bound.Left = this.Margin.Left;
        bound.Top = this.Margin.Top;
        bound.Right = this.Container.Width - this.Margin.Right;
        bound.Bottom = this.Container.Height - this.Margin.Bottom;
        this.Bound = bound;

        // 计算图例区域边界
        if (this.Legend) {
            this.Legend.adjust(g, data, bound);
        }

        // 计算Y轴边界
        this.AxisY.adjust(g, data, bound);

        // 计算X轴边界
        this.AxisX.adjust(g, data, bound);

        // 计算曲线区域边界
        this.CurvePane.adjust(g, data, bound);

        // 根据元素的边界调整绘图区域边界
        this.Bound.Bottom = this.AxisX.Bound.Bottom + PumpCurve.MARGIN;
    }

    this.draw = function (g, data, p) {
        if (p.IsDebug) {
            g.drawRect({
                pt: {
                    x: this.Bound.Left,
                    y: this.Bound.Top
                },
                width: this.Bound.Width(),
                height: this.Bound.Height()
            });
        }

        // 绘制图例
        if (this.Legend) {
            this.Legend.draw(g, data, p);
        }

        // 绘制Y坐标
        this.AxisY.draw(g, data, p);

        // 绘制X坐标
        this.AxisX.draw(g, data, p);

        // 绘制曲线区域
        this.CurvePane.draw(g, data, p);
    }

    this.onMouseMove = function (g, event) {
        // 将鼠标移动消息发送给各个部分
        this.CurvePane.onMouseMove(g, event);
    }
}

function Legend(pane, args) {

    (function init(self, pane, args) {

        // 设置绘图区域对象
        self.DrawPane = pane;

    })(this, pane, args);

    this.adjust = function (g, data, outBound) {

        var image = PumpCurve.StatePixelImage;
        var metrics = g.measureText({ text: '开' });
        var metrics2 = g.measureText({ text: '故障' });
        var height = image.height < metrics.height ? metrics.height : data.Image.height;
        var width = (image.height + metrics.width + this.SPACING * 2) * this.COLUMN_COUNT + metrics.width;

        // 计算图例的边界
        var bound = new Rectangle();
        bound.Left = outBound.Width() - width + outBound.Left - PumpCurve.MARGIN;
        bound.Top = outBound.Top + PumpCurve.MARGIN;
        bound.Right = bound.Left + width;
        bound.Bottom = bound.Top + height;
        this.Bound = bound;
    }

    this.draw = function (g, data, p) {
        if (p.IsDebug) {
            g.drawRect({
                pt: {
                    x: this.Bound.Left,
                    y: this.Bound.Top
                },
                width: this.Bound.Width(),
                height: this.Bound.Height()
            });
        }

        // 定义图例对象
        var cols = [{
            text: '开',
            color: 9
        }, {
            text: '关',
            color: 3
        }, {
            text: '故障',
            color: 0
        }];

        var image = PumpCurve.StatePixelImage; 
        var x = this.Bound.Left + PumpCurve.BOARD_WIDTH;
        var y = this.Bound.Top + PumpCurve.BOARD_WIDTH;
        for (var i = 0; i < cols.length; i++) {
            var col = cols[i];

            // 绘制图例图标
            g.drawImage({
                image: image,
                spt: { x: col.color, y: 0 },
                dpt: { x: x, y: y },
                sw: 1,
                sh: image.height,
                dw: image.height,
                dh: image.height
            });

            // 绘制图例文字
            x += image.height;
            x += this.SPACING;
            var obj = {
                text: col.text,
                size: 12,
                font: '宋体',
                bold: false,
                pt: { x: x, y: y }
            };
            g.drawText(obj);

            // 测量文字宽度
            var metrics = g.measureText(obj);
            x += metrics.width;
            x += this.SPACING;
        }
    }

    // 定义两个图例间的间距
    this.SPACING = 5;

    // 定义图例列数
    this.COLUMN_COUNT = 3;
}

function LabelAxis(pane, args) {

    (function init(self, pane, args) {

        // 设置绘图区域对象
        self.DrawPane = pane;

    })(this, pane, args);

    this.adjust = function (g, data, outBound) {

        // 计算Y坐标轴边界
        // 边界包括坐标轴
        var bound = new Rectangle();
        bound.Left = outBound.Left + PumpCurve.MARGIN;
        bound.Top = this.DrawPane.Legend.Bound.Bottom;
        bound.Right = bound.Left;
        bound.Bottom = bound.Top;

        // 保存水泵和Y坐标关系
        var dict = {};

        var image = PumpCurve.StatePixelImage;
        for (var i = 0; i < data.Pumps.length; i++) {
            var pump = data.Pumps[i];

            // 保存水泵编号和坐标的关系
            dict[pump.Id] = parseInt(bound.Bottom);
            var obj = {
                text: pump.Name,
                font: '宋体',
                size: 12,
                bold: false
            };
            var metrics = g.measureText(obj);
            bound.Bottom += (metrics.height < image.height ? image.height : metrics.height);
            if (metrics.width > bound.Right)
                bound.Right = metrics.width;
        }

        bound.Right += bound.Left;
        bound.Right += PumpCurve.MARGIN;
        bound.Right += PumpCurve.MARGIN;
        bound.Bottom += PumpCurve.MARGIN;
        if (bound.Right > this.MAX_WIDTH) {
            bound.Right = this.MAX_WIDTH;
        }

        this.Dict = dict;
        this.Bound = bound;
    }

    this.getCoordY = function (id) {
        // 根据水泵编号获取对应的坐标位置
        return this.Dict[id];
    }

    this.draw = function (g, data, p) {
        if (p.IsDebug) {
            g.drawRect({
                pt: {
                    x: this.Bound.Left,
                    y: this.Bound.Top
                },
                width: this.Bound.Width(),
                height: this.Bound.Height()
            });
        }
                
        for (var i = 0; i < data.Pumps.length; i++) {
            var pump = data.Pumps[i];

            var x = this.Bound.Left + PumpCurve.MARGIN;
            var y = this.getCoordY(pump.Id) + PumpCurve.MARGIN;

            var obj = {
                text: pump.Name,
                pt: { x: x, y: y },
                style: pump.Type == 'CSP' ? 'black' : 'blue',
                font: '宋体',
                size: 12,
                bold: false
            };

            var metrics = g.measureText(obj);
            if (metrics.width < this.Bound.Width()) {
                var dw = this.Bound.Width() - metrics.width;
                obj.pt.x = x + dw - PumpCurve.MARGIN - PumpCurve.BOARD_WIDTH * 2;
            }
            //else if (metrics.width > this.Bound.Width()) {
            //    var text = obj.text;
            //    while(text.length > 0) {
            //        text = text.slice(0, text.length - 1);
            //        var o = {
            //            text: text,
            //            font: '宋体',
            //            size: 12,
            //            bold: false
            //        };
            //        metrics = g.measureText(o);
            //        if (metrics.width + 10 < this.Bound.Width()) {
            //            text += '…';
            //            break;
            //        }
            //    }
            //    obj.text = text;
            //}
            
            g.drawText(obj);
        }

        // 绘制Y坐标轴
        g.drawLine({
            pt1: {
                x: this.Bound.Right,
                y: this.Bound.Top
            },
            pt2: {
                x: this.Bound.Right,
                y: this.Bound.Bottom
            },
            strokeStyle: 'black'
        })
    }

    // 定义标签框最大宽度
    this.MAX_WIDTH = 80;
}

function TimeAxis(pane, args) {

    (function init(self, pane, args) {

        // 设置绘图区域对象
        self.DrawPane = pane;

    })(this, pane, args);

    this.getTimeInfo = function (g) {

        var info = {};
        var width = this.DrawPane.Legend.Bound.Right - this.DrawPane.AxisY.Bound.Right;

        // 计算时间刻度步长
        var step = 1;
        var metrics = g.measureText({ text: '00' });
        while (width / (metrics.width * (TimeAxis.HOURS / step)) < 1) {
            step *= 2;
        }
        info.step = step;

        // 计算时间刻度间隔
        var timeCount = TimeAxis.HOURS / step;
        var interval = (width - metrics.width * timeCount) / timeCount;
        info.interval = interval;
        info.metrics = metrics;

        return info;
    }

    this.adjust = function (g, data, outBound) {
        // 计算X轴边界
        var bound = new Rectangle();
        bound.Left = this.DrawPane.AxisY.Bound.Right;
        bound.Top = this.DrawPane.AxisY.Bound.Bottom;
        bound.Right = bound.Left;

        var dict = {};
        var info = this.getTimeInfo(g);
        for (var i = 0; i < TimeAxis.HOURS; i += info.step) {

            // 保存每个时间点的X坐标位置
            var minute = i * TimeAxis.MINUTES_PER_HOUR;
            dict[minute] = bound.Right;

            bound.Right += info.metrics.width;
            if (i < TimeAxis.HOURS) {
                bound.Right += info.interval;
            }
        }
        // 添加最后一个时间点
        var minute = i * TimeAxis.MINUTES_PER_HOUR;
        dict[minute] = parseInt(bound.Right);

        bound.Bottom = bound.Top + info.metrics.height + PumpCurve.MARGIN;
        this.Bound = bound;
        this.Dict = dict;
    }

    this.getCoordX = function (minute, dx) {
        // 根据给定的分钟数计算对应的X坐标
        var x = this.Dict[minute];
        if (!x) {
            // 如果对应的X坐标不存在，需要重新计算
            var dx = this.Bound.Width() / TimeAxis.MINUTES_PER_DAY;
            x = this.Dict[0] + dx * minute;
            this.Dict[minute] = parseInt(x);
        }
        if (dx) { x += dx; }
        if (x > this.Bound.Right) {
            x = this.Bound.Right;
        }
        return x;
    }

    this.getTime = function (x) {
        // 根据X坐标位置获取对应的时间
        var dx = this.Bound.Width() / TimeAxis.MINUTES_PER_DAY;
        var xx = x - this.Bound.Left;
        var t = xx / dx;
        var h = parseInt(t / 60);
        var m = parseInt(t % 60);
        var d = new Date('1900/1/1');
        d.setMinutes(t);
        return d.Format('hh:mm');
    }

    this.draw = function (g, data, p) {
        if (p.IsDebug) {
            g.drawRect({
                pt: {
                    x: this.Bound.Left,
                    y: this.Bound.Top
                },
                width: this.Bound.Width(),
                height: this.Bound.Height()
            });
        }

        // 获取时间轴绘图信息
        var info = this.getTimeInfo(g);

        var y = this.Bound.Top + PumpCurve.MARGIN;
        for (var i = 0; i <= TimeAxis.HOURS; i += info.step) {
            var text = i % 24;
            if (text < 10) {
                text = '0' + text;
            }

            var x = this.getCoordX(i * TimeAxis.MINUTES_PER_HOUR, -5);
            g.drawText({
                text: text,
                pt: { x: x, y: y },
                style: 'black',
                font: '宋体',
                size: 12,
                bold: false
            });
        }

        // 绘制X坐标轴
        g.drawLine({
            pt1: {
                x: this.Bound.Left,
                y: this.Bound.Top
            },
            pt2: {
                x: this.Bound.Right,
                y: this.Bound.Top
            }
        });
    }

    // 定义一天的小时数
    TimeAxis.HOURS = 24;

    // 定义每天的分钟数
    TimeAxis.MINUTES_PER_DAY = 1440;

    // 定义每小时分钟数
    TimeAxis.MINUTES_PER_HOUR = 60;
}

function CurvePane(pane, args) {

    (function init(self, pane, args) {
        // 设置绘图区域对象 
        self.DrawPane = pane;

        // 设置当前曲线区域与X、Y坐标关联
        self.AxisX = pane.AxisX;
        self.AxisY = pane.AxisY;

        // 设置是否显示主坐标
        if (args) {
            self.IsShowTick = args.IsShowTick;
        }

    })(this, pane, args);

    this.adjust = function (g, data, outBound) {
        // 计算曲线区域边界
        var bound = new Rectangle();
        bound.Left = this.DrawPane.AxisY.Bound.Right;
        bound.Top = this.DrawPane.Legend.Bound.Bottom;
        bound.Right = bound.Left + this.DrawPane.AxisX.Bound.Width();
        bound.Bottom = this.DrawPane.AxisX.Bound.Top;
        this.Bound = bound;
    }

    this.draw = function (g, data, p) {
        if (p.IsDebug) {
            g.drawRect({
                pt: {
                    x: this.Bound.Left,
                    y: this.Bound.Top
                },
                width: this.Bound.Width(),
                height: this.Bound.Height()
            });
        }

        // 绘制每台水泵的开泵图
        var pump_regions = [];
        for (var i = 0; i < data.Pumps.length; i++) {
            var pump = data.Pumps[i];

            // 为每个水泵状态图生成区域对象
            var pump_dict = {};
            var pump_bound = new Rectangle();
            pump_bound.Left = this.AxisX.getCoordX(0, PumpCurve.BOARD_WIDTH);
            pump_bound.Top = this.AxisY.getCoordY(pump.Id) + PumpCurve.MARGIN;
            pump_bound.Right = this.AxisX.getCoordX(TimeAxis.MINUTES_PER_DAY, PumpCurve.BOARD_WIDTH);
            pump_bound.Bottom = pump_bound.Top + PumpCurve.StatePixelImage.height;
            pump_dict.Bound = pump_bound;
            pump_dict.Rects = [];
            pump_dict.Pump = pump;
            pump_regions.push(pump_dict);

            var drawRect = null;            
            if (!pump.Data || pump.Data.length == 0) {
                // 绘制故障图
                var st = 0, et = 1440;
                drawRect = this.drawState(g, pump, st, et, -1);
                pump_dict.Rects.push(drawRect);
            } else {
                var pre = pump.Data[0];
                var cur = pump.Data[0];
                for (var j = 1; j < pump.Data.length; j++) {
                    cur = pump.Data[j];
                    if (cur.value != pre.value) {
                        // 当前后两个时间点的值不同时才绘制
                        drawRect = this.drawState(g, pump, pre.time, cur.time, pre.value);
                        pump_dict.Rects.push(drawRect);
                        pre = cur;
                    }
                }
                var et = cur.time;
                if (et < 1440) { et = 1440 }
                drawRect = this.drawState(g, pump, pre.time, et, pre.value);
                pump_dict.Rects.push(drawRect);
            }
        }
        this.StateRegions = pump_regions;

        if (this.IsShowTick) {
            // 绘制X轴坐标线
            for (var i = 1; i < TimeAxis.HOURS; i++) {
                var x = this.AxisX.getCoordX(i * TimeAxis.MINUTES_PER_HOUR);
                g.drawLine({
                    pt1: { x: x, y: this.Bound.Top },
                    pt2: { x: x, y: this.Bound.Bottom },
                    strokeStyle: 'black'
                });
            }
        }

        // 绘制曲线右侧坐标轴
            g.drawLine({
                pt1: { x: this.Bound.Right, y: this.AxisY.Bound.Top },
                pt2: { x: this.Bound.Right, y: this.AxisY.Bound.Bottom},
                strokeStyle: 'black'
            });
    }

    this.drawState = function (g, pump, st, et, v) {
        var dy = this.AxisY.getCoordY(pump.Id) + PumpCurve.MARGIN;
        var dx0 = this.AxisX.getCoordX(st, PumpCurve.BOARD_WIDTH);
        var dx1 = this.AxisX.getCoordX(et, PumpCurve.BOARD_WIDTH);

        // 获取图片X偏移量
        var offset = this.FAULT;
        if (v == 0) offset = this.CLOSE;     // 关
        else if (v > 0) offset = this.OPEN;  // 开

        var img = PumpCurve.StatePixelImage;

        // 绘制状态图
        g.drawImage({
            image: img,
            spt: { x: offset, y: 0 },
            dpt: { x: dx0, y: dy },
            sw: 1,
            sh: img.height,
            dw: dx1 - dx0,
            dh: img.height
        });

        // 绘制左端点
        if (st > 0) {
            g.drawImage({
                image: img,
                spt: { x: offset + 1, y: 0 },
                dpt: { x: dx0 - 1, y: dy },
                sw: 2,
                sh: img.height,
                dw: 2,
                dh: img.height
            });
        }

        // 绘制右端点
        g.drawImage({
            image: img,
            spt: { x: offset + 1, y: 0 },
            dpt: { x: dx1 - 1, y: dy },
            sw: 2,
            sh: img.height,
            dw: 2,
            dh: img.height
        });

        // 如果为调速泵，需要在状态上绘制文字
        if (pump.Type == 'RSP') {
            if (v >= 0) {
                var obj = {
                    text: this.getStateText(pump.Type, v, false),
                    size: 12,
                    font: '宋体'
                };
                var metrics = g.measureText(obj);
                var w = dx1 - dx0;
                if (metrics.width < w) {
                    // 如果文字宽度小于状态举行宽度，那么绘制文字
                    var x = dx0 + w / 2 - metrics.width / 2;
                    obj.pt = { x: x, y: dy };
                    g.drawText(obj);
                }
            }
        }

        // 为每个状态创建状态矩形
        var rect = new Rectangle();
        rect.Left = dx0 - 1;
        rect.Top = dy;
        rect.Right = dx1 + 1;
        rect.Bottom = rect.Top + img.height;
        var d = {
            rect: rect,
            st: st,
            et: et,
            pump: pump,
            v: v
        }
        return d;
    }

    this.onMouseMove = function (g, event) {
        if (event.offsetX >= this.Bound.Left && event.offsetX <= this.Bound.Right) {
            if (event.offsetY >= this.Bound.Top && event.offsetY <= this.Bound.Bottom) {

                // 绘制时间定位线和时间
                this.drawTime(g, event);

                // 绘制标注提示
                this.drawTip(g, event);
            }
        }
    }

    this.drawTime = function (g, event) {
        var x = event.offsetX;
        var y1 = 0;
        var y2 = this.Bound.Bottom;

        // 绘制鼠标定位线
        g.drawLine({
            pt1: { x: x, y: y1 },
            pt2: { x: x, y: y2 },
            strokeStyle: 'black'
        });

        // 绘制顶部绘制时间框
        var image = PumpCurve.TimePanelImage;
        g.drawImage({
            image: image,
            dpt: { x: event.offsetX + 2, y: 0 }
        });

        var text = this.AxisX.getTime(event.offsetX);
        var obj = {
            text: text,
            font: '宋体',
            size: 12
        };
        var metrics = g.measureText(obj);
        obj.pt = {
            x: event.offsetX + (image.width / 2 - metrics.width / 2) + 1,
            y: image.height / 2 - metrics.height / 2 + 1
        };
        g.drawText(obj);
    }

    this.drawTip = function (g, event) {
        // 如果鼠标在某个状态内，则显示该状态对应的数据
        // 判断鼠标是否在某个水泵状态图上
        var hasDrawn = false;
        for (var i in this.StateRegions) {
            if (hasDrawn) break;
            var region = this.StateRegions[i];
            var rb = region.Bound;

            if (event.offsetX < rb.Left ||
                event.offsetX > rb.Right ||
                event.offsetY < rb.Top ||
                event.offsetY > rb.Bottom) {
                continue;
            }

            // 如果鼠标位置在某个水泵状态上，需要遍历该水泵状态中的所有状态矩形
            // 并为鼠标位置对应的状态矩形高亮矩形

            for (var j in region.Rects) {
                var rect = region.Rects[j];
                var bound = rect.rect;

                if (event.offsetX < bound.Left ||
                   event.offsetX > bound.Right ||
                   event.offsetY < bound.Top ||
                   event.offsetY > bound.Bottom) {
                    continue;
                }

                // 绘制高亮矩形 
                g.drawRect({
                    pt: { x: bound.Left, y: bound.Top },
                    width: bound.Width(),
                    height: bound.Height(),
                    lineWidth: 1,
                    alpha: 0.3,
                    fillStyle: 'black',
                    strokeStyle: 'black'
                });

                // 绘制标注信息
                var texts = [];
                var sd = new Date("1900/1/1"),
                    ed = new Date("1900/1/1");
                sd.setMinutes(rect.st);
                ed.setMinutes(rect.et);
                texts[0] = '水泵：' + rect.pump.Name + ' (' + (rect.pump.Type == 'CSP' ? '定速泵' : '调速泵') + ')';
                texts[1] = '时间：' + sd.Format('hh:mm') + ' — ' + ed.Format('hh:mm');
                texts[2] = '状态：' + this.getStateText(rect.pump.Type, rect.v, true);

                // 计算文字的宽度和高度
                var mw = 0, mh = 0;
                for (var k = 0; k < texts.length; k++) {
                    var metrics = g.measureText({
                        text: texts[k],
                        font: '宋体',
                        size: 12,
                        bold: true
                    });
                    if (metrics.width > mw) {
                        mw = metrics.width;
                    }
                    mh += metrics.height;
                }

                // 计算标注框的位置
                var l = event.offsetX + PumpCurve.MARGIN * 2;
                var t = region.Bound.Bottom + PumpCurve.MARGIN * 2;
                var c = this.DrawPane.Container;
                if (l + mw > c.Width) { l = c.Width - mw; }
                if (t + mh > c.Height) { t = c.Height - mh }

                // 绘制提示框和背景
                g.drawRect({
                    pt: { x: l, y: t },
                    width: mw,
                    height: mh,
                    lineWidth: 0,
                    alpha: 0.7,
                    fillStyle: 'black',
                    strokeStyle: 'black'
                });

                // 绘制提示文字
                var offsetY = t + PumpCurve.MARGIN;
                for (var k = 0; k < texts.length; k++) {

                    var obj = {
                        text: texts[k],
                        font: '宋体',
                        size: 12,
                        bold: true,
                        style: 'white',
                        pt: { x: l, y: offsetY }
                    };

                    var metrics = g.measureText(obj);
                    offsetY += metrics.height;
                    g.drawText(obj);
                }

                hasDrawn = true;
                break;
            }
        }
    }

    this.getStateText = function (type, value, unit) {
        var text = value;
        if (value == 0) { text = '关'; }
        else if (value < 0) { text = '故障'; }
        else {
            if (type == 'CSP') { text = '开'; }
            else {
                if (text != parseInt(text)) {
                    // 如果是小数需要保留2位小数
                    text = text.toFixed(1);
                }
                if (unit) {
                    text += ' HZ';
                }
            }
        }
        return text;
    }

    // 水泵状态开
    this.OPEN = 9;

    // 水泵状态关
    this.CLOSE = 3;

    // 水泵状态故障
    this.FAULT = 0;
}